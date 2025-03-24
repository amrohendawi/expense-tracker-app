"use server";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { receiptDataSchema } from "@/lib/schemas/receipt-schema";
import { prisma } from "@/lib/prisma";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    const userId = session?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data from the request
    const formData = await request.formData();
    const receiptFile = formData.get("file") as File;

    if (!receiptFile) {
      return NextResponse.json(
        { error: "No receipt file provided" },
        { status: 400 }
      );
    }

    // Fetch user's categories to include in the prompt
    const categories = await prisma.category.findMany({
      where: {
        userId,
      },
      select: {
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const categoryNames = categories.map((cat) => cat.name);

    // Convert the file to a base64 string
    const bytes = await receiptFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Create a system prompt for the OpenAI model
    const systemPrompt = `
      You are an expert at analyzing receipts and invoices. 
      Extract the following information from the receipt image:
      - title (a short descriptive name for the expense)
      - amount (just the number in positive form, no currency symbol)
      - date (in YYYY-MM-DD format)
      - category (choose the most appropriate from this list: ${categoryNames.join(", ")})
      - suggestedCategory (if none of the existing categories match well, suggest a new category name)
      - vendor (the merchant or service provider)
      - description (any additional details)
      - currency (if identifiable, use the 3-letter code like USD, EUR, etc.)

      Format your response as a valid JSON object with these fields.
      Do not include any explanations, just the JSON.
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
      return NextResponse.json(
        { error: "Failed to extract information from receipt" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    try {
      // Extract the JSON part from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;

      const extractedData = JSON.parse(jsonString);

      // Convert amount to number if it's a string
      if (typeof extractedData.amount === "string") {
        extractedData.amount = parseFloat(extractedData.amount);

        // If parsing fails, set a default value
        if (isNaN(extractedData.amount)) {
          extractedData.amount = 0;
        }
      }

      // Handle category creation if needed
      let categoryId = null;
      if (extractedData.category) {
        // Check if the category exists
        const existingCategory = await prisma.category.findFirst({
          where: {
            userId,
            name: extractedData.category,
          },
        });

        if (existingCategory) {
          categoryId = existingCategory.id;
        } else if (extractedData.suggestedCategory) {
          // Create a new category with the suggested name
          const newCategory = await prisma.category.create({
            data: {
              name: extractedData.suggestedCategory,
              color: generateRandomColor(),
              userId,
            },
          });
          categoryId = newCategory.id;
          // Update the category name in the extracted data
          extractedData.category = extractedData.suggestedCategory;
        }
      } else if (extractedData.suggestedCategory) {
        // Create a new category with the suggested name
        const newCategory = await prisma.category.create({
          data: {
            name: extractedData.suggestedCategory,
            color: generateRandomColor(),
            userId,
          },
        });
        categoryId = newCategory.id;
        extractedData.category = extractedData.suggestedCategory;
      }

      // Add categoryId to the extracted data
      if (categoryId) {
        extractedData.categoryId = categoryId;
      }

      // Validate the data against our schema
      const validatedData = receiptDataSchema.parse(extractedData);

      return NextResponse.json({ data: validatedData }, { status: 200 });
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return NextResponse.json(
        { error: "Failed to parse receipt data", aiResponse },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Error processing receipt:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}

// Helper function to generate a random color for new categories
function generateRandomColor(): string {
  const colors = [
    "#FF5733", // Red-Orange
    "#33FF57", // Green
    "#3357FF", // Blue
    "#FF33F5", // Pink
    "#F5FF33", // Yellow
    "#33FFF5", // Cyan
    "#FF3333", // Red
    "#33FF33", // Lime
    "#3333FF", // Deep Blue
    "#FF33FF", // Magenta
    "#FFFF33", // Yellow
    "#33FFFF", // Aqua
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}
