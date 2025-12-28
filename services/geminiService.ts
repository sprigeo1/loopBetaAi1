import { GoogleGenAI, Type } from "@google/genai";
import { GRACE_SYSTEM_INSTRUCTION, SAFETY_CHECK_PROMPT } from "../constants";
import { LoopAction } from "../types";

// Always use process.env.API_KEY directly for initialization
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

interface SafetyCheckResult {
  isSafe: boolean;
  isRelevant: boolean;
  isSexualTopic?: boolean;
}

async function checkInputSafetyAndRelevance(input: string): Promise<SafetyCheckResult> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return { isSafe: true, isRelevant: true };

  const ai = getAIClient();
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
          required: ['isSafe', 'isRelevant'],
        }
      }
    });
    return JSON.parse(response.text || '{}') as SafetyCheckResult;
  } catch (error) {
    console.error("Safety Check Error:", error);
    return { isSafe: true, isRelevant: true };
  }
}

function cleanGraceResponse(rawText: string): { cleanText: string; action?: LoopAction; insight?: any } {
  let text = rawText;
  let action: LoopAction | undefined;
  let insight: any | undefined;

  // Extract JSON command if present at the end of the response
  const jsonMatch = text.match(/\{[\s\n]*"type":[\s\n]*"[A-Z_]+".*?\}[\s\n]*$/s);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[0]);
      if (data.type) action = { type: data.type, payload: data.payload };
      if (data.insight) insight = data.insight;
      text = text.replace(jsonMatch[0], '').trim();
    } catch (e) {}
  }

  // Final cleanup of markdown artifacts
  text = text
    .replace(/```json[\s\S]*?```/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`{1,3}/g, '')
    .trim();

  return { cleanText: text, action, insight };
}

export async function sendMessageToGrace(
  history: { role: string; parts: { text: string }[] }[],
  currentInput: string
): Promise<{ text: string; isSafetyResource: boolean; action?: LoopAction; insight?: any }> {
  if (!process.env.API_KEY) {
    return { 
      text: "The Loop is currently disconnected from its creative core. Please ensure the API_KEY environment variable is set in your project settings and the app is redeployed.", 
      isSafetyResource: false 
    };
  }

  const safetyCheck = await checkInputSafetyAndRelevance(currentInput);

  if (!safetyCheck.isSafe) {
    return {
      text: "I hear that you are in pain, and I want you to be safe. You matter. Text HOME to 741741 or call 988. I am here for you, but your safety requires more help than I can give alone.",
      isSafetyResource: true
    };
  }

  if (safetyCheck.isSexualTopic) {
    return {
      text: "I hear you, and it's totally natural to have questions about that. Since my focus is on helping you navigate the orbits of friendship and social signals, I'm not the best one to dive into that topic. I'd really encourage you to share these questions with a trusted friend or an adult you feel safe with—like a parent, teacher, or counselor.",
      isSafetyResource: false
    };
  }

  const ai = getAIClient();
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview', 
      config: {
        systemInstruction: GRACE_SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
      history: history.map(h => ({ 
        role: h.role === 'model' ? 'model' : 'user', 
        parts: h.parts 
      })),
    });

    const result = await chat.sendMessage({ message: currentInput });
    const { cleanText, action, insight } = cleanGraceResponse(result.text || "");

    return {
      text: cleanText,
      isSafetyResource: false,
      action,
      insight
    };
  } catch (error) {
    console.error("Grace Error:", error);
    return { 
      text: "The connection to the stars is flickering. Let's try that again in a moment.", 
      isSafetyResource: false 
    };
  }
}