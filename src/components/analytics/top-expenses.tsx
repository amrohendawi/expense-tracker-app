"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Expense } from "@prisma/client"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface TopExpensesProps {
  expenses: (Expense & {
    category: {
      name: string
      color: string
    }
  })[]
  limit?: number
}

export function TopExpenses({ expenses, limit = 5 }: TopExpensesProps) {
  // Sort expenses by amount (descending) and limit to the specified number
  const topExpenses = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)

  if (topExpenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center">
        <p className="text-muted-foreground">No expense data available.</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topExpenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">
                {formatDate(expense.date)}
              </TableCell>
              <TableCell>{expense.description || "—"}</TableCell>
              <TableCell>
                <Badge 
                  style={{ backgroundColor: expense.category.color }}
                  className="text-white"
                >
                  {expense.category.name}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(expense.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
