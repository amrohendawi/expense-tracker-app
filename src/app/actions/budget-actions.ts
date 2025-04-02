"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { convertCurrency } from "@/lib/utils" // Use the existing currency converter

export async function createBudgetAction(data: {
  amount: number;
  currency: string;  // Add currency
  categoryId: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  period: string;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const budget = await prisma.budget.create({
    data: {
      ...data,
      userId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budgets");
  return budget;
}

export async function updateBudgetAction({
  id,
  ...data
}: {
  id: string;
  amount?: number;
  currency?: string;  // Add currency
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  period?: string;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const budget = await prisma.budget.findUnique({
    where: {
      id,
    },
  });

  if (!budget || budget.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const updatedBudget = await prisma.budget.update({
    where: {
      id,
    },
    data,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budgets");
  return updatedBudget;
}

export async function deleteBudgetAction(id: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const budget = await prisma.budget.findUnique({
    where: {
      id,
    },
  });

  if (!budget || budget.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.budget.delete({
    where: {
      id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budgets");
  return true;
}

export async function getBudgetsAction() {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
    },
    include: {
      category: true,
    },
  });

  return budgets;
}

export async function getBudgetStatusAction() {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  // Get current month's start and end dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get all budgets
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      // Ensure we only get active budgets for current period
      OR: [
        { 
          startDate: { lte: endOfMonth },
          endDate: { gte: startOfMonth }
        },
        {
          period: "monthly"  // Always include monthly budgets
        }
      ]
    },
    include: {
      category: true,
    },
  });

  // Get all expenses for the current month
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // Calculate spent amount for each budget
  const budgetStatus = budgets.map(budget => {
    // Filter expenses by this budget's category
    const categoryExpenses = expenses.filter(exp => exp.categoryId === budget.categoryId);
        
    // Convert expenses to budget's currency
    const spent = categoryExpenses.reduce((sum, expense) => {
      const expenseCurrency = expense.currency || "USD";
      const budgetCurrency = budget.currency || "USD";
      
      // Convert expense amount to budget currency
      const convertedAmount = convertCurrency(expense.amount, expenseCurrency, budgetCurrency);
      return sum + convertedAmount;
    }, 0);

    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      budget: {
        id: budget.id,
        amount: budget.amount,
        currency: budget.currency || "USD",
        period: budget.period,
        category: budget.category,
      },
      spent,
      spentCurrency: budget.currency || "USD",
      remaining,
      percentage,
    };
  });

  return budgetStatus;
}
