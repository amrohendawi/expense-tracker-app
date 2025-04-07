"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { 
  initializeUserCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getCategories, 
  supabase 
} from "@/lib/db";
import type { Tables } from "@/lib/db";

export async function initializeCategoriesAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await initializeUserCategories(userId);
    // Don't call revalidatePath during render
    // The layout will already have the latest data
  } catch (error) {
    console.error("[initializeCategoriesAction] Error:", error);
    throw error;
  }
}

export async function getCategoriesAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const categories = await getCategories(userId);
    if (!categories || categories.length === 0) {
      // If no categories exist, initialize them
      await initializeUserCategories(userId);
      return await getCategories(userId);
    }

    return categories;
  } catch (error) {
    console.error("[getCategoriesAction] Error:", error);
    return [];
  }
}

export async function createCategoryAction(data: {
  name: string;
  color: string;
  icon?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const category = await createCategory(userId, data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("[createCategoryAction] Error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategoryAction(
  id: string, 
  data: {
    name?: string;
    color?: string;
    icon?: string;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify category belongs to user
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!category) {
      throw new Error("Category not found");
    }

    const updatedCategory = await updateCategory(userId, id, data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categories");
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error("[updateCategoryAction] Error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    await deleteCategory(userId, id);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error) {
    console.error("[deleteCategoryAction] Error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
