"use server"

// Updated imports for Clerk 6
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ReceiptData } from "@/lib/schemas/receipt-schema"; // Add this import

export async function clerkAuth() {
  try {
    // Properly await auth() in Clerk 6 with Next.js 15
    const session = await auth();
    const userId = session.userId;
    
    if (userId) {
      return { userId };
    }
    
    // No valid auth found
    return { userId: null };
  } catch (error) {
    console.error("Authentication error:", error);
    return { userId: null };
  }
}

export async function createExpenseAction(formData: any) {
  const { userId } = await clerkAuth();
  
  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        title: formData.title,
        amount: formData.amount,
        currency: formData.currency || "USD", // Add currency handling
        date: formData.date,
        description: formData.description,
        categoryId: formData.categoryId,
        receiptUrl: formData.receiptUrl,
        userId,
      },
      include: {
        category: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: expense };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Failed to create expense" };
  }
}

/**
 * Create expense from receipt data
 */
export async function createExpenseFromReceiptAction(
  receiptData: ReceiptData,
  filePath: string
) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // Create the expense record
    const expense = await prisma.expense.create({
      data: {
        userId,
        title: receiptData.title || "Receipt Expense",
        amount: receiptData.amount,
        currency: receiptData.currency || "USD", // Use the receipt's currency or default to USD
        date: receiptData.date ? new Date(receiptData.date) : new Date(),
        description: receiptData.description || "",
        receiptUrl: filePath,
        // Link to category if provided
        categoryId: receiptData.categoryId,
      },
      include: {
        category: true,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/expenses");
    return { success: true, data: expense };
  } catch (error) {
    console.error("Error creating expense from receipt:", error);
    return { success: false, error: "Failed to create expense from receipt" };
  }
}

export async function updateExpenseAction(id: string, formData: any) {
  const { userId } = await clerkAuth();
  
  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  const expense = await prisma.expense.findUnique({
    where: {
      id,
    },
  });

  if (!expense || expense.userId !== userId) {
    return { success: false, error: "Expense not found or access denied" };
  }

  try {
    const updatedExpense = await prisma.expense.update({
      where: {
        id,
      },
      data: {
        title: formData.title,
        amount: formData.amount,
        currency: formData.currency || "USD", // Add currency handling
        date: formData.date,
        description: formData.description,
        categoryId: formData.categoryId,
        receiptUrl: formData.receiptUrl,
      },
      include: {
        category: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: updatedExpense };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { success: false, error: "Failed to update expense" };
  }
}

export async function deleteExpenseAction(id: string) {
  const { userId } = await clerkAuth();
  
  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  const expense = await prisma.expense.findUnique({
    where: {
      id,
    },
  });

  if (!expense || expense.userId !== userId) {
    return { success: false, error: "Expense not found or access denied" };
  }

  try {
    await prisma.expense.delete({
      where: {
        id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}

export async function getCategoriesAction(): Promise<{ id: string; name: string; color: string }[]> {
  const { userId } = await clerkAuth();
  
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
  const { userId } = await clerkAuth();
  
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
