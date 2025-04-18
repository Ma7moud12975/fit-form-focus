
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileVideo, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  onVideoLoad: (video: HTMLVideoElement) => void;
  className?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoLoad, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      onVideoLoad(video);
    };
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <input
        type="file"
        ref={inputRef}
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Video
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Supported formats: MP4, WebM
      </p>
    </div>
  );
};

export default VideoUpload;
