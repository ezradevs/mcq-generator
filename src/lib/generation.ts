import { randomUUID } from "crypto";
import { z } from "zod";

import { AnswerOption, GenerationSettings, MCQQuestion } from "@/types";
import { getModel, getOpenAIClient } from "@/lib/openai";

const aiResponseSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(8),
        options: z.object({
          A: z.string().min(1),
          B: z.string().min(1),
          C: z.string().min(1),
          D: z.string().min(1),
        }),
        answer: z.union([
          z.literal("A"),
          z.literal("B"),
          z.literal("C"),
          z.literal("D"),
        ]),
        explanation: z.string().min(4),
        sourceSpan: z.string().min(3),
      })
    )
    .min(1),
});

function buildSystemPrompt(settings: GenerationSettings) {
  return `You are an expert exam author creating high-quality multiple choice questions.
Each question must be challenging yet fair, unambiguous, and aligned with the provided material.
Use only the subject matter expertise relevant to "${settings.subject}" and match the requested difficulty (${settings.difficulty}).`;
}

function buildUserPrompt({
  sourceText,
  settings,
}: {
  sourceText: string;
  settings: GenerationSettings;
}) {
  const beyondNotesHint = settings.enrichBeyondNotes
    ? "When necessary to create rigorous questions, you may use reliable domain knowledge beyond the supplied text. For any question that relies on enrichment, set sourceSpan to \"Beyond-notes\"."
    : "Do not invent content beyond what is provided. Every answer must be justified by the supplied text. sourceSpan must quote the exact short phrase (<= 140 characters) from the supplied text that supports the answer.";

  return `Write exactly ${settings.questionCount} multiple-choice questions using the supplied material.
Requirements:
- Each question has four options labelled A-D with only one correct answer.
- Provide a concise explanation (max 45 words) for the correct answer.
- Include a sourceSpan string. Quote a phrase (<= 140 characters) that justifies the answer. ${settings.enrichBeyondNotes ? "If enrichment was required, use the literal string \"Beyond-notes\"." : "Never use Beyond-notes."}
- Vary cognitive level and phrasing. Avoid true/false, avoid trivial recall.
- No duplicate questions. Avoid answer leakage (options giving away the answer).
${beyondNotesHint}

Context to analyze:
"""
${sourceText}
"""`;
}

export async function generateQuestionsFromSource({
  sourceText,
  settings,
}: {
  sourceText: string;
  settings: GenerationSettings;
}): Promise<MCQQuestion[]> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: getModel(),
    temperature: 0.7,
    max_output_tokens: Math.max(800, settings.questionCount * 180),
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: buildSystemPrompt(settings) }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: buildUserPrompt({ sourceText, settings }) }],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "mcq_response",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            questions: {
              type: "array",
              minItems: settings.questionCount,
              maxItems: settings.questionCount,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      A: { type: "string" },
                      B: { type: "string" },
                      C: { type: "string" },
                      D: { type: "string" },
                    },
                    required: ["A", "B", "C", "D"],
                  },
                  answer: {
                    type: "string",
                    enum: ["A", "B", "C", "D"],
                  },
                  explanation: { type: "string" },
                  sourceSpan: { type: "string" },
                },
                required: [
                  "question",
                  "options",
                  "answer",
                  "explanation",
                  "sourceSpan",
                ],
              },
            },
          },
          required: ["questions"],
        },
        strict: true,
      },
    },
  });

  const outputText = response.output_text;
  if (!outputText) {
    throw new Error("No response from OpenAI");
  }

  const parsed = aiResponseSchema.safeParse(JSON.parse(outputText));
  if (!parsed.success) {
    throw new Error("Failed to parse questions from OpenAI response");
  }

  const optionOrder: AnswerOption[] = ["A", "B", "C", "D"];

  return parsed.data.questions.map((question) => ({
    id: randomUUID(),
    question: question.question.trim(),
    options: optionOrder.map((label) => ({
      label,
      text: question.options[label].trim(),
    })),
    answer: question.answer,
    explanation: question.explanation.trim(),
    sourceSpan: question.sourceSpan.trim(),
  }));
}
