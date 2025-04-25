
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCnlo4wBA7HJe-n7wp5anejyZCo-G1oHEQ");

export const getChatResponse = async (message: string) => {
  try {
    // Use the correct model version with proper configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });
    
    // Create a proper chat session with system instructions
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a helpful fitness assistant who provides expert advice on exercises, fitness routines, and health information."}],
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

    // Send the message to the chat
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in chat response:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};
