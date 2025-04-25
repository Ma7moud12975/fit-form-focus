
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCnlo4wBA7HJe-n7wp5anejyZCo-G1oHEQ");

export const getChatResponse = async (message: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in chat response:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};
