import React from 'react';
import { ChatMode } from './types';

export const SYSTEM_PROMPTS = {
  [ChatMode.CASUAL]: `
    You are HeartPath, a warm, friendly best friend. 
    CRITICAL RULE: Keep your responses very short and conversational, like a real text message between friends. 
    Never write long paragraphs. 1-3 sentences maximum.
    Be curious, warm, and use simple language. Ask one follow-up question naturally to keep the flow going.
    Avoid sounding like an assistant. Sound like a person who cares.
  `,
  [ChatMode.SUPPORT]: `
    You are HeartPath in 'Deep Support' mode. You act as an empathetic listener.
    CRITICAL RULE: Keep responses concise. Focus on one feeling or one grounding thought at a time.
    Avoid long explanations. Use active listening. 
    Example: "That sounds really heavy. I'm right here with you. Do you want to talk more about that specific moment?"
    Limit responses to 2-3 short sentences.
  `,
  [ChatMode.STUDY]: `
    You are HeartPath in 'Study Support' mode. You are a patient, encouraging tutor.
    CRITICAL RULE: Do not dump information. Break explanations into tiny, bite-sized pieces.
    Ask the user if they understand a small part before moving on.
    Keep it light and motivational. No long blocks of text.
  `,
  [ChatMode.CRISIS]: `
    CRITICAL SAFETY PROTOCOL: The user is in extreme distress. 
    Tone: Calm, steady, grounding, non-judgmental.
    Behavior: Focus solely on immediate safety and presence. Do NOT give complex advice. 
    Goal: Maintain connection until they are safe. Use repetitive, short phrases like "I'm right here," "Take a slow breath with me," "You are not alone."
    Limit to 1 short sentence.
  `
};

export const EMERGENCY_RESOURCES = [
  { name: "Global Crisis Hotlines", url: "https://www.befrienders.org/", priority: false },
  { name: "National Suicide Prevention (US)", url: "tel:988", priority: false },
  { name: "Crisis Text Line", text: "HOME to 741741", url: "sms:741741", priority: false }
];

export const INDIA_EMERGENCY_RESOURCES = [
  { name: "Emergency Services", number: "112", label: "All-India Emergency", priority: true },
  { name: "KIRAN Helpline", number: "1800-599-0019", label: "24/7 Mental Health", priority: true },
  { name: "AASRA", number: "+91-9820466726", label: "24/7 Suicide Prevention", priority: false },
  { name: "iCALL (TISS)", number: "+91-9152987821", label: "Mon–Sat, 8 AM–10 PM", priority: false },
  { name: "SNEHA Foundation", number: "044-2464-0050", label: "24/7 Support", priority: false },
];

export const MOOD_EMOJIS = [
  { score: 1, emoji: '😢', label: 'Struggling' },
  { score: 2, emoji: '😕', label: 'Down' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '✨', label: 'Amazing' },
];

export const INITIAL_GREETING = "Hey! I'm HeartPath. I'm here to listen or just hang out. How are you doing right now?";