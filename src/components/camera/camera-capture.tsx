"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, FlipHorizontal, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (imageData: string, imageFile: File) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Use a more natural aspect ratio with vertical orientation
      const constraints = {
        video: { 
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access the camera. Please ensure camera permissions are enabled.");
    }
  }, [isFrontCamera]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  };

  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    // Restart the camera with the new facing mode
    startCamera();
  };

  const captureImage = () => {
    if (!videoRef.current || !isStreaming) return;
    
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    
    // Ensure canvas matches the video dimensions exactly
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    if (context) {
      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get the data URL from the canvas
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      setCapturedImage(dataUrl);
      
      // Stop the camera stream
      stopCamera();
      
      // Convert dataURL to File
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "receipt-capture.jpg", { type: "image/jpeg" });
          // Pass both dataURL and File to the parent component
          onCapture(dataUrl, file);
        }
      }, "image/jpeg", 0.95);
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Start the camera when the component mounts
  useEffect(() => {
    startCamera();
    
    // Cleanup function to stop the camera when component unmounts
    return () => {
      stopCamera();
    };
  }, [startCamera]);

  // Regular camera view
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto pb-4">
      <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-[9/16]">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-4">
              <Button
                onClick={captureImage}
                size="icon"
                variant="secondary"
                className="rounded-full h-14 w-14 bg-white hover:bg-gray-100"
              >
                <Camera className="h-6 w-6 text-black" />
              </Button>
            </div>
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                onClick={toggleCamera}
                size="icon"
                variant="ghost"
                className="bg-black/30 hover:bg-black/50 text-white rounded-full"
              >
                <FlipHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured receipt"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-4">
              <Button
                onClick={retakeImage}
                size="icon"
                variant="destructive"
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => {}}
                size="icon"
                variant="default"
                className="rounded-full"
                disabled
              >
                <Check className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 w-full">
        <Button onClick={onCancel} variant="outline" className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
