import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

let genAI: GoogleGenAI | null = null;

export const initializeGemini = () => {
  if (process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const generateResponse = async (
  history: Message[],
  context: string,
  systemInstruction: string = "You are an expert AI assistant for the oil and gas industry."
): Promise<string> => {
  if (!genAI) {
      // Fallback for demo if no key is present, though instruction says assume key is there.
      // We will assume the key is present as per strict instructions.
      // However, if the user doesn't provide one in the env, we handle gracefully.
      if (!process.env.API_KEY) {
          console.warn("API Key missing");
          return "Error: API Key is missing in environment variables.";
      }
      genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  try {
    const model = 'gemini-3-flash-preview'; 
    
    // Construct the prompt with context
    const lastUserMessage = history[history.length - 1];
    
    // We strictly use the provided context as the "Ground Truth" for this RAG-like simulation
    // Instruction update: Ask for specific [[Source: filename]] format
    const fullPrompt = `
    Context Information (MBU Data):
    ${context}
    
    User Query: ${lastUserMessage.content}
    
    Please answer the query based primarily on the provided context. 
    IMPORTANT: When you use specific information from the context, you MUST cite the source using this exact format: [[Source: [1]]].
    For example: "The porosity is high [[Source: [1]]]."
    `;

    const response = await genAI.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I encountered an error while processing your request.";
  }
};