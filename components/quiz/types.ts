import type { FunctionArgs, FunctionReturnType } from "convex/server";
import type { Counts } from "@/components/integrity/useIntegrity";
import type { CodeFile } from "@/components/sandbox/types";
import type { api } from "@/convex-api/api";

// Shapes the quiz player works with, derived from the backend so they can't drift.

export type Quiz = FunctionReturnType<typeof api.learn.quiz>;
export type QuizQuestion = Quiz["questions"][number];
export type QuestionId = QuizQuestion["_id"];
/** The saved answers, kept apart from the quiz so an autosave doesn't re-send the questions. */
export type QuizAnswers = FunctionReturnType<typeof api.learn.quizAnswers>["answers"];
/** What the student saved, code included. */
export type SavedValue = QuizAnswers[number]["value"];
/** What the quiz player sends for every type except code. */
export type Answer = FunctionArgs<typeof api.learn.saveQuizAnswer>["answer"];

/** The backend calls the player needs; the page wires them to Convex, the dev demo to local state. */
export type QuizActions = {
  start: () => Promise<unknown>;
  saveAnswer: (questionId: QuestionId, answer: Answer) => Promise<{ savedAt: number }>;
  saveCode: (questionId: QuestionId, files: CodeFile[]) => Promise<{ savedAt: number }>;
  submit: () => Promise<unknown>;
  reportIntegrity: (counts: Counts) => Promise<unknown>;
};

export const KIND_LABEL: Record<Quiz["assessment"]["kind"], string> = {
  task: "Task",
  quiz: "Quiz",
  midterm: "Midterm",
  final: "Final exam",
};

/** Whether a saved value counts as answered. */
export function isAnswered(value: SavedValue | undefined): boolean {
  if (value === undefined) return false;
  switch (value.type) {
    case "single":
      return true;
    case "multiple":
      return value.optionIds.length > 0;
    case "short":
    case "essay":
      return value.text.trim() !== "";
    case "code":
      return true;
  }
}

export function formatWhen(ms: number): string {
  return new Date(ms).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
