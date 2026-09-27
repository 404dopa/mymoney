import React from 'react';
import { formatMoney } from '../../utils/format';
import { IconExpense, IconIncome, IconStats } from '../Icons/Icons';
import './SummaryCard.css';

export interface SummaryCardProps {
  title: string;
  amount: number | string;
  variant?: 'income' | 'expense' | 'balance';
  subtitle?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  variant = 'balance',
  subtitle,
}) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isNegative = !isNaN(num) && num < 0;

  return (
    <div className={`summary-card summary-${variant}`}>
      <div className="summary-card-header">
        <span className="summary-card-icon">
          {variant === 'income' && <IconIncome size={13} />}
          {variant === 'expense' && <IconExpense size={13} />}
          {variant === 'balance' && <IconStats size={13} />}
        </span>
        <span className="summary-title">{title}</span>
      </div>
      <div className={`summary-amount ${isNegative ? 'amount-negative' : ''}`}>
        {formatMoney(amount)}
      </div>
      {subtitle && <span className="summary-subtitle">{subtitle}</span>}
    </div>
  );
};
