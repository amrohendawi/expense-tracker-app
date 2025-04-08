import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getCategoriesAction, getExpensesAction } from "@/app/actions/expense-actions"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { DateRangeFilter } from "@/components/date-range-filter"
import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { getExpensesByCategoryAction } from "@/app/actions/analytics-actions"
import { getBudgetStatusAction } from "@/app/actions/budget-actions"
import { getUserSettingsAction } from "@/app/actions/settings-actions"

// Add dynamic flag to ensure the page refreshes with URL changes
export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const currentDate = new Date();
  
  // Get search parameters using the new async patterns
  const params = await Promise.resolve(searchParams);
  
  const yearStr = typeof params.year === 'string' ? params.year : 
                  Array.isArray(params.year) ? params.year[0] : '';
  
  const monthStr = typeof params.month === 'string' ? params.month : 
                   Array.isArray(params.month) ? params.month[0] : '';
  
  const year = yearStr ? parseInt(yearStr) : currentDate.getFullYear();
  const month = monthStr ? parseInt(monthStr) : currentDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  
  // Get user settings first to determine currency preference
  const userSettings = await getUserSettingsAction();
  const preferredCurrency = userSettings?.currency || "USD";
  
  // Fetch all required data for the dashboard
  const categories = await getCategoriesAction();
  const expenses = await getExpensesAction({ startDate: startOfMonth, endDate: endOfMonth });
  const budgetStatus = await getBudgetStatusAction();
  const categoryData = await getExpensesByCategoryAction(startOfMonth, endOfMonth);

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
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-4">
              <DateRangeFilter currentYear={year} currentMonth={month} />

              <ExpenseDialog categories={categories}>
                <Button size="sm">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Expense
                </Button>
              </ExpenseDialog>
            </div>
          </div>
        </header>

        <Suspense fallback={<div className="p-8 text-center">Loading dashboard data...</div>}>
          <DashboardContent 
            key={`${year}-${month}-${preferredCurrency}`} // Force re-render when currency, month, or year changes
            startDate={startOfMonth} 
            endDate={endOfMonth}
            initialExpenses={expenses}
            initialBudgetStatus={budgetStatus}
            initialCategoryData={categoryData}
            initialCurrency={preferredCurrency} // Pass user's currency preference
          />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
