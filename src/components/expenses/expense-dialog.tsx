"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"

// Define a simplified category type that matches what's returned from getCategoriesAction
type CategoryWithBasicInfo = {
  id: string;
  name: string;
  color: string;
};

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
import { toast } from "@/components/ui/use-toast"
import { createExpenseAction, updateExpenseAction } from "@/app/actions/expense-actions"
import { ReceiptUpload } from "./receipt-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReceiptData } from "@/lib/schemas/receipt-schema"

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
  receiptUrl: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof formSchema>

interface ExpenseDialogProps {
  children: React.ReactNode
  expense?: {
    id: string
    title: string
    amount: number
    date: Date
    categoryId: string
    description?: string
    category: CategoryWithBasicInfo
    receiptUrl?: string
  }
  categories?: CategoryWithBasicInfo[]
  onSuccess?: () => void
}

export function ExpenseDialog({
  children,
  expense,
  categories = [],
  onSuccess,
}: ExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("receipt")
  const [receiptUrl, setReceiptUrl] = useState<string | null>(expense?.receiptUrl || null)

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: expense
      ? {
          title: expense.title,
          amount: expense.amount,
          date: new Date(expense.date),
          categoryId: expense.categoryId,
          description: expense.description || "",
          receiptUrl: expense.receiptUrl || "",
        }
      : {
          title: "",
          amount: 0,
          date: new Date(),
          categoryId: "",
          description: "",
          receiptUrl: "",
        },
  })

  const {
    formState: { errors },
  } = form

  async function onSubmit(values: ExpenseFormValues) {
    try {
      // Ensure description is null if it's undefined
      const formattedValues = {
        ...values,
        description: values.description || null,
        receiptUrl: receiptUrl || null,
      };

      if (expense) {
        await updateExpenseAction(expense.id, formattedValues)
        toast({
          title: "Expense updated",
          description: "Your expense has been updated successfully.",
        })
      } else {
        await createExpenseAction(formattedValues)
        toast({
          title: "Expense created",
          description: "Your expense has been created successfully.",
        })
      }

      setOpen(false)
      form.reset()

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

  const handleReceiptProcessed = (data: ReceiptData) => {
    // Update form with extracted data
    form.setValue("title", data.title);
    form.setValue("amount", data.amount);

    // Parse the date string to a Date object
    if (data.date) {
      try {
        const dateObj = new Date(data.date);
        form.setValue("date", dateObj);
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }

    // If category is provided and matches one of our categories, set it
    if (data.category && categories.length > 0) {
      const matchedCategory = categories.find(
        cat => cat.name.toLowerCase() === data.category?.toLowerCase()
      );

      if (matchedCategory) {
        form.setValue("categoryId", matchedCategory.id);
      }
    }

    // Set description if available
    if (data.description) {
      form.setValue("description", data.description);
    } else if (data.vendor) {
      // Use vendor as description if no description is provided
      form.setValue("description", `Vendor: ${data.vendor}`);
    }

    // Switch to manual tab to review and edit the extracted data
    setActiveTab("manual");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            {expense
              ? "Update the details of your existing expense."
              : "Add a new expense to your tracker."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="receipt">Upload Receipt</TabsTrigger>
          </TabsList>

          <TabsContent value="receipt" className="mt-4">
            <ReceiptUpload onReceiptProcessed={handleReceiptProcessed} />
          </TabsContent>

          <TabsContent value="manual">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Grocery shopping" {...field} />
                      </FormControl>
                      <FormMessage>{errors.title?.message}</FormMessage>
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage>{errors.amount?.message}</FormMessage>
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
                        <input
                          type="date"
                          value={format(field.value, "yyyy-MM-dd")}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage>{errors.date?.message}</FormMessage>
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
                            <SelectValue placeholder="Select a category">
                              {field.value && categories.find(c => c.id === field.value) && (
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-3 w-3 rounded-full border"
                                    style={{ backgroundColor: categories.find(c => c.id === field.value)?.color }}
                                  />
                                  {categories.find(c => c.id === field.value)?.name}
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="h-3 w-3 rounded-full border"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
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
                      <FormMessage>{errors.categoryId?.message}</FormMessage>
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
                      <FormMessage>{errors.description?.message}</FormMessage>
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
