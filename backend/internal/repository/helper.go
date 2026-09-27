package repository

import (
	"fmt"
	"regexp"
)

var paramRegex = regexp.MustCompile(`\$\d+`)

// Rebind converts $1, $2, $3 style placeholders to ? when running on SQLite
func Rebind(query string, driver string) string {
	if driver == "sqlite" {
		return paramRegex.ReplaceAllString(query, "?")
	}
	return query
}

// MonthFilterCondition returns the appropriate SQL condition for filtering by YYYY-MM
func MonthFilterCondition(colName string, driver string, argIdx int) string {
	if driver == "sqlite" {
		return fmt.Sprintf("substr(%s, 1, 7) = $%d", colName, argIdx)
	}
	return fmt.Sprintf("TO_CHAR(%s, 'YYYY-MM') = $%d", colName, argIdx)
}

// DateSelectExpression returns the appropriate date string expression YYYY-MM-DD
func DateSelectExpression(colName string, driver string) string {
	if driver == "sqlite" {
		return fmt.Sprintf("substr(%s, 1, 10)", colName)
	}
	return fmt.Sprintf("TO_CHAR(%s, 'YYYY-MM-DD')", colName)
}

// DateRangeFilterCondition returns the SQL condition for filtering between startDate and endDate inclusive
func DateRangeFilterCondition(colName string, driver string, startIdx, endIdx int) string {
	if driver == "sqlite" {
		return fmt.Sprintf("substr(%s, 1, 10) >= $%d AND substr(%s, 1, 10) <= $%d", colName, startIdx, colName, endIdx)
	}
	return fmt.Sprintf("CAST(%s AS DATE) >= $%d::DATE AND CAST(%s AS DATE) <= $%d::DATE", colName, startIdx, colName, endIdx)
}

