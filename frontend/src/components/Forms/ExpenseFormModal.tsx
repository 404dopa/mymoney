import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { Expense, ExpenseFormData, ExpenseType } from '../../types';
import { getTodayDateString } from '../../utils/date';
import './Forms.css';

export interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  expenseTypes: ExpenseType[];
  onCreateType: (name: string) => Promise<ExpenseType>;
  initialData?: Expense | null;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  expenseTypes,
  onCreateType,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseTypeId, setExpenseTypeId] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');

  // Inline category creation
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(String(initialData.amount));
      setExpenseTypeId(initialData.expense_type_id);
      setExpenseDate(initialData.expense_date.split('T')[0]);
      setNote(initialData.note || '');
    } else {
      setName('');
      setAmount('');
      setExpenseTypeId(expenseTypes.length > 0 ? expenseTypes[0].id : 0);
      setExpenseDate(getTodayDateString());
      setNote('');
    }
    setIsCreatingType(false);
    setNewTypeName('');
    setError(null);
  }, [initialData, isOpen, expenseTypes]);

  const handleCreateNewType = async () => {
    const trimmed = newTypeName.trim();
    if (!trimmed) {
      setError('يرجى كتابة اسم نوع المصروف الجديد');
      return;
    }
    try {
      setError(null);
      const created = await onCreateType(trimmed);
      setExpenseTypeId(created.id);
      setNewTypeName('');
      setIsCreatingType(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('فشل في إنشاء نوع المصروف الجديد');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('يرجى إدخال اسم المصروف (مثال: بنزين، كهرباء، طعام)');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }

    if (!expenseTypeId || expenseTypeId <= 0) {
      setError('يرجى اختيار نوع المصروف');
      return;
    }

    if (!expenseDate) {
      setError('يرجى تحديد تاريخ المصروف');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: trimmedName,
        amount: numAmount,
        expense_type_id: expenseTypeId,
        expense_date: expenseDate,
        note: note.trim(),
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء حفظ المصروف');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader={true}
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error-alert">{error}</div>}

        {/* Expense Name */}
        <div className="form-group">
          <label className="form-label">
            <span>اسم المصروف <span className="form-label-required">*</span></span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: بنزين، صيانة، إيجار، كهرباء..."
            required
            autoFocus
          />
        </div>

        {/* Amount & Date in a 2-column row */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <span>المبلغ <span className="form-label-required">*</span></span>
            </label>
            <input
              type="number"
              step="any"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مثال: 25000"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>التاريخ <span className="form-label-required">*</span></span>
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Expense Type with inline creation */}
        <div className="form-group">
          <div className="form-label">
            <span>نوع المصروف <span className="form-label-required">*</span></span>
            {!isCreatingType && (
              <button
                type="button"
                className="btn btn-secondary btn-inline-add"
                onClick={() => setIsCreatingType(true)}
              >
                + نوع جديد
              </button>
            )}
          </div>

          {!isCreatingType ? (
            <select
              value={expenseTypeId}
              onChange={(e) => setExpenseTypeId(Number(e.target.value))}
              required
            >
              <option value={0} disabled>
                اختر نوع المصروف...
              </option>
              {expenseTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="inline-create-box">
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="اكتب اسم نوع المصروف الجديد (مثال: ملابس)..."
                autoFocus
              />
              <div className="inline-create-actions">
                <Button
                  type="button"
                  variant="primary"
                  size="normal"
                  onClick={handleCreateNewType}
                >
                  حفظ النوع
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="normal"
                  onClick={() => {
                    setIsCreatingType(false);
                    setNewTypeName('');
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="form-group">
          <label className="form-label">
            <span>ملاحظات إضافية (اختياري)</span>
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="أي تفاصيل أو ملاحظات أخرى..."
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <Button
            type="submit"
            variant="expense"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ المصروف'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="large"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
};
