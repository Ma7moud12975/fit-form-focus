
import React from "react";
import { cn } from "@/lib/utils";
import { Dumbbell } from "lucide-react";

interface LoadingAnimationProps {
  message?: string;
  className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = "Loading...", 
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6", 
      className
    )}>
      <div className="relative w-12 h-12 mb-4">
        <Dumbbell className="w-12 h-12 text-muted-foreground animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingAnimation;
