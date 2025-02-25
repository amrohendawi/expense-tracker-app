"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  ReferenceLine,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface BudgetData {
  category: string
  budget: number
  actual: number
  color: string
}

interface BudgetVsActualProps {
  data: BudgetData[]
}

export function BudgetVsActual({ data }: BudgetVsActualProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <p className="text-muted-foreground">No budget comparison data available.</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-md p-2">
          <p className="font-medium">{payload[0].payload.category}</p>
          <p className="text-primary">Budget: {formatCurrency(payload[0].payload.budget)}</p>
          <p className="text-secondary">Actual: {formatCurrency(payload[0].payload.actual)}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].payload.actual > payload[0].payload.budget 
              ? `Over budget by ${formatCurrency(payload[0].payload.actual - payload[0].payload.budget)}`
              : `Under budget by ${formatCurrency(payload[0].payload.budget - payload[0].payload.actual)}`
            }
          </p>
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
            dataKey="category" 
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
          <Legend />
          <Bar 
            name="Budget" 
            dataKey="budget" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={20}
          />
          <Bar 
            name="Actual" 
            dataKey="actual" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
