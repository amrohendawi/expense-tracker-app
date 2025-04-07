"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { 
  getUserSettings,
  updateUserSettings,
  getExpenses,
  getCategories,
  getBudgets,
  supabase
} from "@/lib/db";

export interface UserSettings {
  currency: string
  language: string
  theme: string
  autoSave: boolean
  emailNotifications: boolean
  budgetAlerts: boolean
  weeklySummary: boolean
  user_id: string
}

export async function getUserSettingsAction(): Promise<UserSettings | null> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    const settings = await getUserSettings(userId);
    return settings;
  } catch (error) {
    console.error("[getUserSettingsAction] Error:", error);
    return null;
  }
}

export async function updateUserSettingsAction(data: {
  currency?: string;
  theme?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const settings = await updateUserSettings(userId, data);
    revalidatePath("/dashboard");
    return settings;
  } catch (error) {
    console.error("[updateUserSettingsAction] Error:", error);
    throw error;
  }
}

export async function exportUserDataAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Fetch all user data
    const [settings, expenses, categories, budgets] = await Promise.all([
      getUserSettings(userId),
      getExpenses(userId),
      getCategories(userId),
      getBudgets(userId)
    ]);

    // Create export object
    const exportData = {
      settings,
      expenses,
      categories,
      budgets,
      exportDate: new Date().toISOString()
    };

    return exportData;
  } catch (error) {
    console.error("[exportUserDataAction] Error:", error);
    throw error;
  }
}

export async function deleteAllUserDataAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Delete all user data in order (to respect foreign key constraints)
    await Promise.all([
      supabase.from('expenses').delete().eq('user_id', userId),
      supabase.from('budgets').delete().eq('user_id', userId),
      supabase.from('categories').delete().eq('user_id', userId),
      supabase.from('user_settings').delete().eq('user_id', userId)
    ]);

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("[deleteAllUserDataAction] Error:", error);
    throw error;
  }
}

export async function getAccountStatisticsAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get all user data
    const [expenses, categories, budgets] = await Promise.all([
      getExpenses(userId),
      getCategories(userId),
      getBudgets(userId)
    ]);

    // Calculate statistics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudgets = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const categoryId = expense.category_id;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExpenses,
      totalBudgets,
      averageExpense,
      expensesByCategory,
      totalCategories: categories.length,
      totalBudgetCount: budgets.length,
      totalExpenseCount: expenses.length
    };
  } catch (error) {
    console.error("[getAccountStatisticsAction] Error:", error);
    throw error;
  }
}
