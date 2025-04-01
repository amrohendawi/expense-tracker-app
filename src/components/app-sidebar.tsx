"use client"

import * as React from "react"
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  PieChart,
  Settings,
  Wallet,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useUser } from "@clerk/nextjs"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const pathname = usePathname();
  
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Expenses",
      url: "/dashboard/expenses",
      icon: CreditCard,
      isActive: pathname === "/dashboard/expenses",
    },
    {
      title: "Budgets",
      url: "/dashboard/budgets",
      icon: Wallet,
      isActive: pathname === "/dashboard/budgets",
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: PieChart,
      isActive: pathname === "/dashboard/categories",
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
      isActive: pathname === "/dashboard/analytics",
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      isActive: pathname === "/dashboard/settings",
    },
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">ExpenseTracker</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.fullName || 'User',
              email: user.primaryEmailAddress?.emailAddress || '',
              image: user.imageUrl || '',
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
