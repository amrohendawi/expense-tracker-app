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
import { getCategoriesAction } from "@/app/actions/expense-actions"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { ExpensesListWrapper } from "@/components/expenses/expenses-list-wrapper"

export default async function ExpensesPage() {
  // Fetch categories for the add expense dialog
  const categories = await getCategoriesAction();
  
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
                  <BreadcrumbPage>Expenses</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="ml-auto">
              <ExpenseDialog categories={categories}>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
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
                Manage your expenses
              </p>
            </div>
            <Separator />
            <ExpensesListWrapper />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
