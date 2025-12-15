import { z } from 'zod';

// --- Configuration ---
const API_KEY = process.env.GOOGLE_GENAI_API_KEY;
if (!API_KEY) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Missing GOOGLE_GENAI_API_KEY in environment variables.');
  }
}

// Default model mapping (uses Google's Generative Language models)
export const AI_MODELS = {
  FLASH: 'models/text-bison-001',
  PRO: 'models/text-bison-001',
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

interface AIRequestOptions<T> {
  model?: AIModel | string;
  system?: string;
  prompt: string;
  schema: z.Schema<T>;
  temperature?: number;
}

interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isRateLimit?: boolean;
}

/**
 * Query Google Generative Language and validate JSON output with Zod.
 */
export async function queryGemini<T>(options: AIRequestOptions<T>): Promise<AIResponse<T>> {
  if (!API_KEY) {
    return { success: false, error: 'API Key is missing. Please set GOOGLE_GENAI_API_KEY.' };
  }

  try {
    const modelId = (options.model as string) || AI_MODELS.FLASH;

    // Prepare container for model text
    let text = '';

    // If an API key is present, call the REST endpoint directly using the key
    if (API_KEY) {
      const shortModel = modelId.replace(/^models\//, '');
      const url = `https://generativelanguage.googleapis.com/v1beta2/models/${shortModel}:generateText?key=${API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: { text: options.prompt }, temperature: options.temperature ?? 0.0 }),
      });
      const data = await res.json();
      text = (
        data?.candidates?.[0]?.content?.map((c: any) => c.text).join('') ||
        data?.candidates?.[0]?.output ||
        data?.candidates?.[0]?.content?.[0]?.text ||
        ''
      ).toString();

    }

    // Attempt to parse JSON from the model output
    try {
      const parsed = JSON.parse(text);
      const validated = options.schema.parse(parsed);
      return { success: true, data: validated };
    } catch (jsonErr: any) {
      return { success: false, error: 'AI returned non-JSON or invalid JSON: ' + (jsonErr.message || String(jsonErr)) };
    }
  } catch (err: any) {
    console.error('AI Engine Failure:', err);
    let message = 'An unexpected error occurred while contacting the AI.';
    if (err?.message) {
      if (err.message.includes('429') || err.message.includes('Resource has been exhausted')) {
        message = 'System is currently overloaded (Rate Limit). Please try again later.';
        return { success: false, error: message, isRateLimit: true };
      }
      message = err.message;
    }
    return { success: false, error: message };
  }
}
 