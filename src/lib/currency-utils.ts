import { getCurrencyConfig, getDefaultCurrencyConfig } from '@/config/currencies';

/**
 * Formats a numeric value as a currency string according to the specified currency code.
 * Uses Intl.NumberFormat for locale-specific formatting.
 *
 * @param value The numeric value to format.
 * @param currencyCode The ISO 4217 currency code (e.g., 'BRL', 'USD', 'EUR').
 * @returns The formatted currency string or "N/A" if the value is undefined or null.
 */
export const formatCurrency = (value: number | undefined | null, currencyCode: string): string => {
  if (value === undefined || value === null) {
    return "N/A";
  }

  const config = getCurrencyConfig(currencyCode) ?? getDefaultCurrencyConfig();

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
       // minimumFractionDigits: 2, // Optional: Ensure 2 decimal places
       // maximumFractionDigits: 2, // Optional: Ensure 2 decimal places
    }).format(value);
  } catch (error) {
    console.error(`Error formatting currency for code ${currencyCode} and locale ${config.locale}:`, error);
    // Fallback to simple formatting if Intl fails
    return `${config.symbol} ${value.toFixed(2)}`;
  }
};
