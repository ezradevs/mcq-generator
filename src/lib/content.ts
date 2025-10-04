const MAX_INPUT_LENGTH = 12000;

export function normalizeWhitespace(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

export function truncateText(text: string, maxLength = MAX_INPUT_LENGTH) {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSentence = truncated.lastIndexOf(".");
  const cutIndex = lastSentence > maxLength * 0.6 ? lastSentence + 1 : truncated.lastIndexOf(" ");
  return `${truncated.slice(0, Math.max(cutIndex, maxLength * 0.8))}…`;
}

export function buildSourceText({
  notes,
  urlText,
  urlTitle,
}: {
  notes?: string;
  urlText?: string;
  urlTitle?: string;
}) {
  const cleanedNotes = notes ? normalizeWhitespace(notes) : "";
  const cleanedUrlText = urlText ? normalizeWhitespace(urlText) : "";

  const combined = [
    cleanedNotes && `NOTES:\n${cleanedNotes}`,
    cleanedUrlText && `SOURCE (${urlTitle ?? "URL"}):\n${cleanedUrlText}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return truncateText(combined);
}

export function ensureHasContent(notes?: string, urlText?: string) {
  if (!notes && !urlText) {
    throw new Error("Provide notes text or a URL to generate questions.");
  }
}
