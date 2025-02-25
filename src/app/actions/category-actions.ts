"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Category } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createCategoryAction(data: Omit<Category, "id" | "userId" | "createdAt" | "updatedAt">) {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const category = await prisma.category.create({
    data: {
      ...data,
      userId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  return category;
}

export async function updateCategoryAction(id: string, data: Partial<Omit<Category, "id" | "userId" | "createdAt" | "updatedAt">>) {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category || category.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id,
    },
    data,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  return updatedCategory;
}

export async function deleteCategoryAction(id: string) {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category || category.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // Check if category is used by any expenses
  const expenseCount = await prisma.expense.count({
    where: {
      categoryId: id,
    },
  });

  if (expenseCount > 0) {
    throw new Error("Cannot delete category that is used by expenses");
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  return true;
}
