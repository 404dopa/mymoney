package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"moneytrack/internal/models"
)

type CardRepository struct {
	db     *sql.DB
	driver string
}

func NewCardRepository(db *sql.DB, driver string) *CardRepository {
	return &CardRepository{db: db, driver: driver}
}

// ------------------- Expense Cards -------------------

func (r *CardRepository) GetAllExpenseCards() ([]models.ExpenseCard, error) {
	query := `
		SELECT 
			c.id, 
			c.name, 
			c.amount, 
			c.expense_type_id, 
			COALESCE(t.name, '') AS expense_type_name,
			c.created_at, 
			c.updated_at
		FROM expense_cards c
		JOIN expense_types t ON c.expense_type_id = t.id
		ORDER BY c.id ASC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query expense cards: %w", err)
	}
	defer rows.Close()

	var cards []models.ExpenseCard
	for rows.Next() {
		var c models.ExpenseCard
		if err := rows.Scan(
			&c.ID,
			&c.Name,
			&c.Amount,
			&c.ExpenseTypeID,
			&c.ExpenseTypeName,
			&c.CreatedAt,
			&c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		cards = append(cards, c)
	}
	if cards == nil {
		cards = []models.ExpenseCard{}
	}
	return cards, nil
}

func (r *CardRepository) GetExpenseCardByID(id int64) (*models.ExpenseCard, error) {
	query := Rebind(`
		SELECT 
			c.id, 
			c.name, 
			c.amount, 
			c.expense_type_id, 
			COALESCE(t.name, '') AS expense_type_name,
			c.created_at, 
			c.updated_at
		FROM expense_cards c
		JOIN expense_types t ON c.expense_type_id = t.id
		WHERE c.id = $1
	`, r.driver)

	var c models.ExpenseCard
	err := r.db.QueryRow(query, id).Scan(
		&c.ID,
		&c.Name,
		&c.Amount,
		&c.ExpenseTypeID,
		&c.ExpenseTypeName,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CardRepository) CreateExpenseCard(req *models.CreateCardRequest) (*models.ExpenseCard, error) {
	query := Rebind(`
		INSERT INTO expense_cards (name, amount, expense_type_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, amount, expense_type_id, created_at, updated_at
	`, r.driver)

	now := time.Now()
	var c models.ExpenseCard
	err := r.db.QueryRow(query, req.Name, req.Amount, req.TypeID, now, now).Scan(
		&c.ID,
		&c.Name,
		&c.Amount,
		&c.ExpenseTypeID,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	typeQuery := Rebind(`SELECT name FROM expense_types WHERE id = $1`, r.driver)
	_ = r.db.QueryRow(typeQuery, c.ExpenseTypeID).Scan(&c.ExpenseTypeName)

	return &c, nil
}

func (r *CardRepository) UpdateExpenseCard(id int64, req *models.UpdateCardRequest) (*models.ExpenseCard, error) {
	query := Rebind(`
		UPDATE expense_cards
		SET name = $1, amount = $2, expense_type_id = $3, updated_at = $4
		WHERE id = $5
		RETURNING id, name, amount, expense_type_id, created_at, updated_at
	`, r.driver)

	now := time.Now()
	var c models.ExpenseCard
	err := r.db.QueryRow(query, req.Name, req.Amount, req.TypeID, now, id).Scan(
		&c.ID,
		&c.Name,
		&c.Amount,
		&c.ExpenseTypeID,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	typeQuery := Rebind(`SELECT name FROM expense_types WHERE id = $1`, r.driver)
	_ = r.db.QueryRow(typeQuery, c.ExpenseTypeID).Scan(&c.ExpenseTypeName)

	return &c, nil
}

func (r *CardRepository) DeleteExpenseCard(id int64) error {
	query := Rebind(`DELETE FROM expense_cards WHERE id = $1`, r.driver)
	res, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// ------------------- Income Cards -------------------

func (r *CardRepository) GetAllIncomeCards() ([]models.IncomeCard, error) {
	query := `
		SELECT 
			c.id, 
			c.name, 
			c.amount, 
			c.income_type_id, 
			COALESCE(t.name, '') AS income_type_name,
			c.created_at, 
			c.updated_at
		FROM income_cards c
		JOIN income_types t ON c.income_type_id = t.id
		ORDER BY c.id ASC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query income cards: %w", err)
	}
	defer rows.Close()

	var cards []models.IncomeCard
	for rows.Next() {
		var c models.IncomeCard
		if err := rows.Scan(
			&c.ID,
			&c.Name,
			&c.Amount,
			&c.IncomeTypeID,
			&c.IncomeTypeName,
			&c.CreatedAt,
			&c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		cards = append(cards, c)
	}
	if cards == nil {
		cards = []models.IncomeCard{}
	}
	return cards, nil
}

func (r *CardRepository) GetIncomeCardByID(id int64) (*models.IncomeCard, error) {
	query := Rebind(`
		SELECT 
			c.id, 
			c.name, 
			c.amount, 
			c.income_type_id, 
			COALESCE(t.name, '') AS income_type_name,
			c.created_at, 
			c.updated_at
		FROM income_cards c
		JOIN income_types t ON c.income_type_id = t.id
		WHERE c.id = $1
	`, r.driver)

	var c models.IncomeCard
	err := r.db.QueryRow(query, id).Scan(
		&c.ID,
		&c.Name,
		&c.Amount,
		&c.IncomeTypeID,
		&c.IncomeTypeName,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CardRepository) CreateIncomeCard(req *models.CreateCardRequest) (*models.IncomeCard, error) {
	query := Rebind(`
		INSERT INTO income_cards (name, amount, income_type_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, amount, income_type_id, created_at, updated_at
	`, r.driver)

	now := time.Now()
	var c models.IncomeCard
	err := r.db.QueryRow(query, req.Name, req.Amount, req.TypeID, now, now).Scan(
		&c.ID,
		&c.Name,
		&c.Amount,
		&c.IncomeTypeID,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	typeQuery := Rebind(`SELECT name FROM income_types WHERE id = $1`, r.driver)
	_ = r.db.QueryRow(typeQuery, c.IncomeTypeID).Scan(&c.IncomeTypeName)

	return &c, nil
}

func (r *CardRepository) UpdateIncomeCard(id int64, req *models.UpdateCardRequest) (*models.IncomeCard, error) {
	query := Rebind(`
		UPDATE income_cards
		SET name = $1, amount = $2, income_type_id = $3, updated_at = $4
		WHERE id = $5
		RETURNING id, name, amount, income_type_id, created_at, updated_at
	`, r.driver)

	now := time.Now()
	var c models.IncomeCard
	err := r.db.QueryRow(query, req.Name, req.Amount, req.TypeID, now, id).Scan(
		&c.ID,
		&c.Name,
		&c.Amount,
		&c.IncomeTypeID,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	typeQuery := Rebind(`SELECT name FROM income_types WHERE id = $1`, r.driver)
	_ = r.db.QueryRow(typeQuery, c.IncomeTypeID).Scan(&c.IncomeTypeName)

	return &c, nil
}

func (r *CardRepository) DeleteIncomeCard(id int64) error {
	query := Rebind(`DELETE FROM income_cards WHERE id = $1`, r.driver)
	res, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
