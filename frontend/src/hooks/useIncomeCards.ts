import { useState, useEffect, useCallback } from 'react';
import { CardFormData, IncomeCard } from '../types';
import { incomeCardApi, incomeApi } from '../services/api';

export function useIncomeCards() {
  const [cards, setCards] = useState<IncomeCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await incomeCardApi.getAll();
      setCards(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تحميل بطاقات الإيرادات');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createCard = async (data: CardFormData): Promise<IncomeCard> => {
    const created = await incomeCardApi.create(data);
    await fetchCards();
    return created;
  };

  const updateCard = async (id: number, data: CardFormData): Promise<IncomeCard> => {
    const updated = await incomeCardApi.update(id, data);
    await fetchCards();
    return updated;
  };

  const deleteCard = async (id: number): Promise<void> => {
    await incomeCardApi.delete(id);
    await fetchCards();
  };

  const recordFromCard = async (id: number) => {
    return await incomeCardApi.record(id);
  };

  const recordTransaction = async (card: IncomeCard, customAmount: number, note?: string) => {
    const today = new Date().toISOString().split('T')[0];
    return await incomeApi.create({
      name: card.name,
      amount: customAmount,
      income_type_id: card.income_type_id,
      income_date: today,
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

