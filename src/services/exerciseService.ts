
import { Pose, calculateAngle, getKeypoint, calculateVerticalDistance, calculateHorizontalDistance } from './poseDetectionService';

// Exercise types supported by the app
export enum ExerciseType {
  SQUAT = 'squat',
  PUSHUP = 'pushup',
  BICEP_CURL = 'bicepCurl',
  SHOULDER_PRESS = 'shoulderPress',
  NONE = 'none'
}

// State of a single exercise repetition
export enum RepState {
  STARTING = 'starting',
  UP = 'up',
  DOWN = 'down',
  COUNTING = 'counting',
  RESTING = 'resting',
  INCORRECT_FORM = 'incorrectForm'
}

// Interface for exercise settings
export interface ExerciseSettings {
  name: string;
  type: ExerciseType;
  targetReps: number;
  restBetweenSets: number; // in seconds
  sets: number;
  thresholds: {
    upAngle: number;
    downAngle: number;
  };
  formInstructions: string[];
  musclesTargeted: string[];
  primaryLandmarks: string[]; // Primary landmarks to track for this exercise
}

// Exercise definitions
export const EXERCISES: Record<ExerciseType, ExerciseSettings> = {
  [ExerciseType.SQUAT]: {
    name: 'Squat',
    type: ExerciseType.SQUAT,
    targetReps: 10,
    restBetweenSets: 60,
    sets: 3,
    thresholds: {
      upAngle: 160, // Hip angle when standing
      downAngle: 90, // Hip angle at bottom of squat
    },
    formInstructions: [
      'Keep your back straight',
      'Knees should be aligned with toes',
      'Go down until thighs are parallel to the ground',
      'Keep weight in heels'
    ],
    musclesTargeted: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
    primaryLandmarks: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle']
  },
  [ExerciseType.PUSHUP]: {
    name: 'Push-up',
    type: ExerciseType.PUSHUP,
    targetReps: 12,
    restBetweenSets: 60,
    sets: 3,
    thresholds: {
      upAngle: 160, // Elbow angle at top of pushup
      downAngle: 90, // Elbow angle at bottom of pushup
    },
    formInstructions: [
      'Keep your body straight from head to heels',
      'Hands should be slightly wider than shoulder width',
      'Lower until elbows are at 90 degrees',
      'Keep elbows close to your body'
    ],
    musclesTargeted: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    primaryLandmarks: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist']
  },
  [ExerciseType.BICEP_CURL]: {
    name: 'Bicep Curl',
    type: ExerciseType.BICEP_CURL,
    targetReps: 12,
    restBetweenSets: 45,
    sets: 3,
    thresholds: {
      upAngle: 45, // Elbow angle at top of curl
      downAngle: 160, // Elbow angle at bottom of curl
    },
    formInstructions: [
      'Keep elbows close to your sides',
      'Only move your forearms',
      'Curl up until forearms are vertical',
      'Lower weights in a controlled motion'
    ],
    musclesTargeted: ['Biceps', 'Forearms'],
    primaryLandmarks: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist']
  },
  [ExerciseType.SHOULDER_PRESS]: {
    name: 'Shoulder Press',
    type: ExerciseType.SHOULDER_PRESS,
    targetReps: 10,
    restBetweenSets: 60,
    sets: 3,
    thresholds: {
      upAngle: 170, // Elbow angle at top of press
      downAngle: 90, // Elbow angle at bottom of press
    },
    formInstructions: [
      'Keep your core engaged',
      'Press directly upward',
      'Don\'t lock your elbows at the top',
      'Lower weights in a controlled motion'
    ],
    musclesTargeted: ['Shoulders', 'Triceps', 'Upper back'],
    primaryLandmarks: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist']
  },
  [ExerciseType.NONE]: {
    name: 'None',
    type: ExerciseType.NONE,
    targetReps: 0,
    restBetweenSets: 0,
    sets: 0,
    thresholds: {
      upAngle: 0,
      downAngle: 0,
    },
    formInstructions: [],
    musclesTargeted: [],
    primaryLandmarks: []
  }
};

