import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DatePickerProps {
  date: Date | null
  setDate: (date: Date | null) => void
  className?: string
  placeholder?: string
}

export function DatePicker({
  date,
  setDate,
  className,
  placeholder = "Pick a date",
}: DatePickerProps) {
  return (
    <div className={cn("relative", className)}>
      <ReactDatePicker
        selected={date}
        onChange={setDate}
        dateFormat="PPP"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholderText={placeholder}
        showYearDropdown
        dropdownMode="select"
        customInput={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : placeholder}
          </Button>
        }
      />
    </div>
  )
}
