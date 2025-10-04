"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BrainCircuit,
  ClipboardList,
  FileText,
  Link2,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { QuestionCard } from "@/components/question-card";
import { SettingsPanel } from "@/components/settings-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AnswerOption, Difficulty, MCQQuestion, Subject } from "@/types";

const DEFAULT_SUBJECT: Subject = "Software Engineering";
const DEFAULT_DIFFICULTY: Difficulty = "Mixed";

export default function HomePage() {
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState("");
  const [subject, setSubject] = useState<Subject>(DEFAULT_SUBJECT);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [questionCount, setQuestionCount] = useState<number>(8);
  const [enrichBeyondNotes, setEnrichBeyondNotes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, AnswerOption | undefined>>({});
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});
  const [showScorecard, setShowScorecard] = useState(false);
  const [meta, setMeta] = useState<{ sourceTitle: string | null; usedUrl: boolean }>({
    sourceTitle: null,
    usedUrl: false,
  });

  const answeredCount = useMemo(
    () => questions.reduce((count, question) => (selectedAnswers[question.id] ? count + 1 : count), 0),
    [questions, selectedAnswers]
  );

  const correctCount = useMemo(
    () =>
      questions.reduce(
        (count, question) => (selectedAnswers[question.id] === question.answer ? count + 1 : count),
        0
      ),
    [questions, selectedAnswers]
  );

  const unansweredCount = Math.max(questions.length - answeredCount, 0);
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  async function handleGenerate(event: FormEvent) {
    event.preventDefault();
    setIsGenerating(true);
    setStatusMessage(null);
    setShowScorecard(false);
    setRevealedMap({});
    setSelectedAnswers({});
    setMeta({ sourceTitle: null, usedUrl: false });

    const payload = {
      notes: notes.trim(),
      url: url.trim(),
      subject,
      difficulty,
      questionCount,
      enrichBeyondNotes,
    };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(data?.error ?? "Unable to generate questions. Try adjusting your input.");
        setQuestions([]);
        return;
      }

      setQuestions(data.questions ?? []);
      setMeta({
        sourceTitle: data.meta?.sourceTitle ?? null,
        usedUrl: Boolean(data.meta?.usedUrl),
      });
    } catch {
      setStatusMessage("Unexpected error while generating questions. Please try again.");
      setQuestions([]);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSelect(questionId: string, option: AnswerOption) {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  }

  function handleReveal(questionId: string) {
    setRevealedMap((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  }

  function handleSubmitAll() {
    const updated: Record<string, boolean> = {};
    questions.forEach((question) => {
      updated[question.id] = true;
    });
    setRevealedMap(updated);
    setShowScorecard(true);
  }

  function handleReset() {
    setQuestions([]);
    setSelectedAnswers({});
    setRevealedMap({});
    setStatusMessage(null);
    setShowScorecard(false);
    setMeta({ sourceTitle: null, usedUrl: false });
  }

  const canSubmitAll = questions.length > 0 && answeredCount > 0;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold">Practice Exam Generator</h1>
              <p className="text-sm text-muted-foreground">
                Paste your notes or link an article. Craft exam-ready MCQs in seconds.
              </p>
            </div>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="container flex-1 pb-16 pt-10">
        <form
          onSubmit={handleGenerate}
          className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"
        >
          <div className="space-y-8">
            <Card className="overflow-hidden border-none bg-gradient-to-br from-card to-card/80 shadow-lg ring-1 ring-border/50">
              <CardHeader className="space-y-2 bg-muted/30 py-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Study Material
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Paste your notes or provide a URL. If both are supplied, the generator will use them together.
                </p>
              </CardHeader>
              <CardContent className="space-y-6 py-6">
                <div className="space-y-2">
                  <LabelledTextarea
                    label="Notes"
                    description="Paste lecture notes, textbook highlights, or summaries."
                    value={notes}
                    onChange={(value) => setNotes(value)}
                  />
                </div>
                <Separator className="my-2" />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground" htmlFor="source-url">
                    <Link2 className="h-4 w-4" />
                    Optional URL
                  </label>
                  <Input
                    id="source-url"
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    We fetch the page, clean it with Readability, and blend it into your notes.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Crafted for exam-style mastery.
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="ghost" onClick={handleReset} disabled={isGenerating && questions.length === 0}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button type="submit" className="rounded-full px-6" disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
                      </>
                    ) : (
                      <>
                        <ClipboardList className="mr-2 h-4 w-4" /> Generate Questions
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {statusMessage && (
              <Card className="border-destructive/40 bg-destructive/10 text-destructive">
                <CardContent className="py-4 text-sm">{statusMessage}</CardContent>
              </Card>
            )}

            {questions.length > 0 ? (
              <section className="space-y-6">
                <header className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Generated Questions</h2>
                    <p className="text-sm text-muted-foreground">
                      {meta.usedUrl && meta.sourceTitle
                        ? `Blended from your notes and \"${meta.sourceTitle}\"`
                        : meta.usedUrl
                        ? "Generated from the provided URL"
                        : "Generated from your notes"}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span className="font-semibold text-foreground">Progress:</span>
                      {answeredCount}/{questions.length} answered
                    </div>
                    <div className="w-full min-w-[160px] sm:w-48">
                      <Progress value={progress} />
                    </div>
                  </div>
                </header>

                {showScorecard && (
                  <Card className="animate-fade-in border-primary/40 bg-primary/10">
                    <CardContent className="flex flex-col gap-2 py-4 text-sm">
                      <span className="text-base font-semibold text-primary">
                        Score: {correctCount} / {questions.length}
                      </span>
                      {unansweredCount > 0 ? (
                        <span className="text-muted-foreground">
                          {unansweredCount} question{unansweredCount === 1 ? "" : "s"} left unanswered. Review the explanations below to close the gaps.
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Review each explanation below to lock in the learning.
                        </span>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-6">
                  {questions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      selected={selectedAnswers[question.id]}
                      onSelect={(option) => handleSelect(question.id, option)}
                      onReveal={() => handleReveal(question.id)}
                      isRevealed={Boolean(revealedMap[question.id])}
                    />
                  ))}
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {answeredCount === questions.length
                      ? "All questions answered. Reveal your score when ready."
                      : `${unansweredCount} question${unansweredCount === 1 ? "" : "s"} left unanswered. You can still reveal the report.`}
                  </div>
                  <Button
                    type="button"
                    className="rounded-full"
                    onClick={handleSubmitAll}
                    disabled={!canSubmitAll}
                  >
                    Reveal Score Report
                  </Button>
                </footer>
              </section>
            ) : (
              <EmptyState />
            )}
          </div>

          <SettingsPanel
            subject={subject}
            onSubjectChange={setSubject}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            questionCount={questionCount}
            onQuestionCountChange={setQuestionCount}
            enrichBeyondNotes={enrichBeyondNotes}
            onToggleEnrich={setEnrichBeyondNotes}
          />
        </form>
      </main>
    </div>
  );
}

interface LabelledTextareaProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
}

function LabelledTextarea({ label, description, value, onChange }: LabelledTextareaProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground" htmlFor="notes">
        <span>{label}</span>
      </label>
      <Textarea
        id="notes"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write or paste the material you want turned into exam questions."
        className="min-h-[220px] rounded-3xl border-muted px-4 py-3 text-sm"
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="animate-fade-in border-dashed bg-card/60 py-16 text-center">
      <CardContent className="mx-auto flex max-w-md flex-col items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </span>
        <CardTitle className="text-xl">Ready to craft your practice exam</CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste your notes or share a link, adjust the settings, and tap Generate Questions. Each question comes with rich explanations and citation spans.
        </p>
      </CardContent>
    </Card>
  );
}
