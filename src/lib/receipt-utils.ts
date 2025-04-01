import { ReceiptData } from "./schemas/receipt-schema";
import { getAllCurrencyCodes } from "./constants/currencies";

/**
 * Interface for receipt extraction results
 */
export interface ReceiptExtractionResult {
  data: ReceiptData;
  filePath: string;
}

/**
 * Type for specifying the input type for AI processing
 */
export type ReceiptInputType = 
  | { type: 'image'; base64Image: string }
  | { type: 'text'; text: string };

/**
 * Format and validate receipt data from AI response
 */
export function formatReceiptData(extractedData: Partial<ReceiptData>): ReceiptData {
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
      console.log("Error parsing date:", error);
      extractedData.date = null;
    }
  }

  // Convert amount to number if it's a string
  if (typeof extractedData.amount === 'string') {
    extractedData.amount = parseFloat(extractedData.amount);
    
    // If parsing fails, set a default value
    if (isNaN(extractedData.amount)) {
      extractedData.amount = 0;
    }
  }
  
  // Normalize and validate currency code - with enhanced logging for debugging
  if (extractedData.currency) {
    if (typeof extractedData.currency === 'string') {
      // Convert to uppercase
      const originalCurrency = extractedData.currency;
      extractedData.currency = extractedData.currency.toUpperCase().trim();
      
      // Validate currency code against our supported list
      const supportedCurrencies = getAllCurrencyCodes();
      if (!supportedCurrencies.includes(extractedData.currency)) {
        // Try to extract a valid currency code if possible
        const matchedCurrency = supportedCurrencies.find(code => 
          extractedData.currency?.includes(code)
        );
        extractedData.currency = matchedCurrency || 'USD';
        console.log(`Normalized currency from "${originalCurrency}" to "${extractedData.currency}"`);
      }
    } else {
      // Not a string, set to default
      extractedData.currency = 'USD';
      console.log(`Invalid currency format, defaulting to USD`);
    }
  } else {
    // No currency provided, set default
    extractedData.currency = 'USD';
    console.log(`No currency provided, defaulting to USD`);
  }

  return extractedData as ReceiptData;
}

/**
 * Extract relevant text from an AI response and parse as JSON
 */
export function parseAIResponse(aiResponse: string): Partial<ReceiptData> {
  if (!aiResponse) {
    throw new Error("Empty response from AI");
  }

  // Parse the JSON response
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error("Failed to parse AI response");
  }
}

/**
 * Generate the system prompt for receipt analysis
 * Works for both image and text inputs
 */
export function generateReceiptPrompt(options: {
  inputType: 'image' | 'text';
  text?: string;  // Only required for text input
  categories: string[];
}): string {
  const { inputType, text, categories } = options;
  const supportedCurrencies = getAllCurrencyCodes();
  
  // Base prompt content that's shared between image and text formats
  const baseInstructions = `
    - title (a short descriptive name for the expense)
    - amount (just the number in positive form, no currency symbol)
    - date (in YYYY-MM-DD format. If no date is found in the receipt, leave this field set to none)
    - category (choose the most appropriate from this list: ${categories.join(", ")})
    - suggestedCategory (if none of the existing categories match well, suggest a new category name)
    - vendor (the merchant or service provider)
    - description (any additional details)
    - currency (identify the 3-letter currency code from these options: ${supportedCurrencies.join(", ")}. Look for currency either as code or symbol like $, €, £, ¥ etc.)
    
    Format your response as a valid JSON object with these fields.
    Do not include any explanations, just the JSON.
  `;
  
  // Generate the appropriate introduction based on input type
  let introduction = "You are an expert at analyzing receipts and invoices.";
  
  if (inputType === 'image') {
    introduction += `\nExtract the following information from the receipt image:`;
  } else if (inputType === 'text') {
    introduction += `\nExtract the following information from this receipt/invoice text:\n\n${text}\n\nExtract the following information:`;
  }
  
  return `${introduction}\n${baseInstructions}`;
}

/**
 * For backward compatibility - will use the unified prompt function
 */
export function getReceiptPrompt(text: string, categories: string[]): string {
  return generateReceiptPrompt({ 
    inputType: 'text', 
    text, 
    categories 
  });
}

/**
 * For backward compatibility - will use the unified prompt function
 */
export function getImageReceiptPrompt(categories: string[]): string {
  return generateReceiptPrompt({ 
    inputType: 'image', 
    categories 
  });
}