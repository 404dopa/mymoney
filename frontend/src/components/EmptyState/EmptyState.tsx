import React from 'react';
import { Button } from '../Button/Button';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'expense' | 'income' | 'primary';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionVariant = 'primary',
}) => {
  return (
    <div className="empty-state-box">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {subtitle && <p className="empty-state-subtitle">{subtitle}</p>}
      {actionLabel && onAction && (
        <Button
          variant={actionVariant}
          size="large"
          onClick={onAction}
          className="empty-state-btn"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
