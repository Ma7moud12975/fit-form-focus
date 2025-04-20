
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExerciseType, EXERCISES } from "@/services/exerciseService";
import { Card } from "@/components/ui/card";

// Define exercise GIF URLs
const exerciseImages = {
  [ExerciseType.SQUAT]: "https://i.pinimg.com/originals/42/52/27/425227c898782116a5955666be277885.gif",
  [ExerciseType.BICEP_CURL]: "https://i.pinimg.com/originals/68/4d/50/684d50925eabbdf60f66d4bf7013c9ef.gif",
  [ExerciseType.SHOULDER_PRESS]: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2RtcjdoNGxzaGE2dHJwM3hxaHplMnhwcGNjc2VoNHF0Z2VuZ25wNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7lugb7ObGYiXe/giphy.gif"
};

interface ExerciseDemoModalProps {
  exerciseType: ExerciseType;
  open: boolean;
  onClose: () => void;
}

const ExerciseDemoModal: React.FC<ExerciseDemoModalProps> = ({
  exerciseType,
  open,
  onClose,
}) => {
  if (exerciseType === ExerciseType.NONE) return null;

  const exercise = EXERCISES[exerciseType];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{exercise.name} - Demonstration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <img
              src={exerciseImages[exerciseType]}
              alt={`${exercise.name} demonstration`}
              className="w-full h-auto"
            />
          </Card>
          <div className="space-y-2">
            <h4 className="font-medium">Key Points:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {exercise.formInstructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDemoModal;
