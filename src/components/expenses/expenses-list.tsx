"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Expense } from "@prisma/client"
import { Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { deleteExpenseAction, getCategoriesAction } from "@/app/actions/expense-actions"
import { ExpenseDialog } from "./expense-dialog"
import { Badge } from "@/components/ui/badge"

interface ExpensesListProps {
  expenses: (Expense & {
    category: {
      name: string
      color: string
    }
  })[]
}

export function ExpensesList({ expenses }: ExpensesListProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Load categories when needed for the edit dialog
  const loadCategories = async () => {
    try {
      const cats = await getCategoriesAction()
      setCategories(cats)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(id)
      await deleteExpenseAction(id)
      toast({
        title: "Expense deleted",
        description: "Your expense has been deleted successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No expenses found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">{expense.title}</TableCell>
              <TableCell>
                <Badge style={{ backgroundColor: expense.category.color }}>
                  {expense.category.name}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(expense.date)}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(expense.amount)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <ExpenseDialog
                    expense={expense}
                    categories={categories}
                    onSuccess={() => router.refresh()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={loadCategories}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </ExpenseDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this expense? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(expense.id)}
                          disabled={isLoading === expense.id}
                        >
                          {isLoading === expense.id ? "Deleting..." : "Delete"}
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
