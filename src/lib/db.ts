import { prisma } from "./prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Category, Expense, Budget } from "@prisma/client";

// User
export async function getCurrentUser() {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
}

export async function createUserIfNotExists() {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  // Use clerkClient instead of getUser
  const user = userId ? await clerkClient.users.getUser(userId) : null;
  
  if (!user) {
    return null;
  }

  // Use upsert instead of checking and creating separately
  const upsertedUser = await prisma.user.upsert({
    where: {
      id: userId,
    },
    update: {
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      image: user.imageUrl || "",
    },
    create: {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      image: user.imageUrl || "",
    },
  });

  // Create default categories
  const defaultCategories = [
    { name: "Food", color: "#FF5733", icon: "utensils" },
    { name: "Transportation", color: "#33A8FF", icon: "car" },
    { name: "Entertainment", color: "#FF33E9", icon: "film" },
    { name: "Shopping", color: "#33FF57", icon: "shopping-bag" },
    { name: "Housing", color: "#8333FF", icon: "home" },
    { name: "Utilities", color: "#FF8333", icon: "bolt" },
    { name: "Healthcare", color: "#33FFC1", icon: "hospital" },
    { name: "Personal", color: "#C133FF", icon: "user" },
    { name: "Education", color: "#33FFF6", icon: "graduation-cap" },
    { name: "Other", color: "#BEBEBE", icon: "ellipsis-h" },
  ];

  // Use Promise.all to run all upserts in parallel
  await Promise.all(
    defaultCategories.map(category => 
      prisma.category.upsert({
        where: {
          // Create a unique identifier based on name and userId
          name_userId: {
            name: category.name,
            userId,
          },
        },
        update: {
          // If it exists, update the color and icon
          color: category.color,
          icon: category.icon,
        },
        create: {
          // If it doesn't exist, create it
          ...category,
          userId,
        },
      })
    )
  );

  return upsertedUser;
}

// Categories
export async function getCategories() {
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

export async function createCategory(data: Omit<Category, "id" | "userId" | "createdAt" | "updatedAt">) {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const category = await prisma.category.create({
    data: {
      ...data,
      userId,
    },
  });

  return category;
}

export async function updateCategory(id: string, data: Partial<Omit<Category, "id" | "userId" | "createdAt" | "updatedAt">>) {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const category = await prisma.category.update({
    where: {
      id,
      userId,
    },
    data,
  });

  return category;
}

export async function deleteCategory(id: string) {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const category = await prisma.category.delete({
    where: {
      id,
      userId,
    },
  });

  return category;
}

// Expenses
export async function getExpenses(filters?: {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
}) {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  type WhereClause = {
    userId: string;
    date?: {
      gte: Date;
      lte: Date;
    };
    categoryId?: string;
  };

  const where: WhereClause = { userId };

  if (filters?.startDate && filters?.endDate) {
    where.date = {
      gte: filters.startDate,
      lte: filters.endDate,
    };
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

export async function createExpense(data: Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">) {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const expense = await prisma.expense.create({
    data: {
      ...data,
      userId,
    },
    include: {
      category: true,
    },
  });

  return expense;
}

export async function updateExpense(id: string, data: Partial<Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">>) {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const expense = await prisma.expense.update({
    where: {
      id,
      userId,
    },
    data,
    include: {
      category: true,
    },
  });

  return expense;
}

export async function deleteExpense(id: string) {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const expense = await prisma.expense.delete({
    where: {
      id,
      userId,
    },
  });

  return expense;
}

// Budgets
export async function getBudgets() {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
    },
    include: {
      category: true,
    },
  });

  return budgets;
}

export async function createBudget(data: Omit<Budget, "id" | "userId" | "createdAt" | "updatedAt">) {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const budget = await prisma.budget.create({
    data: {
      ...data,
      userId,
    },
    include: {
      category: true,
    },
  });

  return budget;
}

export async function updateBudget(id: string, data: Partial<Omit<Budget, "id" | "userId" | "createdAt" | "updatedAt">>) {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const budget = await prisma.budget.update({
    where: {
      id,
      userId,
    },
    data,
    include: {
      category: true,
    },
  });

  return budget;
}

export async function deleteBudget(id: string) {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  const budget = await prisma.budget.delete({
    where: {
      id,
      userId,
    },
  });

  return budget;
}

// Analytics
export async function getExpensesByCategory(startDate: Date, endDate: Date) {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
  });

  const categoryTotals: Record<string, { 
    categoryId: string, 
    name: string, 
    color: string, 
    total: number 
  }> = {};

  for (const expense of expenses) {
    const { categoryId, category, amount } = expense;
    
    if (!categoryTotals[categoryId]) {
      categoryTotals[categoryId] = {
        categoryId,
        name: category.name,
        color: category.color,
        total: 0,
      };
    }
    
    categoryTotals[categoryId].total += amount;
  }

  return Object.values(categoryTotals);
}

export async function getMonthlyExpenses(year: number) {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const monthlyTotals = Array(12).fill(0);

  for (const expense of expenses) {
    const month = expense.date.getMonth();
    monthlyTotals[month] += expense.amount;
  }

  return monthlyTotals;
}

export async function getBudgetStatus() {
  const { userId } = auth();
  
  if (!userId) {
    return [];
  }

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
    },
    include: {
      category: true,
    },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);

  const result = [];

  for (const budget of budgets) {
    let startDate, endDate;

    if (budget.period === "monthly") {
      startDate = startOfMonth;
      endDate = endOfMonth;
    } else if (budget.period === "weekly") {
      startDate = startOfWeek;
      endDate = endOfWeek;
    } else if (budget.period === "yearly") {
      startDate = startOfYear;
      endDate = endOfYear;
    } else {
      continue;
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        categoryId: budget.categoryId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;

    result.push({
      budget,
      spent,
      remaining,
      percentage,
      isOverBudget: spent > budget.amount,
    });
  }

  return result;
}
