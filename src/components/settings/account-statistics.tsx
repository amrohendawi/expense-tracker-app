"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAccountStatisticsAction } from "@/app/actions/settings-actions"
import { 
  ReceiptText, 
  Tags, 
  PiggyBank, 
  Calendar 
} from "lucide-react"

interface AccountStats {
  expenseCount: number
  categoryCount: number
  budgetCount: number
  accountAge: number
}

export function AccountStatistics() {
  const [stats, setStats] = useState<AccountStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAccountStatisticsAction()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch account statistics:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStats()
  }, [])
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>Loading your account statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <div className="animate-pulse h-4 w-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Statistics</CardTitle>
        <CardDescription>
          Overview of your account activity and data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon={<ReceiptText className="h-5 w-5 text-primary" />}
            label="Expenses Tracked"
            value={stats?.expenseCount || 0}
          />
          
          <StatCard 
            icon={<Tags className="h-5 w-5 text-primary" />}
            label="Categories Created"
            value={stats?.categoryCount || 0}
          />
          
          <StatCard 
            icon={<PiggyBank className="h-5 w-5 text-primary" />}
            label="Budgets Set"
            value={stats?.budgetCount || 0}
          />
          
          <StatCard 
            icon={<Calendar className="h-5 w-5 text-primary" />}
            label="Days Using App"
            value={stats?.accountAge || 0}
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border p-4 text-center">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
