import Link from "next/link"
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
import { getCategoriesAction } from "@/app/actions/expense-actions"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { DateRangeFilter } from "@/components/date-range-filter"
import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get the selected date or default to current month
  const currentDate = new Date();
  const yearParam = searchParams?.year || '';
  const monthParam = searchParams?.month || '';
  
  const year = yearParam ? parseInt(yearParam as string) : currentDate.getFullYear();
  const month = monthParam ? parseInt(monthParam as string) : currentDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  
  // Fetch categories for the ExpenseDialog
  const categories = await getCategoriesAction();

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
          <DashboardContent startDate={startOfMonth} endDate={endOfMonth} />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
