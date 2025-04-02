"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface UserSettings {
  currency: string
  language: string
  theme: string
  autoSave: boolean
  emailNotifications: boolean
  budgetAlerts: boolean
  weeklySummary: boolean
  darkMode: boolean
}

export async function getUserSettingsAction(): Promise<UserSettings | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  return settings || {
    currency: "USD",
    language: "English",
    theme: "#10b981",
    autoSave: true,
    emailNotifications: true,
    budgetAlerts: true,
    weeklySummary: true,
    darkMode: false,
  };
}

export async function updateUserSettingsAction(settings: Partial<UserSettings>) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  // Extract only fields that are in the Prisma schema
  const {
    currency,
    language,
    theme,
    autoSave,
    emailNotifications,
    budgetAlerts,
    weeklySummary,
    darkMode
  } = settings;

  try {
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId },
      create: { 
        userId, 
        currency, 
        language, 
        theme,
        autoSave,
        emailNotifications,
        budgetAlerts,
        weeklySummary,
        darkMode
      },
      update: { 
        currency, 
        language, 
        theme,
        autoSave,
        emailNotifications,
        budgetAlerts,
        weeklySummary,
        darkMode
      },
    });
    
    revalidatePath("/dashboard/settings");
    return { success: true, data: updatedSettings };
  } catch (error) {
    console.error("Error updating user settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function exportUserDataAction() {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  // Get all user data
  const [expenses, categories, budgets] = await Promise.all([
    prisma.expense.findMany({
      where: { userId },
      include: { category: true },
    }),
    prisma.category.findMany({
      where: { userId },
    }),
    prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    }),
  ]);

  // Create export object
  const exportData = {
    expenses,
    categories,
    budgets,
    exportDate: new Date().toISOString(),
  };

  return { success: true, data: exportData };
}

export async function deleteAllUserDataAction() {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Authentication required" };
  }

  try {
    // Delete all user data in the correct order to respect foreign key constraints
    await prisma.$transaction([
      prisma.expense.deleteMany({ where: { userId } }),
      prisma.budget.deleteMany({ where: { userId } }),
      prisma.category.deleteMany({ where: { userId } }),
    ]);

    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user data:", error);
    return { success: false, error: "Failed to delete user data" };
  }
}

export async function getAccountStatisticsAction() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Get counts of user data
  const [expenseCount, categoryCount, budgetCount] = await Promise.all([
    prisma.expense.count({ where: { userId } }),
    prisma.category.count({ where: { userId } }),
    prisma.budget.count({ where: { userId } }),
  ]);

  // Get first expense date
  const firstExpense = await prisma.expense.findFirst({
    where: { userId },
    orderBy: { date: 'asc' },
  });

  const accountAge = firstExpense 
    ? Math.ceil((Date.now() - new Date(firstExpense.date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    expenseCount,
    categoryCount,
    budgetCount,
    accountAge,
  };
}
