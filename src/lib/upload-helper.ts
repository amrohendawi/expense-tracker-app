"use server";

import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a file to the local file system
 * In a production environment, you would use a cloud storage service like S3, Cloudinary, etc.
 */
export async function uploadFile(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPEG, PNG, WebP image or PDF document.");
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 10MB.");
  }

  // Create a unique filename
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Generate a unique ID for the file
  const uniqueId = uuidv4();
  const fileExtension = file.name.split(".").pop();
  const fileName = `receipt-${uniqueId}.${fileExtension}`;
  
  // In a real app, you would upload to cloud storage instead
  // For demo purposes, we'll save to the public directory
  const uploadDir = join(process.cwd(), "public", "uploads");
  const filePath = join(uploadDir, fileName);
  
  try {
    // Ensure the directory exists
    await writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
}
