import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { ReceiptData } from "@/lib/schemas/receipt-schema";

interface ReceiptUploadProps {
  onReceiptProcessed: (data: ReceiptData) => void;
}

export function ReceiptUpload({ onReceiptProcessed }: ReceiptUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP image or PDF document.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
        setImageDimensions(null);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview("/file.svg");
      setImageDimensions(null);
    }

    setSuccess(false);
  };

  useEffect(() => {
    if (preview && preview.startsWith("data:image")) {
      const img = document.createElement("img");
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 500;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        setImageDimensions({ width, height });
      };
      img.src = preview;
    }
  }, [preview]);

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setSuccess(false);
    setImageDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProcessReceipt = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/process-receipt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process receipt");
      }

      const { data } = await response.json();

      setSuccess(true);
      toast({
        title: "Receipt processed successfully",
        description: "The receipt data has been extracted.",
      });

      onReceiptProcessed(data);
    } catch (error) {
      console.error("Error processing receipt:", error);
      toast({
        title: "Error processing receipt",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-dashed border-gray-300"
        } p-6 transition-colors ${!preview ? "hover:border-gray-400" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!preview ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              id="receipt-upload"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
            />

            <div className="flex items-center justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Choose File</span>
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-2">or drag and drop your receipt here</p>
            <p className="text-xs text-gray-500">Supported formats: JPEG, PNG, WebP, PDF (max 10MB)</p>
          </>
        ) : (
          <div className="relative w-full">
            <div className="flex items-center justify-center">
              {preview.startsWith("data:image") ? (
                <div
                  className={`relative overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm mx-auto ${
                    !imageDimensions ? "min-h-[100px]" : ""
                  }`}
                  style={
                    imageDimensions
                      ? { width: `${imageDimensions.width}px`, height: `${imageDimensions.height}px` }
                      : {}
                  }
                >
                  {!imageDimensions && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  )}
                  <div
                    className={`relative ${!imageDimensions ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                    style={
                      imageDimensions
                        ? { width: `${imageDimensions.width}px`, height: `${imageDimensions.height}px` }
                        : {}
                    }
                  >
                    <Image
                      src={preview}
                      alt="Receipt preview"
                      fill
                      style={{ objectFit: "contain" }}
                      className="p-2"
                    />
                  </div>
                  {file && (
                    <p className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-70 p-1 text-center text-xs text-white">
                      {file.name}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex h-48 w-full flex-col items-center justify-center rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                  <Image src={preview} alt="File preview" width={64} height={64} />
                  <p className="mt-2 text-sm text-gray-700">{file?.name}</p>
                  <p className="text-xs text-gray-500">{file ? `${(file.size / 1024).toFixed(1)} KB` : ""}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute -right-2 -top-2 rounded-full bg-gray-800 p-1 text-white hover:bg-gray-900 shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {file && (
        <Button onClick={handleProcessReceipt} className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : success ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Processed
            </>
          ) : (
            "Process Receipt"
          )}
        </Button>
      )}
    </div>
  );
}
