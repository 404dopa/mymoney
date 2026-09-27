import { useState, useEffect, useCallback } from 'react';
import { IncomeType } from '../types';
import { incomeTypeApi } from '../services/api';

export function useIncomeTypes() {
  const [types, setTypes] = useState<IncomeType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await incomeTypeApi.getAll();
      setTypes(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('فشل في تحميل أنواع الإيرادات');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createType = async (name: string): Promise<IncomeType> => {
    const newType = await incomeTypeApi.create(name);
    await fetchTypes();
    return newType;
  };

  const updateType = async (id: number, name: string): Promise<IncomeType> => {
    const updated = await incomeTypeApi.update(id, name);
    await fetchTypes();
    return updated;
  };

  const deleteType = async (id: number): Promise<void> => {
    await incomeTypeApi.delete(id);
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
