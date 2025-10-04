# Practice Exam Generator

AI-assisted full-stack web application that transforms your notes or an article URL into exam-style multiple-choice questions. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and shadcn/ui for a polished, responsive interface with dark mode support.

## Features

- Paste raw notes or supply a URL; the server fetches, cleans, and merges content with Readability + JSDOM.
- Generates four-option MCQs using the OpenAI Responses API, including explanations and source spans or a `Beyond-notes` badge when enrichment is allowed.
- Interactive cards let you check answers one at a time or submit all for a score report with progress tracking.
- Configurable subject, difficulty, question count (1–20), and optional “Enrich with Beyond-notes” toggle.
- Rounded-2xl card layout, subtle shadows, micro-animations, and dark mode via `next-themes` + shadcn/ui components.

## Tech Stack

- [Next.js 14 (App Router)](https://nextjs.org/docs/app)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 3.4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [next-themes](https://github.com/pacocoursey/next-themes) for theme switching
- [OpenAI Node SDK](https://www.npmjs.com/package/openai) (`responses.create` API)
- [@mozilla/readability](https://github.com/mozilla/readability) + [jsdom](https://github.com/jsdom/jsdom) for article extraction
- [Zod](https://zod.dev/) for runtime validation

## Prerequisites

- Node.js 18.17+ (or Node 20/22) and npm 9+
- An OpenAI API key with access to a Responses-capable model (e.g. `gpt-4.1-mini`)

## Installation

```bash
npm install
```

If you re-clone or switch branches, run `npm install` again to ensure all dependencies are present.

## Environment Variables

Create a `.env.local` file in the project root (Next.js loads it automatically) and add:

```bash
OPENAI_API_KEY=sk-your-key-here
# Optional: override the default model (gpt-4.1-mini)
# OPENAI_MODEL=gpt-4.1
```

> Never expose your API key to the browser. All OpenAI calls happen server-side in `src/app/api/generate/route.ts`.

## Development

Start the app in development mode:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the generator.

During development you can adjust Tailwind styles in `src/app/globals.css` and the UI logic in `src/app/page.tsx` or components under `src/components`.

## Linting & Quality

```bash
npm run lint
```

`next lint` ensures the codebase conforms to Next.js + TypeScript best practices.

## Production Build

```bash
npm run build
npm run start
```

This creates an optimized production build and serves it locally.

## Project Structure (selected)

```
src/
  app/
    api/generate/route.ts   # Server route: validation, scraping, OpenAI call
    page.tsx                # Main UI and state management
    layout.tsx              # App shell + ThemeProvider
  components/
    question-card.tsx       # Interactive MCQ card
    settings-panel.tsx      # Exam settings sidebar
    ui/                     # shadcn/ui primitives (button, card, etc.)
  lib/
    generation.ts           # OpenAI prompt + parsing helpers
    content.ts              # Text cleanup and truncation
    scrape.ts               # Readability/JSDOM extraction
    openai.ts               # Client and model helpers
    validation.ts           # Shared Zod schema for API payloads
  types/index.ts            # Shared enums and interfaces
```

## OpenAI Usage Overview

`POST /api/generate` accepts JSON payloads with notes/URL/settings, validates them via Zod, optionally scrapes the URL, composes the source text, and calls `openai.responses.create` with a JSON schema response format. The API returns structured MCQs that the client renders into interactive cards.

## Dark Mode & Styling

The app relies on `next-themes` to attach a `class` attribute (`light`/`dark`) to the `<html>` element. Tailwind tokens in `globals.css` update CSS custom properties for an elegant exam-like look in either mode. Animations are implemented via Tailwind’s custom keyframes.

## Deployment Notes

Deploy to any Node-friendly platform (e.g., Vercel). Ensure `OPENAI_API_KEY` (and optional `OPENAI_MODEL`) are configured in the hosting environment’s secrets.

