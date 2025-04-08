"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createBudget, updateBudget, deleteBudget, getBudgets, getExpenses } from "@/lib/db";
import type { Tables } from "@/lib/db";

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

    // Get all budgets and expenses
    const [budgets, expenses] = await Promise.all([
      getBudgets(userId),
      getExpenses(userId)
    ]);

    // If there are no budgets, return an empty array
    if (!budgets || budgets.length === 0) {
      console.log("No budgets found for user");
      return [];
    }

    console.log(`Found ${budgets.length} budgets and ${expenses.length} expenses`);

    // Calculate status for each budget
    const status = budgets.map(budget => {
      // Ensure we have a valid category ID
      const categoryId = budget.category_id;
      
      if (!categoryId) {
        console.log(`Budget ${budget.id} has no category ID, skipping`);
        return null;
      }

      // Filter expenses for this budget's category
      const budgetExpenses = expenses.filter(e => e.category_id === categoryId);
      
      // Calculate spent amount in the budget's currency
      const spent = budgetExpenses.reduce((sum, e) => {
        // Skip invalid expenses
        if (typeof e.amount !== 'number') {
          console.log(`Expense ${e.id} has invalid amount: ${e.amount}`);
          return sum;
        }
        
        // For now, simple sum - currency conversion will happen in the component
        return sum + e.amount;
      }, 0);
      
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      console.log(`Budget ${budget.name}: ${budget.amount} ${budget.currency || 'USD'}, Spent: ${spent}, Remaining: ${remaining}`);

      // Make sure we have a category object
      const category = budget.category || {
        id: categoryId,
        name: 'Unknown Category',
        color: '#888888'
      };

      return {
        id: budget.id,
        name: budget.name || 'Unnamed Budget',
        categoryId: categoryId,
        category: {
          id: category.id,
          name: category.name,
          color: category.color
        },
        amount: budget.amount,
        currency: budget.currency || "USD",
        spent,
        remaining,
        percentage,
        isOverBudget: spent > budget.amount,
        startDate: budget.start_date,
        endDate: budget.end_date,
        period: budget.period || 'monthly'
      };
    }).filter(Boolean); // Remove null entries

    return status;
  } catch (error) {
    console.error("[getBudgetStatusAction] Error:", error);
    return [];
  }
}