// Interface for tracking exercise state
export interface ExerciseState {
  type: ExerciseType;
  repCount: number;
  setCount: number;
  repState: RepState;
  formFeedback: string[];
  lastRepTimestamp: number;
  formCorrect: boolean; // Track if current form is correct
}

// Initialize a new exercise state
export function initExerciseState(type: ExerciseType): ExerciseState {
  return {
    type,
    repCount: 0,
    setCount: 1,
    repState: RepState.STARTING,
    formFeedback: [],
    lastRepTimestamp: Date.now(),
    formCorrect: true
  };
}

// Detect which exercise is being performed based on the pose
export function detectExerciseType(pose: Pose | null): ExerciseType {
  if (!pose) return ExerciseType.NONE;
  
  // Check if user is in a squat position
  const leftHip = getKeypoint(pose, 'left_hip');
  const leftKnee = getKeypoint(pose, 'left_knee');
  const leftAnkle = getKeypoint(pose, 'left_ankle');
  
  if (leftHip && leftKnee && leftAnkle) {
    const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    if (kneeAngle < 120) {
      return ExerciseType.SQUAT;
    }
  }
  
  // Check if user is in a pushup position
  const leftShoulder = getKeypoint(pose, 'left_shoulder');
  const leftElbow = getKeypoint(pose, 'left_elbow');
  const leftWrist = getKeypoint(pose, 'left_wrist');
  
  if (leftShoulder && leftElbow && leftWrist) {
    const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    // Check if in plank-like position
    if (elbowAngle < 120) {
      return ExerciseType.PUSHUP;
    }
  }
  
  // Check for bicep curl
  const rightShoulder = getKeypoint(pose, 'right_shoulder');
  const rightElbow = getKeypoint(pose, 'right_elbow');
  const rightWrist = getKeypoint(pose, 'right_wrist');
  
  if (rightShoulder && rightElbow && rightWrist) {
    const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    if (elbowAngle < 90) {
      return ExerciseType.BICEP_CURL;
    }
  }
  
  // Default: no exercise detected
  return ExerciseType.NONE;
}

// Check exercise form and update rep state
export function processExerciseState(
  currentState: ExerciseState,
  pose: Pose | null
): ExerciseState {
  if (!pose || currentState.type === ExerciseType.NONE) {
    return currentState;
  }
  
  // Clone the current state to avoid mutations
  const newState = { ...currentState };
  newState.formFeedback = []; // Clear previous feedback
  newState.formCorrect = true; // Start with assumption that form is correct
  
  const exerciseSettings = EXERCISES[currentState.type];
  
  // Exercise-specific logic
  switch (currentState.type) {
    case ExerciseType.SQUAT:
      return processSquat(newState, pose, exerciseSettings);
    
    case ExerciseType.PUSHUP:
      return processPushup(newState, pose, exerciseSettings);
    
    case ExerciseType.BICEP_CURL:
      return processBicepCurl(newState, pose, exerciseSettings);
    
    case ExerciseType.SHOULDER_PRESS:
      return processShoulderPress(newState, pose, exerciseSettings);
    
    default:
      return newState;
  }
}

