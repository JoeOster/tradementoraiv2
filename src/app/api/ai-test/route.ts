import { NextResponse } from 'next/server';
import { z } from 'zod';
import { queryGemini } from '../../../lib/ai-engine';

const cmykSchema = z.object({
  c: z.number().min(0).max(100),
  m: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  k: z.number().min(0).max(100),
});

export async function GET() {
  try {
    const basePrompt = `You are a strict formatter. Provide the CMYK percentages (0-100) for the color \"blue\" (hex #0000FF).`;
    const strictInstructions = 'RETURN ONLY A JSON OBJECT AND NOTHING ELSE. EXACT FORM: {"c": number, "m": number, "y": number, "k": number}. Do not include any explanation, markdown, or code fences.';

    const prompts = [
      `${basePrompt} ${strictInstructions}`,
      // fallback: even stricter, request a bare JSON and remind about numbers
      `${basePrompt} ${strictInstructions} If you are unable to produce JSON, respond with an empty object {}.`,
    ];

    let lastResult: any = null;
    for (let i = 0; i < prompts.length; i++) {
      lastResult = await queryGemini({ prompt: prompts[i], schema: cmykSchema, temperature: 0.0 });
      if (lastResult.success) break;
      // if error isn't JSON-related, stop retrying
      if (!/json|JSON|non-JSON|invalid JSON|Unexpected end of JSON/i.test(String(lastResult.error || ''))) break;
    }

    if (!lastResult || !lastResult.success) {
      return NextResponse.json({ success: false, error: lastResult?.error || 'AI error' }, { status: 502 });
    }

    return NextResponse.json({ success: true, data: lastResult.data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
