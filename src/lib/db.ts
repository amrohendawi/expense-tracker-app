import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { defaultCategories } from './default-categories';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type User = Tables['users']['Row'];
export type Expense = Tables['expenses']['Row'];
export type Category = Tables['categories']['Row'];
export type Budget = Tables['budgets']['Row'];
export type UserSettings = Tables['user_settings']['Row'];

// User
export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[getCurrentUser] Error:', error);
    return null;
  }
}

// User Settings
export async function getUserSettings(userId: string) {
  try {
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );
    
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no settings exist for this user, create default settings
      if (error.code === 'PGRST116') {
        console.log(`[getUserSettings] Creating default settings for user ${userId}`);
        return await createUserSettings(userId);
      }
      console.error('[getUserSettings] Error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[getUserSettings] Error:', error);
    return null;
  }
}

async function createUserSettings(userId: string) {
  try {
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );
    
    const defaultSettings = {
      user_id: userId,
      currency: 'USD',
      theme: 'light',
      language: 'English',
      auto_save: true,
      email_notifications: true,
      budget_alerts: true,
      weekly_summary: true,
      dark_mode: false
    };
    
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .insert([defaultSettings])
      .select()
      .single();
      
    if (error) {
      console.error('[createUserSettings] Error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[createUserSettings] Error:', error);
    // Return default settings as fallback
    return { 
      user_id: userId,
      currency: 'USD', 
      theme: 'light',
      language: 'English'
    };
  }
}

export async function updateUserSettings(userId: string, data: Tables['user_settings']['Update']) {
  try {
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );
    
    // Check if settings exist first
    const { data: existingSettings } = await supabaseAdmin
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (!existingSettings) {
      // If no settings exist, create them first
      return await createUserSettings(userId);
    }
    
    // Update existing settings
    const { data: settings, error } = await supabaseAdmin
      .from('user_settings')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[updateUserSettings] Error:', error);
      throw error;
    }
    
    return settings;
  } catch (error) {
    console.error('[updateUserSettings] Error:', error);
    throw error;
  }
}

// Categories
export async function getCategories(userId: string) {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) {
      console.error('[getCategories] Error:', error);
      
      // If there's a permission error, try with admin client
      if (error.code === '42501') {
        console.log('[getCategories] Attempting with admin client due to permission error');
        const supabaseAdmin = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              persistSession: false,
            }
          }
        );
        
        const { data: adminCategories, error: adminError } = await supabaseAdmin
          .from('categories')
          .select('*')
          .eq('user_id', userId)
          .order('name');
          
        if (adminError) {
          console.error('[getCategories] Admin Error:', adminError);
          throw adminError;
        }
        
        return adminCategories || [];
      }
      
      throw error;
    }

    return categories || [];
  } catch (error) {
    console.error('[getCategories] Error:', error);
    throw error;
  }
}

export async function createCategory(userId: string, data: Tables['categories']['Insert']) {
  try {
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('[createCategory] Error:', error);
      throw error;
    }
    
    return category;
  } catch (error) {
    console.error('[createCategory] Error:', error);
    throw error;
  }
}

export async function updateCategory(userId: string, id: string, data: Tables['categories']['Update']) {
  try {
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)  // Ensure the user owns this category
      .select()
      .single();

    if (error) {
      console.error('[updateCategory] Error:', error);
      throw error;
    }
    
    return category;
  } catch (error) {
    console.error('[updateCategory] Error:', error);
    throw error;
  }
}

export async function deleteCategory(userId: string, id: string) {
  try {
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    // Ensure the user owns this category
    const { data: category, error: checkError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError || !category) {
      console.error('[deleteCategory] Category not found or access denied:', checkError);
      throw new Error('Category not found or access denied');
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[deleteCategory] Delete Error:', error);
      throw error;
    }
  } catch (error) {
    console.error('[deleteCategory] Error:', error);
    throw error;
  }
}

// Expenses
export async function getExpenses(userId: string, filters?: {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}) {
  try {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId);

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("[getExpenses] Error:", error);
    throw error;
  }
}

