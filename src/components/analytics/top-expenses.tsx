"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  category?: {
    name: string;
    color: string;
  };
}

export function TopExpenses({ expenses }: { expenses: Expense[] }) {
  const { currency } = useCurrency();
  
  return (
    <div className="space-y-6">
      {expenses.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground">No expenses found for this period</p>
        </div>
      ) : (
        expenses.map((expense) => (
          <div key={expense.id} className="flex items-start justify-between">
            <div>
              <p className="font-medium">{expense.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {expense.category && (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: expense.category.color }}
                  />
                )}
                <p className="text-sm text-muted-foreground">
                  {expense.category?.name || "Uncategorized"} • {formatDate(new Date(expense.date))}
                </p>
              </div>
            </div>
            <p className="font-semibold">{formatCurrency(expense.amount, currency)}</p>
          </div>
        ))
      )}
    </div>
  );
}
