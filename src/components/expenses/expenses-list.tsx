"use client"

import { Edit, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
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
import { ExpenseDialog } from "./expense-dialog"
import { Badge } from "@/components/ui/badge"

interface ExpensesListProps {
  expenses: {
    id: string
    title: string
    amount: number
    date: Date
    categoryId: string
    description?: string
    category: { id: string; name: string; color: string }
  }[]
  categories: { id: string; name: string; color: string }[]
  onDelete: (id: string) => void
  onEdit: (expense: {
    id: string
    title: string
    amount: number
    date: Date
    categoryId: string
    description?: string
    category: { id: string; name: string; color: string }
  }) => void
}

export function ExpensesList({
  expenses,
  categories,
  onDelete,
  onEdit,
}: ExpensesListProps) {
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
                <Badge 
                  variant="outline"
                  className="flex items-center gap-1.5 font-normal"
                >
                  <div 
                    className="h-2.5 w-2.5 rounded-full" 
                    style={{ backgroundColor: expense.category.color }}
                  />
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
                    onSuccess={() => onEdit(expense)}
                  >
                    <Button variant="ghost" size="icon">
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
                        <AlertDialogAction onClick={() => onDelete(expense.id)}>
                          Delete
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
