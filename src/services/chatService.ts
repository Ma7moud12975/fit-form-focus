
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile } from "@/types/userProfile";

const genAI = new GoogleGenerativeAI("AIzaSyCnlo4wBA7HJe-n7wp5anejyZCo-G1oHEQ");

// Enhanced exercise configurations
const EXERCISE_CONFIGS = {
  BICEP_CURL: {
    enter_down_threshold: 155,
    exit_down_threshold: 70,
    enter_up_threshold: 55,
    exit_up_threshold: 70,
    form_checks: {
      back_angle_max: 20,
      upper_arm_movement_max: 25
    }
  },
  SQUAT: {
    enter_down_threshold: 100,
    exit_down_threshold: 165,
    enter_up_threshold: 165,
    exit_up_threshold: 100,
    form_checks: {
      back_angle_max: 45,
      knee_valgus_check: true,
      chest_forward_check: true
    }
  },
  PUSH_UP: {
    enter_down_threshold: 95,
    exit_down_threshold: 155,
    enter_up_threshold: 155,
    exit_up_threshold: 95,
    form_checks: {
      body_line_angle_range: [150, 190]
    }
  },
  PULL_UP: {
    enter_down_threshold: 80,
    exit_down_threshold: 160,
    enter_up_threshold: 160,
    exit_up_threshold: 80,
    special_conditions: {
      chin_above_wrist_required: true
    }
  }
};

export const exerciseConfig = EXERCISE_CONFIGS;

export const getChatResponse = async (message: string, userProfile: UserProfile | null) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });
    
    let systemPrompt = "You are a helpful fitness assistant who provides expert advice on exercises, fitness routines, and health information. ";
    
    // Add exercise configurations to system prompt
    systemPrompt += "You have access to specific exercise form guidelines for: Bicep Curls, Squats, Push-ups, and Pull-ups. ";
    
    if (userProfile) {
      systemPrompt += `The user's profile: Name: ${userProfile.name}, Age: ${userProfile.age}, Height: ${userProfile.height}cm, Weight: ${userProfile.weight}kg. Please consider this information when providing advice.`;
    }
    
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "I'm your fitness assistant with detailed knowledge of proper exercise form and technique. I can help with workouts, form guidance, and personalized fitness advice." }],
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in chat response:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};
