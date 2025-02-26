"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Expense } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createExpenseAction(data: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const expense = await prisma.expense.create({
    data: {
      ...data,
      userId,
    },
  });

  revalidatePath("/dashboard");
  return expense;
}

export async function updateExpenseAction(id: string, data: Partial<Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">>) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const expense = await prisma.expense.findUnique({
    where: {
      id,
    },
  });

  if (!expense || expense.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const updatedExpense = await prisma.expense.update({
    where: {
      id,
    },
    data,
  });

  revalidatePath("/dashboard");
  return updatedExpense;
}

export async function deleteExpenseAction(id: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const expense = await prisma.expense.findUnique({
    where: {
      id,
    },
  });

  if (!expense || expense.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.expense.delete({
    where: {
      id,
    },
  });

  revalidatePath("/dashboard");
  return true;
}

export async function getCategoriesAction(): Promise<{ id: string; name: string; color: string }[]> {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  try {
    const categories = await prisma.category.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getExpensesAction(filters?: {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  const where: {
    userId: string;
    categoryId?: string;
    date?: {
      gte?: Date;
      lte?: Date;
    };
  } = {
    userId,
  };

  if (filters) {
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return expenses;
}
