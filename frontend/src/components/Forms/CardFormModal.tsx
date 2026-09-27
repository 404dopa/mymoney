import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { CardFormData, ExpenseCard, ExpenseType, IncomeCard, IncomeType } from '../../types';
import './Forms.css';

export interface CardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CardFormData) => Promise<void>;
  types: (ExpenseType | IncomeType)[];
  onCreateType: (name: string) => Promise<ExpenseType | IncomeType>;
  kind: 'expense' | 'income';
  initialData?: ExpenseCard | IncomeCard | null;
}

export const CardFormModal: React.FC<CardFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  types,
  onCreateType,
  kind,
  initialData,
}) => {
  const isExpense = kind === 'expense';
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [typeId, setTypeId] = useState<number>(0);

  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(String(initialData.amount));
      setTypeId(
        isExpense
          ? (initialData as ExpenseCard).expense_type_id
          : (initialData as IncomeCard).income_type_id
      );
    } else {
      setName('');
      setAmount('');
      setTypeId(types.length > 0 ? types[0].id : 0);
    }
    setIsCreatingType(false);
    setNewTypeName('');
    setError(null);
  }, [initialData, isOpen, types, isExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(
        isExpense
          ? 'يرجى إدخال اسم بطاقة المصروف'
          : 'يرجى إدخال اسم بطاقة الإيراد'
      );
      return;
    }

    const numAmount = amount.trim() === '' ? 0 : parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setError('يرجى إدخال مبلغ صحيح (0 أو أكثر)');
      return;
    }

    let finalTypeId = typeId;

    // إذا كان المستخدم يكتب تصنيفاً جديداً، يتم إنشاؤه تلقائياً الآن عند حفظ البطاقة
    if (isCreatingType) {
      const trimmedTypeName = newTypeName.trim();
      if (!trimmedTypeName) {
        setError('يرجى كتابة اسم التصنيف الجديد');
        return;
      }
      try {
        setIsSubmitting(true);
        const created = await onCreateType(trimmedTypeName);
        finalTypeId = created.id;
      } catch (err: unknown) {
        setIsSubmitting(false);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('فشل في إنشاء التصنيف الجديد');
        }
        return;
      }
    } else {
      if (!typeId || typeId <= 0) {
        setError('يرجى اختيار التصنيف');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: trimmedName,
        amount: numAmount,
        type_id: finalTypeId,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء حفظ البطاقة التعريفية');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideHeader={true}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error-alert">{error}</div>}

        {/* Card Name */}
        <div className="form-group">
          <label className="form-label">
            <span>
              {isExpense ? 'اسم بطاقة المصروف' : 'اسم بطاقة الإيراد'}{' '}
              <span className="form-label-required">*</span>
            </span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=""
            required
            autoFocus
          />
        </div>

        {/* Amount (غير إجباري مع أزرار + و - بمقدار 500) */}
        <div className="form-group">
          <label className="form-label">
            <span>المبلغ</span>
          </label>
          <div className="amount-input-wrapper">
            <button
              type="button"
              className="amount-step-btn"
              onClick={() => {
                const current = parseFloat(amount) || 0;
                setAmount(String(Math.max(0, current - 500)));
              }}
              title="إنقاص 500"
              aria-label="إنقاص 500"
            >
              -
            </button>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="amount-stepper-input"
            />
            <button
              type="button"
              className="amount-step-btn"
              onClick={() => {
                const current = parseFloat(amount) || 0;
                setAmount(String(current + 500));
              }}
              title="زيادة 500"
              aria-label="زيادة 500"
            >
              +
            </button>
          </div>
        </div>

        {/* Type / Category: يستبدل القائمة بحقل نص بنفس الحجم والموقع دون زيادة في حجم النافذة */}
        <div className="form-group">
          <div className="form-label">
            <span>التصنيف <span className="form-label-required">*</span></span>
            <button
              type="button"
              className="btn-inline-toggle"
              onClick={() => {
                setIsCreatingType((prev) => !prev);
                setError(null);
              }}
              title={isCreatingType ? 'الرجوع لاختيار تصنيف' : 'إضافة تصنيف جديد'}
              aria-label={isCreatingType ? 'الرجوع لاختيار تصنيف' : 'إضافة تصنيف جديد'}
            >
              {isCreatingType ? '✕' : '+'}
            </button>
          </div>

          {!isCreatingType ? (
            <select
              value={typeId}
              onChange={(e) => setTypeId(Number(e.target.value))}
              required
            >
              <option value={0} disabled>
                اختر التصنيف...
              </option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => {
                setNewTypeName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="اكتب اسم التصنيف الجديد هنا..."
              autoFocus
              required
            />
          )}
        </div>

        {/* Actions (حفظ أبيض، إلغاء أحمر، جنباً إلى جنب) */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-action-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button
            type="button"
            className="btn-action-red"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </button>
        </div>
      </form>
    </Modal>
  );
};
