import { ReceiptData } from "./schemas/receipt-schema";

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
  const today = new Date().toISOString().split('T')[0];
  
  // Base prompt content that's shared between image and text formats
  const baseInstructions = `
    - title (a short descriptive name for the expense)
    - amount (just the number in positive form, no currency symbol)
    - date (in YYYY-MM-DD format, must not be later than today's date: ${today}. If you can't find a valid date or you're unsure, leave this field empty)
    - category (choose the most appropriate from this list: ${categories.join(", ")})
    - suggestedCategory (if none of the existing categories match well, suggest a new category name)
    - vendor (the merchant or service provider)
    - description (any additional details)
    - currency (if identifiable, use the 3-letter code like USD, EUR, etc.)
    
    Format your response as a valid JSON object with these fields.
    Do not include any explanations, just the JSON.
    
    IMPORTANT: If the date appears to be in the future or you're not confident about the date, leave the date field empty so the user can enter it manually.
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

/**
 * Common AI processing function for both image and text
 */
export async function processAIInput(input: ReceiptInputType, categories: string[]): Promise<ReceiptExtractionResult> {
  let aiResponse: string;
  let prompt: string;

  if (input.type === 'text') {
    prompt = getReceiptPrompt(input.text, categories);
  } else if (input.type === 'image') {
    prompt = getImageReceiptPrompt(categories);
  } else {
    throw new Error('Invalid input type');
  }

  // Call the AI model with the prompt (this is a placeholder, you need to implement the actual AI call)
  aiResponse = await callAIModel(prompt);

  const extractedData = parseAIResponse(aiResponse);
  const formattedData = formatReceiptData(extractedData);

  return {
    data: formattedData,
    filePath: '', // You need to implement the logic to get the file path
  };
}

// Placeholder function for calling the AI model
async function callAIModel(prompt: string): Promise<string> {
  // Implement the actual AI call here
  return '';
}
