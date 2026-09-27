import {
  ApiResponse,
  CardFormData,
  Expense,
  ExpenseCard,
  ExpenseFormData,
  ExpenseType,
  Income,
  IncomeCard,
  IncomeFormData,
  IncomeType,
  StatisticsSummary,
} from '../types';

const ENV_URL = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '';
const API_BASE = ENV_URL ? `${ENV_URL.replace(/\/$/, '')}/api` : '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await res.json().catch(() => ({
      success: false,
      data: null as unknown as T,
      message: 'فشل في قراءة استجابة الخادم',
    }));

    if (!res.ok || !data.success) {
      throw new Error(data.message || `خطأ في الاتصال بالخادم (${res.status})`);
    }

    return data.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('حدث خطأ غير متوقع أثناء الاتصال بالخادم');
  }
}

// ------------------- Preset Expense Cards API (البطاقات التعريفية للمصاريف) -------------------
export const expenseCardApi = {
  getAll: () => request<ExpenseCard[]>('/expense-cards'),

  create: (data: CardFormData) =>
    request<ExpenseCard>('/expense-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: CardFormData) =>
    request<ExpenseCard>(`/expense-cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/expense-cards/${id}`, {
      method: 'DELETE',
    }),

  record: (id: number) =>
    request<Expense>(`/expense-cards/${id}/record`, {
      method: 'POST',
    }),
};

// ------------------- Preset Income Cards API (البطاقات التعريفية للإيرادات) -------------------
export const incomeCardApi = {
  getAll: () => request<IncomeCard[]>('/income-cards'),

  create: (data: CardFormData) =>
    request<IncomeCard>('/income-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: CardFormData) =>
    request<IncomeCard>(`/income-cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/income-cards/${id}`, {
      method: 'DELETE',
    }),

  record: (id: number) =>
    request<Income>(`/income-cards/${id}/record`, {
      method: 'POST',
    }),
};

// ------------------- Recorded Expenses API -------------------
export const expenseApi = {
  getAll: (params?: { month?: string; type_id?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', params.month);
    if (params?.type_id) query.set('type_id', String(params.type_id));
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<Expense[]>(`/expenses${qs ? `?${qs}` : ''}`);
  },

  getById: (id: number) => request<Expense>(`/expenses/${id}`),

  create: (data: ExpenseFormData) =>
    request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ExpenseFormData) =>
    request<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/expenses/${id}`, {
      method: 'DELETE',
    }),
};

// ------------------- Recorded Income API -------------------
export const incomeApi = {
  getAll: (params?: { month?: string; type_id?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', params.month);
    if (params?.type_id) query.set('type_id', String(params.type_id));
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<Income[]>(`/income${qs ? `?${qs}` : ''}`);
  },

  getById: (id: number) => request<Income>(`/income/${id}`),

  create: (data: IncomeFormData) =>
    request<Income>('/income', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: IncomeFormData) =>
    request<Income>(`/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/income/${id}`, {
      method: 'DELETE',
    }),
};

// ------------------- Expense Types API -------------------
export const expenseTypeApi = {
  getAll: () => request<ExpenseType[]>('/expense-types'),

  create: (name: string) =>
    request<ExpenseType>('/expense-types', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  update: (id: number, name: string) =>
    request<ExpenseType>(`/expense-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  delete: (id: number) =>
    request<void>(`/expense-types/${id}`, {
      method: 'DELETE',
    }),
};

// ------------------- Income Types API -------------------
export const incomeTypeApi = {
  getAll: () => request<IncomeType[]>('/income-types'),

  create: (name: string) =>
    request<IncomeType>('/income-types', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  update: (id: number, name: string) =>
    request<IncomeType>(`/income-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  delete: (id: number) =>
    request<void>(`/income-types/${id}`, {
      method: 'DELETE',
    }),
};

// ------------------- Statistics API -------------------
export const statisticsApi = {
  getSummary: (params?: { month?: string; start_date?: string; end_date?: string; expense_type_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', params.month);
    if (params?.start_date) query.set('start_date', params.start_date);
    if (params?.end_date) query.set('end_date', params.end_date);
    if (params?.expense_type_id) query.set('expense_type_id', String(params.expense_type_id));
    const qs = query.toString();
    return request<StatisticsSummary>(`/statistics${qs ? `?${qs}` : ''}`);
  },

  getExpenseTransactionsByCategory: (
    typeId: number,
    filter?: string | { month?: string; start_date?: string; end_date?: string }
  ) => {
    const query = new URLSearchParams();
    if (typeof filter === 'string') {
      if (filter) query.set('month', filter);
    } else if (filter) {
      if (filter.month) query.set('month', filter.month);
      if (filter.start_date) query.set('start_date', filter.start_date);
      if (filter.end_date) query.set('end_date', filter.end_date);
    }
    const qs = query.toString();
    return request<Expense[]>(`/statistics/expenses-by-category/${typeId}${qs ? `?${qs}` : ''}`);
  },

  getIncomeTransactionsByCategory: (
    typeId: number,
    filter?: string | { month?: string; start_date?: string; end_date?: string }
  ) => {
    const query = new URLSearchParams();
    if (typeof filter === 'string') {
      if (filter) query.set('month', filter);
    } else if (filter) {
      if (filter.month) query.set('month', filter.month);
      if (filter.start_date) query.set('start_date', filter.start_date);
      if (filter.end_date) query.set('end_date', filter.end_date);
    }
    const qs = query.toString();
    return request<Income[]>(`/statistics/incomes-by-category/${typeId}${qs ? `?${qs}` : ''}`);
  },
};

