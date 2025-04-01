"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { ExpenseDialog } from "./expense-dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  categoryId: string;
  description: string | null;
  category: { id: string; name: string; color: string };
  currency?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ExpensesListProps {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: string) => Promise<void>;
  onEdit: () => void;
}

export function ExpensesList({ expenses, categories, onDelete, onEdit }: ExpensesListProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">{expense.title}</TableCell>
              <TableCell>{formatCurrency(expense.amount, expense.currency || "USD")}</TableCell>
              <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
              <TableCell>
                {expense.category && (
                  <Badge 
                    style={{ 
                      backgroundColor: expense.category.color || "#888888",
                      color: "#ffffff" 
                    }}
                  >
                    {expense.category.name}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {expense.description || "-"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <ExpenseDialog 
                      categories={categories} 
                      expenseToEdit={expense}
                      onSuccess={onEdit}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </ExpenseDialog>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onSelect={() => onDelete(expense.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
