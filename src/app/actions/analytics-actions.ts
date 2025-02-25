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
