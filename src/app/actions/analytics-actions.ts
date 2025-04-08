"use server";

import { auth } from "@clerk/nextjs/server";
import { getExpensesByCategory, getExpensesByMonth, getBudgetProgress } from "@/lib/db";

export async function getExpensesByCategoryAction(startDate: Date, endDate: Date) {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  try {
    const expenses = await getExpensesByCategory(userId, startDate.toISOString(), endDate.toISOString());
    const totalExpenses = expenses.reduce((total, category) => total + category.amount, 0);

    return expenses.map((category) => {
      const percentage = totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0;

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        amount: category.amount,
        percentage,
        expenses: category.expenses, // Include full expense data for currency conversion
      };
    });
  } catch (error) {
    console.error("[getExpensesByCategoryAction] Error:", error);
    throw error;
  }
}

export async function getMonthlyExpensesAction(year: number) {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  try {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const expenses = await getExpensesByMonth(userId, startDate.toISOString(), endDate.toISOString());

    const monthlyTotals = Array(12).fill(0);

    for (const expense of expenses) {
      const month = new Date(expense.date).getMonth();
      monthlyTotals[month] += expense.amount;
    }

    return monthlyTotals.map((amount, index) => ({
      name: new Date(year, index).toLocaleString('default', { month: 'short' }),
      amount,
    }));
  } catch (error) {
    console.error("[getMonthlyExpensesAction] Error:", error);
    throw error;
  }
}

export async function getBudgetVsActualAction(startDate: Date, endDate: Date) {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  try {
    const result = await getBudgetProgress(userId, startDate.toISOString(), endDate.toISOString());
    return result;
  } catch (error) {
    console.error("[getBudgetVsActualAction] Error:", error);
    throw error;
  }
}

export async function getTopExpensesAction(limit: number = 5) {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  try {
    // Provide valid ISO date strings instead of empty strings
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const startDate = oneYearAgo.toISOString();
    const endDate = new Date().toISOString();
    
    const expenses = await getExpensesByCategory(userId, startDate, endDate);
    const topExpenses = expenses
      .reduce((acc, category) => acc.concat(category.expenses || []), [])
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);

    return topExpenses;
  } catch (error) {
    console.error("[getTopExpensesAction] Error:", error);
    return []; // Return empty array instead of throwing to prevent page errors
  }
}

export async function getExpenseTrendsAction() {
  const { userId } = await auth();
  
  if (!userId) {
    return {
      totalThisMonth: 0,
      totalLastMonth: 0,
      percentChange: 0,
      averagePerDay: 0,
      mostExpensiveDay: { day: '', amount: 0 },
      mostExpensiveCategory: { name: '', amount: 0 },
    };
  }

  try {
    // Get current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Calculate date ranges
    const startOfThisMonth = new Date(currentYear, currentMonth, 1);
    const endOfThisMonth = new Date(currentYear, currentMonth + 1, 0);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0);

    // Get expenses for this month
    const thisMonthExpenses = await getExpensesByMonth(userId, startOfThisMonth.toISOString(), endOfThisMonth.toISOString());

    // Get expenses for last month
    const lastMonthExpenses = await getExpensesByMonth(userId, startOfLastMonth.toISOString(), endOfLastMonth.toISOString());

    // Calculate totals
    const totalThisMonth = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalLastMonth = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate percent change
    const percentChange = totalLastMonth === 0 
      ? 100 
      : ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;
    
    // Calculate average per day for this month
    const daysInMonth = endOfThisMonth.getDate();
    const daysPassed = Math.min(now.getDate(), daysInMonth);
    const averagePerDay = daysPassed === 0 ? 0 : totalThisMonth / daysPassed;

    // Find most expensive day
    const expensesByDay: Record<string, number> = {};
    thisMonthExpenses.forEach(expense => {
      // Handle potential undefined or null date
      if (!expense.date) return;
      
      const day = new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long' });
      expensesByDay[day] = (expensesByDay[day] || 0) + expense.amount;
    });

    let mostExpensiveDay = { day: '', amount: 0 };
    Object.entries(expensesByDay).forEach(([day, amount]) => {
      if (amount > mostExpensiveDay.amount) {
        mostExpensiveDay = { day, amount };
      }
    });

    // Find most expensive category
    const expensesByCategory: Record<string, { name: string, amount: number }> = {};
    thisMonthExpenses.forEach(expense => {
      // Handle possible undefined category
      if (!expense.category) {
        // Add to "Uncategorized" if category is missing
        const uncategorizedId = 'uncategorized';
        if (!expensesByCategory[uncategorizedId]) {
          expensesByCategory[uncategorizedId] = { name: 'Uncategorized', amount: 0 };
        }
        expensesByCategory[uncategorizedId].amount += expense.amount;
        return;
      }
      
      // Handle both camelCase and snake_case naming conventions for compatibility
      const categoryId = expense.category.id || expense.category_id || 'unknown';
      const categoryName = expense.category.name || 'Unknown';
      
      if (!expensesByCategory[categoryId]) {
        expensesByCategory[categoryId] = { name: categoryName, amount: 0 };
      }
      expensesByCategory[categoryId].amount += expense.amount;
    });

    let mostExpensiveCategory = { name: '', amount: 0 };
    Object.values(expensesByCategory).forEach(category => {
      if (category.amount > mostExpensiveCategory.amount) {
        mostExpensiveCategory = category;
      }
    });

    return {
      totalThisMonth,
      totalLastMonth,
      percentChange,
      averagePerDay,
      mostExpensiveDay,
      mostExpensiveCategory,
    };
  } catch (error) {
    console.error("[getExpenseTrendsAction] Error:", error);
    // Return default values instead of throwing to prevent page errors
    return {
      totalThisMonth: 0,
      totalLastMonth: 0,
      percentChange: 0,
      averagePerDay: 0,
      mostExpensiveDay: { day: '', amount: 0 },
      mostExpensiveCategory: { name: '', amount: 0 },
    };
  }
}

export async function getExpensesByMonthAction(startDate: Date, endDate: Date) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const expenses = await getExpensesByMonth(userId, startDate.toISOString(), endDate.toISOString());
    return expenses;
  } catch (error) {
    console.error("[getExpensesByMonthAction] Error:", error);
    return [];
  }
}

export async function getBudgetProgressAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const progress = await getBudgetProgress(userId);
    return progress;
  } catch (error) {
    console.error("[getBudgetProgressAction] Error:", error);
    return [];
  }
}
