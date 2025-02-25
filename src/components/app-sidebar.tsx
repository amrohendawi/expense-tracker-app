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

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { UserButton, useUser } from "@clerk/nextjs"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Expenses",
      url: "/dashboard/expenses",
      icon: CreditCard,
    },
    {
      title: "Budgets",
      url: "/dashboard/budgets",
      icon: Wallet,
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: PieChart,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <DollarSign className="h-6 w-6" />
          <span className="text-xl font-bold">ExpenseTracker</span>
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
          >
            <UserButton afterSignOutUrl="/" />
          </NavUser>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
