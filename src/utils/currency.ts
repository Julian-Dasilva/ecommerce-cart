/**
 * Currency formatting utilities.
 * 
 * In a production app, you'd want to:
 * - Support multiple currencies
 * - Use Intl.NumberFormat for localization
 * - Consider using a library like dinero.js for money calculations
 * - Store prices in cents to avoid floating-point issues
 */

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

/**
 * Formats a number as currency.
 * Uses Intl.NumberFormat for proper localization.
 */
export const formatCurrency = (
  amount: number,
  locale: string = DEFAULT_LOCALE,
  currency: string = DEFAULT_CURRENCY
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a percentage for display.
 */
export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

/**
 * Rounds a number to 2 decimal places.
 * Important for currency calculations to avoid floating-point errors.
 */
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
};

