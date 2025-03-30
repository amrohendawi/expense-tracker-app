import { prisma, withRetry } from "./prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Category, Expense, Budget } from "@prisma/client";

// User
export async function getCurrentUser() {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }

  try {
    return await withRetry(async () => {
      return await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
    });
  } catch (error) {
    console.log("[getCurrentUser] Error:", 
      error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function createUserIfNotExists() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      console.log("[createUserIfNotExists] No userId from auth()");
      return null;
    }

    // Use clerkClient instead of getUser
    let user;
    try {
      user = await clerkClient.users.getUser(userId);
    } catch (clerkError) {
      console.log("[createUserIfNotExists] Clerk API error:", String(clerkError));
      return null;
    }
    
    if (!user) {
      console.log("[createUserIfNotExists] No user data returned from Clerk");
      return null;
    }

    // Log user data shape to identify what might be missing
    console.log("[createUserIfNotExists] User data from Clerk:", {
      id: userId,
      hasEmailAddresses: user.emailAddresses?.length > 0,
      emailAddress: user.emailAddresses?.[0]?.emailAddress || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      imageUrl: user.imageUrl || null
    });

    // Create the user data payload with null checks
    const email = user.emailAddresses?.[0]?.emailAddress || "user@example.com";
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
    const image = user.imageUrl || "";

    // Use the withRetry helper to handle database operations
    const existingUser = await withRetry(async () => {
      return await prisma.user.findUnique({
        where: { id: userId }
      });
    });
    
    let upsertedUser;
    if (existingUser) {
      // Update existing user with retry logic
      upsertedUser = await withRetry(async () => {
        return await prisma.user.update({
          where: { id: userId },
          data: { email, name, image }
        });
      });
    } else {
      // Create new user with retry logic
      upsertedUser = await withRetry(async () => {
        return await prisma.user.create({
          data: { id: userId, email, name, image }
        });
      });
    }

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

    // Create default categories with retry logic
    await Promise.all(
      defaultCategories.map(category => 
        withRetry(async () => {
          return await prisma.category.upsert({
            where: {
              name_userId: {
                name: category.name,
                userId,
              },
            },
            update: {
              color: category.color,
              icon: category.icon,
            },
            create: {
              ...category,
              userId,
            },
          });
        })
      )
    );

    return upsertedUser;
  } catch (error) {
    // Use String() to safely convert the error to a string for logging
    // and avoid the "payload" argument issue
    console.log("[createUserIfNotExists] Error creating user:", 
      error instanceof Error ? error.message : String(error));
    return null;
  }
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
