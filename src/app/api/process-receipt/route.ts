"use server";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { receiptDataSchema } from "@/lib/schemas/receipt-schema";
import { processPdfReceipt } from "@/lib/pdf-processor";
import { processImageReceipt } from "@/lib/image-processor";
import { supabase } from "@/lib/supabase";

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
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get user's categories for context
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId);

    // Process receipt based on file type
    const fileType = receiptFile.type;
    let receiptData;

    if (fileType === 'application/pdf') {
      const result = await processPdfReceipt(receiptFile, categories || []);
      receiptData = result.data; // Extract just the data part
    } else if (fileType.startsWith('image/')) {
      const result = await processImageReceipt(receiptFile, categories || []);
      receiptData = result.data; // Extract just the data part
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // Add detailed logging before validation
    console.log("Receipt data before validation:", JSON.stringify(receiptData, null, 2));
    console.log("Receipt data type:", typeof receiptData);
    console.log("Has title:", receiptData?.title !== undefined);
    console.log("Has amount:", receiptData?.amount !== undefined);
    
    // Ensure object has the expected structure - create a clean object to validate
    const cleanData = {
      title: receiptData?.title || "Untitled",
      amount: typeof receiptData?.amount === 'number' ? receiptData.amount : 0,
      date: receiptData?.date || null,
      category: receiptData?.category || null,
      suggestedCategory: receiptData?.suggestedCategory || null,
      vendor: receiptData?.vendor || null,
      description: receiptData?.description || null,
      currency: receiptData?.currency || "USD",
      categoryId: receiptData?.categoryId || null,
      receiptUrl: receiptData?.filePath || null // Use filePath as receiptUrl if available
    };
    
    console.log("Clean data for validation:", JSON.stringify(cleanData, null, 2));
    
    // Validate receipt data with the clean object
    const validatedData = receiptDataSchema.safeParse(cleanData);
    if (!validatedData.success) {
      console.error("Zod validation failed:", validatedData.error.format());
      
      // If still failing, return error with details
      return NextResponse.json(
        { error: "Invalid receipt data", details: validatedData.error.format() },
        { status: 400 }
      );
    }

    // Successful validation - add the original file path to the response
    const result = {
      ...validatedData.data,
      // Preserve the receipt file path from the original processing
      receiptUrl: receiptData.filePath || validatedData.data.receiptUrl
    };

    console.log("Returning validated receipt data:", JSON.stringify(result, null, 2));
    return NextResponse.json(result);
  } catch (error) {
    console.error("[process-receipt] Error:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}
