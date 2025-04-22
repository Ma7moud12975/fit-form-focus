
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ExerciseType, ExerciseState, EXERCISES } from "@/services/exerciseService";

// Define exercise colors
const exerciseColors = {
  [ExerciseType.SQUAT]: "#8B5CF6", // Vivid Purple
  [ExerciseType.BICEP_CURL]: "#D946EF", // Magenta Pink
  [ExerciseType.SHOULDER_PRESS]: "#F97316", // Bright Orange
};

interface ExerciseDashboardProps {
  exerciseStates: Record<ExerciseType, ExerciseState>;
}

const ExerciseDashboard: React.FC<ExerciseDashboardProps> = ({ exerciseStates }) => {
  const chartData = Object.entries(exerciseStates)
    .filter(([type]) => type !== ExerciseType.NONE)
    .map(([type, state]) => ({
      name: EXERCISES[type as ExerciseType].name,
      reps: state.repCount,
      sets: state.setCount,
      color: exerciseColors[type as ExerciseType],
    }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exercise Performance</CardTitle>
          <CardDescription>Track your progress across different exercises</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="reps" 
                  name="Total Reps"
                  fill="#8884d8" // Default color
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercise Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercise</TableHead>
                <TableHead>Total Reps</TableHead>
                <TableHead>Sets Completed</TableHead>
                <TableHead>Form Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(exerciseStates)
                .filter(([type]) => type !== ExerciseType.NONE)
                .map(([type, state]) => (
                  <TableRow 
                    key={type}
                    style={{ 
                      backgroundColor: `${exerciseColors[type as ExerciseType]}10`
                    }}
                  >
                    <TableCell 
                      className="font-medium"
                      style={{ 
                        color: exerciseColors[type as ExerciseType]
                      }}
                    >
                      {EXERCISES[type as ExerciseType].name}
                    </TableCell>
                    <TableCell>{state.repCount}</TableCell>
                    <TableCell>{Math.max(0, state.setCount - 1)}</TableCell>
                    <TableCell>
                      {state.formCorrect ? "100%" : "0%"}
                    </TableCell>
                  </TableRow>
                ))}
              {Object.keys(exerciseStates).filter(type => type === ExerciseType.NONE).length > 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={4} 
                    className="text-center text-muted-foreground"
                  >
                    No exercise selected
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseDashboard;

