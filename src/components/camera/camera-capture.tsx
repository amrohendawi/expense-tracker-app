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
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: { 
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
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
          setCapturedFile(file);
          // Pass both dataURL and File to the parent component
          // onCapture(dataUrl, file); - We'll now wait for explicit confirmation
        }
      }, "image/jpeg", 0.95);
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    setCapturedFile(null);
    startCamera();
  };

  // Start the camera when the component mounts
  useEffect(() => {
    startCamera();
    
    // Cleanup function to stop the camera when component unmounts
    return () => {
      stopCamera();
    };
  }, [startCamera, isFrontCamera]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black text-white">
        <Button
          onClick={onCancel}
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="font-medium">Capture Receipt</div>
        <Button
          onClick={toggleCamera}
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20"
        >
          <FlipHorizontal className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="relative flex-grow w-full h-full">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-8 inset-x-0 flex justify-center space-x-4">
              <Button
                onClick={captureImage}
                size="icon"
                variant="secondary"
                className="rounded-full h-16 w-16 bg-white hover:bg-gray-100"
              >
                <Camera className="h-8 w-8 text-black" />
              </Button>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured receipt"
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
            <div className="absolute bottom-8 inset-x-0 flex justify-center space-x-6">
              <Button
                onClick={retakeImage}
                size="lg"
                variant="outline"
                className="rounded-full border-white text-white hover:bg-white/20"
              >
                <X className="h-5 w-5 mr-2" />
                Retake
              </Button>
              <Button
                onClick={() => {
                  if (capturedImage && capturedFile) {
                    onCapture(capturedImage, capturedFile);
                  }
                }}
                size="lg"
                variant="default"
                className="rounded-full"
              >
                <Check className="h-5 w-5 mr-2" />
                Use Photo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
