import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatistics } from '../../hooks/useStatistics';
import { SummaryCard } from '../../components/SummaryCard/SummaryCard';
import { Modal } from '../../components/Modal/Modal';
import { TransactionDetailsModal } from '../../components/Details/TransactionDetailsModal';
import { Button } from '../../components/Button/Button';
import { IconExpense, IconIncome } from '../../components/Icons/Icons';
import { Expense, Income } from '../../types';
import { formatMoney } from '../../utils/format';
import { formatDisplayDate, getDaysInMonth } from '../../utils/date';
import './StatisticsPage.css';

export const StatisticsPage: React.FC = () => {
  const {
    summary,
    loading,
    error,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    fetchStats,
    drillDownCategory,
    openCategoryDetails,
    closeCategoryDetails,
  } = useStatistics();

  const navigate = useNavigate();

  // Extract from parts
  const fromParts = startDate.split('-');
  const fromYear = parseInt(fromParts[0], 10) || new Date().getFullYear();
  const fromMonth = parseInt(fromParts[1], 10) || new Date().getMonth() + 1;
  const fromDay = parseInt(fromParts[2], 10) || 1;

  // Extract to parts
  const toParts = endDate.split('-');
  const toYear = parseInt(toParts[0], 10) || new Date().getFullYear();
  const toMonth = parseInt(toParts[1], 10) || new Date().getMonth() + 1;
  const toDay = parseInt(toParts[2], 10) || getDaysInMonth(toYear, toMonth);

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const monthsList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const daysInFromMonth = getDaysInMonth(fromYear, fromMonth);
  const daysInToMonth = getDaysInMonth(toYear, toMonth);

  const handleFromYearChange = (newYear: number) => {
    const maxDays = getDaysInMonth(newYear, fromMonth);
    const clampedDay = Math.min(fromDay, maxDays);
    setStartDate(`${newYear}-${String(fromMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`);
  };

  const handleFromMonthChange = (newMonth: number) => {
    const maxDays = getDaysInMonth(fromYear, newMonth);
    const clampedDay = Math.min(fromDay, maxDays);
    setStartDate(`${fromYear}-${String(newMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`);
  };

  const handleFromDayChange = (newDay: number) => {
    setStartDate(`${fromYear}-${String(fromMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`);
  };

  const handleToYearChange = (newYear: number) => {
    const maxDays = getDaysInMonth(newYear, toMonth);
    const clampedDay = Math.min(toDay, maxDays);
    setEndDate(`${newYear}-${String(toMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`);
  };

  const handleToMonthChange = (newMonth: number) => {
    const maxDays = getDaysInMonth(toYear, newMonth);
    const clampedDay = Math.min(toDay, maxDays);
    setEndDate(`${toYear}-${String(newMonth).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`);
  };

  const handleToDayChange = (newDay: number) => {
    setEndDate(`${toYear}-${String(toMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`);
  };

  // Modal for full details of a clicked transaction from the drill-down
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<{
    tx: Expense | Income;
    kind: 'expense' | 'income';
  } | null>(null);

  return (
    <div className="statistics-page page-fade-in">
      {/* Error Alert */}
      {error && (
        <div className="page-error-banner">
          <span>{error}</span>
          <Button variant="secondary" size="normal" onClick={() => fetchStats(false)}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Filters Bar: From (Year + Month + Day), To (Year + Month + Day) */}
      <div className="stats-filters-bar">
        {/* من: سنة - شهر - يوم */}
        <div className="filter-group">
          <label className="filter-label">من:</label>
          <div className="date-selectors-row">
            {/* سلكتر السنة */}
            <select
              id="stats-from-year-select"
              className="filter-select year-select"
              value={fromYear}
              onChange={(e) => handleFromYearChange(Number(e.target.value))}
              title="اختر سنة البداية"
            >
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <span className="selector-pipe">|</span>

            {/* سلكتر الشهر بالأرقام */}
            <select
              id="stats-from-month-select"
              className="filter-select month-select"
              value={fromMonth}
              onChange={(e) => handleFromMonthChange(Number(e.target.value))}
              title="اختر شهر البداية"
            >
              {monthsList.map((m) => (
                <option key={m} value={m}>
                  شهر {m}
                </option>
              ))}
            </select>

            <span className="selector-pipe">|</span>

            {/* سلكتر اليوم */}
            <select
              id="stats-from-day-select"
              className="filter-select day-select"
              value={fromDay}
              onChange={(e) => handleFromDayChange(Number(e.target.value))}
              title="اختر يوم البداية"
            >
              {Array.from({ length: daysInFromMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  يوم {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* خط فاصل بين من وإلى */}
        <div className="filter-line-divider" />

        {/* إلى: سنة - شهر - يوم */}
        <div className="filter-group">
          <label className="filter-label">إلى:</label>
          <div className="date-selectors-row">
            {/* سلكتر السنة */}
            <select
              id="stats-to-year-select"
              className="filter-select year-select"
              value={toYear}
              onChange={(e) => handleToYearChange(Number(e.target.value))}
              title="اختر سنة النهاية"
            >
              {yearsList.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <span className="selector-pipe">|</span>

            {/* سلكتر الشهر بالأرقام */}
            <select
              id="stats-to-month-select"
              className="filter-select month-select"
              value={toMonth}
              onChange={(e) => handleToMonthChange(Number(e.target.value))}
              title="اختر شهر النهاية"
            >
              {monthsList.map((m) => (
                <option key={m} value={m}>
                  شهر {m}
                </option>
              ))}
            </select>

            <span className="selector-pipe">|</span>

            {/* سلكتر اليوم */}
            <select
              id="stats-to-day-select"
              className="filter-select day-select"
              value={toDay}
              onChange={(e) => handleToDayChange(Number(e.target.value))}
              title="اختر يوم النهاية"
            >
              {Array.from({ length: daysInToMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  يوم {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>



      {/* Loading State */}
      {loading && !summary && (
        <div className="loading-indicator">جاري تجميع وحساب الإحصائيات...</div>
      )}

      {/* Summary Cards */}
      {summary && (
        <>
          <div className="summary-cards-grid">
            <SummaryCard
              title="الإيرادات"
              amount={summary.total_income}
              variant="income"
            />

            <SummaryCard
              title="المصاريف"
              amount={summary.total_expenses}
              variant="expense"
            />

            <SummaryCard
              title="الرصيد"
              amount={summary.balance}
              variant="balance"
            />
          </div>

          {/* Expense Categories Section */}
          <section className="categories-section">
            <h2 className="section-title">
              <IconExpense size={22} color="var(--color-expense)" />
              <span>المصاريف حسب النوع</span>
            </h2>

            {summary.expenses_by_type.length === 0 ? (
              <div className="empty-state-box" style={{ minHeight: '100px', padding: '20px' }}>
                <p>لا توجد مصاريف مسجلة في هذه الفترة</p>
              </div>
            ) : (
              <div className="category-items-grid">
                {summary.expenses_by_type.map((cat) => (
                  <div
                    key={cat.type_id}
                    className="category-card"
                    onClick={() =>
                      openCategoryDetails(cat.type_id, cat.type_name, 'expense', cat.total)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        openCategoryDetails(cat.type_id, cat.type_name, 'expense', cat.total);
                      }
                    }}
                  >
                    <span className="cat-name">{cat.type_name}</span>
                    <span className="cat-total cat-total-expense">
                      {formatMoney(cat.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Income Categories Section */}
          <section className="categories-section">
            <h2 className="section-title">
              <IconIncome size={22} color="var(--color-income)" />
              <span>الإيرادات حسب النوع</span>
            </h2>

            {summary.income_by_type.length === 0 ? (
              <div className="empty-state-box" style={{ minHeight: '100px', padding: '20px' }}>
                <p>لا توجد إيرادات مسجلة في هذه الفترة</p>
              </div>
            ) : (
              <div className="category-items-grid">
                {summary.income_by_type.map((cat) => (
                  <div
                    key={cat.type_id}
                    className="category-card"
                    onClick={() =>
                      openCategoryDetails(cat.type_id, cat.type_name, 'income', cat.total)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        openCategoryDetails(cat.type_id, cat.type_name, 'income', cat.total);
                      }
                    }}
                  >
                    <span className="cat-name">{cat.type_name}</span>
                    <span className="cat-total cat-total-income">
                      {formatMoney(cat.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Drill-down Modal showing all transactions of clicked category */}
      {drillDownCategory && (
        <Modal
          isOpen={true}
          onClose={closeCategoryDetails}
          title={
            drillDownCategory.kind === 'expense'
              ? `نوع المصروف: ${drillDownCategory.name}`
              : `نوع الإيراد: ${drillDownCategory.name}`
          }
          maxWidth="600px"
        >
          <div className="drilldown-wrapper">
            <div className="drilldown-header">
              <span className="drilldown-header-title">
                {drillDownCategory.kind === 'expense' ? 'إجمالي المصروف:' : 'إجمالي الإيراد:'}
              </span>
              <span
                className={`drilldown-total ${
                  drillDownCategory.kind === 'expense'
                    ? 'cat-total-expense'
                    : 'cat-total-income'
                }`}
              >
                {formatMoney(drillDownCategory.total)}
              </span>
            </div>

            {drillDownCategory.loading ? (
              <div className="loading-indicator">جاري تحميل المعاملات...</div>
            ) : drillDownCategory.items.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                لا توجد معاملات تابعة لهذا النوع في الفترة المحددة
              </p>
            ) : (
              <div className="drilldown-items-list">
                {drillDownCategory.items.map((item) => {
                  const dateStr =
                    drillDownCategory.kind === 'expense'
                      ? (item as Expense).expense_date
                      : (item as Income).income_date;
                  return (
                    <div
                      key={item.id}
                      className="drilldown-item-card"
                      onClick={() =>
                        setSelectedTxForDetails({
                          tx: item,
                          kind: drillDownCategory.kind,
                        })
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <div className="drilldown-item-info">
                        <span className="drilldown-item-name">{item.name}</span>
                        <span className="drilldown-item-date">{formatDisplayDate(dateStr)}</span>
                      </div>
                      <div
                        className={`drilldown-item-amount ${
                          drillDownCategory.kind === 'expense'
                            ? 'cat-total-expense'
                            : 'cat-total-income'
                        }`}
                      >
                        {formatMoney(item.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Details modal for a transaction clicked from inside category list */}
      <TransactionDetailsModal
        isOpen={!!selectedTxForDetails}
        onClose={() => setSelectedTxForDetails(null)}
        transaction={selectedTxForDetails?.tx || null}
        kind={selectedTxForDetails?.kind || 'expense'}
        onEdit={() => {
          const targetPage = selectedTxForDetails?.kind === 'expense' ? '/expenses' : '/income';
          setSelectedTxForDetails(null);
          navigate(targetPage);
        }}
        onDelete={() => {
          setSelectedTxForDetails(null);
        }}
      />
    </div>
  );
};
