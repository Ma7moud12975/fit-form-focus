
import { Pose, calculateAngle, getKeypoint } from './poseDetectionService';

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
  RESTING = 'resting'
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
    musclesTargeted: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core']
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
    musclesTargeted: ['Chest', 'Shoulders', 'Triceps', 'Core']
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
    musclesTargeted: ['Biceps', 'Forearms']
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
    musclesTargeted: ['Shoulders', 'Triceps', 'Upper back']
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
    musclesTargeted: []
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
}

// Initialize a new exercise state
export function initExerciseState(type: ExerciseType): ExerciseState {
  return {
    type,
    repCount: 0,
    setCount: 1,
    repState: RepState.STARTING,
    formFeedback: [],
    lastRepTimestamp: Date.now()
  };
}

// Detect which exercise is being performed based on the pose
export function detectExerciseType(pose: Pose | null): ExerciseType {
  if (!pose) return ExerciseType.NONE;
  
  // This is a simplified detection - in a full implementation,
  // we would use machine learning or more complex logic
  
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
  const leftHip = getKeypoint(pose, 'left_hip');
  const leftKnee = getKeypoint(pose, 'left_knee');
  const leftAnkle = getKeypoint(pose, 'left_ankle');
  
  if (!leftHip || !leftKnee || !leftAnkle) {
    return { ...state, formFeedback: ['Cannot detect legs clearly'] };
  }
  
  const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  
  // Check back alignment for form feedback
  const shoulder = getKeypoint(pose, 'left_shoulder');
  const hip = getKeypoint(pose, 'left_hip');
  const knee = getKeypoint(pose, 'left_knee');
  
  if (shoulder && hip && knee) {
    const backAngle = calculateAngle(shoulder, hip, knee);
    if (backAngle < 160) {
      state.formFeedback.push('Keep your back straighter');
    }
  }
  
  // Knee alignment check
  const ankle = getKeypoint(pose, 'left_ankle');
  if (knee && ankle) {
    // Check if knees are going too far forward
    if (knee.x < ankle.x - 50) {
      state.formFeedback.push('Knees too far forward, shift weight to heels');
    }
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
  }
  
  return state;
}

// Process pushup exercise
function processPushup(
  state: ExerciseState,
  pose: Pose,
  settings: ExerciseSettings
): ExerciseState {
  const leftShoulder = getKeypoint(pose, 'left_shoulder');
  const leftElbow = getKeypoint(pose, 'left_elbow');
  const leftWrist = getKeypoint(pose, 'left_wrist');
  
  if (!leftShoulder || !leftElbow || !leftWrist) {
    return { ...state, formFeedback: ['Cannot detect arms clearly'] };
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
    }
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
  }
  
  return state;
}

// Process bicep curl exercise
function processBicepCurl(
  state: ExerciseState,
  pose: Pose,
  settings: ExerciseSettings
): ExerciseState {
  const rightShoulder = getKeypoint(pose, 'right_shoulder');
  const rightElbow = getKeypoint(pose, 'right_elbow');
  const rightWrist = getKeypoint(pose, 'right_wrist');
  
  if (!rightShoulder || !rightElbow || !rightWrist) {
    return { ...state, formFeedback: ['Cannot detect arms clearly'] };
  }
  
  const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  
  // Check elbow position for form feedback
  if (rightElbow.x > rightShoulder.x + 30) {
    state.formFeedback.push('Keep your elbows close to your body');
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
  }
  
  return state;
}

// Process shoulder press exercise
function processShoulderPress(
  state: ExerciseState,
  pose: Pose,
  settings: ExerciseSettings
): ExerciseState {
  const rightShoulder = getKeypoint(pose, 'right_shoulder');
  const rightElbow = getKeypoint(pose, 'right_elbow');
  const rightWrist = getKeypoint(pose, 'right_wrist');
  
  if (!rightShoulder || !rightElbow || !rightWrist) {
    return { ...state, formFeedback: ['Cannot detect arms clearly'] };
  }
  
  const elbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  
  // Form feedback
  if (rightWrist.x < rightElbow.x - 20) {
    state.formFeedback.push('Press directly upward');
  }
  
  // State machine for rep counting
  switch (state.repState) {
    case RepState.STARTING:
    case RepState.DOWN:
      if (elbowAngle > settings.thresholds.upAngle) {
        state.repState = RepState.UP;
      }
      break;
    
    case RepState.UP:
      if (elbowAngle < settings.thresholds.downAngle) {
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
  }
  
  return state;
}
