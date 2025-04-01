import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
import { ExpensesListWrapper } from "@/components/expenses/expenses-list-wrapper"
import { DateRangeFilter } from "@/components/date-range-filter"

export default async function ExpensesPage({
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
  
  // Fetch categories for the add expense dialog
  const categories = await getCategoriesAction();
  
  // Pre-fetch expenses to avoid the infinite loop
  const expenses = await getExpensesAction({
    startDate: startOfMonth,
    endDate: endOfMonth,
  });
  
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
                    <BreadcrumbPage>Expenses</BreadcrumbPage>
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="text-xl font-semibold">Expenses</h2>
              <p className="text-sm text-muted-foreground">
                Manage your expenses for {new Date(startOfMonth).toLocaleString('default', { month: 'long' })} {year}
              </p>
            </div>
            <Separator />
            <ExpensesListWrapper 
              startDate={startOfMonth} 
              endDate={endOfMonth} 
              initialExpenses={expenses} 
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
