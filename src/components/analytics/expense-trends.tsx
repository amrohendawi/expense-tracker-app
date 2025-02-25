"use client"

import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Tag
} from "lucide-react"

interface ExpenseTrendsProps {
  trends: {
    totalThisMonth: number
    totalLastMonth: number
    percentChange: number
    averagePerDay: number
    mostExpensiveDay: { day: string; amount: number }
    mostExpensiveCategory: { name: string; amount: number }
  }
}

export function ExpenseTrends({ trends }: ExpenseTrendsProps) {
  const {
    totalThisMonth,
    totalLastMonth,
    percentChange,
    averagePerDay,
    mostExpensiveDay,
    mostExpensiveCategory,
  } = trends

  const isIncrease = percentChange > 0
  
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                This Month vs Last Month
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {formatCurrency(totalThisMonth)}
              </h3>
              <div className="flex items-center mt-1">
                <span className={`flex items-center text-sm ${isIncrease ? 'text-destructive' : 'text-green-500'}`}>
                  {isIncrease ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      {percentChange.toFixed(1)}%
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                      {Math.abs(percentChange).toFixed(1)}%
                    </>
                  )}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  vs {formatCurrency(totalLastMonth)}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${isIncrease ? 'bg-red-100' : 'bg-green-100'}`}>
              {isIncrease ? (
                <TrendingUp className={`h-5 w-5 text-destructive`} />
              ) : (
                <TrendingDown className={`h-5 w-5 text-green-500`} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Average Daily Spending
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {formatCurrency(averagePerDay)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Per day this month
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Most Expensive Day
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {mostExpensiveDay.day || "N/A"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {mostExpensiveDay.amount ? formatCurrency(mostExpensiveDay.amount) : "No data"}
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-100">
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Top Spending Category
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {mostExpensiveCategory.name || "N/A"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {mostExpensiveCategory.amount ? formatCurrency(mostExpensiveCategory.amount) : "No data"}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Tag className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
