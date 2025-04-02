"use server";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { receiptDataSchema } from "@/lib/schemas/receipt-schema";
import { prisma } from "@/lib/prisma";
import { processPdfReceipt } from "@/lib/pdf-processor";
import { processImageReceipt } from "@/lib/image-processor";

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

    let extractedData;
    let receiptUrl;
    
    // Process the file based on its type
    const isPdf = receiptFile.type === "application/pdf";
    const isImage = receiptFile.type.startsWith("image/");
    
    if (!isPdf && !isImage) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload an image or PDF file." },
        { status: 400 }
      );
    }
    
    try {
      // Process the file using the appropriate processor based on file type
      let result;
      
      if (isPdf) {
        // Use the PDF processor for PDF files
        result = await processPdfReceipt(receiptFile, categoryNames);
      } else {
        // Use the image processor for image files
        result = await processImageReceipt(receiptFile, categoryNames);
      }
      
      // Extract data and receipt URL from the result
      extractedData = result.data;
      receiptUrl = result.filePath;

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

      // Add categoryId and receiptUrl to the extracted data
      if (categoryId) {
        extractedData.categoryId = categoryId;
      }
      
      // Add the file path to the extracted data
      extractedData.receiptUrl = receiptUrl;

      // Handle date formatting - ensure it's in YYYY-MM-DD format or null
      if (extractedData.date) {
        try {
          // Try to parse and format the date
          const dateObj = new Date(extractedData.date);
          // Check if date is valid
          if (!isNaN(dateObj.getTime())) {
            // Format as YYYY-MM-DD
            extractedData.date = dateObj.toISOString().split('T')[0];
          } else {
            // Invalid date - set to null
            extractedData.date = null;
          }
        } catch (error) {
          // If any error in parsing, set to null
          console.error("Error parsing date:", error);
          extractedData.date = null;
        }
      } else {
        // If no date, set to null explicitly
        extractedData.date = null;
      }

      // Validate the data against our schema
      const validatedData = receiptDataSchema.parse(extractedData);

      return NextResponse.json({ data: validatedData }, { status: 200 });
    } catch (error) {
      console.error("Error processing receipt:", error);
      return NextResponse.json(
        { error: "Failed to process receipt" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in process-receipt API:", error);
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
