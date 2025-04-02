import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  getExpensesByCategoryAction, 
  getMonthlyExpensesAction, 
  getBudgetVsActualAction, 
  getTopExpensesAction,
  getExpenseTrendsAction
} from "@/app/actions/analytics-actions"
import { getExpensesAction } from "@/app/actions/expense-actions"
import { getUserSettingsAction } from "@/app/actions/settings-actions"
import { SpendingChart } from "@/components/analytics/spending-chart"
import { CategoryDistribution } from "@/components/analytics/category-distribution"
import { MonthlyTrend } from "@/components/analytics/monthly-trend"
import { BudgetVsActual } from "@/components/analytics/budget-vs-actual"
import { TopExpenses } from "@/components/analytics/top-expenses"
import { ExpenseTrends } from "@/components/analytics/expense-trends"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangeFilter } from "@/components/date-range-filter"
import { Suspense } from "react"
import { formatCurrency } from "@/lib/utils"
import { AnalyticsLayout } from "@/components/analytics/analytics-layout"

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const currentDate = new Date();
  
  // Get search parameters using the new async patterns for Next.js 15
  const params = await Promise.resolve(searchParams);
  
  const yearStr = typeof params.year === 'string' ? params.year : 
                  Array.isArray(params.year) ? params.year[0] : '';
  
  const monthStr = typeof params.month === 'string' ? params.month : 
                   Array.isArray(params.month) ? params.month[0] : '';
  
  const year = yearStr ? parseInt(yearStr) : currentDate.getFullYear();
  const month = monthStr ? parseInt(monthStr) : currentDate.getMonth();
  
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  
  try {
    const [
      expenses,
      categoryData,
      monthlyData,
      budgetComparison,
      topExpenses,
      trends,
      userSettings
    ] = await Promise.all([
      getExpensesAction({ startDate: startOfMonth, endDate: endOfMonth }),
      getExpensesByCategoryAction(startOfMonth, endOfMonth),
      getMonthlyExpensesAction(year),
      getBudgetVsActualAction(startOfMonth, endOfMonth),
      getTopExpensesAction(),
      getExpenseTrendsAction(),
      getUserSettingsAction()
    ]);
    
    const preferredCurrency = userSettings?.currency || "USD";
  
    return (
      <AnalyticsLayout>
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
                      <SpendingChart 
                        expenses={expenses} 
                        convertToCurrency={preferredCurrency} 
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CategoryDistribution 
                        data={categoryData} 
                        currency={preferredCurrency}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Spending Trend ({year})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MonthlyTrend 
                      data={monthlyData} 
                      currency={preferredCurrency}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="trends" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Expense Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExpenseTrends 
                      trends={trends} 
                      startDate={startOfMonth}
                      currency={preferredCurrency}
                    />
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
                      <BudgetVsActual 
                        data={budgetComparison} 
                        currency={preferredCurrency}
                      />
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
                          {formatCurrency(category.amount, preferredCurrency)}
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
                    <TopExpenses 
                      expenses={topExpenses} 
                      currency={preferredCurrency} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Suspense>
          </Tabs>
        </div>
      </AnalyticsLayout>
    );
  } catch (error) {
    console.error('Error loading analytics data:', error);
    return (
      <AnalyticsLayout>
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
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-muted-foreground mb-2">Error loading analytics data</p>
          <p className="text-sm text-muted-foreground">Please try again later or contact support</p>
        </div>
      </AnalyticsLayout>
    );
  }
}
