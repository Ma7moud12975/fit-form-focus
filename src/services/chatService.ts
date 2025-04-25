
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile } from "@/types/userProfile";

const genAI = new GoogleGenerativeAI("AIzaSyCnlo4wBA7HJe-n7wp5anejyZCo-G1oHEQ");

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
    
    let systemPrompt = "You are a helpful fitness assistant who provides expert advice on exercises, fitness routines, and health information.";
    
    if (userProfile) {
      systemPrompt += ` The user's profile: Name: ${userProfile.name}, Age: ${userProfile.age}, Height: ${userProfile.height}cm, Weight: ${userProfile.weight}kg. Please consider this information when providing advice.`;
    }
    
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "I'll be your fitness assistant! Ask me any questions about exercises, workout routines, nutrition, or general fitness advice." }],
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
