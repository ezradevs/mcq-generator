import { NextResponse } from "next/server";

import { buildSourceText } from "@/lib/content";
import { generateQuestionsFromSource } from "@/lib/generation";
import { extractReadableText } from "@/lib/scrape";
import { generatePayloadSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = generatePayloadSchema.safeParse(json);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          error: "Invalid request",
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "Server missing OpenAI credentials. Set OPENAI_API_KEY on the server.",
        },
        { status: 500 }
      );
    }

    const { notes, url, subject, difficulty, questionCount, enrichBeyondNotes } =
      parsed.data;

    let urlText: string | undefined;
    let urlTitle: string | undefined;

    if (url) {
      try {
        const article = await extractReadableText(url);
        urlText = article.text;
        urlTitle = article.title;
      } catch {
        return NextResponse.json(
          {
            error: "Unable to extract content from the provided URL.",
          },
          { status: 400 }
        );
      }
    }

    const sourceText = buildSourceText({ notes, urlText, urlTitle });

    if (!sourceText) {
      return NextResponse.json(
        {
          error:
            "Nothing to analyze. Please provide notes or a URL that contains readable text.",
        },
        { status: 400 }
      );
    }

    const questions = await generateQuestionsFromSource({
      sourceText,
      settings: {
        subject,
        difficulty,
        questionCount,
        enrichBeyondNotes,
      },
    });

    return NextResponse.json({
      questions,
      meta: {
        sourceTitle: urlTitle ?? null,
        usedUrl: Boolean(url),
      },
    });
  } catch (error) {
    console.error("/api/generate error", error);
    return NextResponse.json(
      {
        error: "Unexpected error while generating questions.",
      },
      { status: 500 }
    );
  }
}
