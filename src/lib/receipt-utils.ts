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
 * Extract relevant text from an AI response and parse as JSON
 */
export function parseAIResponse(aiResponse: string): Partial<ReceiptData> {
  if (!aiResponse) {
    console.warn("Empty response from AI, returning defaults");
    return { title: "Unnamed Receipt", amount: 1, currency: "USD" };
  }

  // Parse the JSON response
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
  
  try {
    const parsedData = JSON.parse(jsonString);
    
    // Ensure critical fields exist
    if (!parsedData.title || parsedData.title.trim() === '') {
      console.warn("Missing or empty title in AI response, setting default");
      parsedData.title = "Unnamed Receipt";
    }
    
    if (parsedData.amount === undefined || parsedData.amount === null) {
      console.warn("Missing amount in AI response, setting default");
      parsedData.amount = 1;
    }
    
    return parsedData;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    // Return default values when parsing fails
    return { title: "Unnamed Receipt", amount: 1, currency: "USD" };
  }
}

/**
 * Format and validate receipt data from AI response
 */
export function formatReceiptData(extractedData: Partial<ReceiptData>): ReceiptData {
  // Create a new object with guaranteed defaults for all required fields
  const formattedData: Partial<ReceiptData> = {
    // Required fields with defaults
    title: extractedData.title && typeof extractedData.title === 'string' && extractedData.title.trim() !== '' 
      ? extractedData.title.trim() 
      : "Unnamed Receipt",
    
    // Handle amount with better parsing and validation
    amount: (() => {
      let amount: number;
      if (typeof extractedData.amount === 'number') {
        amount = extractedData.amount;
      } else if (typeof extractedData.amount === 'string') {
        try {
          // Remove any currency symbols or non-numeric characters except decimal point
          const cleanedAmount = extractedData.amount.replace(/[^\d.-]/g, '');
          amount = parseFloat(cleanedAmount);
        } catch (e) {
          amount = 1;
        }
      } else {
        amount = 1;
      }
      // Ensure positive value
      return isNaN(amount) || amount <= 0 ? 1 : amount;
    })(),
    
    // Optional fields with defaults
    date: null,
    vendor: extractedData.vendor || '',
    description: extractedData.description || '',
    category: extractedData.category || 'Uncategorized',
    suggestedCategory: extractedData.suggestedCategory || null,
    currency: (() => {
      if (!extractedData.currency) return 'USD';
      
      if (typeof extractedData.currency === 'string') {
        const currencyCode = extractedData.currency.toUpperCase().trim();
        const supportedCurrencies = getAllCurrencyCodes();
        
        if (supportedCurrencies.includes(currencyCode)) {
          return currencyCode;
        }
        
        // Try to extract a valid currency code
        const matchedCurrency = supportedCurrencies.find(code => currencyCode.includes(code));
        return matchedCurrency || 'USD';
      }
      
      return 'USD';
    })(),
  };

  // Format the date if present
  if (extractedData.date) {
    try {
      const dateObj = new Date(extractedData.date);
      // Check if date is valid and not in the future
      if (!isNaN(dateObj.getTime())) {
        const today = new Date();
        formattedData.date = dateObj > today ? null : dateObj.toISOString().split('T')[0];
      }
    } catch (error) {
      console.log("Error parsing date:", error);
    }
  }

  // Preserve any additional fields from extracted data
  if (extractedData.categoryId) {
    formattedData.categoryId = extractedData.categoryId;
  }
  
  if (extractedData.receiptUrl) {
    formattedData.receiptUrl = extractedData.receiptUrl;
  }

  // Log for debugging
  console.log("Formatted receipt data:", JSON.stringify(formattedData));

  return formattedData as ReceiptData;
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