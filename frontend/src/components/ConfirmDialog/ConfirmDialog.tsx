import React from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import './ConfirmDialog.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'تأكيد الحذف',
  message,
  confirmLabel = 'تأكيد الحذف',
  cancelLabel = 'إلغاء',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="450px">
      <div className="confirm-dialog-content">
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <Button
            variant="danger"
            size="large"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'جاري الحذف...' : confirmLabel}
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
