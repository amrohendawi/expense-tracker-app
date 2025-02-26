"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ExpensesList } from "./expenses-list"
import { getCategoriesAction, getExpensesAction, deleteExpenseAction } from "@/app/actions/expense-actions"

interface Expense {
  id: string
  title: string
  amount: number
  date: Date
  categoryId: string
  description: string | null
  category: { id: string; name: string; color: string }
}

interface Category {
  id: string
  name: string
  color: string
}

export function ExpensesListWrapper() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the current date
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        
        const [expensesData, categoriesData] = await Promise.all([
          getExpensesAction({ startDate: startOfMonth, endDate: endOfMonth }),
          getCategoriesAction(),
        ])
        
        setExpenses(expensesData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [toast])

  const handleDelete = async (id: string) => {
    try {
      await deleteExpenseAction(id)
      toast({
        title: "Expense deleted",
        description: "Your expense has been deleted successfully.",
      })
      
      // Refresh the list
      router.refresh()
      
      // Update local state
      setExpenses(expenses.filter(expense => expense.id !== id))
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = () => {
    // Just refresh the page after edit
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    )
  }

  return (
    <ExpensesList 
      expenses={expenses} 
      categories={categories} 
      onDelete={handleDelete} 
      onEdit={handleEdit} 
    />
  )
}
