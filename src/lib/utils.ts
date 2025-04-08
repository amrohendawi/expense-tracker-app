import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from "date-fns"
import { currencies, exchangeRates, CurrencyCode } from "./constants/currencies"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD"): string {
  const currencyCode = currency.toUpperCase() as CurrencyCode;
  const config = currencies[currencyCode] || currencies.USD;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
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

// Convert amount from one currency to another
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) return amount;
  
  // Normalize currency codes
  const from = fromCurrency.toUpperCase() as CurrencyCode;
  const to = toCurrency.toUpperCase() as CurrencyCode;
  
  // Check if we support these currencies
  if (!exchangeRates[from]) {
    console.warn(`Unsupported currency: ${from}, using USD as fallback`);
    return convertCurrency(amount, "USD", to);
  }
  
  if (!exchangeRates[to]) {
    console.warn(`Unsupported currency: ${to}, using USD as fallback`);
    return convertCurrency(amount, from, "USD");
  }
  
  // First convert to USD as the base currency
  // Note: Exchange rates are defined as "per 1 USD"
  // So to convert to USD we divide by the rate
  const amountInUSD = amount / exchangeRates[from];
  
  // Then convert from USD to target currency
  return amountInUSD * exchangeRates[to];
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
