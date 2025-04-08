"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

interface CategoryData {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

interface CategoryDistributionProps {
  data: CategoryData[];
  targetCurrency?: string;
}

export function CategoryDistribution({ data, targetCurrency = "USD" }: CategoryDistributionProps) {
  console.log(`CategoryDistribution rendering with targetCurrency: ${targetCurrency}`);

  // Ensure we have data for the chart
  const chartData = data?.length > 0 ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <p className="text-muted-foreground">No category data available.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: { 
    active?: boolean; 
    payload?: Array<{ name: string; value: number; payload: { name: string; amount: number; color: string; percentage: number } }> 
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-md shadow-md p-2">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(data.amount, targetCurrency)}</p>
          <p className="text-xs text-muted-foreground">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value, entry) => {
              // Safe type cast with checks
              const payload = entry?.payload as unknown;
              // Check if payload has the expected structure
              if (payload && typeof payload === 'object' && 'name' in payload && 'percentage' in payload) {
                const categoryData = payload as { name: string; percentage?: number };
                return (
                  <span className="text-xs">
                    {categoryData.name} ({categoryData.percentage?.toFixed(1) ?? '0.0'}%)
                  </span>
                );
              }
              // Fallback
              return <span className="text-xs">{value}</span>;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
