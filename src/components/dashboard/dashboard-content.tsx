"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency, convertCurrency, convertExpensesToCurrency } from "@/lib/utils";
import { BudgetOverview } from "@/components/budget/budget-overview";
import { SpendingChart } from "@/components/analytics/spending-chart";
import { CategoryDistribution } from "@/components/analytics/category-distribution";
import { useCurrency } from "@/context/currency-context";
import { useEffect, useState } from "react";

export function DashboardContent({
  startDate,
  endDate,
  initialExpenses,
  initialBudgetStatus,
  initialCategoryData,
  initialCurrency
}: {
  startDate: Date;
  endDate: Date;
  initialExpenses: any[];
  initialBudgetStatus: any[];
  initialCategoryData: any[];
  initialCurrency?: string;
}) {
  // Use initialCurrency as the default value but allow context updates
  const { currency, setCurrency } = useCurrency();
  const [expenses] = useState(initialExpenses);
  const [budgetStatus, setBudgetStatus] = useState(initialBudgetStatus);
  const [categoryData, setCategoryData] = useState(initialCategoryData);
  
  // Initialize with server-provided currency preference
  useEffect(() => {
    if (initialCurrency && initialCurrency !== currency) {
      console.log(`Setting currency from server preference: ${initialCurrency}`);
      setCurrency(initialCurrency);
    }
  }, [initialCurrency, setCurrency]);
  
  // Log user's currency preference for debugging
  console.log(`DashboardContent rendering with currency: ${currency}, initialCurrency: ${initialCurrency}`);
  
  // Convert the expenses to the user's currency and calculate totals
  const totalExpenses = convertExpensesToCurrency(expenses, currency);
  
  // Convert budgets to user's currency
  const totalBudget = budgetStatus.reduce((sum, budget) => {
    // The budget data is directly on the budget object, not nested
    return sum + convertCurrency(budget.amount, budget.currency || "USD", currency);
  }, 0);
  
  const totalRemaining = totalBudget - totalExpenses;
  
  // Get latest expenses (most recent 5)
  const latestExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  console.log("Latest Expenses:", latestExpenses);
  console.log("Total Expenses:", totalExpenses);
  console.log("Total Budget:", totalBudget);

  // Process budget status for accurate remaining calculations
  useEffect(() => {
    // Create a map of expense totals by category
    const categoryExpenses = expenses.reduce((acc: Record<string, {total: number, currency: string}[]>, expense: any) => {
      const categoryId = expense.categoryId || expense.category_id;
      if (!categoryId) return acc;
      
      // Store the original expense amount and currency
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      
      // Add expense with its original currency
      acc[categoryId].push({
        total: expense.amount,
        currency: expense.currency || "USD"
      });
      
      return acc;
    }, {});
    
    // Process each budget to calculate remaining amounts correctly
    const processedBudgetStatus = initialBudgetStatus.map((budget: any) => {
      // Get budget details
      const budgetCurrency = budget.currency || "USD";
      const categoryId = budget.categoryId || budget.category_id;
      
      // This is the raw budget amount in its original currency
      const budgetAmount = budget.amount;
      
      // Convert each expense to the budget's currency and sum them
      const categoryExpenseArray = categoryExpenses[categoryId] || [];
      const categoryExpenseTotal = categoryExpenseArray.reduce((sum, expense) => {
        // Convert expense to budget currency
        const convertedAmount = convertCurrency(
          expense.total, 
          expense.currency, 
          budgetCurrency
        );
        return sum + convertedAmount;
      }, 0);
      
      // Calculate remaining amount in the budget's currency
      const remaining = budgetAmount - categoryExpenseTotal;
      const percentage = budgetAmount > 0 
        ? Math.min((categoryExpenseTotal / budgetAmount) * 100, 100) 
        : 0;
      
      console.log(`Budget ${budget.name}: ${formatCurrency(budgetAmount, budgetCurrency)}, Spent: ${formatCurrency(categoryExpenseTotal, budgetCurrency)}, Remaining: ${formatCurrency(remaining, budgetCurrency)}`);
      
      // For user display in UI, convert everything to user's preferred currency
      const budgetInUserCurrency = convertCurrency(budgetAmount, budgetCurrency, currency);
      const spentInUserCurrency = convertCurrency(categoryExpenseTotal, budgetCurrency, currency);
      const remainingInUserCurrency = budgetInUserCurrency - spentInUserCurrency;
      
      return {
        ...budget,
        // Original currency values (for calculations)
        originalAmount: budgetAmount,
        originalCurrency: budgetCurrency,
        originalSpent: categoryExpenseTotal,
        originalRemaining: remaining,
        // Converted values for display
        amount: budgetInUserCurrency,
        spent: spentInUserCurrency,
        remaining: remainingInUserCurrency,
        percentage: percentage,
        isOverBudget: remaining < 0
      };
    });
    
    setBudgetStatus(processedBudgetStatus);
  }, [initialBudgetStatus, expenses, currency]);

  // Prepare normalized data for charts with converted currencies
  useEffect(() => {
    // Convert category data to user's selected currency
    const convertedCategoryData = initialCategoryData.map(cat => {
      const convertedAmount = cat.expenses?.reduce((sum: number, exp: any) => {
        const expCurrency = exp.currency || "USD";
        return sum + convertCurrency(exp.amount, expCurrency, currency);
      }, 0) || cat.amount;
      
      return {
        ...cat,
        amount: convertedAmount
      };
    });
    
    // Calculate total for percentages
    const totalAmount = convertedCategoryData.reduce((sum, cat) => sum + cat.amount, 0);
    
    // Add percentages
    const finalCategoryData = convertedCategoryData.map(cat => ({
      ...cat,
      percentage: totalAmount > 0 ? (cat.amount / totalAmount) * 100 : 0
    }));
    
    setCategoryData(finalCategoryData);
  }, [initialCategoryData, currency]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card key="total-expenses">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              For {new Date(startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
        <Card key="total-budget">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget, currency)}</div>
            <p className="text-xs text-muted-foreground">
              Allocated for this period
            </p>
          </CardContent>
        </Card>
        <Card key="remaining-budget">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Budget
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRemaining, currency)}</div>
            <p className="text-xs text-muted-foreground">
              {totalRemaining >= 0 ? "Available to spend" : "Over budget"}
            </p>
          </CardContent>
        </Card>
        <Card key="budget-utilization">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Budget Utilization
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBudget > 0 
                ? `${Math.min(Math.round((totalExpenses / totalBudget) * 100), 100)}%` 
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Of total budget used
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <SpendingChart 
              data={expenses} 
              targetCurrency={currency} 
              key={`spending-chart-${currency}`} // Force re-render when currency changes
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <CategoryDistribution 
                data={categoryData} 
                targetCurrency={currency} 
                key={`category-dist-${currency}`} // Force re-render when currency changes
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Budget Status and Recent Expenses */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Force the currency to be the user's preferred currency */}
            <BudgetOverview 
              budgetStatus={budgetStatus} 
              targetCurrency={currency} 
              key={`budget-overview-${currency}`} // Force re-render when currency changes
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestExpenses.length > 0 ? (
                latestExpenses.map(expense => (
                  <div key={expense.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">{expense.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {expense.category?.name || 'Uncategorized'} • {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(expense.amount, expense.currency || currency)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No expenses found for this period.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
