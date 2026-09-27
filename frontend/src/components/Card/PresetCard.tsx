import React, { useState } from 'react';
import { IconEdit, IconTrash, IconCheck } from '../Icons/Icons';
import { formatMoney } from '../../utils/format';
import './PresetCard.css';

export interface PresetCardProps {
  id: number;
  name: string;
  amount: number | string;
  typeName: string;
  kind: 'expense' | 'income';
  isEditMode?: boolean;
  onRecord: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  name,
  amount,
  typeName,
  kind,
  isEditMode = false,
  onRecord,
  onEdit,
  onDelete,
}) => {
  const [justRecorded, setJustRecorded] = useState(false);

  const handleRecord = () => {
    if (isEditMode) return;
    onRecord();
    setJustRecorded(true);
    setTimeout(() => setJustRecorded(false), 2500);
  };

  const cardClass = [
    'preset-card',
    kind === 'expense' ? 'preset-expense' : 'preset-income',
    justRecorded ? 'preset-just-recorded' : '',
    isEditMode ? 'preset-in-edit-mode' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClass}
      onClick={!isEditMode ? handleRecord : undefined}
      role={!isEditMode ? 'button' : undefined}
      tabIndex={!isEditMode ? 0 : undefined}
      onKeyDown={
        !isEditMode
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') handleRecord();
            }
          : undefined
      }
    >
      {/* Top Row: name + type badge + action buttons (edit mode) */}
      <div className="preset-top-row">
        <div className="preset-title-wrap">
          <p className="preset-name">{name}</p>
          {typeName && (
            <span className="preset-type-badge">{typeName}</span>
          )}
        </div>

        {isEditMode && (
          <div className="preset-manage-actions">
            <button
              type="button"
              className="preset-btn-icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label="تعديل البطاقة"
              title="تعديل"
            >
              <IconEdit size={14} />
            </button>
            <button
              type="button"
              className="preset-btn-icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="حذف البطاقة"
              title="حذف"
            >
              <IconTrash size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="preset-amount-wrap">
        <span className="preset-amount">{formatMoney(Number(amount))}</span>
      </div>

      {/* Success feedback */}
      {!isEditMode && justRecorded && (
        <div className="preset-tap-bar">
          <span className="preset-tap-status preset-success-status">
            <IconCheck size={14} />
            تم التسجيل
          </span>
        </div>
      )}
    </div>
  );
};
