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
  Tag,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ExpenseTrendsProps {
  trends: {
    totalThisMonth: number
    totalLastMonth: number
    percentChange: number
    averagePerDay: number
    mostExpensiveDay: { day: string; amount: number }
    mostExpensiveCategory: { name: string; amount: number }
  }
  startDate: Date
}

export function ExpenseTrends({ trends, startDate }: ExpenseTrendsProps) {
  // Add fallback in case startDate is undefined
  const actualStartDate = startDate || new Date();
  
  // Default values for when data is missing
  const {
    totalThisMonth = 0,
    totalLastMonth = 0,
    percentChange = 0,
    averagePerDay = 0,
    mostExpensiveDay = { day: '', amount: 0 },
    mostExpensiveCategory = { name: '', amount: 0 },
  } = trends || {}

  const isIncrease = percentChange > 0
  
  // Format month and year from startDate
  const selectedMonth = actualStartDate.toLocaleString('default', { month: 'long' })
  const selectedYear = actualStartDate.getFullYear()
  
  // Calculate the previous month's name
  const previousDate = new Date(actualStartDate)
  previousDate.setMonth(previousDate.getMonth() - 1)
  const previousMonth = previousDate.toLocaleString('default', { month: 'long' })

  // Check if we have actual data
  const hasData = !!trends && 
    (totalThisMonth > 0 || totalLastMonth > 0 || mostExpensiveDay.amount > 0 || mostExpensiveCategory.amount > 0)
  
  if (!hasData) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No expense data available for {selectedMonth} {selectedYear}. Try selecting a different month or add some expenses.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Empty cards with placeholders */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {selectedMonth} vs {previousMonth}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {formatCurrency(0)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No data available
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-100">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
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
                    {formatCurrency(0)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No data for {selectedMonth}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-100">
                  <Calendar className="h-5 w-5 text-gray-400" />
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
                    N/A
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No data for this period
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-100">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {selectedMonth} vs {previousMonth}
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
                Per day in {selectedMonth} {selectedYear}
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
                {mostExpensiveDay.amount ? 
                  `${formatCurrency(mostExpensiveDay.amount)} in ${selectedMonth}` : 
                  "No data for this period"}
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
                {mostExpensiveCategory.amount ? 
                  `${formatCurrency(mostExpensiveCategory.amount)} in ${selectedMonth}` : 
                  "No data for this period"}
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
