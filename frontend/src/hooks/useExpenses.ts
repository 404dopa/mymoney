import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFormData } from '../types';
import { expenseApi } from '../services/api';

export function useExpenses(initialMonth?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth || 'all');
  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { month?: string; type_id?: number; search?: string } = {};
      if (selectedMonth && selectedMonth !== 'all') {
        params.month = selectedMonth;
      }
      if (selectedTypeId > 0) {
        params.type_id = selectedTypeId;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const data = await expenseApi.getAll(params);
      setExpenses(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تحميل المصاريف');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedTypeId, searchQuery]);

  const createExpense = async (data: ExpenseFormData): Promise<Expense> => {
    const created = await expenseApi.create(data);
    await fetchExpenses();
    return created;
  };

  const updateExpense = async (id: number, data: ExpenseFormData): Promise<Expense> => {
    const updated = await expenseApi.update(id, data);
    await fetchExpenses();
    return updated;
  };

  const deleteExpense = async (id: number): Promise<void> => {
    await expenseApi.delete(id);
    await fetchExpenses();
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    error,
    selectedMonth,
    setSelectedMonth,
    selectedTypeId,
    setSelectedTypeId,
    searchQuery,
    setSearchQuery,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
