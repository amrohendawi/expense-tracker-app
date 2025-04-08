/**
 * List of supported currencies with their configurations
 */
export const currencies = {
  USD: { 
    code: "USD", 
    name: "US Dollar", 
    symbol: "$", 
    locale: "en-US" 
  },
  EUR: { 
    code: "EUR", 
    name: "Euro", 
    symbol: "€", 
    locale: "de-DE" 
  },
  GBP: { 
    code: "GBP", 
    name: "British Pound", 
    symbol: "£", 
    locale: "en-GB" 
  },
  JPY: { 
    code: "JPY", 
    name: "Japanese Yen", 
    symbol: "¥", 
    locale: "ja-JP" 
  },
  CAD: { 
    code: "CAD", 
    name: "Canadian Dollar", 
    symbol: "$", 
    locale: "en-CA" 
  },
  AUD: { 
    code: "AUD", 
    name: "Australian Dollar", 
    symbol: "$", 
    locale: "en-AU" 
  },
  CHF: { 
    code: "CHF", 
    name: "Swiss Franc", 
    symbol: "Fr", 
    locale: "de-CH" 
  },
  CNY: { 
    code: "CNY", 
    name: "Chinese Yuan", 
    symbol: "¥", 
    locale: "zh-CN" 
  },
  INR: { 
    code: "INR", 
    name: "Indian Rupee", 
    symbol: "₹", 
    locale: "en-IN" 
  },
  MXN: { 
    code: "MXN", 
    name: "Mexican Peso", 
    symbol: "$", 
    locale: "es-MX" 
  },
  BRL: { 
    code: "BRL", 
    name: "Brazilian Real", 
    symbol: "R$", 
    locale: "pt-BR" 
  }
};

/**
 * Exchange rates (per 1 USD)
 */
export const exchangeRates = {
  USD: 1,
  EUR: 0.9298, // Updated to a more accurate EUR to USD rate (was 1.1897)
  GBP: 0.8587,
  JPY: 160.93,
  CAD: 1.8585,
  AUD: 2.0483,
  CHF: 0.9052,
  CNY: 7.2478,
  INR: 83.5025,
  MXN: 17.0861,
  BRL: 5.1725
};

/**
 * Get all currency codes as an array
 */
export function getAllCurrencyCodes(): string[] {
  return Object.keys(currencies);
}

/**
 * Get formatted currency options for select inputs
 */
export function getCurrencyOptions(): Array<{value: string, label: string}> {
  return Object.entries(currencies).map(([code, currency]) => ({
    value: code,
    label: `${code} - ${currency.name}`
  }));
}

/**
 * Type for currency codes
 */
export type CurrencyCode = keyof typeof currencies;
