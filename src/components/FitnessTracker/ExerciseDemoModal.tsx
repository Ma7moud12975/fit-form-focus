
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExerciseType, EXERCISES } from "@/services/exerciseService";
import { Card } from "@/components/ui/card";

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
              src={`/exercises/${exerciseType.toLowerCase()}.gif`}
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
