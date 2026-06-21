
import { GoogleGenAI, Type } from "@google/genai";
import { AIGenResult } from "../types";

/**
 * Generates game code using Gemini 3 Pro.
 * Adheres to strict @google/genai guidelines for initialization and text extraction.
 */
export const generateGameCode = async (prompt: string): Promise<AIGenResult> => {
  // FIX: Always use the mandatory initialization format with direct access to process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a single-file HTML (including CSS and JavaScript) for a browser game based on this idea: "${prompt}". 
      Requirements: 
      - The file MUST be self-contained (all CSS and JS inside the HTML).
      - Aesthetic: Brazilian Phonk, neon colors (green, yellow, blue), dark mode, aggressive/fast-paced feel.
      - Gameplay: Ensure it is fun and fully functional.
      - Output: You must return a JSON object with the fields "code" (the full HTML string) and "explanation" (how to play).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["code", "explanation"],
        },
      },
    });

    // Access .text property directly, do not call as a function.
    const rawText = response.text;
    if (!rawText) throw new Error("GEMINI ENGINE RETURNED EMPTY RESULT.");
    
    // Attempt to extract JSON if wrapped in markdown
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonToParse = jsonMatch ? jsonMatch[0] : rawText;
    
    return JSON.parse(jsonToParse);
  } catch (err: any) {
    console.error("Gemini Code Gen Failed:", err);
    throw new Error(err.message || "AI GENERATION FAILED.");
  }
};
