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
import { BudgetDialog } from "@/components/budget/budget-dialog"
import { BudgetsList } from "@/components/budget/budgets-list"

export default async function BudgetsPage() {
  // Fetch categories for the add budget dialog
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
                  <BreadcrumbPage>Budgets</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="ml-auto">
              <BudgetDialog categories={categories}>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Budget
                </Button>
              </BudgetDialog>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="text-xl font-semibold">Budgets</h2>
              <p className="text-sm text-muted-foreground">
                Manage your monthly budgets
              </p>
            </div>
            <Separator />
            <BudgetsList />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
