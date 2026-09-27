import { useState, useEffect, useCallback } from 'react';
import { Income, IncomeFormData } from '../types';
import { incomeApi } from '../services/api';

export function useIncome(initialMonth?: string) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth || 'all');
  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchIncomes = useCallback(async () => {
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

      const data = await incomeApi.getAll(params);
      setIncomes(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تحميل الإيرادات');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedTypeId, searchQuery]);

  const createIncome = async (data: IncomeFormData): Promise<Income> => {
    const created = await incomeApi.create(data);
    await fetchIncomes();
    return created;
  };

  const updateIncome = async (id: number, data: IncomeFormData): Promise<Income> => {
    const updated = await incomeApi.update(id, data);
    await fetchIncomes();
    return updated;
  };

  const deleteIncome = async (id: number): Promise<void> => {
    await incomeApi.delete(id);
    await fetchIncomes();
  };

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  return {
    incomes,
    loading,
    error,
    selectedMonth,
    setSelectedMonth,
    selectedTypeId,
    setSelectedTypeId,
    searchQuery,
    setSearchQuery,
    fetchIncomes,
    createIncome,
    updateIncome,
    deleteIncome,
  };
}
