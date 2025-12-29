import { GoogleGenAI, Type } from "@google/genai";
import { GRACE_SYSTEM_INSTRUCTION, SAFETY_CHECK_PROMPT } from "../constants";
import { LoopAction } from "../types";

/**
 * Checks if the API Key is available in the environment.
 */
export function isGraceOnline(): boolean {
  return !!process.env.API_KEY && process.env.API_KEY.length > 10;
}

/**
 * Perform a quick safety and relevance check on the user input.
 * Uses gemini-3-flash-preview for speed and efficiency.
 */
async function checkInputSafetyAndRelevance(input: string): Promise<{ isSafe: boolean; isRelevant: boolean; isSexualTopic: boolean }> {
  if (!process.env.API_KEY) {
    return { isSafe: true, isRelevant: true, isSexualTopic: false };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Input: "${input}"\n\n${SAFETY_CHECK_PROMPT}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            isRelevant: { type: Type.BOOLEAN },
            isSexualTopic: { type: Type.BOOLEAN },
          },
          required: ['isSafe', 'isRelevant', 'isSexualTopic'],
        }
      }
    });

    const text = response.text;
    if (!text) return { isSafe: true, isRelevant: true, isSexualTopic: false };
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Safety check failed:", error);
    return { isSafe: true, isRelevant: true, isSexualTopic: false };
  }
}

/**
 * Extracts possible JSON actions from Grace's markdown response.
 */
function parseGraceResponse(rawText: string): { cleanText: string; action?: LoopAction; insight?: any } {
  let text = rawText;
  let action: LoopAction | undefined;
  let insight: any | undefined;

  // Look for JSON at the end of the response
  const jsonMatch = text.match(/\{[\s\n]*"type":[\s\n]*"[A-Z_]+".*?\}[\s\n]*$/s);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[0]);
      if (data.type) action = { type: data.type, payload: data.payload };
      if (data.insight) insight = data.insight;
      text = text.replace(jsonMatch[0], '').trim();
    } catch (e) {}
  }

  // Clean up any remaining markdown blocks
  text = text
    .replace(/```json[\s\S]*?```/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`{1,3}/g, '')
    .trim();

  return { cleanText: text, action, insight };
}

/**
 * Main interaction point with Grace.
 * Uses the latest Gemini 3 Flash model.
 */
export async function sendMessageToGrace(
  history: { role: string; parts: { text: string }[] }[],
  currentInput: string
): Promise<{ text: string; isSafetyResource: boolean; action?: LoopAction; insight?: any }> {
  // 1. Check for API Key
  if (!process.env.API_KEY) {
    return { 
      text: "Connection to the stars is currently offline. Please ensure your API_KEY environment variable is set in your deployment settings and the app is redeployed.", 
      isSafetyResource: false 
    };
  }

  // 2. Safety Check
  const safety = await checkInputSafetyAndRelevance(currentInput);

  if (!safety.isSafe) {
    return {
      text: "I hear that you are in pain, and I want you to be safe. You matter. Text HOME to 741741 or call 988. I am here for you, but your safety requires more help than I can give alone.",
      isSafetyResource: true
    };
  }

  if (safety.isSexualTopic) {
    return {
      text: "I hear you, and it's totally natural to have questions about that. Since my focus is on helping you navigate the orbits of friendship and social signals, I'm not the best one to dive into that topic. I'd really encourage you to share these questions with a trusted friend or an adult you feel safe with—like a parent, teacher, or counselor.",
      isSafetyResource: false
    };
  }

  // 3. Generate Content
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: h.parts })),
        { role: 'user', parts: [{ text: currentInput }] }
      ],
      config: {
        systemInstruction: GRACE_SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    const { cleanText, action, insight } = parseGraceResponse(response.text || "");

    return {
      text: cleanText,
      isSafetyResource: false,
      action,
      insight
    };
  } catch (error: any) {
    console.error("Grace Error:", error);
    
    // Check for specific API key errors
    if (error.status === 401 || error.message?.includes('401')) {
       return {
         text: "The stars can't recognize our current connection key. Please check that the API key provided is valid.",
         isSafetyResource: false
       };
    }

    return { 
      text: "The stars are a bit fuzzy right now. Could you try saying that again?", 
      isSafetyResource: false 
    };
  }
}