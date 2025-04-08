import { z } from "zod";

// Schema for receipt data extracted by OpenAI
export const receiptDataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    z.string().transform(() => null), // Accept any string but transform invalid ones to null
    z.null()
  ]).optional().nullable(),
  category: z.string().optional().nullable(),
  suggestedCategory: z.string().optional().nullable(),
  vendor: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  currency: z.string().optional().default("USD"),
  categoryId: z.string().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
});

export type ReceiptData = z.infer<typeof receiptDataSchema>;
