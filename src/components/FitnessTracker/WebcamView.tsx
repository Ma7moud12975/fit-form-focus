
import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Camera, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebcamViewProps {
  className?: string;
  onFrame?: (imageData: ImageData) => void;
  width?: number;
  height?: number;
  drawCanvas?: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

const WebcamView: React.FC<WebcamViewProps> = ({
  className,
  onFrame,
  width = 640,
  height = 480,
  drawCanvas = true,
  canvasRef: externalCanvasRef,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width, height },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsLoading(false);
          setHasPermission(true);
        };
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      
      setHasPermission(false);
      setIsLoading(false);
      
      // Set a more user-friendly error message based on the error type
      if (error.name === "NotAllowedError") {
        setErrorMessage("Camera access denied. Please allow camera access in your browser settings.");
      } else if (error.name === "NotFoundError") {
        setErrorMessage("No camera found. Please connect a camera to your device.");
      } else if (error.name === "AbortError" && error.message?.includes("Timeout")) {
        setErrorMessage("Camera connection timed out. Please try again or use video upload instead.");
      } else {
        setErrorMessage(`Camera error: ${error.message || "Unknown error"}`);
      }
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      // Clean up video stream on unmount
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [width, height]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !hasPermission || !onFrame) return;

    const captureFrame = () => {
      const ctx = canvasRef.current?.getContext("2d", { willReadFrequently: true });
      if (!ctx || !videoRef.current) return;

      // Draw the video frame to the canvas
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      
      // If we need to process the frame, get the ImageData and call onFrame
      if (onFrame) {
        const imageData = ctx.getImageData(0, 0, width, height);
        onFrame(imageData);
      }
      
      // Continue capturing frames
      requestAnimationFrame(captureFrame);
    };

    // Start capturing frames
    const frameId = requestAnimationFrame(captureFrame);
    
    // Clean up
    return () => cancelAnimationFrame(frameId);
  }, [hasPermission, onFrame, width, height, drawCanvas]);

  const handleRetry = () => {
    startCamera();
  };

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white z-10">
          Loading camera...
        </div>
      )}
      
      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background border rounded-lg z-10 p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Camera Access Issue</h3>
          <p className="mb-4 text-muted-foreground">{errorMessage || "Unable to access camera"}</p>
          <div className="flex gap-3">
            <Button onClick={handleRetry} variant="outline">
              Try Again
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            You can also use the "Video" tab to upload and analyze a pre-recorded video.
          </p>
        </div>
      )}
      
      <video 
        ref={videoRef} 
        className={cn(
          "w-full h-auto rounded-lg",
          (!drawCanvas || !hasPermission) ? "block" : "hidden"
        )} 
        width={width}
        height={height}
        playsInline
        muted
      />
      
      <canvas 
        ref={canvasRef} 
        className={cn(
          "w-full h-auto rounded-lg", 
          drawCanvas && hasPermission ? "block" : "hidden"
        )} 
        width={width} 
        height={height}
      />
    </div>
  );
};

export default WebcamView;
