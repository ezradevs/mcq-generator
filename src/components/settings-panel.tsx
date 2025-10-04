"use client";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DIFFICULTIES, SUBJECTS, Difficulty, Subject } from "@/types";

interface SettingsPanelProps {
  subject: Subject;
  onSubjectChange: (subject: Subject) => void;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  enrichBeyondNotes: boolean;
  onToggleEnrich: (value: boolean) => void;
}

export function SettingsPanel({
  subject,
  onSubjectChange,
  difficulty,
  onDifficultyChange,
  questionCount,
  onQuestionCountChange,
  enrichBeyondNotes,
  onToggleEnrich,
}: SettingsPanelProps) {
  return (
    <Card className="sticky top-24 space-y-4">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-lg">
          Exam Settings
          <Badge variant="secondary" className="rounded-full">
            Fine-tuned control
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select value={subject} onValueChange={(value) => onSubjectChange(value as Subject)}>
            <SelectTrigger id="subject">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(value) => onDifficultyChange(value as Difficulty)}
          >
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-count">Number of questions</Label>
          <Input
            id="question-count"
            type="number"
            min={1}
            max={20}
            value={questionCount}
            onChange={(event) =>
              onQuestionCountChange(
                Math.min(20, Math.max(1, Number(event.target.value) || 1))
              )
            }
          />
          <p className="text-xs text-muted-foreground">
            Between 1 and 20 questions per session.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-dashed px-4 py-3">
          <div>
            <p className="text-sm font-medium">Enrich with Beyond-notes</p>
            <p className="text-xs text-muted-foreground">
              Allow the model to add carefully sourced context when needed.
            </p>
          </div>
          <Switch
            checked={enrichBeyondNotes}
            onCheckedChange={onToggleEnrich}
            aria-label="Toggle enrichment"
          />
        </div>

        {enrichBeyondNotes ? (
          <Badge variant="muted" className="inline-flex items-center gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            Explanations may cite Beyond-notes when expanding concepts.
          </Badge>
        ) : (
          <p className="text-xs text-muted-foreground">
            Explanations will always cite the exact phrase from your material.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
