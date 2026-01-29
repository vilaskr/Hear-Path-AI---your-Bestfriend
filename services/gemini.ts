import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPTS } from "../constants";
import { ChatMode, Message } from "../types";

export class GeminiService {
  private getClient() {
    // ALWAYS initialize using the process.env.API_KEY directly
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async checkCrisisIntent(userInput: string): Promise<boolean> {
    if (!process.env.API_KEY) return false;
    
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Evaluate this text for acute emotional crisis, self-harm intent, or life-threatening distress.
User input: "${userInput}"`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }, // Fast classification, no deep thinking needed
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCrisis: { 
                type: Type.BOOLEAN,
                description: "True if the user is in immediate life-threatening danger or severe crisis."
              }
            },
            required: ["isCrisis"]
          }
        }
      });
      
      const result = JSON.parse(response.text || '{"isCrisis": false}');
      return result.isCrisis;
    } catch (e) {
      console.error("Crisis assessment failed:", e);
      return false;
    }
  }

  async generateResponse(
    mode: ChatMode,
    history: Message[],
    userInput: string,
    image?: { data: string; mimeType: string }
  ): Promise<string> {
    if (!process.env.API_KEY) return "The Gemini API key is missing from the environment variables.";

    try {
      const ai = this.getClient();
      const recentHistory = history.slice(-10);
      
      const contents = recentHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.image 
          ? [{ inlineData: { data: msg.image.data, mimeType: msg.image.mimeType } }, { text: msg.content }]
          : [{ text: msg.content }]
      }));

      const currentParts: any[] = [];
      if (image) {
        currentParts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
      }
      currentParts.push({ text: userInput });
      
      contents.push({ role: 'user', parts: currentParts });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPTS[mode],
          temperature: mode === ChatMode.CRISIS ? 0.1 : 0.8,
          // Reserve thinking tokens for high-quality emotional reasoning
          thinkingConfig: { thinkingBudget: 4000 }
        },
      });

      return response.text || "I'm listening closely...";
    } catch (error) {
      console.error("Gemini connection error:", error);
      return "I'm having a quiet moment to myself (connection issue), but I'm still right here for you.";
    }
  }
}

export const geminiService = new GeminiService();