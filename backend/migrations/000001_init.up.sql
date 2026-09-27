-- Create expense_types table
CREATE TABLE IF NOT EXISTS expense_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create income_types table
CREATE TABLE IF NOT EXISTS income_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create expenses table
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

-- Create incomes table
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

-- Create Indexes for performance
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