// Process squat exercise
function processSquat(
  state: ExerciseState,
  pose: Pose,
  settings: ExerciseSettings
): ExerciseState {
  // Get primary landmarks for squats
  const leftHip = getKeypoint(pose, 'left_hip');
  const leftKnee = getKeypoint(pose, 'left_knee');
  const leftAnkle = getKeypoint(pose, 'left_ankle');
  
  if (!leftHip || !leftKnee || !leftAnkle) {
    state.formFeedback.push('Cannot detect legs clearly');
    state.formCorrect = false;
    return state;
  }
  
  // Calculate key angles for squat form
  const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  
  // Check back alignment for form feedback
  const shoulder = getKeypoint(pose, 'left_shoulder');
  const hip = getKeypoint(pose, 'left_hip');
  const knee = getKeypoint(pose, 'left_knee');
  
  if (shoulder && hip && knee) {
    const backAngle = calculateAngle(shoulder, hip, knee);
    if (backAngle < 160) {
      state.formFeedback.push('Keep your back straighter');
      state.formCorrect = false;
    }
  }
  
  // Knee alignment check
  const ankle = getKeypoint(pose, 'left_ankle');
  if (knee && ankle) {
    // Check if knees are going too far forward
    if (knee.x < ankle.x - 50) {
      state.formFeedback.push('Knees too far forward, shift weight to heels');
      state.formCorrect = false;
    }
  }
  
  // If form is incorrect and we're not in INCORRECT_FORM state, transition to it
  if (!state.formCorrect && state.repState !== RepState.INCORRECT_FORM && 
      state.repState !== RepState.RESTING && state.repState !== RepState.STARTING) {
    state.repState = RepState.INCORRECT_FORM;
    state.formFeedback.push('Fix your form to continue');
    return state;
  }
  
  // If form was incorrect but is now fixed, return to appropriate state
  if (state.formCorrect && state.repState === RepState.INCORRECT_FORM) {
    // Determine if we should go back to UP or DOWN state based on knee angle
    state.repState = kneeAngle < settings.thresholds.downAngle ? RepState.DOWN : RepState.UP;
    state.formFeedback.push('Good form, continue your exercise');
  }
  
  // State machine for rep counting
  switch (state.repState) {
    case RepState.STARTING:
    case RepState.UP:
      if (kneeAngle < settings.thresholds.downAngle) {
        state.repState = RepState.DOWN;
      }
      break;
    
    case RepState.DOWN:
      if (kneeAngle > settings.thresholds.upAngle) {
        state.repState = RepState.UP;
        state.repCount += 1;
        state.lastRepTimestamp = Date.now();
        
        // Check if set is complete
        if (state.repCount >= settings.targetReps) {
          state.setCount += 1;
          state.repCount = 0;
          state.repState = RepState.RESTING;
          
          if (state.setCount > settings.sets) {
            state.setCount = settings.sets;
            state.formFeedback.push('Workout complete! Great job!');
          } else {
            state.formFeedback.push(`Set ${state.setCount - 1} complete! Rest for ${settings.restBetweenSets} seconds.`);
          }
        }
      }
      break;
    
    case RepState.RESTING:
      // Check if rest period is over
      const restTime = (Date.now() - state.lastRepTimestamp) / 1000;
      if (restTime >= settings.restBetweenSets) {
        state.repState = RepState.STARTING;
        state.formFeedback.push(`Starting set ${state.setCount}`);
      } else {
        state.formFeedback.push(`Rest: ${Math.round(settings.restBetweenSets - restTime)}s remaining`);
      }
      break;
      
    case RepState.INCORRECT_FORM:
      // Already handled above
      break;
  }
  
  return state;
}

// Process pushup exercise
function processPushup(
  state: ExerciseState,
  pose: Pose,
  settings: ExerciseSettings
): ExerciseState {
  // Focus on primary landmarks for pushups
  const leftShoulder = getKeypoint(pose, 'left_shoulder');
  const leftElbow = getKeypoint(pose, 'left_elbow');
  const leftWrist = getKeypoint(pose, 'left_wrist');
  
  if (!leftShoulder || !leftElbow || !leftWrist) {
    state.formFeedback.push('Cannot detect arms clearly');
    state.formCorrect = false;
    return state;
  }
  
  const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  
  // Check body alignment for form feedback
  const shoulder = getKeypoint(pose, 'left_shoulder');
  const hip = getKeypoint(pose, 'left_hip');
  const knee = getKeypoint(pose, 'left_knee');
  
  if (shoulder && hip && knee) {
    const bodyAngle = calculateAngle(shoulder, hip, knee);
    if (Math.abs(bodyAngle - 180) > 15) {
      state.formFeedback.push('Keep your body straight');
      state.formCorrect = false;
    }
  }
  
  // If form is incorrect and we're not in INCORRECT_FORM state, transition to it
  if (!state.formCorrect && state.repState !== RepState.INCORRECT_FORM && 
      state.repState !== RepState.RESTING && state.repState !== RepState.STARTING) {
    state.repState = RepState.INCORRECT_FORM;
    state.formFeedback.push('Fix your form to continue');
    return state;
  }
  
  // If form was incorrect but is now fixed, return to appropriate state
  if (state.formCorrect && state.repState === RepState.INCORRECT_FORM) {
    // Determine if we should go back to UP or DOWN state based on elbow angle
    state.repState = elbowAngle < settings.thresholds.downAngle ? RepState.DOWN : RepState.UP;
    state.formFeedback.push('Good form, continue your exercise');
  }
  
  // State machine for rep counting
  switch (state.repState) {
    case RepState.STARTING:
    case RepState.UP:
      if (elbowAngle < settings.thresholds.downAngle) {
        state.repState = RepState.DOWN;
      }
      break;
    
    case RepState.DOWN:
      if (elbowAngle > settings.thresholds.upAngle) {
        state.repState = RepState.UP;
        state.repCount += 1;
        state.lastRepTimestamp = Date.now();
        
        // Check if set is complete
        if (state.repCount >= settings.targetReps) {
          state.setCount += 1;
          state.repCount = 0;
          state.repState = RepState.RESTING;
          
          if (state.setCount > settings.sets) {
            state.setCount = settings.sets;
            state.formFeedback.push('Workout complete! Great job!');
          } else {
            state.formFeedback.push(`Set ${state.setCount - 1} complete! Rest for ${settings.restBetweenSets} seconds.`);
          }
        }
      }
      break;
    
    case RepState.RESTING:
      // Check if rest period is over
      const restTime = (Date.now() - state.lastRepTimestamp) / 1000;
      if (restTime >= settings.restBetweenSets) {
        state.repState = RepState.STARTING;
        state.formFeedback.push(`Starting set ${state.setCount}`);
      } else {
        state.formFeedback.push(`Rest: ${Math.round(settings.restBetweenSets - restTime)}s remaining`);
      }
      break;
      
    case RepState.INCORRECT_FORM:
      // Already handled above
      break;
  }
  
  return state;
}

