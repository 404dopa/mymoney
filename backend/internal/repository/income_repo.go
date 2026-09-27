package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"moneytrack/internal/models"
)

type IncomeRepository struct {
	db     *sql.DB
	driver string
}

func NewIncomeRepository(db *sql.DB, driver string) *IncomeRepository {
	return &IncomeRepository{db: db, driver: driver}
}

func (r *IncomeRepository) GetAllIncomes(month, startDate, endDate string, typeID int64, search string) ([]models.Income, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if startDate != "" && endDate != "" {
		conditions = append(conditions, DateRangeFilterCondition("i.income_date", r.driver, argIdx, argIdx+1))
		args = append(args, startDate, endDate)
		argIdx += 2
	} else if month != "" && month != "all" {
		conditions = append(conditions, MonthFilterCondition("i.income_date", r.driver, argIdx))
		args = append(args, month)
		argIdx++
	}


	if typeID > 0 {
		conditions = append(conditions, fmt.Sprintf("i.income_type_id = $%d", argIdx))
		args = append(args, typeID)
		argIdx++
	}

	if strings.TrimSpace(search) != "" {
		searchPattern := "%" + strings.TrimSpace(search) + "%"
		if r.driver == "sqlite" {
			conditions = append(conditions, fmt.Sprintf("(i.name LIKE $%d OR i.note LIKE $%d)", argIdx, argIdx+1))
		} else {
			conditions = append(conditions, fmt.Sprintf("(i.name ILIKE $%d OR i.note ILIKE $%d)", argIdx, argIdx+1))
		}
		args = append(args, searchPattern, searchPattern)
		argIdx += 2
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	dateExpr := DateSelectExpression("i.income_date", r.driver)

	query := fmt.Sprintf(`
		SELECT 
			i.id, 
			i.name, 
			i.amount, 
			i.income_type_id, 
			COALESCE(t.name, '') AS income_type_name,
			%s AS income_date,
			i.note,
			i.created_at, 
			i.updated_at
		FROM incomes i
		JOIN income_types t ON i.income_type_id = t.id
		%s
		ORDER BY i.income_date DESC, i.id DESC
	`, dateExpr, whereClause)

	query = Rebind(query, r.driver)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query incomes: %w", err)
	}
	defer rows.Close()

	var incomes []models.Income
	for rows.Next() {
		var i models.Income
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Amount,
			&i.IncomeTypeID,
			&i.IncomeTypeName,
			&i.IncomeDate,
			&i.Note,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		incomes = append(incomes, i)
	}
	if incomes == nil {
		incomes = []models.Income{}
	}
	return incomes, nil
}

func (r *IncomeRepository) GetIncomeByID(id int64) (*models.Income, error) {
	dateExpr := DateSelectExpression("i.income_date", r.driver)

	query := fmt.Sprintf(`
		SELECT 
			i.id, 
			i.name, 
			i.amount, 
			i.income_type_id, 
			COALESCE(t.name, '') AS income_type_name,
			%s AS income_date,
			i.note,
			i.created_at, 
			i.updated_at
		FROM incomes i
		JOIN income_types t ON i.income_type_id = t.id
		WHERE i.id = $1
	`, dateExpr)

	query = Rebind(query, r.driver)

	var i models.Income
	err := r.db.QueryRow(query, id).Scan(
		&i.ID,
		&i.Name,
		&i.Amount,
		&i.IncomeTypeID,
		&i.IncomeTypeName,
		&i.IncomeDate,
		&i.Note,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &i, nil
}

func (r *IncomeRepository) CreateIncome(req *models.CreateIncomeRequest) (*models.Income, error) {
	dateExpr := DateSelectExpression("income_date", r.driver)

	query := fmt.Sprintf(`
		INSERT INTO incomes (name, amount, income_type_id, income_date, note, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, name, amount, income_type_id, %s, note, created_at, updated_at
	`, dateExpr)

	query = Rebind(query, r.driver)
	now := time.Now()

	var i models.Income
	err := r.db.QueryRow(
		query,
		req.Name,
		req.Amount,
		req.IncomeTypeID,
		req.IncomeDate,
		req.Note,
		now,
		now,
	).Scan(
		&i.ID,
		&i.Name,
		&i.Amount,
		&i.IncomeTypeID,
		&i.IncomeDate,
		&i.Note,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	typeQuery := Rebind(`SELECT name FROM income_types WHERE id = $1`, r.driver)
	_ = r.db.QueryRow(typeQuery, i.IncomeTypeID).Scan(&i.IncomeTypeName)

	return &i, nil
}

func (r *IncomeRepository) UpdateIncome(id int64, req *models.UpdateIncomeRequest) (*models.Income, error) {
	dateExpr := DateSelectExpression("income_date", r.driver)

	query := fmt.Sprintf(`
		UPDATE incomes
		SET name = $1, amount = $2, income_type_id = $3, income_date = $4, note = $5, updated_at = $6
		WHERE id = $7
		RETURNING id, name, amount, income_type_id, %s, note, created_at, updated_at
	`, dateExpr)

	query = Rebind(query, r.driver)
	now := time.Now()

	var i models.Income
	err := r.db.QueryRow(
		query,
		req.Name,
		req.Amount,
		req.IncomeTypeID,
		req.IncomeDate,
		req.Note,
		now,
		id,
	).Scan(
		&i.ID,
		&i.Name,
		&i.Amount,
		&i.IncomeTypeID,
		&i.IncomeDate,
		&i.Note,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	typeQuery := Rebind(`SELECT name FROM income_types WHERE id = $1`, r.driver)
	_ = r.db.QueryRow(typeQuery, i.IncomeTypeID).Scan(&i.IncomeTypeName)

	return &i, nil
}

func (r *IncomeRepository) DeleteIncome(id int64) error {
	query := Rebind(`DELETE FROM incomes WHERE id = $1`, r.driver)
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