export async function createExpense(data: Tables['expenses']['Insert']) {
  try {
    // Create a clean object with proper database column names
    const dbData: Record<string, any> = {};
    
    // Map common field names (handle both name/title)
    dbData.user_id = data.user_id || data.userId;
    dbData.category_id = data.category_id || data.categoryId;
    dbData.name = data.name || data.title; // Handle both name and title
    dbData.amount = data.amount;
    dbData.currency = data.currency || 'USD';
    dbData.date = data.date;
    dbData.description = data.description;
    dbData.receipt_url = data.receipt_url || data.receiptUrl;
    dbData.created_at = data.created_at || new Date().toISOString();
    dbData.updated_at = data.updated_at || new Date().toISOString();
    
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    console.log('Creating expense with data:', dbData);

    const { data: expense, error } = await supabaseAdmin
      .from('expenses')
      .insert(dbData)
      .select(`
        *,
        category:categories (
          id,
          name,
          color
        )
      `)
      .single();

    if (error) {
      console.error("[createExpense] Error:", error);
      throw error;
    }

    return expense;
  } catch (error) {
    console.error("[createExpense] Error:", error);
    throw error;
  }
}

export async function updateExpense(id: string, data: Tables['expenses']['Update']) {
  try {
    // Create a clean object with proper database column names
    const dbData: Record<string, any> = {};
    
    // Only add fields that are provided
    if (data.title || data.name) dbData.name = data.name || data.title;
    if (data.amount) dbData.amount = data.amount;
    if (data.currency) dbData.currency = data.currency;
    if (data.date) dbData.date = data.date;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.receipt_url || data.receiptUrl) dbData.receipt_url = data.receipt_url || data.receiptUrl;
    if (data.category_id || data.categoryId) dbData.category_id = data.category_id || data.categoryId;
    
    // Always update the timestamp
    dbData.updated_at = new Date().toISOString();
    
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    console.log('Updating expense with data:', dbData);

    const { data: expense, error } = await supabaseAdmin
      .from('expenses')
      .update(dbData)
      .eq('id', id)
      .select(`
        *,
        category:categories (
          id,
          name,
          color
        )
      `)
      .single();

    if (error) {
      console.error("[updateExpense] Error:", error);
      throw error;
    }

    return expense;
  } catch (error) {
    console.error("[updateExpense] Error:", error);
    throw error;
  }
}

export async function deleteExpense(userId: string, id: string) {
  try {
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );
    
    // Verify the expense belongs to the user
    const { data: expense, error: checkError } = await supabaseAdmin
      .from('expenses')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (checkError || !expense) {
      console.error('[deleteExpense] Expense not found or access denied:', checkError);
      throw new Error('Expense not found or access denied');
    }

    const { error } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("[deleteExpense] Error:", error);
      throw error;
    }
  } catch (error) {
    console.error("[deleteExpense] Error:", error);
    throw error;
  }
}

