"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { BudgetDialog } from "@/components/budget/budget-dialog"
import { deleteBudgetAction, getBudgetsAction } from "@/app/actions/budget-actions"
import { getCategoriesAction } from "@/app/actions/expense-actions"

interface BudgetWithCategory {
  id: string;
  categoryId?: string;
  category_id?: string;
  amount: number;
  currency?: string;
  startDate?: Date | string;
  start_date?: string;
  endDate?: Date | string;
  end_date?: string;
  description?: string;
  period?: string;
  name?: string;
  category: {
    id: string;
    name: string;
    color: string;
  }
}

interface Category {
  id: string
  name: string
  color: string
}

export function BudgetsList() {
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshBudgets = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [budgetsData, categoriesData] = await Promise.all([
          getBudgetsAction(),
          getCategoriesAction(),
        ])
        const formattedBudgets = budgetsData.map(budget => ({
          ...budget,
          description: budget.description || ""
        }))
        setBudgets(formattedBudgets)
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
  }, [refreshTrigger])

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : "Unknown"
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      await deleteBudgetAction(id)
      refreshBudgets()
      toast({
        title: "Budget deleted",
        description: "Your budget has been deleted successfully.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
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

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          You haven&apos;t created any budgets yet.
        </p>
        <BudgetDialog categories={categories} onSuccess={refreshBudgets}>
          <Button size="sm">Create your first budget</Button>
        </BudgetDialog>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => (
            <TableRow key={budget.id}>
              <TableCell>{getCategoryName(budget.category_id || budget.categoryId)}</TableCell>
              <TableCell>{formatCurrency(budget.amount, budget.currency || "USD")}</TableCell>
              <TableCell>
                {budget.start_date ? format(new Date(budget.start_date), "MMM d, yyyy") : format(new Date(budget.startDate), "MMM d, yyyy")} -{" "}
                {budget.end_date ? format(new Date(budget.end_date), "MMM d, yyyy") : format(new Date(budget.endDate), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{budget.description || "—"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <BudgetDialog 
                    budget={budget} 
                    categories={categories}
                    onSuccess={refreshBudgets}
                  >
                    <Button size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </BudgetDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this budget? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(budget.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
