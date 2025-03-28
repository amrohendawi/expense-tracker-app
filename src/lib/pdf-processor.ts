"use server";

import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { ReceiptData } from "./schemas/receipt-schema";
import { existsSync, mkdirSync } from "fs";

/**
 * Process a PDF file to extract receipt data using LangChain and OpenAI
 */
export async function processPdfReceipt(file: File, categories: string[]): Promise<{
  data: ReceiptData;
  filePath: string;
}> {
  try {
    // Save the PDF file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique ID for the file
    const uniqueId = uuidv4();
    const fileName = `receipt-${uniqueId}.pdf`;
    
    // Ensure the uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // Use LangChain's PDFLoader to extract text
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    
    // Combine all pages into a single text
    const pdfText = docs.map(doc => doc.pageContent).join("\n");
    
    // Initialize ChatOpenAI (proper class for chat models)
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0,
    });
    
    // Create a prompt for the OpenAI model
    const prompt = `
      You are an expert at analyzing receipts and invoices. 
      Extract the following information from this PDF receipt text:
      
      ${pdfText}
      
      Extract the following information:
      - title (a short descriptive name for the expense)
      - amount (just the number in positive form, no currency symbol)
      - date (in YYYY-MM-DD format)
      - category (choose the most appropriate from this list: ${categories.join(", ")})
      - suggestedCategory (if none of the existing categories match well, suggest a new category name)
      - vendor (the merchant or service provider)
      - description (any additional details)
      - currency (if identifiable, use the 3-letter code like USD, EUR, etc.)
      
      Format your response as a valid JSON object with these fields.
      Do not include any explanations, just the JSON.
    `;
    
    // Get response from OpenAI using the chat interface
    const response = await model.invoke(prompt);
    const responseText = response.content.toString();
    
    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    let extractedData = JSON.parse(jsonString);
    
    // Convert amount to number if it's a string
    if (typeof extractedData.amount === 'string') {
      extractedData.amount = parseFloat(extractedData.amount);
      
      // If parsing fails, set a default value
      if (isNaN(extractedData.amount)) {
        extractedData.amount = 0;
      }
    }
    
    // Return the extracted data and the file path
    return {
      data: extractedData as ReceiptData,
      filePath: `/uploads/${fileName}`,
    };
  } catch (error) {
    console.error("Error processing PDF receipt:", error);
    throw new Error("Failed to process PDF receipt");
  }
}
