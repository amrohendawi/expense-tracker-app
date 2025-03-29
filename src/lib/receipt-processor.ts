"use server";

import { processImageReceipt } from "./image-processor";
import { processPdfReceipt } from "./pdf-processor";
import { ReceiptData } from "./schemas/receipt-schema";

/**
 * Process a receipt file (image or PDF) and extract data
 */
export async function processReceiptFile(
  file: File, 
  categories: string[]
): Promise<{
  data: ReceiptData;
  filePath: string;
}> {
  // Determine the file type
  const isPdf = file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");
  
  if (!isPdf && !isImage) {
    throw new Error("Unsupported file type. Please upload an image or PDF file.");
  }
  
  // Process the file based on its type
  if (isPdf) {
    return processPdfReceipt(file, categories);
  } else {
    return processImageReceipt(file, categories);
  }
}
