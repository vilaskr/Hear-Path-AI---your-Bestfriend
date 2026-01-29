import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPTS } from "../constants";
import { ChatMode, Message } from "../types";

const getApiKey = () => {
  // Try different ways to find the API Key depending on environment
  if (typeof process !== 'undefined' && process.env?.API_KEY) return process.env.API_KEY;
  // @ts-ignore
  if (import.meta.env?.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
  return '';
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: getApiKey() });
  }

  async checkCrisisIntent(userInput: string): Promise<boolean> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze this text for extreme emotional distress, self-harm intent, or life-threatening crisis. Focus on semantic intent. User text: "${userInput}"`,
        config: {
          thinkingConfig: { thinkingBudget: 2000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCrisis: { type: Type.BOOLEAN }
            },
            required: ["isCrisis"]
          }
        }
      });
      const result = JSON.parse(response.text || '{"isCrisis": false}');
      return result.isCrisis;
    } catch (e) {
      console.error("Crisis Check Error:", e);
      return false;
    }
  }

  async generateResponse(
    mode: ChatMode,
    history: Message[],
    userInput: string,
    image?: { data: string; mimeType: string }
  ): Promise<string> {
    try {
      const recentHistory = history.slice(-10);
      const contents: any[] = recentHistory.map(msg => ({
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

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPTS[mode],
          temperature: mode === ChatMode.CRISIS ? 0.1 : 0.8,
        },
      });

      return response.text || "I'm here.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having a little trouble connecting right now, but I'm still here with you.";
    }
  }
}

export const geminiService = new GeminiService();