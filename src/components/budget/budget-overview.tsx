"use client"

import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface BudgetStatusItem {
  category?: {
    id: string
    name: string
    color: string
  }
  budget: {
    id: string
    amount: number
  }
  spent: number
  remaining: number
  percentage: number
}

interface BudgetOverviewProps {
  budgetStatus: BudgetStatusItem[]
}

export function BudgetOverview({ budgetStatus }: BudgetOverviewProps) {
  if (budgetStatus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No budget data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {budgetStatus.map((item) => (
        <div key={item.budget.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.category ? (
                <Badge style={{ backgroundColor: item.category.color }}>
                  {item.category.name}
                </Badge>
              ) : (
                <Badge>General</Badge>
              )}
            </div>
            <div className="text-sm font-medium">
              {formatCurrency(item.spent)} / {formatCurrency(item.budget.amount)}
            </div>
          </div>
          <Progress
            value={item.percentage}
            className="h-2"
            indicatorColor={
              item.percentage >= 100
                ? "#ef4444" // red-500
                : item.percentage >= 80
                ? "#eab308" // yellow-500
                : "#22c55e" // green-500
            }
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {item.remaining < 0
                ? `${formatCurrency(Math.abs(item.remaining))} over budget`
                : `${formatCurrency(item.remaining)} remaining`}
            </span>
            <span>{Math.round(item.percentage)}% used</span>
          </div>
        </div>
      ))}
    </div>
  )
}
