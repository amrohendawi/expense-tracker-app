"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency, convertCurrency } from "@/lib/utils"
import { useMemo } from "react"

interface BudgetData {
  category: string
  budget: number
  actual: number
  color: string
  budgetCurrency?: string
  actualCurrency?: string
}

interface BudgetVsActualProps {
  data: BudgetData[]
  currency?: string
}

export function BudgetVsActual({ data, currency = "USD" }: BudgetVsActualProps) {
  // Convert all values to the target currency
  const convertedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      budget: convertCurrency(item.budget, item.budgetCurrency || "USD", currency),
      actual: convertCurrency(item.actual, item.actualCurrency || "USD", currency)
    }));
  }, [data, currency]);

  if (convertedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <p className="text-muted-foreground">No budget comparison data available.</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: { 
    active?: boolean; 
    payload?: Array<{ name: string; value: number; payload: { category: string; budget: number; actual: number } }> 
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-md p-2">
          <p className="font-medium">{payload[0].payload.category}</p>
          <p className="text-primary">Budget: {formatCurrency(payload[0].payload.budget, currency)}</p>
          <p className="text-secondary">Actual: {formatCurrency(payload[0].payload.actual, currency)}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].payload.actual > payload[0].payload.budget 
              ? `Over budget by ${formatCurrency(payload[0].payload.actual - payload[0].payload.budget, currency)}`
              : `Under budget by ${formatCurrency(payload[0].payload.budget - payload[0].payload.actual, currency)}`
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
          data={convertedData}
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
            tickFormatter={(value) => formatCurrency(value, currency).split('.')[0]} 
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
