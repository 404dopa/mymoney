package models

import (
	"time"

	"github.com/shopspring/decimal"
)

// ExpenseType represents category for outgoing expenses
type ExpenseType struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// IncomeType represents category for incoming revenues
type IncomeType struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ExpenseCard represents a preset/template card for quick 1-tap recording
type ExpenseCard struct {
	ID              int64           `json:"id"`
	Name            string          `json:"name"`
	Amount          decimal.Decimal `json:"amount"`
	ExpenseTypeID   int64           `json:"expense_type_id"`
	ExpenseTypeName string          `json:"expense_type_name,omitempty"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

// IncomeCard represents a preset/template card for quick 1-tap recording
type IncomeCard struct {
	ID             int64           `json:"id"`
	Name           string          `json:"name"`
	Amount         decimal.Decimal `json:"amount"`
	IncomeTypeID   int64           `json:"income_type_id"`
	IncomeTypeName string          `json:"income_type_name,omitempty"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// Create/Update Card Request
type CreateCardRequest struct {
	Name   string          `json:"name" binding:"required"`
	Amount decimal.Decimal `json:"amount" binding:"required"`
	TypeID int64           `json:"type_id" binding:"required"`
}

type UpdateCardRequest struct {
	Name   string          `json:"name" binding:"required"`
	Amount decimal.Decimal `json:"amount" binding:"required"`
	TypeID int64           `json:"type_id" binding:"required"`
}

// Expense represents an outgoing financial transaction recorded
type Expense struct {
	ID              int64           `json:"id"`
	Name            string          `json:"name"`
	Amount          decimal.Decimal `json:"amount"`
	ExpenseTypeID   int64           `json:"expense_type_id"`
	ExpenseTypeName string          `json:"expense_type_name,omitempty"`
	ExpenseDate     string          `json:"expense_date"` // YYYY-MM-DD
	Note            string          `json:"note"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

// Income represents an incoming financial transaction recorded
type Income struct {
	ID             int64           `json:"id"`
	Name           string          `json:"name"`
	Amount         decimal.Decimal `json:"amount"`
	IncomeTypeID   int64           `json:"income_type_id"`
	IncomeTypeName string          `json:"income_type_name,omitempty"`
	IncomeDate     string          `json:"income_date"` // YYYY-MM-DD
	Note           string          `json:"note"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// Create/Update Requests for recorded transactions
type CreateExpenseRequest struct {
	Name          string          `json:"name" binding:"required"`
	Amount        decimal.Decimal `json:"amount" binding:"required"`
	ExpenseTypeID int64           `json:"expense_type_id" binding:"required"`
	ExpenseDate   string          `json:"expense_date" binding:"required"`
	Note          string          `json:"note"`
}

type UpdateExpenseRequest struct {
	Name          string          `json:"name" binding:"required"`
	Amount        decimal.Decimal `json:"amount" binding:"required"`
	ExpenseTypeID int64           `json:"expense_type_id" binding:"required"`
	ExpenseDate   string          `json:"expense_date" binding:"required"`
	Note          string          `json:"note"`
}

type CreateIncomeRequest struct {
	Name         string          `json:"name" binding:"required"`
	Amount       decimal.Decimal `json:"amount" binding:"required"`
	IncomeTypeID int64           `json:"income_type_id" binding:"required"`
	IncomeDate   string          `json:"income_date" binding:"required"`
	Note         string          `json:"note"`
}

type UpdateIncomeRequest struct {
	Name         string          `json:"name" binding:"required"`
	Amount       decimal.Decimal `json:"amount" binding:"required"`
	IncomeTypeID int64           `json:"income_type_id" binding:"required"`
	IncomeDate   string          `json:"income_date" binding:"required"`
	Note         string          `json:"note"`
}

type CreateTypeRequest struct {
	Name string `json:"name" binding:"required"`
}

type UpdateTypeRequest struct {
	Name string `json:"name" binding:"required"`
}

// CategoryTotal represents grouped stats for an expense or income type
type CategoryTotal struct {
	TypeID   int64           `json:"type_id"`
	TypeName string          `json:"type_name"`
	Total    decimal.Decimal `json:"total"`
	Count    int             `json:"count"`
}

// StatisticsSummary represents overall financial metrics
type StatisticsSummary struct {
	TotalIncome    decimal.Decimal `json:"total_income"`
	TotalExpenses  decimal.Decimal `json:"total_expenses"`
	Balance        decimal.Decimal `json:"balance"`
	ExpenseCount   int             `json:"expense_count"`
	IncomeCount    int             `json:"income_count"`
	ExpensesByType []CategoryTotal `json:"expenses_by_type"`
	IncomeByType   []CategoryTotal `json:"income_by_type"`
	FilterMonth    string          `json:"filter_month"`
}
