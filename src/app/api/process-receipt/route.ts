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

    try {
      if (fileType === 'application/pdf') {
        receiptData = await processPdfReceipt(receiptFile, categories || []);
      } else if (fileType.startsWith('image/')) {
        receiptData = await processImageReceipt(receiptFile, categories || []);
      } else {
        return NextResponse.json(
          { error: "Unsupported file type" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error processing receipt:", error);
      return NextResponse.json(
        { error: `Error processing receipt: ${error instanceof Error ? error.message : String(error)}` },
        { status: 400 }
      );
    }

    // Debug logging
    console.log("Receipt data before validation:", JSON.stringify(receiptData));

    // Validate receipt data
    const validatedData = receiptDataSchema.safeParse(receiptData.data);
    if (!validatedData.success) {
      console.error("Validation error:", validatedData.error.format());
      return NextResponse.json(
        { 
          error: "Invalid receipt data", 
          details: validatedData.error.format()
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      data: validatedData.data,
      filePath: receiptData.filePath
    });
  } catch (error) {
    console.error("[process-receipt] Error:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 }
    );
  }
}
