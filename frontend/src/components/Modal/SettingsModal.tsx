import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useSettings } from '../../context/SettingsContext';
import { calculateMonthDateRange, getCurrentMonthString } from '../../utils/date';
import './SettingsModal.css';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    monthStartDay,
    saveSettings,
  } = useSettings();

  const [tempDay, setTempDay] = useState<number>(monthStartDay);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSettingsOpen) {
      setTempDay(monthStartDay);
      setError(null);
    }
  }, [isSettingsOpen, monthStartDay]);

  // Preview range for current month
  const currentMonthStr = getCurrentMonthString();
  const previewRange = calculateMonthDateRange(
    currentMonthStr,
    tempDay || 1,
    'same_day'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const day = Number(tempDay);
    if (isNaN(day) || day < 1 || day > 31) {
      setError('يرجى إدخال يوم صالح بين 1 و 31');
      return;
    }
    saveSettings(day, 'same_day');
  };

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={closeSettings}
      title="الاعدادات"
      maxWidth="400px"
    >
      <form onSubmit={handleSave} className="settings-modal-form">
        {error && <div className="form-error-alert">{error}</div>}

        {/* حقل تحديد يوم بداية الشهر فقط */}
        <div className="form-group">
          <label htmlFor="settings-start-day-input" className="form-label">
            يوم بداية الشهر
          </label>
          <div className="day-input-row">
            <input
              id="settings-start-day-input"
              type="number"
              min="1"
              max="31"
              className="form-input day-number-input"
              value={tempDay || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val)) {
                  setTempDay(0);
                } else {
                  setTempDay(Math.max(1, Math.min(31, val)));
                }
                if (error) setError(null);
              }}
              placeholder="1"
              required
            />
          </div>
        </div>

        {/* صندوق المعاينة الحية */}
        {previewRange && (
          <div className="preview-range-box">
            <div className="preview-range-title">معاينة دورة الشهر الحالي:</div>
            <div className="preview-range-dates">
              <span>تبدأ: <strong>{previewRange.startDate}</strong></span>
              <span>تنتهي: <strong>{previewRange.endDate}</strong></span>
            </div>
          </div>
        )}

        {/* الأزرار جنباً إلى جنب: حفظ (أبيض) وإلغاء (أحمر) */}
        <div className="settings-modal-actions">
          <button type="submit" className="confirm-btn-white">
            حفظ
          </button>
          <button type="button" onClick={closeSettings} className="cancel-btn-red">
            إلغاء
          </button>
        </div>
      </form>
    </Modal>
  );
};
