import React from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import { IconEdit, IconTrash } from '../Icons/Icons';
import { Expense, Income } from '../../types';
import { formatMoney } from '../../utils/format';
import { formatDisplayDate, formatDisplayDateTime } from '../../utils/date';
import './TransactionDetailsModal.css';

export interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Expense | Income | null;
  kind: 'expense' | 'income';
  onEdit: (tx: Expense | Income) => void;
  onDelete: (tx: Expense | Income) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
  kind,
  onEdit,
  onDelete,
}) => {
  if (!transaction) return null;

  const isExpense = kind === 'expense';
  const typeName =
    isExpense
      ? (transaction as Expense).expense_type_name
      : (transaction as Income).income_type_name;
  const dateVal =
    isExpense
      ? (transaction as Expense).expense_date
      : (transaction as Income).income_date;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isExpense ? 'تفاصيل المصروف' : 'تفاصيل الإيراد'}
      maxWidth="500px"
    >
      <div className="details-wrapper">
        {/* Big Amount Banner */}
        <div className={`details-amount-banner ${isExpense ? 'banner-expense' : 'banner-income'}`}>
          <span className="details-banner-label">
            {isExpense ? 'المبلغ المصروف' : 'المبلغ المحصّل'}
          </span>
          <span className="details-banner-val">{formatMoney(transaction.amount)}</span>
        </div>

        {/* Information Table/List */}
        <div className="details-list">
          <div className="details-row">
            <span className="details-key">{isExpense ? 'اسم المصروف:' : 'اسم الإيراد:'}</span>
            <span className="details-value font-bold">{transaction.name}</span>
          </div>

          <div className="details-row">
            <span className="details-key">{isExpense ? 'نوع المصروف:' : 'نوع الإيراد:'}</span>
            <span className="details-value type-badge">{typeName || 'غير محدد'}</span>
          </div>

          <div className="details-row">
            <span className="details-key">التاريخ:</span>
            <span className="details-value">{formatDisplayDate(dateVal)}</span>
          </div>

          {transaction.note && (
            <div className="details-row note-row">
              <span className="details-key">ملاحظات:</span>
              <span className="details-value note-text">{transaction.note}</span>
            </div>
          )}

          <div className="details-row">
            <span className="details-key">تاريخ الإدخال:</span>
            <span className="details-value text-muted">
              {formatDisplayDateTime(transaction.created_at)}
            </span>
          </div>
        </div>

        {/* Action Buttons: Edit, Delete */}
        <div className="details-actions">
          <Button
            variant="secondary"
            size="large"
            onClick={() => {
              onClose();
              onEdit(transaction);
            }}
          >
            <IconEdit size={16} /> تعديل
          </Button>

          <Button
            variant="danger"
            size="large"
            onClick={() => {
              onClose();
              onDelete(transaction);
            }}
          >
            <IconTrash size={16} /> حذف
          </Button>
        </div>
      </div>
    </Modal>
  );
};
