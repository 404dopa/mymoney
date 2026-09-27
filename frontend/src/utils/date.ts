const ARABIC_MONTH_NAMES = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current month formatted as YYYY-MM
 */
export function getCurrentMonthString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO timestamp) into DD/MM/YYYY
 * Example: "2026-09-26" -> "26/09/2026"
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats full timestamp into DD/MM/YYYY - HH:mm
 */
export function formatDisplayDateTime(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return formatDisplayDate(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

/**
 * Returns Arabic representation of a month string (YYYY-MM)
 * Example: "2026-09" -> "سبتمبر 2026"
 */
export function formatDisplayMonth(monthStr: string): string {
  if (!monthStr || monthStr === 'all') return 'كل الأشهر';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const monthName = ARABIC_MONTH_NAMES[monthIdx] || parts[1];
  return `${monthName} ${year}`;
}

export interface MonthDateRange {
  startDate: string;
  endDate: string;
  label: string;
}

/**
 * Calculates start and end dates based on configured month start day.
 * Example for startDay = 1: 1/1 to 1/2
 * Example for startDay = 5: 5/1 to 5/2
 * In short months (e.g. 28 days for Feb), 29, 30, 31 clamp to 28.
 */
export function calculateMonthDateRange(
  monthStr: string,
  startDay = 1
): MonthDateRange | null {
  if (!monthStr || monthStr === 'all') return null;

  const parts = monthStr.split('-');
  if (parts.length < 2) return null;

  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;

  if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  const daysInThisMonth = new Date(year, monthIndex + 1, 0).getDate();
  const clampedDay = Math.max(1, Math.min(31, Math.floor(startDay || 1)));

  // If month has fewer days (e.g. 28 in Feb), 29, 30, 31 mean the end of that month (28)
  const actualStartDay = Math.min(clampedDay, daysInThisMonth);
  const startDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(actualStartDay).padStart(2, '0')}`;

  // Next month calculation
  const nextMonthDate = new Date(year, monthIndex + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonthIndex = nextMonthDate.getMonth();
  const daysInNextMonth = new Date(nextYear, nextMonthIndex + 1, 0).getDate();

  // End day is the same day of the next month, clamped to days in next month (e.g. 28 if Feb)
  const targetEndDay = Math.min(clampedDay, daysInNextMonth);
  const endDate = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(targetEndDay).padStart(2, '0')}`;
  const label = `${formatDisplayMonth(monthStr)} (${actualStartDay}/${monthIndex + 1} إلى ${targetEndDay}/${nextMonthIndex + 1})`;

  return {
    startDate,
    endDate,
    label,
  };
}

/**
 * Returns the current active financial month (YYYY-MM) based on startDay
 */
export function getCurrentFinancialMonthString(startDay = 1): string {
  const d = new Date();
  const daysInThisMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const effectiveStartDay = Math.min(Math.max(1, Math.floor(startDay || 1)), daysInThisMonth);

  if (startDay <= 1 || d.getDate() >= effectiveStartDay) {
    return getCurrentMonthString();
  }
  // Before start day of current month -> belongs to previous cycle
  const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  const year = prev.getFullYear();
  const month = String(prev.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Generates the past N months for month filter dropdown
 */
export function getRecentMonthsList(
  count = 18,
  startDay = 1
): { value: string; label: string; startDate?: string; endDate?: string }[] {
  const list: { value: string; label: string; startDate?: string; endDate?: string }[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const val = `${year}-${monthNum}`;
    const range = calculateMonthDateRange(val, startDay);

    list.push({
      value: val,
      label: range ? range.label : formatDisplayMonth(val),
      startDate: range?.startDate,
      endDate: range?.endDate,
    });
  }

  return list;
}

/**
 * Returns number of days in a month (year, month where month is 1 to 12)
 * Example: getDaysInMonth(2026, 2) -> 28
 * Example: getDaysInMonth(2026, 9) -> 30
 */
export function getDaysInMonth(year: number, month: number): number {
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return 31;
  return new Date(year, month, 0).getDate();
}

/**
 * Returns available months list (past N months):
 * [{ value: 'YYYY-MM', label: 'سبتمبر 2026', year: 2026, month: 9 }, ...]
 */
export function getAvailableMonthsList(count = 24): {
  value: string;
  label: string;
  year: number;
  month: number;
}[] {
  const list = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const value = `${year}-${String(month).padStart(2, '0')}`;
    list.push({
      value,
      label: formatDisplayMonth(value),
      year,
      month,
    });
  }
  return list;
}



