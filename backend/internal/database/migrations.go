package database

import (
	"database/sql"
	"fmt"
	"log"
)

const sqliteMigrationSQL = `
-- SQLite Schema

CREATE TABLE IF NOT EXISTS expense_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS income_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Expense Preset Cards (البطاقات التعريفية للمصاريف السريعة)
CREATE TABLE IF NOT EXISTS expense_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    expense_type_id INTEGER NOT NULL REFERENCES expense_types(id) ON DELETE RESTRICT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Income Preset Cards (البطاقات التعريفية للإيرادات السريعة)
CREATE TABLE IF NOT EXISTS income_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    income_type_id INTEGER NOT NULL REFERENCES income_types(id) ON DELETE RESTRICT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recorded Expenses (المصاريف المسجلة فعلياً)
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    expense_type_id INTEGER NOT NULL REFERENCES expense_types(id) ON DELETE RESTRICT,
    expense_date TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recorded Incomes (الإيرادات المسجلة فعلياً)
CREATE TABLE IF NOT EXISTS incomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    income_type_id INTEGER NOT NULL REFERENCES income_types(id) ON DELETE RESTRICT,
    income_date TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(income_date);
CREATE INDEX IF NOT EXISTS idx_incomes_type ON incomes(income_type_id);

-- Insert Default Expense Types
INSERT INTO expense_types (name) VALUES
    ('طعام'),
    ('نقل'),
    ('صيانة'),
    ('فواتير'),
    ('رواتب'),
    ('مشتريات'),
    ('أخرى')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Income Types
INSERT INTO income_types (name) VALUES
    ('راتب'),
    ('مبيعات'),
    ('مشروع'),
    ('استثمار'),
    ('عمولة'),
    ('أخرى')
ON CONFLICT (name) DO NOTHING;

-- Insert Initial Preset Expense Cards
INSERT INTO expense_cards (name, amount, expense_type_id)
SELECT 'بنزين', 25000, id FROM expense_types WHERE name = 'نقل'
AND NOT EXISTS (SELECT 1 FROM expense_cards WHERE name = 'بنزين');

INSERT INTO expense_cards (name, amount, expense_type_id)
SELECT 'وجبة غداء', 10000, id FROM expense_types WHERE name = 'طعام'
AND NOT EXISTS (SELECT 1 FROM expense_cards WHERE name = 'وجبة غداء');

INSERT INTO expense_cards (name, amount, expense_type_id)
SELECT 'قهوة وشاي', 3000, id FROM expense_types WHERE name = 'طعام'
AND NOT EXISTS (SELECT 1 FROM expense_cards WHERE name = 'قهوة وشاي');

INSERT INTO expense_cards (name, amount, expense_type_id)
SELECT 'فاتورة كهرباء', 50000, id FROM expense_types WHERE name = 'فواتير'
AND NOT EXISTS (SELECT 1 FROM expense_cards WHERE name = 'فاتورة كهرباء');

-- Insert Initial Preset Income Cards
INSERT INTO income_cards (name, amount, income_type_id)
SELECT 'راتب شهري', 1500000, id FROM income_types WHERE name = 'راتب'
AND NOT EXISTS (SELECT 1 FROM income_cards WHERE name = 'راتب شهري');

INSERT INTO income_cards (name, amount, income_type_id)
SELECT 'مبيعات يومية', 100000, id FROM income_types WHERE name = 'مبيعات'
AND NOT EXISTS (SELECT 1 FROM income_cards WHERE name = 'مبيعات يومية');

INSERT INTO income_cards (name, amount, income_type_id)
SELECT 'دفعة مشروع', 500000, id FROM income_types WHERE name = 'مشروع'
AND NOT EXISTS (SELECT 1 FROM income_cards WHERE name = 'دفعة مشروع');
`

