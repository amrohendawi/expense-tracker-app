import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCategoriesAction, getExpensesAction } from "@/app/actions/expense-actions";
import { getBudgetStatusAction } from "@/app/actions/budget-actions";
import { getExpensesByCategoryAction } from "@/app/actions/analytics-actions";
import { BudgetOverview } from "@/components/budget/budget-overview";
import { SpendingChart } from "@/components/analytics/spending-chart";
import { CategoryDistribution } from "@/components/analytics/category-distribution";

export async function DashboardContent({
  startDate,
  endDate
}: {
  startDate: Date;
  endDate: Date;
}) {
  // Fetch data based on selected date range
  const expenses = await getExpensesAction({ startDate, endDate });
  const budgetStatus = await getBudgetStatusAction();
  const categoryData = await getExpensesByCategoryAction(startDate, endDate);
  
  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = budgetStatus.reduce((sum, budget) => sum + budget.budget.amount, 0);
  const totalRemaining = totalBudget - totalExpenses;
  
  // Get latest expenses (most recent 5)
  const latestExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {startDate.toLocaleString('default', { month: 'long' })} {startDate.getFullYear()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Budget
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly Budget
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Budget
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-500' : ''}`}>
              {formatCurrency(totalRemaining)}
            </div>
            <div className="flex items-center pt-1">
              {totalRemaining < 0 ? (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-500">Over budget</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-500">Under budget</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Budget Utilization
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0}%
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
              <div 
                className={`h-full rounded-full ${
                  totalExpenses > totalBudget ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(Math.round((totalExpenses / totalBudget) * 100), 100)}%` 
                }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Budget Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Spending Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SpendingChart expenses={expenses} />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDistribution data={categoryData} />
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
            <BudgetOverview budgetStatus={budgetStatus} />
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
                      ${expense.amount.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No expenses found for this period.</p>
                </div>
              )}
              
              {latestExpenses.length > 0 && (
                <div className="text-center pt-2">
                  <Link href="/dashboard/expenses" className="text-sm text-blue-500 hover:underline">
                    View all expenses
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
