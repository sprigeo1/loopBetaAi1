
// Always use process.env.API_KEY directly for initialization
import { GoogleGenAI, Type } from "@google/genai";
import { GRACE_SYSTEM_INSTRUCTION, SAFETY_CHECK_PROMPT } from "../constants";
import { LoopAction } from "../types";

// Defensive check for process to prevent crash in environments without node polyfills
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

interface SafetyCheckResult {
  isSafe: boolean;
  isRelevant: boolean;
  isSexualTopic?: boolean;
}

async function checkInputSafetyAndRelevance(input: string): Promise<SafetyCheckResult> {
  const apiKey = getApiKey();
  if (!apiKey) return { isSafe: true, isRelevant: true };

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
    return { isSafe: true, isRelevant: true };
  }
}

/**
 * Hardened JSON extraction.
 * Ensures internal control signals NEVER appear to the user.
 */
function cleanGraceResponse(rawText: string): { cleanText: string; action?: LoopAction; insight?: any } {
  let text = rawText;
  let action: LoopAction | undefined;
  let insight: any | undefined;

  // 1. Regex to find any JSON-like structures at the end of the text
  const jsonMatch = text.match(/\{[\s\n]*"type":[\s\n]*"[A-Z_]+".*?\}[\s\n]*$/s);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[0]);
      if (data.type) action = { type: data.type, payload: data.payload };
      if (data.insight) insight = data.insight;
      text = text.replace(jsonMatch[0], '').trim();
    } catch (e) {
      // If it fails to parse, it might be partial.
    }
  }

  // 2. Extra safety: Strip anything following triple newlines if it looks like JSON
  const parts = text.split('\n\n\n');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    if (lastPart.startsWith('{') && lastPart.endsWith('}')) {
      try {
        if (!action) {
            const data = JSON.parse(lastPart);
            if (data.type) action = { type: data.type, payload: data.payload };
        }
        text = parts.slice(0, -1).join('\n\n\n').trim();
      } catch (e) {}
    }
  }

  // 3. Final sanitization: Remove all backticks and explicit code blocks
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
  const apiKey = getApiKey();
  if (!apiKey) {
    return { text: "Connection to the stars is currently offline. Please ensure your API key is set.", isSafetyResource: false };
  }

  const safetyCheck = await checkInputSafetyAndRelevance(currentInput);

  if (!safetyCheck.isSafe) {
    return {
      text: "I hear that you are in pain, and I want you to be safe. You matter. Text HOME to 741741 or call 988. I am here for you, but your safety requires more help than I can give alone.",
      isSafetyResource: true
    };
  }

  // Specific guardrail for sexual topics
  if (safetyCheck.isSexualTopic) {
    return {
      text: "I hear you, and it's totally natural to have questions about that. Since my focus is on helping you navigate the orbits of friendship and social signals, I'm not the best one to dive into that topic. I'd really encourage you to share these questions with a trusted friend or an adult you feel safe with—like a parent, teacher, or counselor.",
      isSafetyResource: false
    };
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview', 
      config: {
        systemInstruction: GRACE_SYSTEM_INSTRUCTION,
        temperature: 0.8,
      },
      history: history.map(h => ({ role: h.role, parts: h.parts })),
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
    return { text: "The stars are a bit fuzzy right now. Let's try that again in a heartbeat.", isSafetyResource: false };
  }
}