import React, { useState } from 'react';
import { useExpenseCards } from '../../hooks/useExpenseCards';
import { useExpenseTypes } from '../../hooks/useExpenseTypes';
import { useCardModal } from '../../context/CardModalContext';
import { Button } from '../../components/Button/Button';
import { PresetCard } from '../../components/Card/PresetCard';
import { CardFormModal } from '../../components/Forms/CardFormModal';
import { RecordConfirmModal } from '../../components/Modal/RecordConfirmModal';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { IconCheck, IconClose } from '../../components/Icons/Icons';
import { CardFormData, ExpenseCard } from '../../types';
import { formatMoney } from '../../utils/format';
import './ExpensesPage.css';

export const ExpensesPage: React.FC = () => {
  const {
    cards,
    loading: cardsLoading,
    error,
    createCard,
    updateCard,
    deleteCard,
    recordTransaction,
    fetchCards,
  } = useExpenseCards();

  const { types: expenseTypes, createType: createExpenseType } = useExpenseTypes();
  const { isAddModalOpen, openAddModal, closeAddModal, isCardEditMode } = useCardModal();

  const [successNotification, setSuccessNotification] = useState<string | null>(null);
  const [confirmingCard, setConfirmingCard] = useState<ExpenseCard | null>(null);
  const [editingCard, setEditingCard] = useState<ExpenseCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<ExpenseCard | null>(null);

  const handleCardClickToRecord = (card: ExpenseCard) => {
    setConfirmingCard(card);
  };

  const handleConfirmRecord = async (amount: number) => {
    if (!confirmingCard) return;
    await recordTransaction(confirmingCard, amount);
    setSuccessNotification(
      `تم تسجيل مصروف "${confirmingCard.name}" بمبلغ ${formatMoney(amount)} بنجاح!`
    );
    setTimeout(() => {
      setSuccessNotification((prev) =>
        prev?.includes(confirmingCard.name) ? null : prev
      );
    }, 3500);
  };

  const handleOpenEditCard = (card: ExpenseCard) => {
    setEditingCard(card);
  };

  const handleCardSubmit = async (data: CardFormData) => {
    if (editingCard) {
      await updateCard(editingCard.id, data);
      setEditingCard(null);
    } else {
      await createCard(data);
      closeAddModal();
    }
  };

  const handleModalClose = () => {
    setEditingCard(null);
    closeAddModal();
  };

  const handleDeleteCardConfirm = async () => {
    if (!deletingCard) return;
    await deleteCard(deletingCard.id);
    setDeletingCard(null);
  };

  const isModalVisible = isAddModalOpen || !!editingCard;

  return (
    <div className="expenses-page">
      {/* Success Notification Alert */}
      {successNotification && (
        <div className="action-notification-banner">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <IconCheck size={18} />
            {successNotification}
          </span>
          <button
            className="notification-close-btn"
            onClick={() => setSuccessNotification(null)}
            aria-label="إغلاق الإشعار"
          >
            <IconClose size={16} />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="page-error-banner">
          <span>{error}</span>
          <Button variant="secondary" size="normal" onClick={fetchCards}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Cards Section */}
      <section className="cards-section">

        {cardsLoading && cards.length === 0 ? (
          <div className="loading-indicator">جاري تحميل البطاقات...</div>
        ) : cards.length === 0 ? (
          <EmptyState
            title="لا توجد بطاقات مصاريف تعريفية"
            subtitle="استخدم زر + في شريط التنقل لإضافة أول بطاقة مصروف"
            actionLabel="+ إضافة بطاقة مصروف"
            actionVariant="expense"
            onAction={openAddModal}
          />
        ) : (
          <div className="preset-cards-grid">
            {cards.map((card) => (
              <PresetCard
                key={card.id}
                id={card.id}
                name={card.name}
                amount={card.amount}
                typeName={card.expense_type_name || ''}
                kind="expense"
                isEditMode={isCardEditMode}
                onRecord={() => handleCardClickToRecord(card)}
                onEdit={() => handleOpenEditCard(card)}
                onDelete={() => setDeletingCard(card)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Record Confirmation Modal with Editable Amount */}
      <RecordConfirmModal
        isOpen={!!confirmingCard}
        onClose={() => setConfirmingCard(null)}
        cardName={confirmingCard?.name || ''}
        defaultAmount={confirmingCard?.amount || 0}
        typeName={confirmingCard?.expense_type_name}
        kind="expense"
        onConfirm={handleConfirmRecord}
      />

      {/* Preset Card Modal */}
      <CardFormModal
        isOpen={isModalVisible}
        onClose={handleModalClose}
        onSubmit={handleCardSubmit}
        types={expenseTypes}
        onCreateType={createExpenseType}
        kind="expense"
        initialData={editingCard}
      />

      {/* Delete Preset Card Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCard}
        title="تأكيد حذف البطاقة التعريفية"
        message={`هل أنت متأكد من حذف بطاقة "${deletingCard?.name}"؟ لن تتمكن من التسجيل السريع بها بعد الآن.`}
        confirmLabel="حذف البطاقة"
        cancelLabel="إلغاء"
        onConfirm={handleDeleteCardConfirm}
        onCancel={() => setDeletingCard(null)}
      />
    </div>
  );
};
