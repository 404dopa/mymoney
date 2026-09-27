package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"moneytrack/internal/models"
)

type TypeRepository struct {
	db     *sql.DB
	driver string
}

func NewTypeRepository(db *sql.DB, driver string) *TypeRepository {
	return &TypeRepository{db: db, driver: driver}
}

// ------------------- Expense Types -------------------

func (r *TypeRepository) GetAllExpenseTypes() ([]models.ExpenseType, error) {
	query := `SELECT id, name, created_at, updated_at FROM expense_types ORDER BY id ASC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query expense types: %w", err)
	}
	defer rows.Close()

	var types []models.ExpenseType
	for rows.Next() {
		var t models.ExpenseType
		if err := rows.Scan(&t.ID, &t.Name, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		types = append(types, t)
	}
	if types == nil {
		types = []models.ExpenseType{}
	}
	return types, nil
}

func (r *TypeRepository) GetExpenseTypeByID(id int64) (*models.ExpenseType, error) {
	query := Rebind(`SELECT id, name, created_at, updated_at FROM expense_types WHERE id = $1`, r.driver)
	var t models.ExpenseType
	err := r.db.QueryRow(query, id).Scan(&t.ID, &t.Name, &t.CreatedAt, &t.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TypeRepository) CreateExpenseType(name string) (*models.ExpenseType, error) {
	query := Rebind(`
		INSERT INTO expense_types (name, created_at, updated_at)
		VALUES ($1, $2, $3)
		RETURNING id, name, created_at, updated_at
	`, r.driver)
	now := time.Now()
	var t models.ExpenseType
	err := r.db.QueryRow(query, name, now, now).Scan(&t.ID, &t.Name, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TypeRepository) UpdateExpenseType(id int64, name string) (*models.ExpenseType, error) {
	query := Rebind(`
		UPDATE expense_types
		SET name = $1, updated_at = $2
		WHERE id = $3
		RETURNING id, name, created_at, updated_at
	`, r.driver)
	var t models.ExpenseType
	err := r.db.QueryRow(query, name, time.Now(), id).Scan(&t.ID, &t.Name, &t.CreatedAt, &t.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TypeRepository) DeleteExpenseType(id int64) error {
	checkQuery := Rebind(`SELECT COUNT(*) FROM expenses WHERE expense_type_id = $1`, r.driver)
	var count int
	err := r.db.QueryRow(checkQuery, id).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("لا يمكن حذف هذا النوع لوجود %d مصروف مسجل به", count)
	}

	deleteQuery := Rebind(`DELETE FROM expense_types WHERE id = $1`, r.driver)
	res, err := r.db.Exec(deleteQuery, id)
	if err != nil {
		return err
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// ------------------- Income Types -------------------

func (r *TypeRepository) GetAllIncomeTypes() ([]models.IncomeType, error) {
	query := `SELECT id, name, created_at, updated_at FROM income_types ORDER BY id ASC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query income types: %w", err)
	}
	defer rows.Close()

	var types []models.IncomeType
	for rows.Next() {
		var t models.IncomeType
		if err := rows.Scan(&t.ID, &t.Name, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		types = append(types, t)
	}
	if types == nil {
		types = []models.IncomeType{}
	}
	return types, nil
}

func (r *TypeRepository) GetIncomeTypeByID(id int64) (*models.IncomeType, error) {
	query := Rebind(`SELECT id, name, created_at, updated_at FROM income_types WHERE id = $1`, r.driver)
	var t models.IncomeType
	err := r.db.QueryRow(query, id).Scan(&t.ID, &t.Name, &t.CreatedAt, &t.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TypeRepository) CreateIncomeType(name string) (*models.IncomeType, error) {
	query := Rebind(`
		INSERT INTO income_types (name, created_at, updated_at)
		VALUES ($1, $2, $3)
		RETURNING id, name, created_at, updated_at
	`, r.driver)
	now := time.Now()
	var t models.IncomeType
	err := r.db.QueryRow(query, name, now, now).Scan(&t.ID, &t.Name, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TypeRepository) UpdateIncomeType(id int64, name string) (*models.IncomeType, error) {
	query := Rebind(`
		UPDATE income_types
		SET name = $1, updated_at = $2
		WHERE id = $3
		RETURNING id, name, created_at, updated_at
	`, r.driver)
	var t models.IncomeType
	err := r.db.QueryRow(query, name, time.Now(), id).Scan(&t.ID, &t.Name, &t.CreatedAt, &t.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TypeRepository) DeleteIncomeType(id int64) error {
	checkQuery := Rebind(`SELECT COUNT(*) FROM incomes WHERE income_type_id = $1`, r.driver)
	var count int
	err := r.db.QueryRow(checkQuery, id).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("لا يمكن حذف هذا النوع لوجود %d إيراد مسجل به", count)
	}

	deleteQuery := Rebind(`DELETE FROM income_types WHERE id = $1`, r.driver)
	res, err := r.db.Exec(deleteQuery, id)
	if err != nil {
		return err
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