// Budgets
export async function getBudgets(userId: string) {
  try {
    console.log(`[getBudgets] Fetching budgets for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[getBudgets] Error:", error);
      return []; // Return empty array instead of throwing error
    }

    if (!data || data.length === 0) {
      console.log("[getBudgets] No budgets found for user");
      return [];
    }

    console.log(`[getBudgets] Found ${data.length} budgets`);
    
    // Ensure all budgets have valid categories
    const processedData = data.map(budget => {
      // Check if category is null or undefined
      if (!budget.category) {
        console.log(`[getBudgets] Budget ${budget.id} has missing category, adding default`);
        // Add a default category
        return {
          ...budget,
          category: {
            id: budget.category_id || 'unknown',
            name: 'Unknown Category',
            color: '#888888'
          }
        };
      }
      return budget;
    });

    return processedData;
  } catch (error) {
    console.error("[getBudgets] Error:", error);
    return []; // Return empty array instead of throwing
  }
}

export async function createBudget(data: Tables['budgets']['Insert']) {
  try {
    // Create a clean object with proper database column names
    const dbData: Record<string, any> = {};
    
    // Map common field names
    dbData.user_id = data.user_id || data.userId;
    dbData.category_id = data.category_id || data.categoryId;
    
    // Handle name field - ensure it's not null/undefined
    if (!data.name && !data.title) {
      // Fetch the category name to use as part of the default budget name
      const supabaseAdmin = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
          }
        }
      );
      
      const { data: category } = await supabaseAdmin
        .from('categories')
        .select('name')
        .eq('id', dbData.category_id)
        .single();
        
      // Create a default name based on the category and period
      const period = data.period || 'monthly';
      const categoryName = category?.name || 'Budget';
      dbData.name = `${categoryName} ${period} budget`;
    } else {
      dbData.name = data.name || data.title;
    }
    
    dbData.amount = data.amount;
    dbData.currency = data.currency || 'USD';
    dbData.start_date = data.start_date || data.startDate;
    dbData.end_date = data.end_date || data.endDate;
    dbData.period = data.period || 'monthly';
    dbData.description = data.description;
    dbData.created_at = data.created_at || new Date().toISOString();
    dbData.updated_at = data.updated_at || new Date().toISOString();
    
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    console.log('Creating budget with data:', dbData);

    const { data: budget, error } = await supabaseAdmin
      .from('budgets')
      .insert(dbData)
      .select(`
        *,
        category:categories (
          id,
          name,
          color
        )
      `)
      .single();

    if (error) {
      console.error("[createBudget] Error:", error);
      throw error;
    }

    return budget;
  } catch (error) {
    console.error("[createBudget] Error:", error);
    throw error;
  }
}

export async function updateBudget(userId: string, id: string, data: Tables['budgets']['Update']) {
  try {
    // Create a clean object with proper database column names
    const dbData: Record<string, any> = {};
    
    // Only add fields that are provided
    if (data.name) dbData.name = data.name;
    if (data.amount) dbData.amount = data.amount;
    if (data.currency) dbData.currency = data.currency;
    if (data.start_date || data.startDate) dbData.start_date = data.start_date || data.startDate;
    if (data.end_date || data.endDate) dbData.end_date = data.end_date || data.endDate;
    if (data.period) dbData.period = data.period;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.category_id || data.categoryId) dbData.category_id = data.category_id || data.categoryId;
    
    // Always update the timestamp
    dbData.updated_at = new Date().toISOString();
    
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    console.log('Updating budget with data:', dbData);

    const { data: budget, error } = await supabaseAdmin
      .from('budgets')
      .update(dbData)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        category:categories (
          id,
          name,
          color
        )
      `)
      .single();

    if (error) {
      console.error("[updateBudget] Error:", error);
      throw error;
    }

    return budget;
  } catch (error) {
    console.error("[updateBudget] Error:", error);
    throw error;
  }
}

export async function deleteBudget(userId: string, id: string) {
  try {
    // Use admin client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );
    
    // Verify the budget belongs to the user
    const { data: budget, error: checkError } = await supabaseAdmin
      .from('budgets')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (checkError || !budget) {
      console.error('[deleteBudget] Budget not found or access denied:', checkError);
      throw new Error('Budget not found or access denied');
    }

    const { error } = await supabaseAdmin
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error("[deleteBudget] Error:", error);
      throw error;
    }
  } catch (error) {
    console.error("[deleteBudget] Error:", error);
    throw error;
  }
}

// Analytics
export async function getExpensesByCategory(userId: string, startDate: string, endDate: string) {
  try {
    // Initialize the query
    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId);
    
    // Only add date filters if they are provided and not empty
    if (startDate && startDate.trim() !== '') {
      query = query.gte('date', startDate);
    }
    
    if (endDate && endDate.trim() !== '') {
      query = query.lte('date', endDate);
    }

    // Execute the query
    const { data: expenses, error } = await query;

    if (error) throw error;

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      // Handle case where category might be null or undefined
      if (!expense.category) {
        const uncategorizedId = 'uncategorized';
        if (!acc[uncategorizedId]) {
          acc[uncategorizedId] = {
            id: uncategorizedId,
            name: 'Uncategorized',
            color: '#999999',
            amount: 0,
            expenses: []
          };
        }
        acc[uncategorizedId].amount += expense.amount;
        acc[uncategorizedId].expenses.push(expense);
        return acc;
      }

      const categoryId = expense.category_id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: expense.category.name,
          color: expense.category.color,
          amount: 0,
          expenses: []
        };
      }
      acc[categoryId].amount += expense.amount;
      acc[categoryId].expenses.push(expense);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(expensesByCategory);
  } catch (error) {
    console.error('[getExpensesByCategory] Error:', error);
    return [];
  }
}

