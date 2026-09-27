import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import './RecordConfirmModal.css';

export interface RecordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardName: string;
  defaultAmount: number | string;
  typeName?: string;
  kind: 'expense' | 'income';
  onConfirm: (amount: number, note?: string) => Promise<void>;
}

export const RecordConfirmModal: React.FC<RecordConfirmModalProps> = ({
  isOpen,
  onClose,
  cardName: _cardName,
  defaultAmount,
  kind: _kind,
  onConfirm,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount(defaultAmount ? String(defaultAmount) : '');
      setError(null);
      setIsSubmitting(false);

      // Auto-focus and select amount after opening
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen, defaultAmount]);

  const handleIncrease = () => {
    const current = parseFloat(amount) || 0;
    const next = current + 500;
    setAmount(String(next));
    if (error) setError(null);
  };

  const handleDecrease = () => {
    const current = parseFloat(amount) || 0;
    const next = Math.max(0, current - 500);
    setAmount(String(next));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = amount.trim() === '' ? 0 : parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('لا يمكن أن يكون المبلغ سالباً');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(parsedAmount);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تسجيل المعاملة');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="380px" hideHeader={true}>
      <form onSubmit={handleSubmit} className="record-confirm-form">
        {error && <div className="form-error-alert">{error}</div>}

        {/* حقل المبلغ مع أزرار + و - بمقدار 500 */}
        <div className="form-group">
          <label htmlFor="confirm-amount-input" className="form-label">
            المبلغ
          </label>
          <div className="amount-input-wrapper">
            <button
              type="button"
              className="amount-step-btn step-btn-minus"
              onClick={handleDecrease}
              disabled={isSubmitting}
              title="إنقاص 500"
              aria-label="إنقاص 500"
            >
              -
            </button>
            <input
              id="confirm-amount-input"
              ref={inputRef}
              type="number"
              step="any"
              min="0"
              className="form-input amount-large-input"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError(null);
              }}
              placeholder="0"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="amount-step-btn step-btn-plus"
              onClick={handleIncrease}
              disabled={isSubmitting}
              title="زيادة 500"
              aria-label="زيادة 500"
            >
              +
            </button>
          </div>
        </div>

        {/* الأزرار جنباً إلى جنب: تأكيد (أبيض) وإلغاء (أحمر) */}
        <div className="confirm-modal-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="confirm-btn-white"
          >
            {isSubmitting ? 'جاري التأكيد...' : 'تأكيد'}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cancel-btn-red"
          >
            إلغاء
          </button>
        </div>
      </form>
    </Modal>
  );
};
