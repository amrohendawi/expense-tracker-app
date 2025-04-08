"use client";

import { Progress } from "@/components/ui/progress";
import { convertCurrency, formatCurrency } from "@/lib/utils";
import { useMemo } from "react";

interface BudgetStatus {
  id: string;
  name?: string;
  amount: number;
  currency?: string;
  period?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  spent: number;
  remaining: number;
  percentage: number;
  color?: string;
  isOverBudget?: boolean;
  // For backward compatibility
  budget?: {
    id: string;
    amount: number;
    period: string;
    category: {
      id: string;
      name: string;
      color: string;
    };
  };
}

interface BudgetOverviewProps {
  budgetStatus: BudgetStatus[];
  targetCurrency?: string;
}

export function BudgetOverview({ budgetStatus, targetCurrency = "USD" }: BudgetOverviewProps) {
  console.log(`BudgetOverview rendering with targetCurrency: ${targetCurrency}`);
  console.log('budgetStatus received:', budgetStatus);

  // Convert budget amounts to target currency
  const convertedBudgetStatus = useMemo(() => {
    if (!budgetStatus || !Array.isArray(budgetStatus) || budgetStatus.length === 0) {
      console.log('No valid budget status data received');
      return [];
    }

    return budgetStatus.map(item => {
      if (!item) {
        console.log('Found a null or undefined budget item');
        return null;
      }

      try {
        // Get the source currency (with fallbacks)
        const sourceCurrency = item.currency || (item.budget?.currency) || "USD";
        console.log(`Processing budget: ${item.name || 'Unnamed'}, currency=${sourceCurrency}, target=${targetCurrency}`);
        
        // Get budget amount with fallbacks
        const originalAmount = item.budget?.amount || item.amount || 0;
        
        // For display in the UI, we ALWAYS want to use the user's preferred currency
        const budgetAmount = convertCurrency(
          originalAmount, 
          sourceCurrency, 
          targetCurrency
        );
        
        // Get spent amount with fallbacks
        const originalSpent = typeof item.spent === 'number' ? item.spent : 0;
        
        // Convert spent amount - ALWAYS convert to user's preferred currency
        const spentAmount = convertCurrency(originalSpent, sourceCurrency, targetCurrency);
        
        // Calculate remaining and percentage in the target currency
        const remainingAmount = budgetAmount - spentAmount;
        const percentage = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 100) : 0;
        
        console.log(`Budget display: ${item.name || 'Unnamed'}, Amount: ${formatCurrency(budgetAmount, targetCurrency)}, Spent: ${formatCurrency(spentAmount, targetCurrency)}, Remaining: ${formatCurrency(remainingAmount, targetCurrency)}`);
        
        return {
          ...item,
          amount: budgetAmount,
          spent: spentAmount,
          remaining: remainingAmount,
          percentage,
          currency: targetCurrency // Ensure currency is set to target for formatting
        };
      } catch (error) {
        console.error('Error processing budget item:', error, item);
        return null;
      }
    }).filter(Boolean); // Filter out null items
  }, [budgetStatus, targetCurrency]);

  console.log('Converted budget status:', convertedBudgetStatus);

  if (!convertedBudgetStatus || convertedBudgetStatus.length === 0) {
    console.log('No budget items to display after conversion');
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
        <div key={item.id} className="space-y-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.category?.color || item.color || "#888" }}
              ></div>
              <span className="font-medium">{item.category?.name || item.name || 'Unnamed Budget'}</span>
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
                {formatCurrency(item.spent, targetCurrency)} of {formatCurrency(item.amount, targetCurrency)}
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
