import { supabase } from './supabase';
import type { Database } from '../types/supabase';

export type Tables = Database['public']['Tables'];
export type User = Tables['users']['Row'];
export type Expense = Tables['expenses']['Row'];
export type Category = Tables['categories']['Row'];
export type Budget = Tables['budgets']['Row'];
export type UserSettings = Tables['user_settings']['Row'];

// User operations
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Expense operations
export async function getExpenses(userId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createExpense(expense: Tables['expenses']['Insert']) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Category operations
export async function getCategories(userId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
}

export async function createCategory(category: Tables['categories']['Insert']) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Budget operations
export async function getBudgets(userId: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
}

export async function createBudget(budget: Tables['budgets']['Insert']) {
  const { data, error } = await supabase
    .from('budgets')
    .insert(budget)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// User Settings operations
export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserSettings(userId: string, settings: Partial<Tables['user_settings']['Update']>) {
  const { data, error } = await supabase
    .from('user_settings')
    .update(settings)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
