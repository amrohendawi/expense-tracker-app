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

export async function getUserSettingsAction(): Promise<UserSettings> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // In a real app, you'd fetch this from a settings table in the database
  // For now, we'll return default settings
  return {
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
    throw new Error("Unauthorized");
  }

  // In a real app, you'd update this in the database
  // For now, we'll just revalidate the path
  console.log("Updating settings:", settings);
  revalidatePath("/dashboard/settings");
  
  return { success: true };
}

export async function exportUserDataAction() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
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

  return exportData;
}

export async function deleteAllUserDataAction() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Delete all user data in the correct order to respect foreign key constraints
  await prisma.$transaction([
    prisma.expense.deleteMany({ where: { userId } }),
    prisma.budget.deleteMany({ where: { userId } }),
    prisma.category.deleteMany({ where: { userId } }),
  ]);

  revalidatePath("/dashboard");
  
  return { success: true };
}

export async function getAccountStatisticsAction() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
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
