"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, FlipHorizontal, X, Check, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (imageData: string, imageFile: File) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Use a more natural aspect ratio with vertical orientation
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Try to apply zoom level if the camera supports it
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const capabilities = videoTrack.getCapabilities();
          if (capabilities && 'zoom' in capabilities) {
            // Use a type assertion to avoid TypeScript errors since "zoom" might not be in standard types
            const zoomConstraints = { 
              advanced: [{ zoom: zoomLevel } as unknown as MediaTrackConstraintSet] 
            };
            await videoTrack.applyConstraints(zoomConstraints);
          }
        } catch (error) {
          console.log("Zoom not supported:", error);
        }
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access the camera. Please ensure camera permissions are enabled.");
    }
  }, [isFrontCamera, zoomLevel]);

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

  const adjustZoom = (adjustment: number) => {
    const newZoom = Math.max(1, Math.min(2.5, zoomLevel + adjustment));
    setZoomLevel(newZoom);
    
    // Apply zoom dynamically if possible without restarting the stream
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const capabilities = videoTrack.getCapabilities();
          if (capabilities && 'zoom' in capabilities) {
            // Use a type assertion to avoid TypeScript errors
            const constraints = { 
              advanced: [{ zoom: newZoom } as unknown as MediaTrackConstraintSet]
            };
            videoTrack.applyConstraints(constraints).catch(err => {
              console.log("Could not apply zoom:", err);
              // If dynamic zoom fails, restart the camera with new settings
              startCamera();
            });
          } else {
            // If zoom capability not found, restart camera with new settings
            startCamera();
          }
        } catch (error) {
          console.log("Error adjusting zoom:", error);
          startCamera();
        }
      }
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !isStreaming || !videoContainerRef.current) return;
    
    const video = videoRef.current;
    const container = videoContainerRef.current;
    
    // Create a canvas to match the displayed size, not the intrinsic video size
    const canvas = document.createElement("canvas");
    
    // Get the display dimensions of the video container
    const containerRect = container.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    
    const context = canvas.getContext("2d");
    if (context) {
      // Calculate the scaling factor between the video's native size and how it's displayed
      const videoAspect = video.videoWidth / video.videoHeight;
      const containerAspect = containerRect.width / containerRect.height;
      
      let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;
      
      if (videoAspect > containerAspect) {
        // Video is wider than container - crop width
        sWidth = video.videoHeight * containerAspect;
        sx = (video.videoWidth - sWidth) / 2;
      } else if (videoAspect < containerAspect) {
        // Video is taller than container - crop height
        sHeight = video.videoWidth / containerAspect;
        sy = (video.videoHeight - sHeight) / 2;
      }
      
      // Draw only the visible part of the video that matches the container
      context.drawImage(
        video,
        sx, sy, sWidth, sHeight,
        0, 0, canvas.width, canvas.height
      );
      
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
      <div ref={videoContainerRef} className="relative w-full rounded-lg overflow-hidden bg-black aspect-[9/16]">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain" // Changed from object-cover to object-contain
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
            
            {/* Zoom controls */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
              <Button
                onClick={() => adjustZoom(0.1)}
                size="icon"
                variant="ghost"
                className="bg-black/30 hover:bg-black/50 text-white rounded-full"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => adjustZoom(-0.1)}
                size="icon"
                variant="ghost"
                className="bg-black/30 hover:bg-black/50 text-white rounded-full"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured receipt"
              className="w-full h-full object-contain" // Changed from object-cover to object-contain
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
      <div className="mt-4">
        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
