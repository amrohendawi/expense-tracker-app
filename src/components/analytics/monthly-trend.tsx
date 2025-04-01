"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency, convertCurrency } from "@/lib/utils"
import { useMemo } from "react"

interface MonthlyData {
  name: string
  amount: number
  currency?: string
}

interface MonthlyTrendProps {
  data: MonthlyData[]
  currency?: string
}

export function MonthlyTrend({ data, currency = "USD" }: MonthlyTrendProps) {
  // Convert amounts to the target currency
  const convertedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      amount: convertCurrency(item.amount, item.currency || "USD", currency)
    }));
  }, [data, currency]);

  if (convertedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <p className="text-muted-foreground">No monthly data available.</p>
      </div>
    )
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        name: string;
      };
    }>;
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-md p-2">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-primary">{formatCurrency(payload[0].value as number, currency)}</p>
        </div>
      )
    }
    return null
  }

  // Find max value for better chart scaling
  const maxValue = Math.max(...convertedData.map(item => item.amount)) * 1.2

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value, currency).split('.')[0]} 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            domain={[0, maxValue]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
