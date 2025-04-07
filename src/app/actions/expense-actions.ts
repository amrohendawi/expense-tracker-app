"use server"

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from "next/cache";
import { createExpense, updateExpense, deleteExpense, getExpenses, getCategories, processReceipt } from "@/lib/db";
import type { Tables } from "@/lib/db";
import { ReceiptData } from "@/lib/schemas/receipt-schema";

export async function createExpenseAction(data: Tables['expenses']['Insert']) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const expense = await createExpense({
      ...data,
      user_id: userId
    });

    revalidatePath("/dashboard");
    return expense;
  } catch (error) {
    console.error("[createExpenseAction] Error:", error);
    throw error;
  }
}

export async function createExpenseFromReceiptAction(
  receiptData: ReceiptData,
  filePath: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const expense = await processReceipt(userId, receiptData, filePath);

    revalidatePath("/dashboard");
    return expense;
  } catch (error) {
    console.error("[createExpenseFromReceiptAction] Error:", error);
    throw error;
  }
}

export async function updateExpenseAction(id: string, data: Tables['expenses']['Update']) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const expense = await updateExpense(id, data);
    revalidatePath("/dashboard");
    return expense;
  } catch (error) {
    console.error("[updateExpenseAction] Error:", error);
    throw error;
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    await deleteExpense(userId, id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteExpenseAction] Error:", error);
    throw error;
  }
}

export async function getCategoriesAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const categories = await getCategories(userId);
    return categories;
  } catch (error) {
    console.error("[getCategoriesAction] Error:", error);
    return [];
  }
}

export async function getExpensesAction(filters?: {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const expenses = await getExpenses(userId, {
      startDate: filters?.startDate?.toISOString(),
      endDate: filters?.endDate?.toISOString(),
      categoryId: filters?.categoryId
    });

    return expenses;
  } catch (error) {
    console.error("[getExpensesAction] Error:", error);
    return [];
  }
}

export async function getExpensesByCategoryAction(startDate: Date, endDate: Date) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    // Get expenses and categories
    const [expenses, categories] = await Promise.all([
      getExpenses(userId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }),
      getCategories(userId)
    ]);

    // Calculate total amount for each category
    const categoryTotals = categories.map(category => {
      const categoryExpenses = expenses.filter(e => e.category_id === category.id);
      const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      const count = categoryExpenses.length;

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        total,
        count,
        expenses: categoryExpenses
      };
    });

    // Sort by total amount descending
    return categoryTotals.sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error("[getExpensesByCategoryAction] Error:", error);
    return [];
  }
}
