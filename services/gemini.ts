import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPTS } from "../constants";
import { ChatMode, Message } from "../types";

export class GeminiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async checkCrisisIntent(userInput: string): Promise<boolean> {
    if (!process.env.API_KEY) return false;
    
    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following user input for signs of acute emotional crisis, self-harm intent, or life-threatening distress. User text: "${userInput}"`,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCrisis: { 
                type: Type.BOOLEAN,
                description: "True if the user is in immediate life-threatening danger or severe emotional crisis."
              }
            },
            required: ["isCrisis"]
          }
        }
      });
      
      const result = JSON.parse(response.text || '{"isCrisis": false}');
      return result.isCrisis;
    } catch (e) {
      console.error("Crisis check failed:", e);
      return false;
    }
  }

  async generateResponse(
    mode: ChatMode,
    history: Message[],
    userInput: string,
    image?: { data: string; mimeType: string }
  ): Promise<string> {
    if (!process.env.API_KEY) return "The Gemini API key is missing. Please check your Vercel Environment Variables.";

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
          temperature: mode === ChatMode.CRISIS ? 0.2 : 0.8,
          thinkingConfig: { thinkingBudget: 4000 }
        },
      });

      return response.text || "I'm listening...";
    } catch (error) {
      console.error("Gemini API error:", error);
      return "I'm having a little trouble connecting to my thoughts right now, but I'm still here with you.";
    }
  }
}

export const geminiService = new GeminiService();