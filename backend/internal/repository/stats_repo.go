package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/shopspring/decimal"
	"moneytrack/internal/models"
)

type StatsRepository struct {
	db     *sql.DB
	driver string
}

func NewStatsRepository(db *sql.DB, driver string) *StatsRepository {
	return &StatsRepository{db: db, driver: driver}
}

// parseDecimal safely converts any database value (int, float, string, byte slice, nil) to decimal.Decimal
func parseDecimal(val interface{}) decimal.Decimal {
	if val == nil {
		return decimal.Zero
	}
	switch v := val.(type) {
	case decimal.Decimal:
		return v
	case []byte:
		d, err := decimal.NewFromString(string(v))
		if err == nil {
			return d
		}
	case string:
		d, err := decimal.NewFromString(v)
		if err == nil {
			return d
		}
	case int64:
		return decimal.NewFromInt(v)
	case int32:
		return decimal.NewFromInt32(v)
	case int:
		return decimal.NewFromInt(int64(v))
	case float64:
		return decimal.NewFromFloat(v)
	case float32:
		return decimal.NewFromFloat32(v)
	}
	d, err := decimal.NewFromString(fmt.Sprint(val))
	if err == nil {
		return d
	}
	return decimal.Zero
}

func (r *StatsRepository) GetStatistics(month, startDate, endDate string, expenseTypeID int64) (*models.StatisticsSummary, error) {
	summary := &models.StatisticsSummary{
		TotalIncome:    decimal.Zero,
		TotalExpenses:  decimal.Zero,
		Balance:        decimal.Zero,
		ExpenseCount:   0,
		IncomeCount:    0,
		ExpensesByType: []models.CategoryTotal{},
		IncomeByType:   []models.CategoryTotal{},
		FilterMonth:    month,
	}

	// 1. Calculate Income Total & Count
	incomeWhere := ""
	var incomeArgs []interface{}
	if startDate != "" && endDate != "" {
		incomeWhere = "WHERE " + DateRangeFilterCondition("income_date", r.driver, 1, 2)
		incomeArgs = append(incomeArgs, startDate, endDate)
	} else if month != "" && month != "all" {
		incomeWhere = "WHERE " + MonthFilterCondition("income_date", r.driver, 1)
		incomeArgs = append(incomeArgs, month)
	}

	incomeQuery := fmt.Sprintf(`
		SELECT COALESCE(SUM(amount), 0), COUNT(id)
		FROM incomes
		%s
	`, incomeWhere)
	incomeQuery = Rebind(incomeQuery, r.driver)

	var rawIncome interface{}
	var incomeCount int
	if err := r.db.QueryRow(incomeQuery, incomeArgs...).Scan(&rawIncome, &incomeCount); err != nil {
		return nil, fmt.Errorf("failed calculating income stats (query: %s, args: %v): %w", incomeQuery, incomeArgs, err)
	}
	summary.TotalIncome = parseDecimal(rawIncome)
	summary.IncomeCount = incomeCount

	// 2. Calculate Expense Total & Count
	var expConditions []string
	var expArgs []interface{}
	argIdx := 1

	if startDate != "" && endDate != "" {
		expConditions = append(expConditions, DateRangeFilterCondition("expense_date", r.driver, argIdx, argIdx+1))
		expArgs = append(expArgs, startDate, endDate)
		argIdx += 2
	} else if month != "" && month != "all" {
		expConditions = append(expConditions, MonthFilterCondition("expense_date", r.driver, argIdx))
		expArgs = append(expArgs, month)
		argIdx++
	}

	if expenseTypeID > 0 {
		expConditions = append(expConditions, fmt.Sprintf("expense_type_id = $%d", argIdx))
		expArgs = append(expArgs, expenseTypeID)
		argIdx++
	}

	expWhere := ""
	if len(expConditions) > 0 {
		expWhere = "WHERE " + strings.Join(expConditions, " AND ")
	}

	expenseQuery := fmt.Sprintf(`
		SELECT COALESCE(SUM(amount), 0), COUNT(id)
		FROM expenses
		%s
	`, expWhere)
	expenseQuery = Rebind(expenseQuery, r.driver)

	var rawExpenses interface{}
	var expenseCount int
	if err := r.db.QueryRow(expenseQuery, expArgs...).Scan(&rawExpenses, &expenseCount); err != nil {
		return nil, fmt.Errorf("failed calculating expense stats (query: %s, args: %v): %w", expenseQuery, expArgs, err)
	}
	summary.TotalExpenses = parseDecimal(rawExpenses)
	summary.ExpenseCount = expenseCount

	// Balance = TotalIncome - TotalExpenses
	summary.Balance = summary.TotalIncome.Sub(summary.TotalExpenses)

	// 3. Expenses Grouped By Type
	var groupConditions []string
	var groupArgs []interface{}
	gIdx := 1

	if startDate != "" && endDate != "" {
		groupConditions = append(groupConditions, DateRangeFilterCondition("e.expense_date", r.driver, gIdx, gIdx+1))
		groupArgs = append(groupArgs, startDate, endDate)
		gIdx += 2
	} else if month != "" && month != "all" {
		groupConditions = append(groupConditions, MonthFilterCondition("e.expense_date", r.driver, gIdx))
		groupArgs = append(groupArgs, month)
		gIdx++
	}

	if expenseTypeID > 0 {
		groupConditions = append(groupConditions, fmt.Sprintf("e.expense_type_id = $%d", gIdx))
		groupArgs = append(groupArgs, expenseTypeID)
		gIdx++
	}

	groupWhere := ""
	if len(groupConditions) > 0 {
		groupWhere = "WHERE " + strings.Join(groupConditions, " AND ")
	}

	expGroupQuery := fmt.Sprintf(`
		SELECT 
			t.id, 
			t.name, 
			COALESCE(SUM(e.amount), 0) AS total, 
			COUNT(e.id) AS count
		FROM expenses e
		JOIN expense_types t ON e.expense_type_id = t.id
		%s
		GROUP BY t.id, t.name
		HAVING COALESCE(SUM(e.amount), 0) > 0
		ORDER BY total DESC
	`, groupWhere)
	expGroupQuery = Rebind(expGroupQuery, r.driver)

	rows, err := r.db.Query(expGroupQuery, groupArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed grouping expenses by type (query: %s, args: %v): %w", expGroupQuery, groupArgs, err)
	}
	defer rows.Close()

	for rows.Next() {
		var cat models.CategoryTotal
		var rawTotal interface{}
		if err := rows.Scan(&cat.TypeID, &cat.TypeName, &rawTotal, &cat.Count); err != nil {
			return nil, fmt.Errorf("failed scanning expense category: %w", err)
		}
		cat.Total = parseDecimal(rawTotal)
		summary.ExpensesByType = append(summary.ExpensesByType, cat)
	}

	// 4. Incomes Grouped By Type
	incGroupWhere := ""
	var incGroupArgs []interface{}
	if startDate != "" && endDate != "" {
		incGroupWhere = "WHERE " + DateRangeFilterCondition("i.income_date", r.driver, 1, 2)
		incGroupArgs = append(incGroupArgs, startDate, endDate)
	} else if month != "" && month != "all" {
		incGroupWhere = "WHERE " + MonthFilterCondition("i.income_date", r.driver, 1)
		incGroupArgs = append(incGroupArgs, month)
	}

	incGroupQuery := fmt.Sprintf(`
		SELECT 
			t.id, 
			t.name, 
			COALESCE(SUM(i.amount), 0) AS total, 
			COUNT(i.id) AS count
		FROM incomes i
		JOIN income_types t ON i.income_type_id = t.id
		%s
		GROUP BY t.id, t.name
		HAVING COALESCE(SUM(i.amount), 0) > 0
		ORDER BY total DESC
	`, incGroupWhere)
	incGroupQuery = Rebind(incGroupQuery, r.driver)

	incRows, err := r.db.Query(incGroupQuery, incGroupArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed grouping incomes by type (query: %s, args: %v): %w", incGroupQuery, incGroupArgs, err)
	}
	defer incRows.Close()

	for incRows.Next() {
		var cat models.CategoryTotal
		var rawTotal interface{}
		if err := incRows.Scan(&cat.TypeID, &cat.TypeName, &rawTotal, &cat.Count); err != nil {
			return nil, fmt.Errorf("failed scanning income category: %w", err)
		}
		cat.Total = parseDecimal(rawTotal)
		summary.IncomeByType = append(summary.IncomeByType, cat)
	}

	return summary, nil
}

