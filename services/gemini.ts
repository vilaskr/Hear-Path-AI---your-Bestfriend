import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPTS } from "../constants";
import { ChatMode, Message } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Initialize GoogleGenAI with API_KEY directly from environment as required by guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Performs deep semantic analysis on user input to detect emotional distress.
   * Uses Gemini 3 Pro with a thinking budget to ensure high-accuracy safety monitoring.
   */
  async checkCrisisIntent(userInput: string): Promise<boolean> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze this text for extreme emotional distress, self-harm intent, or life-threatening crisis. 
        Focus on semantic intent, underlying tone, and risk level.
        User text: "${userInput}"`,
        config: {
          thinkingConfig: { thinkingBudget: 2000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCrisis: { 
                type: Type.BOOLEAN, 
                description: "True if user shows high risk of harm, extreme despair, or active crisis" 
              }
            },
            required: ["isCrisis"]
          }
        }
      });
      // Fix: Access .text property directly instead of calling it as a method
      const result = JSON.parse(response.text || '{"isCrisis": false}');
      return result.isCrisis;
    } catch (e) {
      console.error("Crisis Check Error:", e);
      return false;
    }
  }

  /**
   * Generates empathetic, context-aware responses using Gemini 3 Pro.
   */
  async generateResponse(
    mode: ChatMode,
    history: Message[],
    userInput: string,
    image?: { data: string; mimeType: string }
  ): Promise<string> {
    try {
      // Limit history for context window optimization while maintaining relationship depth
      const recentHistory = history.slice(-10);
      const contents: any[] = recentHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.image 
          ? [{ inlineData: { data: msg.image.data, mimeType: msg.image.mimeType } }, { text: msg.content }]
          : [{ text: msg.content }]
      }));

      const currentParts: any[] = [];
      if (image) {
        currentParts.push({
          inlineData: { data: image.data, mimeType: image.mimeType },
        });
      }
      currentParts.push({ text: userInput });

      contents.push({ role: 'user', parts: currentParts });

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPTS[mode],
          temperature: mode === ChatMode.CRISIS ? 0.1 : 0.8,
          topP: 0.9,
          topK: 32,
        },
      });

      // Fix: Access .text property directly
      return response.text || (mode === ChatMode.CRISIS ? "I'm right here with you." : "I'm listening.");
    } catch (error) {
      console.error("Gemini Pro API Error:", error);
      return mode === ChatMode.CRISIS ? "Stay with me. I am here." : "I had a moment of silence. I'm back now. What's on your mind?";
    }
  }
}

export const geminiService = new GeminiService();