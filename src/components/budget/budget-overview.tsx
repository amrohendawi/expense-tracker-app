"use client"

import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface BudgetStatusItem {
  category: {
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
        <div key={item.category.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge style={{ backgroundColor: item.category.color }}>
                {item.category.name}
              </Badge>
            </div>
            <div className="text-sm font-medium">
              {formatCurrency(item.spent)} / {formatCurrency(item.budget.amount)}
            </div>
          </div>
          <Progress
            value={item.percentage}
            className="h-2"
            indicatorClassName={
              item.percentage >= 100
                ? "bg-red-500"
                : item.percentage >= 80
                ? "bg-yellow-500"
                : "bg-green-500"
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
