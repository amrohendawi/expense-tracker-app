"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Expense } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createExpenseAction(data: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">) {
  const { userId } = auth();
  
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
  const { userId } = auth();
  
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
  const { userId } = auth();
  
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

export async function getCategoriesAction() {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  const categories = await prisma.category.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
}

export async function getExpensesAction(filters?: {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}) {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  const where: any = { userId };

  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.date.lte = filters.endDate;
    }
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
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
