"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createBudgetAction, updateBudgetAction } from "@/app/actions/budget-actions"
import { useCurrency } from "@/context/currency-context"
import { getCurrencyOptions } from "@/lib/constants/currencies"

// Define a simplified category type that matches what's returned from getCategoriesAction
type CategoryWithBasicInfo = {
  id: string;
  name: string;
  color: string;
};

const budgetFormSchema = z.object({
  name: z.string().min(1, "Please enter a budget name"),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().min(1, "Please select a currency"),
  categoryId: z.string().min(1, "Please select a category"),
  startDate: z.date(),
  endDate: z.date(),
  description: z.string().optional(),
  period: z.string().min(1, "Please select a period"),
})

type BudgetFormValues = z.infer<typeof budgetFormSchema>

export function BudgetDialog({
  children,
  budget,
  categories,
  onSuccess,
}: {
  children: React.ReactNode
  budget?: {
    id: string
    categoryId?: string
    category_id?: string
    amount: number
    currency?: string
    startDate?: Date | string
    start_date?: string
    endDate?: Date | string
    end_date?: string
    description?: string
    period?: string
    name?: string
  }
  categories: CategoryWithBasicInfo[]
  onSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)
  const { currency: userPreferredCurrency } = useCurrency();
  const currencyOptions = getCurrencyOptions();

  const defaultValues: Partial<BudgetFormValues> = {
    name: budget?.name || "",
    amount: budget?.amount || 0,
    currency: budget?.currency || userPreferredCurrency,
    categoryId: budget?.categoryId || budget?.category_id || "",
    startDate: budget?.startDate ? new Date(budget.startDate) : 
              budget?.start_date ? new Date(budget.start_date) : new Date(),
    endDate: budget?.endDate ? new Date(budget.endDate) : 
            budget?.end_date ? new Date(budget.end_date) : new Date(),
    description: budget?.description || "",
    period: budget?.period || "monthly",
  }

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues,
  })

  async function onSubmit(data: BudgetFormValues) {
    try {
      if (budget) {
        await updateBudgetAction({
          id: budget.id,
          ...data,
        })
        toast({
          title: "Budget updated",
          description: "Your budget has been updated successfully.",
        })
      } else {
        await createBudgetAction(data)
        toast({
          title: "Budget created",
          description: "Your budget has been created successfully.",
        })
      }
      setOpen(false)
      form.reset()
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? "Edit Budget" : "Add Budget"}</DialogTitle>
          <DialogDescription>
            {budget
              ? "Update the details of your existing budget."
              : "Add a new budget to track your spending."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a budget name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the category for this budget.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the budget period.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        value={format(field.value, "yyyy-MM-dd")}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        value={format(field.value, "yyyy-MM-dd")}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a description for this budget"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {budget ? "Update Budget" : "Create Budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
