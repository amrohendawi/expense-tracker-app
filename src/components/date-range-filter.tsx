'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from 'lucide-react'

export function DateRangeFilter({ 
  currentYear, 
  currentMonth 
}: { 
  currentYear: number, 
  currentMonth: number 
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [year, setYear] = useState<number>(currentYear)
  const [month, setMonth] = useState<number>(currentMonth)
  
  // Generate year options (current year - 5 to current year + 1)
  const currentDate = new Date()
  const currentYearValue = currentDate.getFullYear()
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYearValue - 5 + i)
  
  // Month options
  const monthOptions = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ]
  
  const updateDateFilter = () => {
    const params = new URLSearchParams()
    params.set('year', year.toString())
    params.set('month', month.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Update URL when year or month changes
  useEffect(() => {
    updateDateFilter()
  }, [year, month])
  
  return (
    <div className="flex items-center gap-2">
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      
      <Select value={month.toString()} onValueChange={val => setMonth(parseInt(val))}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((monthOption) => (
            <SelectItem key={monthOption.value} value={monthOption.value.toString()}>
              {monthOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={year.toString()} onValueChange={val => setYear(parseInt(val))}>
        <SelectTrigger className="w-[90px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((yearOption) => (
            <SelectItem key={yearOption} value={yearOption.toString()}>
              {yearOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
