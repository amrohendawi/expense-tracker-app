"use server";

import { 
  formatReceiptData, 
  parseAIResponse,
  ReceiptExtractionResult,
  generateReceiptPrompt
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
    const { virtualFilePath } = await saveReceiptFile(file, 'receipt-img');
    
    // Get file buffer for OpenAI processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert the file to a base64 string for the OpenAI API
    const base64Image = buffer.toString("base64");
    
    // Use centralized AI processing function for image analysis
    const aiResponse = await processImageWithAI(base64Image, categories);
    
    // Extract and parse the AI response
    const extractedData = parseAIResponse(aiResponse);
    
    // Log the extracted currency information for debugging
    console.log(`Extracted currency from image: ${extractedData.currency || 'Not found, will default to USD'}`);
    
    // Format and validate the extracted data
    const formattedData = formatReceiptData(extractedData);
    
    console.log(`Final receipt data with currency: ${formattedData.currency}`);

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
