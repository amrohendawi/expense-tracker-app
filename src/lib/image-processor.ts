"use server";

import OpenAI from "openai";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { ReceiptData } from "./schemas/receipt-schema";
import { existsSync, mkdirSync } from "fs";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Process an image file to extract receipt data using OpenAI's Vision API
 */
export async function processImageReceipt(file: File, categories: string[]): Promise<{
  data: ReceiptData;
  filePath: string;
}> {
  try {
    // Save the image file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique ID for the file
    const uniqueId = uuidv4();
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `receipt-${uniqueId}.${fileExtension}`;
    
    // Ensure the uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // Convert the file to a base64 string for the OpenAI API
    const base64Image = buffer.toString("base64");
    
    // Create a system prompt for the OpenAI model
    const systemPrompt = `
      You are an expert at analyzing receipts and invoices. 
      Extract the following information from the receipt image:
      - title (a short descriptive name for the expense)
      - amount (just the number in positive form, no currency symbol)
      - date (in YYYY-MM-DD format, must not be later than today's date: ${new Date().toISOString().split('T')[0]}. If you can't find a valid date or you're unsure, leave this field empty)
      - category (choose the most appropriate from this list: ${categories.join(", ")})
      - suggestedCategory (if none of the existing categories match well, suggest a new category name)
      - vendor (the merchant or service provider)
      - description (any additional details)
      - currency (if identifiable, use the 3-letter code like USD, EUR, etc.)

      Format your response as a valid JSON object with these fields.
      Do not include any explanations, just the JSON.
      
      IMPORTANT: If the date appears to be in the future or you're not confident about the date, leave the date field empty so the user can enter it manually.
    `;

    // Call OpenAI's Vision API to analyze the receipt
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the information from this receipt according to the specified format.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    // Extract the JSON response
    const aiResponse = response.choices[0].message.content;
    if (!aiResponse) {
      throw new Error("Failed to extract information from receipt");
    }

    // Parse the JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
    
    let extractedData = JSON.parse(jsonString);
    
    // Convert amount to number if it's a string
    if (typeof extractedData.amount === 'string') {
      extractedData.amount = parseFloat(extractedData.amount);
      
      // If parsing fails, set a default value
      if (isNaN(extractedData.amount)) {
        extractedData.amount = 0;
      }
    }
    
    // Format the date to ensure YYYY-MM-DD format or null
    if (extractedData.date) {
      try {
        // Try to parse and format the date
        const dateObj = new Date(extractedData.date);
        // Check if date is valid
        if (!isNaN(dateObj.getTime())) {
          // Format as YYYY-MM-DD and ensure it's not in the future
          const today = new Date();
          if (dateObj > today) {
            extractedData.date = null;
          } else {
            extractedData.date = dateObj.toISOString().split('T')[0];
          }
        } else {
          // Invalid date - set to null
          extractedData.date = null;
        }
      } catch (error) {
        // If any error in parsing, set to null
        console.log("Error parsing date:", error);
        extractedData.date = null;
      }
    }
    
    // Return the extracted data and the file path
    return {
      data: extractedData as ReceiptData,
      filePath: `/uploads/${fileName}`,
    };
  } catch (error) {
    console.error("Error processing image receipt:", error);
    throw new Error("Failed to process image receipt");
  }
}
