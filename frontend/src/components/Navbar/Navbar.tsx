import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useCardModal } from '../../context/CardModalContext';
import { IconExpense, IconIncome, IconStats, IconPlus, IconEdit } from '../Icons/Icons';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { openAddModal, isCardEditMode, toggleCardEditMode } = useCardModal();
  const location = useLocation();

  const isIncome = location.pathname === '/income';
  const isStats = location.pathname === '/statistics';
  const addBtnLabel = isIncome ? 'إضافة بطاقة إيراد' : 'إضافة بطاقة مصروف';
  const editToggleLabel = isCardEditMode ? 'إلغاء وضع التعديل' : 'تعديل أو حذف البطاقات';

  return (
    <>
      {/* Top Header: Brand & Action Buttons */}
      <header className="app-top-header">
        <div className="top-header-inner">
          <Link to="/expenses" className="header-brand" aria-label="Money Track - المصاريف">
            <span className="brand-title">Money Track</span>
          </Link>

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
          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `nav-pill-btn pill-btn-right ${isActive ? 'active-expense' : ''}`
            }
          >
            <span className="nav-pill-icon">
              <IconExpense size={22} />
            </span>
            <span className="nav-pill-text">المصاريف</span>
          </NavLink>

          {/* الوسط: الدائرة المخصصة للإحصائيات */}
          <NavLink
            to="/statistics"
            className={({ isActive }) =>
              `nav-pill-center-circle ${isActive ? 'active-stats-circle' : ''}`
            }
            title="الإحصائيات"
            aria-label="الإحصائيات"
          >
            <span className="circle-icon">
              <IconStats size={24} />
            </span>
          </NavLink>

          {/* الزر الأيسر في RTL: الإيرادات */}
          <NavLink
            to="/income"
            className={({ isActive }) =>
              `nav-pill-btn pill-btn-left ${isActive ? 'active-income' : ''}`
            }
          >
            <span className="nav-pill-icon">
              <IconIncome size={22} />
            </span>
            <span className="nav-pill-text">الإيرادات</span>
          </NavLink>
        </nav>
      </div>
    </>
  );
};


