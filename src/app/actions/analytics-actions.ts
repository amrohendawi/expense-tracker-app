"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function getExpensesByCategoryAction(startDate: Date, endDate: Date) {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
  });

  const categoryTotals: Record<string, { 
    id: string, 
    name: string, 
    color: string, 
    amount: number 
  }> = {};

  let totalAmount = 0;

  // First pass: calculate totals
  for (const expense of expenses) {
    const { categoryId, category, amount } = expense;
    totalAmount += amount;
    
    if (!categoryTotals[categoryId]) {
      categoryTotals[categoryId] = {
        id: categoryId,
        name: category.name,
        color: category.color,
        amount: 0,
      };
    }
    
    categoryTotals[categoryId].amount += amount;
  }

  // Second pass: calculate percentages
  const result = Object.values(categoryTotals).map(category => ({
    ...category,
    percentage: totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0
  }));

  return result;
}

export async function getMonthlyExpensesAction(year: number) {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });

  const monthlyTotals = Array(12).fill(0);

  for (const expense of expenses) {
    const month = new Date(expense.date).getMonth();
    monthlyTotals[month] += expense.amount;
  }

  return monthlyTotals.map((amount, index) => ({
    name: new Date(year, index).toLocaleString('default', { month: 'short' }),
    amount,
  }));
}

export async function getBudgetVsActualAction(startDate: Date, endDate: Date) {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  // Get all budgets
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
    include: {
      category: true,
    },
  });

  // Get all expenses for the period
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
  });

  // Calculate actual spending by category
  const actualByCategory: Record<string, number> = {};
  for (const expense of expenses) {
    const { categoryId, amount } = expense;
    actualByCategory[categoryId] = (actualByCategory[categoryId] || 0) + amount;
  }

  // Combine budget and actual data
  const result = budgets.map(budget => {
    return {
      category: budget.category.name,
      budget: budget.amount,
      actual: actualByCategory[budget.categoryId] || 0,
      color: budget.category.color,
    };
  });

  return result;
}

export async function getTopExpensesAction(limit: number = 5) {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
    },
    include: {
      category: true,
    },
    orderBy: {
      amount: 'desc',
    },
    take: limit,
  });

  return expenses;
}

export async function getExpenseTrendsAction() {
  const { userId } = auth();
  
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
  const thisMonthExpenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
    include: {
      category: true,
    },
  });

  // Get expenses for last month
  const lastMonthExpenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
  });

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
    const { category, amount } = expense;
    if (!expensesByCategory[category.id]) {
      expensesByCategory[category.id] = { name: category.name, amount: 0 };
    }
    expensesByCategory[category.id].amount += amount;
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
}
