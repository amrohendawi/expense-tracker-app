"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { getCategoriesAction, deleteExpenseAction } from "@/app/actions/expense-actions";
import { ExpensesList } from "./expenses-list";
import { format } from "date-fns";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  categoryId: string;
  description: string | null;
  category: { id: string; name: string; color: string };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ExpensesListWrapperProps {
  startDate: Date;
  endDate: Date;
  initialExpenses?: Expense[];
}

export function ExpensesListWrapper({
  startDate,
  endDate,
  initialExpenses = [],
}: ExpensesListWrapperProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [categories, setCategories] = useState<Category[]>([]);
  // Fix: Initialize loading to false since data is pre-fetched on the server
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Update expenses whenever initialExpenses changes
    setExpenses(initialExpenses);
    
    // Always fetch categories for edit functionality
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategoriesAction();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [initialExpenses]);

  const handleDelete = async (id: string) => {
    try {
      await deleteExpenseAction(id);
      toast({
        title: "Expense deleted",
        description: "Your expense has been deleted successfully.",
      });
      
      // Update local state
      setExpenses(expenses.filter(expense => expense.id !== id));
      
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    // Refresh the page after edit
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  if (expenses.length === 0) {
    const month = format(startDate, 'MMMM yyyy');
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">
          No expenses found for {month}.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a new expense using the "Add Expense" button above.
        </p>
      </div>
    );
  }

  return (
    <ExpensesList 
      expenses={expenses} 
      categories={categories} 
      onDelete={handleDelete} 
      onEdit={handleEdit} 
    />
  );
}
