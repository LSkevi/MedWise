import { generateText, Output } from "ai";
import { z } from "zod";

const interpretationSchema = z.object({
  diseases: z
    .array(
      z.object({
        name: z.string().describe("Official medical disease/condition name"),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe("Confidence level 0-1"),
      }),
    )
    .describe("Possible diseases matching the symptoms, most likely first"),
  summary: z
    .string()
    .describe(
      "Brief explanation of why these conditions were identified, in plain language",
    ),
});

export async function POST(req: Request) {
  const { symptoms }: { symptoms: string } = await req.json();

  if (!symptoms || symptoms.trim().length < 3) {
    return Response.json(
      { error: "Please provide a description of your symptoms" },
      { status: 400 },
    );
  }

  try {
    const { output } = await generateText({
      model: "anthropic/claude-sonnet-4.6",
      output: Output.object({ schema: interpretationSchema }),
      prompt: `You are a medical terminology expert. Given the following patient symptom description in any language, identify the most likely medical conditions/diseases using their official English medical names (as used in medical databases like MeSH/ICD).

Return up to 5 possible conditions, ordered by likelihood. Use standard medical terminology (e.g., "Diabetes Mellitus, Type 2" not "sugar disease", "Hypertension" not "high blood pressure").

Patient description: "${symptoms}"

Important: Map colloquial/lay terms to their proper medical names. Consider the language of the input and translate appropriately.`,
    });

    return Response.json(output);
  } catch (error) {
    console.error("AI interpretation failed:", error);
    return Response.json(
      { error: "Failed to interpret symptoms. Please try searching directly." },
      { status: 500 },
    );
  }
}
