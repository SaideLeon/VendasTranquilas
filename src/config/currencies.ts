/**
 * Configuration for supported currencies.
 * Includes code, symbol, and locale for formatting.
 */
export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string; // Used for formatting with Intl.NumberFormat
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'BRL', symbol: 'R$', locale: 'pt-BR' }, // Brazil
  { code: 'USD', symbol: '$', locale: 'en-US' }, // USA & East Timor
  { code: 'EUR', symbol: '€', locale: 'pt-PT' }, // Portugal
  { code: 'MZN', symbol: 'MT', locale: 'pt-MZ' }, // Mozambique
  { code: 'AOA', symbol: 'Kz', locale: 'pt-AO' }, // Angola
  { code: 'CVE', symbol: 'Esc', locale: 'pt-CV' }, // Cape Verde
  { code: 'XOF', symbol: 'CFA', locale: 'pt-GW' }, // Guinea-Bissau (West African CFA Franc)
  { code: 'STN', symbol: 'Db', locale: 'pt-ST' }, // São Tomé and Príncipe (New Dobra)
  { code: 'XAF', symbol: 'FCFA', locale: 'pt-GQ' }, // Equatorial Guinea (Central African CFA Franc)
  // Note: East Timor uses USD, Equatorial Guinea uses XAF. Locales help formatting.
];

export const DEFAULT_CURRENCY_CODE = 'MZN';

export const getCurrencyConfig = (code: string): CurrencyConfig | undefined => {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code);
};

export const getDefaultCurrencyConfig = (): CurrencyConfig => {
  return getCurrencyConfig(DEFAULT_CURRENCY_CODE)!; // Assumes default is always valid
};
