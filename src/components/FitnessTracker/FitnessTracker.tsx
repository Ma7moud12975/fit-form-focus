
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import WebcamView from "./WebcamView";
import ExerciseStats from "./ExerciseStats";
import FormGuide from "./FormGuide";
import WelcomeModal from "./WelcomeModal";
import LoadingAnimation from "./LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  initPoseDetector, 
  detectPose, 
  drawPose,
  Pose
} from "@/services/poseDetectionService";
import {
  ExerciseState,
  ExerciseType,
  EXERCISES,
  initExerciseState,
  detectExerciseType,
  processExerciseState
} from "@/services/exerciseService";
import { Dumbbell, Camera, AlertTriangle, Play, Pause } from "lucide-react";

interface FitnessTrackerProps {
  className?: string;
}

const FitnessTracker: React.FC<FitnessTrackerProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [pose, setPose] = useState<Pose | null>(null);
  const [currentExercise, setCurrentExercise] = useState<ExerciseType>(ExerciseType.NONE);
  const [exerciseState, setExerciseState] = useState<ExerciseState>(initExerciseState(ExerciseType.NONE));
  const [selectedTab, setSelectedTab] = useState<string>("auto");
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);

  // Initialize the pose detector
  useEffect(() => {
    const loadModel = async () => {
      try {
        await initPoseDetector();
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error initializing pose detector:", error);
      }
    };

    loadModel();
  }, []);

  // Process webcam frames
  const processFrame = async (imageData: ImageData) => {
    if (!isModelLoaded || !isTracking) return;

    try {
      // Detect pose
      const detectedPose = await detectPose(imageData);
      setPose(detectedPose);

      // Draw pose on canvas
      if (canvasRef.current && detectedPose) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            imageData as unknown as CanvasImageSource, 
            0, 0, 
            canvasRef.current.width, 
            canvasRef.current.height
          );
          drawPose(ctx, detectedPose);
        }
      }

      // Update exercise tracking
      if (detectedPose) {
        // In auto mode, detect the exercise
        if (selectedTab === "auto" && currentExercise === ExerciseType.NONE) {
          const exerciseType = detectExerciseType(detectedPose);
          if (exerciseType !== ExerciseType.NONE) {
            setCurrentExercise(exerciseType);
            setExerciseState(initExerciseState(exerciseType));
          }
        }

        // Process the current exercise
        if (currentExercise !== ExerciseType.NONE) {
          const updatedState = processExerciseState(exerciseState, detectedPose);
          setExerciseState(updatedState);
        }
      }
    } catch (error) {
      console.error("Error processing frame:", error);
    }
  };

  // Handle exercise selection
  const handleExerciseSelect = (type: ExerciseType) => {
    setCurrentExercise(type);
    setExerciseState(initExerciseState(type));
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if (tab === "auto") {
      setCurrentExercise(ExerciseType.NONE);
      setExerciseState(initExerciseState(ExerciseType.NONE));
    }
  };

  return (
    <div className={cn("grid gap-6", className)}>
      <WelcomeModal open={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Webcam and pose detection */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Pose Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <WebcamView
                className="w-full h-auto overflow-hidden rounded-md"
                width={640}
                height={480}
                onFrame={processFrame}
                drawCanvas={true}
                canvasRef={canvasRef}
              />
              
              {!isModelLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                  <LoadingAnimation message="Loading AI Model..." />
                </div>
              )}
              
              <div className="absolute bottom-4 right-4">
                <Button
                  onClick={() => setIsTracking(!isTracking)}
                  variant={isTracking ? "destructive" : "default"}
                  size="sm"
                  disabled={!isModelLoaded}
                >
                  {isTracking ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Tracking
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Tracking
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {!isTracking && isModelLoaded && (
              <div className="mt-4 p-3 bg-muted rounded-md text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-warning" />
                Tracking is paused. Click Start Tracking to begin exercise detection.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise tracking and stats */}
        <div className="w-full lg:w-80">
          <Tabs 
            defaultValue="auto" 
            value={selectedTab} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="auto">Auto Detect</TabsTrigger>
              <TabsTrigger value="select">Select Exercise</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auto" className="pt-4">
              <ExerciseStats exerciseState={exerciseState} />
              
              {currentExercise === ExerciseType.NONE && (
                <div className="mt-4 p-4 text-sm text-center text-muted-foreground">
                  <p>
                    Get into position to begin an exercise. The system will automatically detect and track your workout.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="select" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ExerciseType)
                  .filter(type => type !== ExerciseType.NONE)
                  .map((type) => (
                    <Button
                      key={type}
                      variant={currentExercise === type ? "default" : "outline"}
                      className={cn(
                        "h-auto py-4 flex flex-col items-center justify-center",
                        currentExercise === type && "border-primary"
                      )}
                      onClick={() => handleExerciseSelect(type)}
                    >
                      <Dumbbell className="h-5 w-5 mb-1" />
                      <span className="text-sm">{EXERCISES[type].name}</span>
                    </Button>
                  ))}
              </div>
              
              {currentExercise !== ExerciseType.NONE && (
                <ExerciseStats exerciseState={exerciseState} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {currentExercise !== ExerciseType.NONE && (
        <FormGuide exerciseType={currentExercise} />
      )}
    </div>
  );
};

export default FitnessTracker;
