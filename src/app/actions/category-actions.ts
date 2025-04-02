"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createCategoryAction(data: { name: string; color: string }) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const category = await prisma.category.create({
      data: {
        ...data,
        userId,
        icon: null, // Set icon to null since we're not using it
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategoryAction(id: string, data: { name: string; color: string }) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category || category.userId !== userId) {
    return { success: false, error: "Category not found or access denied" };
  }

  try {
    const updatedCategory = await prisma.category.update({
      where: {
        id,
      },
      data,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categories");
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(id: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category || category.userId !== userId) {
    return { success: false, error: "Category not found or access denied" };
  }

  // Check if category is used by any expenses
  const expenseCount = await prisma.expense.count({
    where: {
      categoryId: id,
    },
  });

  if (expenseCount > 0) {
    return { success: false, error: "Cannot delete category that is used by expenses" };
  }

  try {
    await prisma.category.delete({
      where: {
        id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
