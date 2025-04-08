"use server";

import { auth } from "@clerk/nextjs/server";
import { getExpensesByCategory, getExpensesByMonth, getBudgetProgress } from "@/lib/db";
import { supabase } from "@/lib/supabase";

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
    return []; // Return empty array instead of throwing to prevent page crashes
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
    return []; // Return empty array instead of throwing to prevent page crashes
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
    return []; // Return empty array instead of throwing to prevent page crashes
  }
}

export async function getTopExpensesAction(limit: number = 5) {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  try {
    // Fetch expenses directly with all necessary fields including currency
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        id,
        name,
        amount,
        currency,
        date,
        description,
        category_id,
        category:categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .order('amount', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Transform the data to ensure consistent field naming
    return expenses.map(expense => ({
      id: expense.id,
      title: expense.name, // Database field is 'name', map to 'title' for the component
      amount: expense.amount,
      currency: expense.currency || "USD", // Include currency info
      date: expense.date,
      description: expense.description,
      category: expense.category
    }));
  } catch (error) {
    console.error("[getTopExpensesAction] Error:", error);
    return []; // Return empty array instead of throwing to prevent page crashes
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
      thisCurrency: "USD",
      lastCurrency: "USD"
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

    // Get expenses for this month - need to use direct DB access here for filtering
    let thisMonthQuery = supabase
      .from('expenses')
      .select(`
        *,
        category:categories (id, name, color)
      `)
      .eq('user_id', userId)
      .gte('date', startOfThisMonth.toISOString())
      .lte('date', endOfThisMonth.toISOString());
    
    // Get expenses for last month
    let lastMonthQuery = supabase
      .from('expenses')
      .select(`*`)
      .eq('user_id', userId)
      .gte('date', startOfLastMonth.toISOString())
      .lte('date', endOfLastMonth.toISOString());
    
    const [thisMonthResult, lastMonthResult] = await Promise.all([
      thisMonthQuery,
      lastMonthQuery
    ]);
    
    if (thisMonthResult.error) throw thisMonthResult.error;
    if (lastMonthResult.error) throw lastMonthResult.error;
    
    const thisMonthExpenses = thisMonthResult.data || [];
    const lastMonthExpenses = lastMonthResult.data || [];
    
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
      try {
        const day = new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long' });
        expensesByDay[day] = (expensesByDay[day] || 0) + expense.amount;
      } catch (e) {
        console.error("Error parsing date:", e);
      }
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
      // Skip expenses without a valid category
      if (!expense.category || !expense.category.id) {
        return;
      }
      
      const { category, amount } = expense;
      const categoryId = category.id;
      
      if (!expensesByCategory[categoryId]) {
        expensesByCategory[categoryId] = { 
          name: category.name || 'Uncategorized', 
          amount: 0 
        };
      }
      expensesByCategory[categoryId].amount += amount;
    });

    let mostExpensiveCategory = { name: 'None', amount: 0 };
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
      thisCurrency: "USD", // Add currency info for conversion
      lastCurrency: "USD"
    };
  } catch (error) {
    console.error("[getExpenseTrendsAction] Error:", error);
    return {
      totalThisMonth: 0,
      totalLastMonth: 0,
      percentChange: 0,
      averagePerDay: 0,
      mostExpensiveDay: { day: '', amount: 0 },
      mostExpensiveCategory: { name: '', amount: 0 },
      thisCurrency: "USD",
      lastCurrency: "USD"
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
    return []; // Return empty array instead of throwing to prevent page crashes
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
    return []; // Return empty array instead of throwing to prevent page crashes
  }
}
