import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatCurrencyOriginal(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

export function calculateTotalExpenses(expenses: any[]): number {
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
