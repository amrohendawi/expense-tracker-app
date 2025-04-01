"use client" // Convert to client component to support dynamic refreshing

import { useState, useEffect } from "react"
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

export default function BudgetsPage() {
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Fetch categories for the add budget dialog
    const loadCategories = async () => {
      const data = await getCategoriesAction();
      setCategories(data);
    };
    
    loadCategories();
  }, []);
  
  // Callback function to refresh the page when a new budget is added
  const handleBudgetAdded = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
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
              <BudgetDialog categories={categories} onSuccess={handleBudgetAdded}>
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
            <BudgetsList key={refreshKey} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
