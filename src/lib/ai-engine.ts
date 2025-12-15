import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// --- Configuration ---
const API_KEY = process.env.GOOGLE_GENAI_API_KEY;
if (!API_KEY) {
  // Warn but don't crash the build if the key is missing during build time
  if (process.env.NODE_ENV !== 'production') {
      console.warn("Missing GOOGLE_GENAI_API_KEY in environment variables.");
  }
}

// Create the Google provider instance
const google = createGoogleGenerativeAI({
  apiKey: API_KEY || "", // Fallback to empty string if key is missing to prevent init crash
});

// Define available models to prevent typos
export const AI_MODELS = {
  FLASH: 'gemini-1.5-flash', // Fast, good for simple extraction/summaries
  PRO: 'gemini-1.5-pro',     // Smart, good for complex strategy analysis
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

interface AIRequestOptions<T> {
  model?: AIModel;           // Default: FLASH
  system?: string;           // "You are a senior trading mentor..."
  prompt: string;            // "Analyze this trade..."
  schema: z.Schema<T>;       // Zod schema for the expected output
  temperature?: number;      // 0.0 (strict) to 1.0 (creative)
}

interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isRateLimit?: boolean;
}

/**
 * The Robust Gemini Query Tool.
 * Wraps the Vercel AI SDK to provide consistent, type-safe responses.
 */
export async function queryGemini<T>(options: AIRequestOptions<T>): Promise<AIResponse<T>> {
  if (!API_KEY) {
      return {
          success: false,
          error: "API Key is missing. Please check your environment variables."
      };
  }

  try {
    const modelId = options.model || AI_MODELS.FLASH;
    
    // The Magic: generateObject forces Gemini to output JSON matching your schema
    const result = await generateObject({
      model: google(modelId),
      system: options.system || "You are a helpful AI assistant.",
      prompt: options.prompt,
      schema: options.schema,
      temperature: options.temperature ?? 0.7, // Default to balanced creativity
    });

    return {
      success: true,
      data: result.object, // This is fully typed as T!
    };

  } catch (error: any) {
    console.error("AI Engine Failure:", error);

    // Robust Error Handling
    let errorMessage = "An unexpected error occurred while contacting the AI.";
    let isRateLimit = false;

    if (error.message) {
      if (error.message.includes("429") || error.message.includes("Resource has been exhausted")) {
        errorMessage = "System is currently overloaded (Rate Limit). Please try again in a moment.";
        isRateLimit = true;
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
      isRateLimit,
    };
  }
}