import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCardModal } from '../../context/CardModalContext';
import { IconExpense, IconIncome, IconStats, IconPlus, IconEdit } from '../Icons/Icons';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { openAddModal, isCardEditMode, toggleCardEditMode } = useCardModal();
  const location = useLocation();
  const navigate = useNavigate();

  const isExpenses = location.pathname === '/expenses' || location.pathname === '/';
  const isIncome = location.pathname === '/income';
  const isStats = location.pathname === '/statistics';
  const addBtnLabel = isIncome ? 'إضافة بطاقة إيراد' : 'إضافة بطاقة مصروف';
  const editToggleLabel = isCardEditMode ? 'إلغاء وضع التعديل' : 'تعديل أو حذف البطاقات';

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <>
      {/* Top Header: Brand & Action Buttons */}
      <header className="app-top-header">
        <div className="top-header-inner">
          <button
            type="button"
            onClick={() => handleNavigate('/expenses')}
            className="header-brand-btn"
            aria-label="Money Track - المصاريف"
          >
            <span className="brand-title">Money Track</span>
          </button>

          <div className="header-action-slot">
            {!isStats && (
              <div className="header-actions-group">
                {/* زر القلم لتفعيل إمكانية تعديل أو حذف البطاقات */}
                <button
                  className={`header-pencil-btn ${isCardEditMode ? 'pencil-active' : ''}`}
                  onClick={toggleCardEditMode}
                  type="button"
                  title={editToggleLabel}
                  aria-label={editToggleLabel}
                >
                  <IconEdit size={20} color={isCardEditMode ? '#60a5fa' : '#ffffff'} />
                </button>

                {/* زر إضافة بطاقة جديدة (+) */}
                <button
                  className="header-add-card-btn"
                  onClick={openAddModal}
                  type="button"
                  title={addBtnLabel}
                  aria-label={addBtnLabel}
                >
                  <IconPlus size={26} color="#ffffff" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation Pill (الزر الأيمن: مصاريف | الوسط: إحصائيات | الزر الأيسر: إيرادات) */}
      <div className="floating-nav-wrapper">
        <nav className="floating-nav-pill" aria-label="شريط التنقل السريع">
          {/* الزر الأيمن في RTL: المصاريف */}
          <button
            type="button"
            onClick={() => handleNavigate('/expenses')}
            className={`nav-pill-btn pill-btn-right ${isExpenses ? 'active-expense' : ''}`}
            aria-label="المصاريف"
          >
            <span className="nav-pill-icon">
              <IconExpense size={22} />
            </span>
            <span className="nav-pill-text">المصاريف</span>
          </button>

          {/* الوسط: الدائرة المخصصة للإحصائيات */}
          <button
            type="button"
            onClick={() => handleNavigate('/statistics')}
            className={`nav-pill-center-circle ${isStats ? 'active-stats-circle' : ''}`}
            title="الإحصائيات"
            aria-label="الإحصائيات"
          >
            <span className="circle-icon">
              <IconStats size={24} />
            </span>
          </button>

          {/* الزر الأيسر في RTL: الإيرادات */}
          <button
            type="button"
            onClick={() => handleNavigate('/income')}
            className={`nav-pill-btn pill-btn-left ${isIncome ? 'active-income' : ''}`}
            aria-label="الإيرادات"
          >
            <span className="nav-pill-icon">
              <IconIncome size={22} />
            </span>
            <span className="nav-pill-text">الإيرادات</span>
          </button>
        </nav>
      </div>
    </>
  );
};


