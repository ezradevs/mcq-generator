export const SUBJECTS = [
  "Software Engineering",
  "Chemistry",
  "Biology",
  "Mathematics",
  "General",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const DIFFICULTIES = ["Mixed", "Easy", "Medium", "Hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export type AnswerOption = "A" | "B" | "C" | "D";

export interface MCQOption {
  label: AnswerOption;
  text: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  answer: AnswerOption;
  explanation: string;
  sourceSpan: string;
}

export interface GenerationSettings {
  subject: Subject;
  difficulty: Difficulty;
  questionCount: number;
  enrichBeyondNotes: boolean;
}
