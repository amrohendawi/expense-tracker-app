"use client";

import { Progress } from "@/components/ui/progress";
import { convertCurrency, formatCurrency } from "@/lib/utils";
import { useMemo } from "react";

interface BudgetStatus {
  budget: {
    id: string;
    amount: number;
    period: string;
    category: {
      id: string;
      name: string;
      color: string;
    };
  };
  spent: number;
  remaining: number;
  percentage: number;
}

interface BudgetOverviewProps {
  budgetStatus: BudgetStatus[];
  targetCurrency?: string;
}

export function BudgetOverview({ budgetStatus, targetCurrency = "USD" }: BudgetOverviewProps) {
  // Convert budget amounts to target currency
  const convertedBudgetStatus = useMemo(() => {
    return budgetStatus.map(item => {
      // Assuming budget amounts are in USD
      const budgetAmount = convertCurrency(item.budget.amount, "USD", targetCurrency);
      const spentAmount = convertCurrency(item.spent, "USD", targetCurrency);
      const remainingAmount = budgetAmount - spentAmount;
      const percentage = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 100) : 0;
      
      return {
        ...item,
        budget: {
          ...item.budget,
          amount: budgetAmount
        },
        spent: spentAmount,
        remaining: remainingAmount,
        percentage
      };
    });
  }, [budgetStatus, targetCurrency]);

  if (!budgetStatus || budgetStatus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <p className="text-muted-foreground">No budgets found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create budgets to track your spending
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {convertedBudgetStatus.map((item) => (
        <div key={item.budget.id} className="space-y-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.budget.category?.color || "#888" }}
              ></div>
              <span className="font-medium">{item.budget.category?.name}</span>
            </div>
            <div className="text-right">
              <span
                className={`text-sm ${
                  item.remaining < 0 ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                Remaining: {formatCurrency(item.remaining, targetCurrency)}
              </span>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(item.spent, targetCurrency)} of {formatCurrency(item.budget.amount, targetCurrency)}
              </div>
            </div>
          </div>
          <Progress
            value={item.percentage}
            className={`h-2 ${item.percentage > 100 ? "bg-red-200" : "bg-primary/20"}`}
            style={{
              "--progress-indicator-color": item.percentage > 100 ? "var(--red-500)" : "var(--primary)"
            } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}
