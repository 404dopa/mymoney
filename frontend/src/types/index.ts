export interface ExpenseType {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface IncomeType {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Preset Cards (البطاقات التعريفية للسحب والتسجيل السريع)
export interface ExpenseCard {
  id: number;
  name: string;
  amount: string | number;
  expense_type_id: number;
  expense_type_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IncomeCard {
  id: number;
  name: string;
  amount: string | number;
  income_type_id: number;
  income_type_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CardFormData {
  name: string;
  amount: number | string;
  type_id: number;
}

// Actual recorded transactions
export interface Expense {
  id: number;
  name: string;
  amount: string | number;
  expense_type_id: number;
  expense_type_name?: string;
  expense_date: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: number;
  name: string;
  amount: string | number;
  income_type_id: number;
  income_type_name?: string;
  income_date: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryTotal {
  type_id: number;
  type_name: string;
  total: string | number;
  count: number;
}

export interface StatisticsSummary {
  total_income: string | number;
  total_expenses: string | number;
  balance: string | number;
  expense_count: number;
  income_count: number;
  expenses_by_type: CategoryTotal[];
  income_by_type: CategoryTotal[];
  filter_month: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface ExpenseFormData {
  name: string;
  amount: number | string;
  expense_type_id: number;
  expense_date: string;
  note?: string;
}

export interface IncomeFormData {
  name: string;
  amount: number | string;
  income_type_id: number;
  income_date: string;
  note?: string;
}
