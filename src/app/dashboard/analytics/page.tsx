import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  getExpensesByCategoryAction, 
  getMonthlyExpensesAction, 
  getBudgetVsActualAction, 
  getTopExpensesAction,
  getExpenseTrendsAction
} from "@/app/actions/analytics-actions"
import { getExpensesAction } from "@/app/actions/expense-actions"
import { SpendingChart } from "@/components/analytics/spending-chart"
import { CategoryDistribution } from "@/components/analytics/category-distribution"
import { MonthlyTrend } from "@/components/analytics/monthly-trend"
import { BudgetVsActual } from "@/components/analytics/budget-vs-actual"
import { TopExpenses } from "@/components/analytics/top-expenses"
import { ExpenseTrends } from "@/components/analytics/expense-trends"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AnalyticsPage() {
  // Get the current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Calculate date ranges
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // Fetch data
  const expenses = await getExpensesAction({ startDate: startOfMonth, endDate: endOfMonth });
  const categoryData = await getExpensesByCategoryAction(startOfMonth, endOfMonth);
  const monthlyData = await getMonthlyExpensesAction(currentYear);
  const budgetComparison = await getBudgetVsActualAction(startOfMonth, endOfMonth);
  const topExpenses = await getTopExpensesAction(5);
  const trends = await getExpenseTrendsAction();
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex w-full items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Get insights into your spending habits and financial trends.
          </p>
          
          {/* Expense Trends */}
          <ExpenseTrends trends={trends} />
          
          <Tabs defaultValue="charts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="budgets">Budget Comparison</TabsTrigger>
              <TabsTrigger value="expenses">Top Expenses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Spending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SpendingChart expenses={expenses} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryDistribution data={categoryData} />
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending Trend ({currentYear})</CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlyTrend data={monthlyData} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="budgets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs. Actual Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  {budgetComparison.length > 0 ? (
                    <BudgetVsActual data={budgetComparison} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <p className="text-muted-foreground">No budget data available.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Create budgets to see how your actual spending compares.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {categoryData.map((category) => (
                  <Card key={category.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${category.amount.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {category.percentage !== undefined 
                          ? `${category.percentage.toFixed(1)}% of total spending`
                          : 'Percentage not available'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopExpenses expenses={topExpenses} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
