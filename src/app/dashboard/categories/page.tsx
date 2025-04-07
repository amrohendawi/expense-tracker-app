import { getCategoriesAction } from "@/app/actions/category-actions";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "@/components/categories/category-dialog";
import { CategoriesList } from "@/components/categories/categories-list";

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategoriesAction();

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
                  <BreadcrumbPage>Categories</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="ml-auto">
              <CategoryDialog>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Category
                </Button>
              </CategoryDialog>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="max-w-3xl mx-auto w-full rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="text-xl font-semibold">Categories</h2>
              <p className="text-sm text-muted-foreground">
                Manage your expense categories
              </p>
            </div>
            <Separator />
            <CategoriesList categories={categories} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
