import { useState, useEffect, useCallback } from 'react';
import { Expense, Income, StatisticsSummary } from '../types';
import { statisticsApi } from '../services/api';
import { getDaysInMonth } from '../utils/date';

let cachedSummary: StatisticsSummary | null = null;
let cachedRangeKey = '';

export function useStatistics(initialStartDate?: string, initialEndDate?: string) {
  // Initialize with current month range by default
  const [startDate, setStartDate] = useState<string>(() => {
    if (initialStartDate) return initialStartDate;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
  });

  const [endDate, setEndDate] = useState<string>(() => {
    if (initialEndDate) return initialEndDate;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const lastDay = getDaysInMonth(y, m);
    return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  });

  const currentRangeKey = `${startDate}_${endDate}`;
  const [summary, setSummary] = useState<StatisticsSummary | null>(() => {
    return cachedRangeKey === currentRangeKey ? cachedSummary : null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !(cachedRangeKey === currentRangeKey && cachedSummary !== null);
  });
  const [error, setError] = useState<string | null>(null);

  // Category drill-down state
  const [drillDownCategory, setDrillDownCategory] = useState<{
    id: number;
    name: string;
    kind: 'expense' | 'income';
    total: string | number;
    items: (Expense | Income)[];
    loading: boolean;
  } | null>(null);

  const fetchStats = useCallback(async (isBackground: boolean | unknown = false) => {
    const bg = isBackground === true;
    try {
      if (!bg && !cachedSummary) {
        setLoading(true);
      }
      setError(null);
      const params: {
        start_date?: string;
        end_date?: string;
      } = {};

      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await statisticsApi.getSummary(params);
      cachedSummary = data;
      cachedRangeKey = `${startDate}_${endDate}`;
      setSummary(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تحميل بيانات الإحصائيات');
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const openCategoryDetails = async (
    id: number,
    name: string,
    kind: 'expense' | 'income',
    total: string | number
  ) => {
    setDrillDownCategory({
      id,
      name,
      kind,
      total,
      items: [],
      loading: true,
    });

    try {
      const filter = {
        start_date: startDate,
        end_date: endDate,
      };

      let items: (Expense | Income)[] = [];
      if (kind === 'expense') {
        items = await statisticsApi.getExpenseTransactionsByCategory(id, filter);
      } else {
        items = await statisticsApi.getIncomeTransactionsByCategory(id, filter);
      }

      setDrillDownCategory({
        id,
        name,
        kind,
        total,
        items,
        loading: false,
      });
    } catch (err: unknown) {
      setDrillDownCategory((prev) =>
        prev ? { ...prev, loading: false } : null
      );
    }
  };

  const closeCategoryDetails = () => {
    setDrillDownCategory(null);
  };

  useEffect(() => {
    fetchStats(cachedSummary !== null && cachedRangeKey === `${startDate}_${endDate}`);
  }, [fetchStats, startDate, endDate]);

  return {
    summary,
    loading,
    error,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    fetchStats,
    drillDownCategory,
    openCategoryDetails,
    closeCategoryDetails,
  };
}
