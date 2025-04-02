"use client";

import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { ReceiptData } from "@/lib/schemas/receipt-schema";

interface ExpenseFormValues {
  title: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  categoryId: string;
}

/**
 * Set form values from receipt data
 */
function populateFormFromReceipt(
  receiptData: ReceiptData,
  form: UseFormReturn<ExpenseFormValues>
) {
  // Reset form with values from receipt
  form.reset({
    title: receiptData.title || "Receipt Expense",
    amount: receiptData.amount,
    currency: receiptData.currency || form.getValues("currency"), // Prioritize receipt currency
    date: receiptData.date ? new Date(receiptData.date) : new Date(),
    description: receiptData.description || "",
    categoryId: receiptData.categoryId || "",
    ...form.getValues(),
    ...(receiptData.title && { title: receiptData.title }),
    ...(receiptData.amount && { amount: receiptData.amount }),
    ...(receiptData.currency && { currency: receiptData.currency }),
    ...(receiptData.date && { date: new Date(receiptData.date) }),
    ...(receiptData.description && { description: receiptData.description }),
    ...(receiptData.categoryId && { categoryId: receiptData.categoryId }),
  });

}

export function ExpenseForm({ receiptData }: { receiptData?: ReceiptData }) {
  const form = useForm<ExpenseFormValues>({
    defaultValues: {
      title: "",
      amount: 0,
      currency: "USD",
      date: new Date(),
      description: "",
      categoryId: "",
    },
  });

  useEffect(() => {
    if (receiptData) {
      populateFormFromReceipt(receiptData, form);

      if (receiptData.currency && form.getValues("currency") !== receiptData.currency) {
        form.setValue("currency", receiptData.currency);
      }
    }
  }, [receiptData]);

  return (
    <form>
      {/* Form fields go here */}
    </form>
  );
}