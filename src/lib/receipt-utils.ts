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
  console.log("Formatting extracted data:", extractedData);
  
  // Apply defaults for required fields
  const formattedData = {
    // Required fields with defaults
    title: extractedData.title || "Unknown Expense",
    amount: typeof extractedData.amount === 'number' ? extractedData.amount : 
            typeof extractedData.amount === 'string' ? parseFloat(extractedData.amount) : 0,
    currency: extractedData.currency || "USD",
    
    // Handle optional fields with proper defaults
    date: extractedData.date || null,
    category: extractedData.category || "",
    suggestedCategory: extractedData.suggestedCategory || null,
    vendor: extractedData.vendor || null,
    description: extractedData.description || null,
    categoryId: extractedData.categoryId || null,
    receiptUrl: extractedData.receiptUrl || null
  };
  
  // Final validation to ensure the object is complete and valid
  console.log("Formatted receipt data:", formattedData);
  
  // Cast to ReceiptData type
  return formattedData as ReceiptData;
}

/**
 * Extract relevant text from an AI response and parse as JSON
 */
export function parseAIResponse(aiResponse: string): Partial<ReceiptData> {
  if (!aiResponse) {
    console.error("Empty response from AI");
    throw new Error("Empty response from AI");
  }

  // Extract JSON from the response - sometimes models add text before/after
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
  
  console.log("Raw AI response:", aiResponse);
  console.log("Extracted JSON string:", jsonString);
  
  try {
    const parsedData = JSON.parse(jsonString);
    
    // Ensure minimum required fields are present
    if (!parsedData.title) {
      console.error("Missing required field: title");
      // Apply fallback value
      parsedData.title = parsedData.vendor || "Expense";
    }
    
    if (!parsedData.amount) {
      console.error("Missing required field: amount");
      // We can't really fallback the amount, but log it
    }
    
    // Ensure currency has a default
    if (!parsedData.currency) {
      console.log("No currency detected, defaulting to USD");
      parsedData.currency = "USD";
    }
    
    console.log("Final parsed data:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    console.error("Raw response:", aiResponse);
    throw new Error("Failed to parse AI response as JSON");
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
    You must extract and return ONLY the following fields in a valid JSON object:
    - title (string, REQUIRED): a short descriptive name for the expense
    - amount (number, REQUIRED): just the number in positive form, no currency symbol
    - date (string in YYYY-MM-DD format, or null if not found)
    - category (string, REQUIRED): choose the most appropriate from this list: ${categories.join(", ")}
    - suggestedCategory (string or null): if none of the existing categories match well, suggest a new category name
    - vendor (string or null): the merchant or service provider
    - description (string or null): any additional details
    - currency (string, default to "USD"): identify the 3-letter currency code from these options: ${supportedCurrencies.join(", ")}
    
    YOUR RESPONSE MUST BE VALID JSON AND MUST CONTAIN AT MINIMUM:
    {
      "title": "string",
      "amount": number,
      "currency": "USD"
    }
    
    Format your response as a valid JSON object with these fields.
    DO NOT include any explanations or text outside the JSON object.
    DO NOT use markdown formatting.
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