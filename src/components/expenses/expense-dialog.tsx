"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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
import { useToast } from "@/components/ui/use-toast"
import { createExpenseAction, updateExpenseAction } from "@/app/actions/expense-actions"
import { Expense } from "@prisma/client"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  date: z.date(),
  categoryId: z.string().min(1, {
    message: "Please select a category.",
  }),
  description: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof formSchema>

interface ExpenseDialogProps {
  children: React.ReactNode
  expense?: Expense & { category: { name: string } }
  categories?: { id: string; name: string }[]
  onSuccess?: () => void
}

export function ExpenseDialog({ 
  children, 
  expense, 
  categories = [], 
  onSuccess 
}: ExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: expense
      ? {
          title: expense.title,
          amount: expense.amount,
          date: new Date(expense.date),
          categoryId: expense.categoryId,
          description: expense.description || "",
        }
      : {
          title: "",
          amount: 0,
          date: new Date(),
          categoryId: "",
          description: "",
        },
  })

  async function onSubmit(values: ExpenseFormValues) {
    try {
      if (expense) {
        await updateExpenseAction(expense.id, values)
        toast({
          title: "Expense updated",
          description: "Your expense has been updated successfully.",
        })
      } else {
        await createExpenseAction(values)
        toast({
          title: "Expense created",
          description: "Your expense has been created successfully.",
        })
      }
      
      setOpen(false)
      form.reset()
      router.refresh()
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            {expense
              ? "Edit your expense details below."
              : "Add a new expense to your tracker."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Grocery shopping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="MMMM d, yyyy"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                          {category.name}
                        </SelectItem>
                      ))}
                      {categories.length === 0 && (
                        <div className="px-2 py-4 text-center">
                          <p className="text-sm text-muted-foreground">No categories found.</p>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <div className="mt-1">
                    <a href="/dashboard/categories" className="text-xs text-blue-500 hover:underline">
                      Manage categories
                    </a>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details about this expense"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {expense ? "Update Expense" : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
