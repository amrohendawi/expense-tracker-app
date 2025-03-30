"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, FlipHorizontal, X, Check, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (imageData: string, imageFile: File) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
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

  const toggleFullScreen = () => {
    // If we're already in full screen, stop and restart camera when switching back
    if (isFullScreen) {
      stopCamera();
      setTimeout(() => {
        setIsFullScreen(false);
        startCamera();
      }, 100);
    } else {
      // Going to full screen
      setIsFullScreen(true);
    }
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

  // If fullscreen is enabled, use the fullscreen layout
  if (isFullScreen) {
    return (
      <div className="absolute inset-0 z-[100] bg-black flex flex-col">
        <div className="w-full flex justify-between items-center p-4 bg-black text-white">
          <Button
            onClick={toggleFullScreen}
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
        
        <div className="flex-1 relative bg-black overflow-hidden">
          {!capturedImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute bottom-10 inset-x-0 flex justify-center space-x-4 z-10">
                <Button
                  onClick={captureImage}
                  size="icon"
                  variant="secondary"
                  className="rounded-full h-16 w-16 bg-white hover:bg-gray-100"
                >
                  <Camera className="h-8 w-8 text-black" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured receipt"
                className="max-h-full max-w-full object-contain"
              />
              <div className="absolute bottom-10 inset-x-0 flex justify-center space-x-6 z-10">
                <Button
                  onClick={retakeImage}
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5 mr-2" />
                  Retake
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular square-shaped view
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto pb-4">
      <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-[3/4]">
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
                onClick={toggleFullScreen}
                size="icon"
                variant="ghost"
                className="bg-black/30 hover:bg-black/50 text-white rounded-full"
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
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