// Process bicep curl exercise
function processBicepCurl(
  state: ExerciseState,
  pose: Pose,
  settings: ExerciseSettings
): ExerciseState {
  // Focus on primary landmarks for bicep curls
  const rightShoulder = getKeypoint(pose, 'right_shoulder');
  const rightElbow = getKeypoint(pose, 'right_elbow');
  const rightWrist = getKeypoint(pose, 'right_wrist');
  
  if (!rightShoulder || !rightElbow || !rightWrist) {
    state.formFeedback.push('Cannot detect arms clearly');
    state.formCorrect = false;
    return state;
  }
  
  const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  
  // Check elbow position for form feedback
  if (rightElbow.x > rightShoulder.x + 30) {
    state.formFeedback.push('Keep your elbows close to your body');
    state.formCorrect = false;
  }
  
  // Check for shoulder movement (should be minimal in proper bicep curl)
  const verticalShoulderMovement = calculateVerticalDistance(rightShoulder, rightElbow);
  if (Math.abs(verticalShoulderMovement) > 40) {
    state.formFeedback.push('Minimize shoulder movement, focus on elbow flexion');
    state.formCorrect = false;
  }
  
  // If form is incorrect and we're not in INCORRECT_FORM state, transition to it
  if (!state.formCorrect && state.repState !== RepState.INCORRECT_FORM && 
      state.repState !== RepState.RESTING && state.repState !== RepState.STARTING) {
    state.repState = RepState.INCORRECT_FORM;
    state.formFeedback.push('Fix your form to continue');
    return state;
  }
  
  // If form was incorrect but is now fixed, return to appropriate state
  if (state.formCorrect && state.repState === RepState.INCORRECT_FORM) {
    // Determine if we should go back to UP or DOWN state based on elbow angle
    state.repState = elbowAngle < settings.thresholds.upAngle ? RepState.UP : RepState.DOWN;
    state.formFeedback.push('Good form, continue your exercise');
  }
  
  // State machine for rep counting
  switch (state.repState) {
    case RepState.STARTING:
    case RepState.DOWN:
      if (elbowAngle < settings.thresholds.upAngle) {
        state.repState = RepState.UP;
      }
      break;
    
    case RepState.UP:
      if (elbowAngle > settings.thresholds.downAngle) {
        state.repState = RepState.DOWN;
        state.repCount += 1;
        state.lastRepTimestamp = Date.now();
        
        // Check if set is complete
        if (state.repCount >= settings.targetReps) {
          state.setCount += 1;
          state.repCount = 0;
          state.repState = RepState.RESTING;
          
          if (state.setCount > settings.sets) {
            state.setCount = settings.sets;
            state.formFeedback.push('Workout complete! Great job!');
          } else {
            state.formFeedback.push(`Set ${state.setCount - 1} complete! Rest for ${settings.restBetweenSets} seconds.`);
          }
        }
      }
      break;
    
    case RepState.RESTING:
      // Check if rest period is over
      const restTime = (Date.now() - state.lastRepTimestamp) / 1000;
      if (restTime >= settings.restBetweenSets) {
        state.repState = RepState.STARTING;
        state.formFeedback.push(`Starting set ${state.setCount}`);
      } else {
        state.formFeedback.push(`Rest: ${Math.round(settings.restBetweenSets - restTime)}s remaining`);
      }
      break;
      
    case RepState.INCORRECT_FORM:
      // Already handled above
      break;
  }
  
  return state;
}

