/**
 * Utility functions for currency formatting, symbol mapping, and currency normalization.
 */

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "INR", symbol: "₹", label: "INR (₹) - Indian Rupee" },
  { code: "USD", symbol: "$", label: "USD ($) - US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR (€) - Euro" },
  { code: "GBP", symbol: "£", label: "GBP (£) - British Pound" },
  { code: "JPY", symbol: "¥", label: "JPY (¥) - Japanese Yen" },
  { code: "CAD", symbol: "C$", label: "CAD (C$) - Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "AUD (A$) - Australian Dollar" },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
};

/**
 * Returns the currency symbol for a given currency code.
 * Defaults to '$' if code is unknown.
 */
export function getCurrencySymbol(currencyCode: string = "USD"): string {
  const normalized = (currencyCode || "USD").trim().toUpperCase();
  return CURRENCY_SYMBOLS[normalized] || normalized;
}

/**
 * Formats a numeric amount with the appropriate currency symbol and locale thousand separators.
 * Example: formatCurrency(50000, "INR") => "₹50,000"
 * Example: formatCurrency(1200, "USD") => "$1,200"
 * Example: formatCurrency(350, "EUR") => "€350"
 */
export function formatCurrency(amount: number | string | null | undefined, currencyCode: string = "USD"): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0)) || 0;
  const symbol = getCurrencySymbol(currencyCode);
  const formattedNum = Math.round(num).toLocaleString("en-US");
  return `${symbol}${formattedNum}`;
}
