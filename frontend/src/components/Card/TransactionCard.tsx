import React from 'react';
import { formatMoney } from '../../utils/format';
import { formatDisplayDate } from '../../utils/date';
import './TransactionCard.css';

export interface TransactionCardProps {
  id: number;
  name: string;
  amount: number | string;
  typeName: string;
  date: string;
  type: 'expense' | 'income';
  onClick: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  name,
  amount,
  typeName,
  date,
  type,
  onClick,
}) => {
  const isExpense = type === 'expense';

  return (
    <article
      className={`transaction-card ${isExpense ? 'card-expense' : 'card-income'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="card-top-row">
        <h3 className="card-name">{name}</h3>
        <span className="card-type-tag">
          {isExpense ? 'نوع المصروف: ' : 'نوع الإيراد: '}
          <strong>{typeName || 'غير محدد'}</strong>
        </span>
      </div>

      <div className="card-bottom-row">
        <div className={`card-amount ${isExpense ? 'amount-expense' : 'amount-income'}`}>
          {isExpense ? '- ' : '+ '}
          {formatMoney(amount)}
        </div>
        <div className="card-date">
          <span>{formatDisplayDate(date)}</span>
        </div>
      </div>
    </article>
  );
};