export async function getExpensesByMonth(userId: string, startDate: string, endDate: string) {
  try {
    // Initialize the query
    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId);
    
    // Only add date filters if they are provided and not empty
    if (startDate && startDate.trim() !== '') {
      query = query.gte('date', startDate);
    }
    
    if (endDate && endDate.trim() !== '') {
      query = query.lte('date', endDate);
    }
    
    // Always add order
    query = query.order('date', { ascending: true });

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error("[getExpensesByMonth] Error:", error);
      return [];
    }

    // Handle possible missing category
    return data.map(expense => ({
      ...expense,
      // Ensure category is always defined, even if it's null in the database
      category: expense.category || {
        id: 'uncategorized',
        name: 'Uncategorized',
        color: '#999999'
      }
    }));
  } catch (error) {
    console.error("[getExpensesByMonth] Error:", error);
    return [];
  }
}

export async function getBudgetProgress(userId: string) {
  try {
    const [budgets, expenses] = await Promise.all([
      getBudgets(userId),
      getExpenses(userId)
    ]);

    return budgets.map(budget => {
      const budgetExpenses = expenses.filter(e => e.category_id === budget.category_id);
      const spent = budgetExpenses.reduce((sum, e) => sum + e.amount, 0);
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;

      return {
        id: budget.id,
        name: budget.name,
        category: budget.category.name,
        color: budget.category.color,
        amount: budget.amount,
        spent,
        remaining,
        percentage,
        isOverBudget: spent > budget.amount
      };
    });
  } catch (error) {
    console.error("[getBudgetProgress] Error:", error);
    throw error;
  }
}

// Receipt Processing
export async function processReceipt(userId: string, receiptData: any, filePath: string) {
  try {
    // First, check if we need to create a new category
    let categoryId = null;
    if (receiptData.suggestedCategory) {
      // Try to find an existing category with the same name
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', receiptData.suggestedCategory)
        .single();

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // Create a new category
        const { data: newCategory } = await supabase
          .from('categories')
          .insert([{
            name: receiptData.suggestedCategory,
            color: generateRandomColor(),
            user_id: userId
          }])
          .select()
          .single();

        if (newCategory) {
          categoryId = newCategory.id;
        }
      }
    }

    // Create the expense
    const expenseData = {
      title: receiptData.title || 'Receipt Expense',
      amount: parseFloat(receiptData.amount) || 0,
      currency: receiptData.currency || 'USD',
      date: receiptData.date ? new Date(receiptData.date).toISOString() : new Date().toISOString(),
      description: receiptData.description || '',
      receipt_url: filePath,
      category_id: categoryId,
      user_id: userId
    };

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select(`
        *,
        category:categories (
          id,
          name,
          color
        )
      `)
      .single();

    if (error) throw error;
    return expense;
  } catch (error) {
    console.error('[processReceipt] Error:', error);
    throw error;
  }
}

// Helper Functions
function generateRandomColor(): string {
  const colors = [
    '#FF5733', // Red-Orange
    '#33FF57', // Green
    '#3357FF', // Blue
    '#FF33F5', // Pink
    '#F5FF33', // Yellow
    '#33FFF5', // Cyan
    '#FF3333', // Red
    '#33FF33', // Lime
    '#3333FF', // Deep Blue
    '#FF33FF', // Magenta
    '#FFFF33', // Yellow
    '#33FFFF', // Aqua
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function initializeUserCategories(userId: string) {
  try {
    // Check if user already has categories
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingCategories && existingCategories.length > 0) {
      return; // User already has categories
    }

    // Create default categories for the user
    const categoriesData = defaultCategories.map(category => ({
      user_id: userId,
      name: category.name,
      color: category.color
    }));

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    const { error } = await supabaseAdmin
      .from('categories')
      .insert(categoriesData);

    if (error) {
      console.error('[initializeUserCategories] Error:', error);
      throw error;
    }
  } catch (error) {
    console.error('[initializeUserCategories] Error:', error);
    throw error;
  }
}
