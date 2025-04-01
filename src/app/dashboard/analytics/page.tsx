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
import { Separator } from "@/components/ui/separator"
import { DateRangeFilter } from "@/components/date-range-filter"
import { Suspense } from "react"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get the selected date or default to current month
  const currentDate = new Date();
  
  // Fix: Properly handle search params - use ReadonlyURLSearchParams properly
  const yearStr = searchParams?.year?.toString() || '';
  const monthStr = searchParams?.month?.toString() || '';
  
  const year = yearStr ? parseInt(yearStr) : currentDate.getFullYear();
  const month = monthStr ? parseInt(monthStr) : currentDate.getMonth();
  
  // Calculate date ranges
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  
  // Fetch data
  // Wrap data fetching in try-catch to handle potential auth errors
  try {
    const expenses = await getExpensesAction({ startDate: startOfMonth, endDate: endOfMonth });
    const categoryData = await getExpensesByCategoryAction(startOfMonth, endOfMonth);
    const monthlyData = await getMonthlyExpensesAction(year);
    const budgetComparison = await getBudgetVsActualAction(startOfMonth, endOfMonth);
    const topExpenses = await getTopExpensesAction(5, startOfMonth, endOfMonth);
    const trends = await getExpenseTrendsAction(startOfMonth, endOfMonth);
  
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <Separator orientation="vertical" className="h-4" />
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
              
              <div className="flex items-center gap-4">
                <DateRangeFilter currentYear={year} currentMonth={month} />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">
                  Insights for {startOfMonth.toLocaleString('default', { month: 'long' })} {year}
                </p>
              </div>
            </div>
            
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="budgets">Budget Comparison</TabsTrigger>
                <TabsTrigger value="expenses">Top Expenses</TabsTrigger>
              </TabsList>
              
              <Suspense fallback={<div className="p-8 text-center">Loading analytics data...</div>}>
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
                      <CardTitle>Monthly Spending Trend ({year})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MonthlyTrend data={monthlyData} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="trends" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Expense Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Fix: Pass startDate to ExpenseTrends */}
                      <ExpenseTrends trends={trends} startDate={startOfMonth} />
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
                      <CardTitle>Top Expenses for {startOfMonth.toLocaleString('default', { month: 'long' })} {year}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TopExpenses expenses={topExpenses} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Suspense>
            </Tabs>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  } catch (error) {
    console.error('Error loading analytics data:', error);
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6">
            {/* Header content */}
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <Separator orientation="vertical" className="h-4" />
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
              
              <div className="flex items-center gap-4">
                <DateRangeFilter currentYear={year} currentMonth={month} />
              </div>
            </div>
          </header>
          <div className="flex flex-col items-center justify-center p-8">
            <p className="text-muted-foreground mb-2">Error loading analytics data</p>
            <p className="text-sm text-muted-foreground">Please try again later or contact support</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }
}
