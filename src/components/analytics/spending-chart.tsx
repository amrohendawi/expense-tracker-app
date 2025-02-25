"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts"
import { Expense } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"

interface SpendingChartProps {
  expenses: (Expense & {
    category: {
      name: string
      color: string
    }
  })[]
}

interface DailyData {
  date: string
  amount: number
}

export function SpendingChart({ expenses }: SpendingChartProps) {
  const data = useMemo(() => {
    const dailyMap = new Map<string, number>()
    
    // Group expenses by day
    expenses.forEach((expense) => {
      const date = new Date(expense.date).toISOString().split("T")[0]
      const currentAmount = dailyMap.get(date) || 0
      dailyMap.set(date, currentAmount + expense.amount)
    })
    
    // Convert to array and sort by date
    const dailyData: DailyData[] = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ 
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        amount 
      }))
      .sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
    
    return dailyData
  }, [expenses])

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <p className="text-muted-foreground">No expense data available.</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-md p-2">
          <p className="font-medium">{payload[0].payload.date}</p>
          <p className="text-primary">{formatCurrency(payload[0].value as number)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `$${value}`} 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="amount" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
