import { useState, useEffect, useCallback } from 'react';
import { CardFormData, ExpenseCard } from '../types';
import { expenseCardApi, expenseApi } from '../services/api';

let cachedExpenseCards: ExpenseCard[] | null = null;

export function useExpenseCards() {
  const [cards, setCards] = useState<ExpenseCard[]>(() => cachedExpenseCards || []);
  const [loading, setLoading] = useState<boolean>(() => cachedExpenseCards === null);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async (isBackground: boolean | unknown = false) => {
    const bg = isBackground === true;
    try {
      if (!bg && !cachedExpenseCards) {
        setLoading(true);
      }
      setError(null);
      const data = await expenseCardApi.getAll();
      const safeData = data || [];
      cachedExpenseCards = safeData;
      setCards(safeData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تحميل بطاقات المصاريف');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createCard = async (data: CardFormData): Promise<ExpenseCard> => {
    const created = await expenseCardApi.create(data);
    await fetchCards(false);
    return created;
  };

  const updateCard = async (id: number, data: CardFormData): Promise<ExpenseCard> => {
    const updated = await expenseCardApi.update(id, data);
    await fetchCards(false);
    return updated;
  };

  const deleteCard = async (id: number): Promise<void> => {
    await expenseCardApi.delete(id);
    await fetchCards(false);
  };

  const recordFromCard = async (id: number) => {
    return await expenseCardApi.record(id);
  };

  const recordTransaction = async (card: ExpenseCard, customAmount: number, note?: string) => {
    const today = new Date().toISOString().split('T')[0];
    return await expenseApi.create({
      name: card.name,
      amount: customAmount,
      expense_type_id: card.expense_type_id,
      expense_date: today,
      note: note || 'مسجل من البطاقة السريعة',
    });
  };

  useEffect(() => {
    fetchCards(cachedExpenseCards !== null);
  }, [fetchCards]);

  return {
    cards,
    loading,
    error,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    recordFromCard,
    recordTransaction,
  };
}

