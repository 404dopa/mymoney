import { useState, useEffect, useCallback } from 'react';
import { ExpenseType } from '../types';
import { expenseTypeApi } from '../services/api';

export function useExpenseTypes() {
  const [types, setTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseTypeApi.getAll();
      setTypes(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('فشل في تحميل أنواع المصاريف');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createType = async (name: string): Promise<ExpenseType> => {
    const newType = await expenseTypeApi.create(name);
    await fetchTypes();
    return newType;
  };

  const updateType = async (id: number, name: string): Promise<ExpenseType> => {
    const updated = await expenseTypeApi.update(id, name);
    await fetchTypes();
    return updated;
  };

  const deleteType = async (id: number): Promise<void> => {
    await expenseTypeApi.delete(id);
    await fetchTypes();
  };

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return {
    types,
    loading,
    error,
    refreshTypes: fetchTypes,
    createType,
    updateType,
    deleteType,
  };
}
