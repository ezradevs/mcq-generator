import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

import { normalizeWhitespace, truncateText } from "@/lib/content";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function extractReadableText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const textContent = article?.textContent ?? dom.window.document.body?.textContent ?? "";
  const title = article?.title ?? dom.window.document.title ?? undefined;

  return {
    title,
    text: truncateText(normalizeWhitespace(textContent)),
  };
}
