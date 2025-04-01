"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { convertCurrency, formatCurrency } from "@/lib/utils";
import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getExpensesAction } from "@/app/actions/expense-actions";

interface SpendingChartProps {
  expenses: Array<{
    id: string;
    date: Date | string;
    amount: number;
    currency?: string;
  }>;
  convertToCurrency?: string;
}

export function SpendingChart({ expenses: initialExpenses, convertToCurrency = "USD" }: SpendingChartProps) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const searchParams = useSearchParams();
  
  // Re-fetch expenses when the URL params change
  useEffect(() => {
    const fetchExpenses = async () => {
      const year = searchParams.get('year') 
        ? parseInt(searchParams.get('year')!) 
        : new Date().getFullYear();
        
      const month = searchParams.get('month') 
        ? parseInt(searchParams.get('month')!) 
        : new Date().getMonth();
      
      // Calculate date range based on the URL parameters
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      
      try {
        const updatedExpenses = await getExpensesAction({ 
          startDate: startOfMonth, 
          endDate: endOfMonth 
        });
        setExpenses(updatedExpenses);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      }
    };
    
    fetchExpenses();
  }, [searchParams]);
  
  // Group expenses by day and convert currencies
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return [];
    }

    // Create a map to store total amount for each day
    const dailyTotals = new Map<string, number>();
    
    // Process each expense
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const day = date.getDate();
      const key = day.toString();
      
      // Convert currency if needed
      const expenseCurrency = expense.currency || "USD";
      const amount = convertCurrency(expense.amount, expenseCurrency, convertToCurrency);
      
      // Add to daily total
      const currentTotal = dailyTotals.get(key) || 0;
      dailyTotals.set(key, currentTotal + amount);
    });
    
    // Convert the map to an array for the chart
    if (expenses.length > 0) {
      const firstDate = new Date(expenses[0].date);
      const daysInMonth = new Date(
        firstDate.getFullYear(),
        firstDate.getMonth() + 1, 
        0
      ).getDate();
      
      // Create data points for each day of the month
      const data = [];
      for (let i = 1; i <= daysInMonth; i++) {
        data.push({
          day: i,
          amount: dailyTotals.get(i.toString()) || 0,
        });
      }
      
      return data;
    }
    
    return [];
  }, [expenses, convertToCurrency]);

  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No expense data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-input rounded-md p-2 shadow-sm">
          <p className="font-medium">{`Day ${payload[0].payload.day}`}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value, convertToCurrency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" />
          <YAxis
            width={80}
            tickFormatter={(value) => formatCurrency(value, convertToCurrency).split(".")[0]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
