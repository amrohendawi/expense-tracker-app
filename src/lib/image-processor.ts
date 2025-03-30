"use server";

import { 
  formatReceiptData, 
  parseAIResponse,
  ReceiptExtractionResult
} from "./receipt-utils";
import { saveReceiptFile, processImageWithAI } from "./receipt-actions";

/**
 * Process an image file to extract receipt data using OpenAI's Vision API
 */
export async function processImageReceipt(
  file: File, 
  categories: string[]
): Promise<ReceiptExtractionResult> {
  try {
    // Read the image file and save it to temp directory
    const { tempFilePath, virtualFilePath } = await saveReceiptFile(file, 'receipt-img');
    
    // Get file buffer for OpenAI processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert the file to a base64 string for the OpenAI API
    const base64Image = buffer.toString("base64");
    
    // Use centralized AI processing function for image analysis
    const aiResponse = await processImageWithAI(base64Image, categories);
    
    // Extract and parse the AI response
    const extractedData = parseAIResponse(aiResponse);
    
    // Format and validate the extracted data
    const formattedData = formatReceiptData(extractedData);

    // Return the extracted data and the file path
    return {
      data: formattedData,
      filePath: virtualFilePath,
    };
  } catch (error) {
    console.error("Error processing image receipt:", error);
    throw new Error(`Error processing image receipt: ${error instanceof Error ? error.message : String(error)}`);
  }
}
