import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { Income, IncomeFormData, IncomeType } from '../../types';
import { getTodayDateString } from '../../utils/date';
import './Forms.css';

export interface IncomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IncomeFormData) => Promise<void>;
  incomeTypes: IncomeType[];
  onCreateType: (name: string) => Promise<IncomeType>;
  initialData?: Income | null;
}

export const IncomeFormModal: React.FC<IncomeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  incomeTypes,
  onCreateType,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [incomeTypeId, setIncomeTypeId] = useState<number>(0);
  const [incomeDate, setIncomeDate] = useState(getTodayDateString());
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
      setIncomeTypeId(initialData.income_type_id);
      setIncomeDate(initialData.income_date.split('T')[0]);
      setNote(initialData.note || '');
    } else {
      setName('');
      setAmount('');
      setIncomeTypeId(incomeTypes.length > 0 ? incomeTypes[0].id : 0);
      setIncomeDate(getTodayDateString());
      setNote('');
    }
    setIsCreatingType(false);
    setNewTypeName('');
    setError(null);
  }, [initialData, isOpen, incomeTypes]);

  const handleCreateNewType = async () => {
    const trimmed = newTypeName.trim();
    if (!trimmed) {
      setError('يرجى كتابة اسم نوع الإيراد الجديد');
      return;
    }
    try {
      setError(null);
      const created = await onCreateType(trimmed);
      setIncomeTypeId(created.id);
      setNewTypeName('');
      setIsCreatingType(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('فشل في إنشاء نوع الإيراد الجديد');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('يرجى إدخال اسم الإيراد (مثال: راتب، مبيعات، مشروع)');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }

    if (!incomeTypeId || incomeTypeId <= 0) {
      setError('يرجى اختيار نوع الإيراد');
      return;
    }

    if (!incomeDate) {
      setError('يرجى تحديد تاريخ الإيراد');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: trimmedName,
        amount: numAmount,
        income_type_id: incomeTypeId,
        income_date: incomeDate,
        note: note.trim(),
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء حفظ الإيراد');
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

        {/* Income Name */}
        <div className="form-group">
          <label className="form-label">
            <span>اسم الإيراد <span className="form-label-required">*</span></span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: راتب، أرباح مبيعات، عمولة، استثمار..."
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
              placeholder="مثال: 1500000"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>التاريخ <span className="form-label-required">*</span></span>
            </label>
            <input
              type="date"
              value={incomeDate}
              onChange={(e) => setIncomeDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Income Type with inline creation */}
        <div className="form-group">
          <div className="form-label">
            <span>نوع الإيراد <span className="form-label-required">*</span></span>
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
              value={incomeTypeId}
              onChange={(e) => setIncomeTypeId(Number(e.target.value))}
              required
            >
              <option value={0} disabled>
                اختر نوع الإيراد...
              </option>
              {incomeTypes.map((t) => (
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
                placeholder="اكتب اسم نوع الإيراد الجديد (مثال: أرباح أسهم)..."
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
            placeholder="أي تفاصيل أو مصدر التحويل..."
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <Button
            type="submit"
            variant="income"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الإيراد'}
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
