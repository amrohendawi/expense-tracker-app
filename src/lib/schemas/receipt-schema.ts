import { z } from "zod";

// Schema for receipt data extracted by OpenAI
export const receiptDataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  category: z.string().optional(),
  vendor: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().optional().default("USD"),
});

export type ReceiptData = z.infer<typeof receiptDataSchema>;
