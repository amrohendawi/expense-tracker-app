"use server";

import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import * as os from 'os';
import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { 
  getReceiptPrompt,
  getImageReceiptPrompt,
} from "./receipt-utils";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Save a file to a temporary location and return path information
 */
export async function saveReceiptFile(
  file: File, 
  prefix: string = 'receipt'
): Promise<{ 
  tempFilePath: string; 
  virtualFilePath: string;
}> {
  // Read the file as buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Generate a unique ID for the file
  const uniqueId = uuidv4();
  const fileExtension = file.name.split(".").pop() || 
    (file.type === "application/pdf" ? "pdf" : "jpg");
  const fileName = `${prefix}-${uniqueId}.${fileExtension}`;
  
  // Define the virtual path to be stored in the database
  const virtualFilePath = `/uploads/${fileName}`;
  
  // In serverless environments, use the OS temp directory
  const tempDir = os.tmpdir();
  const tempFilePath = join(tempDir, fileName);
  
  // Write the file to the temp directory
  await writeFile(tempFilePath, buffer);
  
  return {
    tempFilePath,
    virtualFilePath
  };
}

/**
 * Process an image using OpenAI's Vision API
 */
export async function processImageWithAI(base64Image: string, categories: string[]): Promise<string> {
  const systemPrompt = getImageReceiptPrompt(categories);
  
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
            text: "Extract the information from this receipt according to the specified format. IMPORTANT: Make sure to include at minimum a title and amount in your response, even if they need to be guesses based on the image content. If no amount can be seen, use 1 as default. If no title can be determined, use 'Unnamed Receipt' as default.",
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

  return response.choices[0].message.content || "";
}

/**
 * Process text using OpenAI's text model
 */
export async function processTextWithAI(text: string, categories: string[]): Promise<string> {
  const prompt = getReceiptPrompt(text, categories);
  
  // Initialize ChatOpenAI (proper class for chat models)
  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o-mini",
    temperature: 0,
  });
  
  // Get response from OpenAI using the chat interface
  const response = await model.invoke(prompt);
  return response.content.toString();
}
