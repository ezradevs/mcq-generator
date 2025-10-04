import { z } from "zod";

import { DIFFICULTIES, SUBJECTS } from "@/types";

const subjectEnum = z.enum(SUBJECTS);
const difficultyEnum = z.enum(DIFFICULTIES);

export const generatePayloadSchema = z
  .object({
    notes: z.preprocess(
      (value) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
      },
      z
        .string()
        .max(8000, "Notes are too long (max 8000 characters)")
        .optional()
    ),
    url: z.preprocess(
      (value) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
      },
      z
        .string()
        .url("Enter a valid URL")
        .optional()
    ),
    subject: subjectEnum,
    difficulty: difficultyEnum,
    questionCount: z
      .number({ invalid_type_error: "Number of questions must be a number" })
      .int()
      .min(1)
      .max(20),
    enrichBeyondNotes: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.notes && !data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide notes or a source URL",
        path: ["notes"],
      });
    }
  });

export type GeneratePayload = z.infer<typeof generatePayloadSchema>;