// Process shoulder press exercise
function processShoulderPress(
  state: ExerciseState,
  pose: Pose,
  settings: ExerciseSettings
): ExerciseState {
  // Focus on primary landmarks for shoulder press
  const rightShoulder = getKeypoint(pose, 'right_shoulder');
  const rightElbow = getKeypoint(pose, 'right_elbow');
  const rightWrist = getKeypoint(pose, 'right_wrist');
  
  if (!rightShoulder || !rightElbow || !rightWrist) {
    state.formFeedback.push('Cannot detect arms clearly');
    state.formCorrect = false;
    return state;
  }
  
  const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  
  // Check wrist vertical position relative to elbow
  const wristVerticalPosition = calculateVerticalDistance(rightWrist, rightShoulder);
  
  // Form feedback
  if (rightWrist.x < rightElbow.x - 20) {
    state.formFeedback.push('Press directly upward');
    state.formCorrect = false;
  }
  
  // If form is incorrect and we're not in INCORRECT_FORM state, transition to it
  if (!state.formCorrect && state.repState !== RepState.INCORRECT_FORM && 
      state.repState !== RepState.RESTING && state.repState !== RepState.STARTING) {
    state.repState = RepState.INCORRECT_FORM;
    state.formFeedback.push('Fix your form to continue');
    return state;
  }
  
  // If form was incorrect but is now fixed, return to appropriate state
  if (state.formCorrect && state.repState === RepState.INCORRECT_FORM) {
    // Determine if we should go back to UP or DOWN state based on wrist position
    state.repState = wristVerticalPosition < -100 ? RepState.UP : RepState.DOWN;
    state.formFeedback.push('Good form, continue your exercise');
  }
  
  // State machine for rep counting
  switch (state.repState) {
    case RepState.STARTING:
    case RepState.DOWN:
      if (elbowAngle > settings.thresholds.upAngle && wristVerticalPosition < -100) {
        state.repState = RepState.UP;
      }
      break;
    
    case RepState.UP:
      if (elbowAngle < settings.thresholds.downAngle && wristVerticalPosition > -50) {
        state.repState = RepState.DOWN;
        state.repCount += 1;
        state.lastRepTimestamp = Date.now();
        
        // Check if set is complete
        if (state.repCount >= settings.targetReps) {
          state.setCount += 1;
          state.repCount = 0;
          state.repState = RepState.RESTING;
          
          if (state.setCount > settings.sets) {
            state.setCount = settings.sets;
            state.formFeedback.push('Workout complete! Great job!');
          } else {
            state.formFeedback.push(`Set ${state.setCount - 1} complete! Rest for ${settings.restBetweenSets} seconds.`);
          }
        }
      }
      break;
    
    case RepState.RESTING:
      // Check if rest period is over
      const restTime = (Date.now() - state.lastRepTimestamp) / 1000;
      if (restTime >= settings.restBetweenSets) {
        state.repState = RepState.STARTING;
        state.formFeedback.push(`Starting set ${state.setCount}`);
      } else {
        state.formFeedback.push(`Rest: ${Math.round(settings.restBetweenSets - restTime)}s remaining`);
      }
      break;
      
    case RepState.INCORRECT_FORM:
      // Already handled above
      break;
  }
  
  return state;
}
