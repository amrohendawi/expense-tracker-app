"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createBudgetAction(data: {
  amount: number;
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
    const spent = expenses
      .filter(expense => {
        // If budget is for a specific category, only include expenses for that category
        if (budget.categoryId) {
          return expense.categoryId === budget.categoryId;
        }
        // If budget is for all categories, include all expenses
        return true;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;

    return {
      category: budget.category,
      budget: {
        id: budget.id,
        amount: budget.amount
      },
      spent,
      remaining,
      percentage,
    };
  });

  return budgetStatus;
}
