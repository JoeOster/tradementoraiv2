'use server';

import { queryGemini } from '@/lib/ai-engine';
import { z } from 'zod';

const aiTestSchema = z.object({
  message: z.string(),
});

export async function aiTest() {
  const result = await queryGemini({
    prompt: "Say 'AI connection successful!'",
    schema: aiTestSchema,
    temperature: 0.1,
  });

  if (result.success) {
    return result.data?.message;
  } else {
    return result.error || "Failed to connect to AI.";
  }
}
