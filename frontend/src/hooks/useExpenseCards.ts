import { useState, useEffect, useCallback } from 'react';
import { CardFormData, ExpenseCard } from '../types';
import { expenseCardApi, expenseApi } from '../services/api';

export function useExpenseCards() {
  const [cards, setCards] = useState<ExpenseCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseCardApi.getAll();
      setCards(data || []);
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
    await fetchCards();
    return created;
  };

  const updateCard = async (id: number, data: CardFormData): Promise<ExpenseCard> => {
    const updated = await expenseCardApi.update(id, data);
    await fetchCards();
    return updated;
  };

  const deleteCard = async (id: number): Promise<void> => {
    await expenseCardApi.delete(id);
    await fetchCards();
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
    fetchCards();
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

