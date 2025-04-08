"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createBudget, updateBudget, deleteBudget, getBudgets, getExpenses } from "@/lib/db";
import type { Tables } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function createBudgetAction(data: Tables['budgets']['Insert']) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const budget = await createBudget({
      ...data,
      user_id: userId
    });

    revalidatePath("/dashboard");
    return budget;
  } catch (error) {
    console.error("[createBudgetAction] Error:", error);
    throw error;
  }
}

export async function updateBudgetAction(id: string, data: Tables['budgets']['Update']) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const budget = await updateBudget(userId, id, data);
    revalidatePath("/dashboard");
    return budget;
  } catch (error) {
    console.error("[updateBudgetAction] Error:", error);
    throw error;
  }
}

export async function deleteBudgetAction(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    await deleteBudget(userId, id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteBudgetAction] Error:", error);
    throw error;
  }
}

export async function getBudgetsAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const budgets = await getBudgets(userId);
    return budgets;
  } catch (error) {
    console.error("[getBudgetsAction] Error:", error);
    return [];
  }
}

export async function getBudgetProgressAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    // Get all budgets and expenses
    const [budgets, expenses] = await Promise.all([
      getBudgets(userId),
      getExpenses(userId)
    ]);

    // Calculate progress for each budget
    const progress = budgets.map(budget => {
      const budgetExpenses = expenses.filter(e => e.category_id === budget.category_id);
      const spent = budgetExpenses.reduce((sum, e) => sum + e.amount, 0);
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      return {
        id: budget.id,
        category: budget.category.name,
        color: budget.category.color,
        budget: budget.amount,
        spent,
        remaining,
        percentage,
        isOverBudget: spent > budget.amount
      };
    });

    return progress;
  } catch (error) {
    console.error("[getBudgetProgressAction] Error:", error);
    return [];
  }
}

export async function getBudgetStatusAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    // Get current date for date filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all budgets
    const budgets = await getBudgets(userId);
    
    // Prepare expenses query with proper filtering
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        id,
        amount,
        currency,
        category_id,
        date
      `)
      .eq('user_id', userId)
      .gte('date', startOfMonth.toISOString())
      .lte('date', endOfMonth.toISOString());
      
    if (error) throw error;

    // Calculate status for each budget
    const status = budgets.map(budget => {
      // Filter expenses that belong to this budget's category
      const budgetExpenses = expenses.filter(e => e.category_id === budget.category_id);
      
      // Calculate total spent with currency information
      const spent = budgetExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      // Calculate remaining amount
      const remaining = budget.amount - spent;
      
      // Calculate percentage used (capped at 100%)
      const percentage = Math.min((spent / budget.amount) * 100, 100);

      return {
        id: budget.id,
        name: budget.name,
        category: budget.category,
        category_id: budget.category_id, // Include snake_case version
        categoryId: budget.category_id, // Include camelCase version for components
        color: budget.category.color,
        amount: budget.amount,
        currency: budget.currency || "USD", // Include currency information
        spent,
        spentCurrency: "USD", // Assuming expenses are in the user's default currency
        remaining,
        percentage,
        isOverBudget: spent > budget.amount,
        startDate: budget.start_date,
        endDate: budget.end_date
      };
    });

    return status;
  } catch (error) {
    console.error("[getBudgetStatusAction] Error:", error);
    return [];
  }
}
