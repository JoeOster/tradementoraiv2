import { NextResponse } from 'next/server';
import { queryGemini } from '@/lib/ai-engine';
import { z } from 'zod';

// Define the schema for the expected CMYK output
const cmykSchema = z.object({
  cyan: z.number().describe("The Cyan value of the CMYK color, from 0 to 100."),
  magenta: z.number().describe("The Magenta value of the CMYK color, from 0 to 100."),
  yellow: z.number().describe("The Yellow value of the CMYK color, from 0 to 100."),
  key: z.number().describe("The Key (Black) value of the CMYK color, from 0 to 100."),
});

export async function GET() {
  try {
    const result = await queryGemini({
      prompt: "What is the CMYK color for Red? Provide only the CMYK values.",
      schema: cmykSchema,
      temperature: 0.1, // Keep it precise for color values
    });

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.error, isRateLimit: result.isRateLimit }, { status: 500 });
    }
  } catch (error: any) {
    console.error("AI Test API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}
