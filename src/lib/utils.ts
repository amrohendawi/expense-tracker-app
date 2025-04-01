import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD"): string {
  const currencyConfig: Record<string, { locale: string, symbol: string }> = {
    USD: { locale: 'en-US', symbol: '$' },
    EUR: { locale: 'de-DE', symbol: '€' },
    GBP: { locale: 'en-GB', symbol: '£' },
    JPY: { locale: 'ja-JP', symbol: '¥' },
    CAD: { locale: 'en-CA', symbol: '$' },
    AUD: { locale: 'en-AU', symbol: '$' },
  };

  const config = currencyConfig[currency] || currencyConfig.USD;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date: Date): string {
  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE, h:mm a');
  } else if (isThisMonth(date)) {
    return format(date, 'MMMM d, h:mm a');
  } else if (isThisYear(date)) {
    return format(date, 'MMMM d');
  } else {
    return format(date, 'MMM d, yyyy');
  }
}

export function getMonthName(monthIndex: number): string {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ][monthIndex];
}

export function generateYearOptions(): { value: number; label: string }[] {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push({ value: i, label: i.toString() });
  }
  
  return years;
}

interface ExpenseWithAmount {
  amount: number;
  id?: string;
  description?: string;
  date?: Date;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color?: string;
  };
}

// Exchange rates (per 1 USD)
export const exchangeRates = {
  USD: 1,
  EUR: 1.1897,
  GBP: 0.8587,
  JPY: 160.93,
  CAD: 1.8585,
  AUD: 2.0483
};

// Convert amount from one currency to another
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) return amount;
  
  // First convert to USD as the base currency
  const amountInUSD = amount / (exchangeRates[fromCurrency as keyof typeof exchangeRates] || 1);
  
  // Then convert from USD to target currency
  return amountInUSD * (exchangeRates[toCurrency as keyof typeof exchangeRates] || 1);
}

// Convert expenses to a single currency
export function convertExpensesToCurrency(
  expenses: Array<{ amount: number; currency?: string }>,
  targetCurrency: string
): number {
  return expenses.reduce((total, expense) => {
    const expenseCurrency = expense.currency || "USD";
    const convertedAmount = convertCurrency(expense.amount, expenseCurrency, targetCurrency);
    return total + convertedAmount;
  }, 0);
}

export function calculateTotalExpenses(expenses: ExpenseWithAmount[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
