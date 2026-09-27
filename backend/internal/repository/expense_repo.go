package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"moneytrack/internal/models"
)

type ExpenseRepository struct {
	db     *sql.DB
	driver string
}

func NewExpenseRepository(db *sql.DB, driver string) *ExpenseRepository {
	return &ExpenseRepository{db: db, driver: driver}
}

func (r *ExpenseRepository) GetAllExpenses(month, startDate, endDate string, typeID int64, search string) ([]models.Expense, error) {
	var conditions []string
	var args []interface{}
	argIdx := 1

	if startDate != "" && endDate != "" {
		conditions = append(conditions, DateRangeFilterCondition("e.expense_date", r.driver, argIdx, argIdx+1))
		args = append(args, startDate, endDate)
		argIdx += 2
	} else if month != "" && month != "all" {
		conditions = append(conditions, MonthFilterCondition("e.expense_date", r.driver, argIdx))
		args = append(args, month)
		argIdx++
	}


	if typeID > 0 {
		conditions = append(conditions, fmt.Sprintf("e.expense_type_id = $%d", argIdx))
		args = append(args, typeID)
		argIdx++
	}

	if strings.TrimSpace(search) != "" {
		searchPattern := "%" + strings.TrimSpace(search) + "%"
		if r.driver == "sqlite" {
			conditions = append(conditions, fmt.Sprintf("(e.name LIKE $%d OR e.note LIKE $%d)", argIdx, argIdx+1))
		} else {
			conditions = append(conditions, fmt.Sprintf("(e.name ILIKE $%d OR e.note ILIKE $%d)", argIdx, argIdx+1))
		}
		args = append(args, searchPattern, searchPattern)
		argIdx += 2
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	dateExpr := DateSelectExpression("e.expense_date", r.driver)

	query := fmt.Sprintf(`
		SELECT 
			e.id, 
			e.name, 
			e.amount, 
			e.expense_type_id, 
			COALESCE(t.name, '') AS expense_type_name,
			%s AS expense_date,
			e.note,
			e.created_at, 
			e.updated_at
		FROM expenses e
		JOIN expense_types t ON e.expense_type_id = t.id
		%s
		ORDER BY e.expense_date DESC, e.id DESC
	`, dateExpr, whereClause)

	query = Rebind(query, r.driver)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query expenses: %w", err)
	}
	defer rows.Close()

	var expenses []models.Expense
	for rows.Next() {
		var e models.Expense
		if err := rows.Scan(
			&e.ID,
			&e.Name,
			&e.Amount,
			&e.ExpenseTypeID,
			&e.ExpenseTypeName,
			&e.ExpenseDate,
			&e.Note,
			&e.CreatedAt,
			&e.UpdatedAt,
		); err != nil {
			return nil, err
		}
		expenses = append(expenses, e)
	}
	if expenses == nil {
		expenses = []models.Expense{}
	}
	return expenses, nil
}

func (r *ExpenseRepository) GetExpenseByID(id int64) (*models.Expense, error) {
	dateExpr := DateSelectExpression("e.expense_date", r.driver)

	query := fmt.Sprintf(`
		SELECT 
			e.id, 
			e.name, 
			e.amount, 
			e.expense_type_id, 
			COALESCE(t.name, '') AS expense_type_name,
			%s AS expense_date,
			e.note,
			e.created_at, 
			e.updated_at
		FROM expenses e
		JOIN expense_types t ON e.expense_type_id = t.id
		WHERE e.id = $1
	`, dateExpr)

	query = Rebind(query, r.driver)

	var e models.Expense
	err := r.db.QueryRow(query, id).Scan(
		&e.ID,
		&e.Name,
		&e.Amount,
		&e.ExpenseTypeID,
		&e.ExpenseTypeName,
		&e.ExpenseDate,
		&e.Note,
		&e.CreatedAt,
		&e.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *ExpenseRepository) CreateExpense(req *models.CreateExpenseRequest) (*models.Expense, error) {
	dateExpr := DateSelectExpression("expense_date", r.driver)

	query := fmt.Sprintf(`
		INSERT INTO expenses (name, amount, expense_type_id, expense_date, note, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, name, amount, expense_type_id, %s, note, created_at, updated_at
	`, dateExpr)

	query = Rebind(query, r.driver)
	now := time.Now()

	var e models.Expense
	err := r.db.QueryRow(
		query,
		req.Name,
		req.Amount,
		req.ExpenseTypeID,
		req.ExpenseDate,
		req.Note,
		now,
		now,
	).Scan(
		&e.ID,
		&e.Name,
		&e.Amount,
		&e.ExpenseTypeID,
		&e.ExpenseDate,
		&e.Note,
		&e.CreatedAt,
		&e.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	typeQuery := Rebind(`SELECT name FROM expense_types WHERE id = $1`, r.driver)
	_ = r.db.QueryRow(typeQuery, e.ExpenseTypeID).Scan(&e.ExpenseTypeName)

	return &e, nil
}

func (r *ExpenseRepository) UpdateExpense(id int64, req *models.UpdateExpenseRequest) (*models.Expense, error) {
	dateExpr := DateSelectExpression("expense_date", r.driver)

	query := fmt.Sprintf(`
		UPDATE expenses
		SET name = $1, amount = $2, expense_type_id = $3, expense_date = $4, note = $5, updated_at = $6
		WHERE id = $7
		RETURNING id, name, amount, expense_type_id, %s, note, created_at, updated_at
	`, dateExpr)

	query = Rebind(query, r.driver)
	now := time.Now()

	var e models.Expense
	err := r.db.QueryRow(
		query,
		req.Name,
		req.Amount,
		req.ExpenseTypeID,
		req.ExpenseDate,
		req.Note,
		now,
		id,
	).Scan(
		&e.ID,
		&e.Name,
		&e.Amount,
		&e.ExpenseTypeID,
		&e.ExpenseDate,
		&e.Note,
		&e.CreatedAt,
		&e.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	typeQuery := Rebind(`SELECT name FROM expense_types WHERE id = $1`, r.driver)
	_ = r.db.QueryRow(typeQuery, e.ExpenseTypeID).Scan(&e.ExpenseTypeName)

	return &e, nil
}

func (r *ExpenseRepository) DeleteExpense(id int64) error {
	query := Rebind(`DELETE FROM expenses WHERE id = $1`, r.driver)
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
