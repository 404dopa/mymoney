import React, { useState } from 'react';
import { useIncomeCards } from '../../hooks/useIncomeCards';
import { useIncomeTypes } from '../../hooks/useIncomeTypes';
import { useCardModal } from '../../context/CardModalContext';
import { Button } from '../../components/Button/Button';
import { PresetCard } from '../../components/Card/PresetCard';
import { CardFormModal } from '../../components/Forms/CardFormModal';
import { RecordConfirmModal } from '../../components/Modal/RecordConfirmModal';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { IconCheck, IconClose } from '../../components/Icons/Icons';
import { CardFormData, IncomeCard } from '../../types';
import { formatMoney } from '../../utils/format';
import './IncomePage.css';

export const IncomePage: React.FC = () => {
  const {
    cards,
    loading: cardsLoading,
    error,
    createCard,
    updateCard,
    deleteCard,
    recordTransaction,
    fetchCards,
  } = useIncomeCards();

  const { types: incomeTypes, createType: createIncomeType } = useIncomeTypes();
  const { isAddModalOpen, openAddModal, closeAddModal, isCardEditMode } = useCardModal();

  const [successNotification, setSuccessNotification] = useState<string | null>(null);
  const [confirmingCard, setConfirmingCard] = useState<IncomeCard | null>(null);
  const [editingCard, setEditingCard] = useState<IncomeCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<IncomeCard | null>(null);

  const handleCardClickToRecord = (card: IncomeCard) => {
    setConfirmingCard(card);
  };

  const handleConfirmRecord = async (amount: number) => {
    if (!confirmingCard) return;
    await recordTransaction(confirmingCard, amount);
    setSuccessNotification(
      `تم تسجيل إيراد "${confirmingCard.name}" بمبلغ ${formatMoney(amount)} بنجاح!`
    );
    setTimeout(() => {
      setSuccessNotification((prev) =>
        prev?.includes(confirmingCard.name) ? null : prev
      );
    }, 3500);
  };

  const handleOpenEditCard = (card: IncomeCard) => {
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
    <div className="income-page">
      {/* Success Notification Alert */}
      {successNotification && (
        <div className="action-notification-banner income-notification-banner">
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
            title="لا توجد بطاقات إيرادات تعريفية"
            subtitle="استخدم زر + في شريط التنقل لإضافة أول بطاقة إيراد"
            actionLabel="+ إضافة بطاقة إيراد"
            actionVariant="income"
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
                typeName={card.income_type_name || ''}
                kind="income"
                isEditMode={isCardEditMode}
                onRecord={() => handleCardClickToRecord(card)}
                onEdit={() => handleOpenEditCard(card)}
                onDelete={() => setDeletingCard(card)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Record Confirmation Modal */}
      <RecordConfirmModal
        isOpen={!!confirmingCard}
        onClose={() => setConfirmingCard(null)}
        cardName={confirmingCard?.name || ''}
        defaultAmount={confirmingCard?.amount || 0}
        typeName={confirmingCard?.income_type_name}
        kind="income"
        onConfirm={handleConfirmRecord}
      />

      {/* Preset Card Modal */}
      <CardFormModal
        isOpen={isModalVisible}
        onClose={handleModalClose}
        onSubmit={handleCardSubmit}
        types={incomeTypes}
        onCreateType={createIncomeType}
        kind="income"
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
