"use server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { 
  formatReceiptData, 
  parseAIResponse,
  ReceiptExtractionResult} from "./receipt-utils";
import { saveReceiptFile, processTextWithAI } from "./receipt-actions";

/**
 * Process a PDF file to extract receipt data using LangChain and OpenAI
 */
export async function processPdfReceipt(
  file: File, 
  categories: string[]
): Promise<ReceiptExtractionResult> {
  try {
    // Save the file and get path information
    const { tempFilePath, virtualFilePath } = await saveReceiptFile(file, 'receipt-pdf');
    
    // Use LangChain's PDFLoader to extract text
    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();
    
    // Combine all pages into a single text
    const pdfText = docs.map(doc => doc.pageContent).join("\n");
    
    // Use centralized AI processing function for text analysis
    // Make sure we're using the latest prompt that includes currency instructions
    const responseText = await processTextWithAI(pdfText, categories);
    
    // Parse the JSON response using shared utility
    const extractedData = parseAIResponse(responseText);
    
    // Log the extracted currency information for debugging
    console.log(`Extracted currency: ${extractedData.currency || 'Not found, will default to USD'}`);
    
    // Format and validate the extracted data using shared utility
    // This will handle currency validation through the updated formatReceiptData function
    const formattedData = formatReceiptData(extractedData);
    
    console.log(`Final receipt data with currency: ${formattedData.currency}`);
    
    // Return the extracted data and the file path
    return {
      data: formattedData,
      filePath: virtualFilePath,
    };
  } catch (error) {
    console.error("Error processing PDF receipt:", error);
    throw new Error(`Failed to process PDF receipt: ${error instanceof Error ? error.message : String(error)}`);
  }
}