const postgresMigrationSQL = `
-- PostgreSQL Schema

CREATE TABLE IF NOT EXISTS expense_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS income_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expense Preset Cards (البطاقات التعريفية للمصاريف السريعة)
CREATE TABLE IF NOT EXISTS expense_cards (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    expense_type_id BIGINT NOT NULL REFERENCES expense_types(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Income Preset Cards (البطاقات التعريفية للإيرادات السريعة)
CREATE TABLE IF NOT EXISTS income_cards (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    income_type_id BIGINT NOT NULL REFERENCES income_types(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recorded Expenses (المصاريف المسجلة فعلياً)
CREATE TABLE IF NOT EXISTS expenses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    expense_type_id BIGINT NOT NULL REFERENCES expense_types(id) ON DELETE RESTRICT,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recorded Incomes (الإيرادات المسجلة فعلياً)
CREATE TABLE IF NOT EXISTS incomes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    income_type_id BIGINT NOT NULL REFERENCES income_types(id) ON DELETE RESTRICT,
    income_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(income_date);
CREATE INDEX IF NOT EXISTS idx_incomes_type ON incomes(income_type_id);

-- Insert Default Expense Types
INSERT INTO expense_types (name) VALUES
    ('طعام'),
    ('نقل'),
    ('صيانة'),
    ('فواتير'),
    ('رواتب'),
    ('مشتريات'),
    ('أخرى')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Income Types
INSERT INTO income_types (name) VALUES
    ('راتب'),
    ('مبيعات'),
    ('مشروع'),
    ('استثمار'),
    ('عمولة'),
    ('أخرى')
ON CONFLICT (name) DO NOTHING;

-- Insert Initial Preset Expense Cards
INSERT INTO expense_cards (name, amount, expense_type_id)
SELECT 'بنزين', 25000, id FROM expense_types WHERE name = 'نقل'
AND NOT EXISTS (SELECT 1 FROM expense_cards WHERE name = 'بنزين');

INSERT INTO expense_cards (name, amount, expense_type_id)
SELECT 'وجبة غداء', 10000, id FROM expense_types WHERE name = 'طعام'
AND NOT EXISTS (SELECT 1 FROM expense_cards WHERE name = 'وجبة غداء');

INSERT INTO expense_cards (name, amount, expense_type_id)
SELECT 'قهوة وشاي', 3000, id FROM expense_types WHERE name = 'طعام'
AND NOT EXISTS (SELECT 1 FROM expense_cards WHERE name = 'قهوة وشاي');

INSERT INTO expense_cards (name, amount, expense_type_id)
SELECT 'فاتورة كهرباء', 50000, id FROM expense_types WHERE name = 'فواتير'
AND NOT EXISTS (SELECT 1 FROM expense_cards WHERE name = 'فاتورة كهرباء');

-- Insert Initial Preset Income Cards
INSERT INTO income_cards (name, amount, income_type_id)
SELECT 'راتب شهري', 1500000, id FROM income_types WHERE name = 'راتب'
AND NOT EXISTS (SELECT 1 FROM income_cards WHERE name = 'راتب شهري');

INSERT INTO income_cards (name, amount, income_type_id)
SELECT 'مبيعات يومية', 100000, id FROM income_types WHERE name = 'مبيعات'
AND NOT EXISTS (SELECT 1 FROM income_cards WHERE name = 'مبيعات يومية');

INSERT INTO income_cards (name, amount, income_type_id)
SELECT 'دفعة مشروع', 500000, id FROM income_types WHERE name = 'مشروع'
AND NOT EXISTS (SELECT 1 FROM income_cards WHERE name = 'دفعة مشروع');
`

func RunMigrations(db *sql.DB, driver string) error {
	log.Printf("Checking and running database migrations for driver: %s...\n", driver)

	var sqlToRun string
	if driver == "sqlite" {
		sqlToRun = sqliteMigrationSQL
	} else {
		sqlToRun = postgresMigrationSQL
	}

	_, err := db.Exec(sqlToRun)
	if err != nil {
		return fmt.Errorf("error executing %s migration SQL: %w", driver, err)
	}
	log.Printf("Database migrations for %s applied successfully.\n", driver)
	return nil
}
