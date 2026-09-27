/**
 * Formats a monetary amount into a clean, human-readable string with currency suffix.
 * Example: formatMoney(25000) => "25,000 IQD"
 * Example: formatMoney("1500000.50") => "1,500,000.50 IQD"
 */
export function formatMoney(amount: number | string | null | undefined, currency: string = ''): string {
  if (amount === null || amount === undefined || amount === '') {
    return '0';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return '0';
  }

  // Format with commas, preserving decimals only if not zero
  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1];

  let formatted = integerPart;
  if (decimalPart && decimalPart !== '00') {
    formatted += `.${decimalPart}`;
  }

  return currency ? `${formatted} ${currency}` : formatted;
}

/**
 * Formats numeric count
 */
export function formatCount(count: number): string {
  return new Intl.NumberFormat('ar-EG').format(count);
}
