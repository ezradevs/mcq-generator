"use client";

import { CheckCircle2, Edit3, HelpCircle, Lightbulb, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnswerOption, MCQQuestion } from "@/types";

interface QuestionCardProps {
  question: MCQQuestion;
  selected?: AnswerOption;
  onSelect: (option: AnswerOption) => void;
  onReveal: () => void;
  isRevealed: boolean;
}

export function QuestionCard({
  question,
  selected,
  onSelect,
  onReveal,
  isRevealed,
}: QuestionCardProps) {
  const isCorrect = selected && selected === question.answer;
  const hasSelection = Boolean(selected);

  return (
    <Card className="group transition-all duration-300 hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="rounded-full text-xs uppercase tracking-wide">
            Question
          </Badge>
          {isRevealed ? (
            <Badge
              variant={isCorrect ? "success" : "destructive"}
              className="flex items-center gap-1"
            >
              {isCorrect ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              {isCorrect ? "Correct" : "Incorrect"}
            </Badge>
          ) : hasSelection ? (
            <Badge variant="muted" className="flex items-center gap-1">
              <Edit3 className="h-3.5 w-3.5" />
              Response saved
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              Awaiting choice
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-semibold leading-relaxed">
          {question.question}
        </CardTitle>
        <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground">
          Select the best answer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selected === option.label;
          const isCorrectAnswer = option.label === question.answer;
          const shouldHighlight = isRevealed && (isCorrectAnswer || isSelected);

          return (
            <Button
              key={option.label}
              type="button"
              variant="outline"
              onClick={() => onSelect(option.label)}
              className={cn(
                "w-full justify-start rounded-xl border-muted bg-card text-left text-sm font-medium transition-all duration-200",
                isSelected && !isRevealed && "border-primary/70 bg-primary/10 text-primary",
                shouldHighlight &&
                  (isCorrectAnswer
                    ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "border-destructive bg-destructive/10 text-destructive"),
                "hover:border-primary/80 hover:bg-primary/10"
              )}
            >
              <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                {option.label}
              </span>
              <span className="leading-relaxed text-sm">{option.text}</span>
            </Button>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-4">
        {isRevealed ? (
          <div className="w-full animate-fade-in rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Explanation
            </div>
            <p className="mt-2 text-muted-foreground">{question.explanation}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Source span:</span>{" "}
              {question.sourceSpan === "Beyond-notes" ? (
                <Badge variant="secondary" className="ml-1">
                  Beyond-notes
                </Badge>
              ) : (
                <q className="ml-1 italic">{question.sourceSpan}</q>
              )}
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              className="flex-1 rounded-full"
              onClick={onReveal}
              disabled={!hasSelection}
            >
              Check answer
            </Button>
            {!hasSelection && (
              <p className="text-xs text-muted-foreground">Choose an option to enable checking.</p>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
