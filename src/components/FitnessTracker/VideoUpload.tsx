
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileVideo, Upload, AlertCircle, ArrowUpTray } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VideoUploadProps {
  onVideoLoad: (video: HTMLVideoElement) => void;
  className?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoLoad, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    processVideoFile(file);
  };
  
  const processVideoFile = (file: File) => {
    setIsLoading(true);
    setError(null);

    // Check file size (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError("File too large (max 100MB)");
      setIsLoading(false);
      return;
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      setError("Please upload a video file");
      setIsLoading(false);
      return;
    }

    const fileURL = URL.createObjectURL(file);
    const video = document.createElement('video');
    
    // Set video metadata properties
    video.preload = 'metadata';
    video.playsInline = true;
    video.muted = true;
    
    video.onloadedmetadata = () => {
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError("Invalid video format or corrupted file");
        URL.revokeObjectURL(fileURL);
        setIsLoading(false);
        return;
      }
      
      // Force load more of the video to ensure frames are available
      video.currentTime = 0;
      video.onloadeddata = () => {
        // Reset to beginning
        video.currentTime = 0;
        setIsLoading(false);
        toast.success(`Video loaded: ${file.name}`);
        onVideoLoad(video);
      };
      
      video.onerror = () => {
        setError("Error loading video. Please try another file.");
        URL.revokeObjectURL(fileURL);
        setIsLoading(false);
      };
    };
    
    video.onerror = () => {
      setError("Error loading video. Please try another file.");
      URL.revokeObjectURL(fileURL);
      setIsLoading(false);
    };
    
    video.src = fileURL;
  };
  
  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processVideoFile(file);
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <FileVideo className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
        <h3 className="text-lg font-medium">Upload Exercise Video</h3>
        <p className="text-sm text-muted-foreground">
          Upload or drag & drop a video to analyze your exercise form
        </p>
      </div>
      
      <input
        type="file"
        ref={inputRef}
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {error && (
        <div className="w-full p-3 text-destructive bg-destructive/10 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Loading...
          </>
        ) : (
          <>
            <ArrowUpTray className="w-4 h-4 mr-2" />
            Select Video File
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        Supported formats: MP4, WebM, MOV (max 100MB)
      </p>
    </div>
  );
};

export default VideoUpload;
