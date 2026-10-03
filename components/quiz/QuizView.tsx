"use client";

import { QuizCover } from "./QuizCover";
import { QuizPlayer } from "./QuizPlayer";
import type { Quiz, QuizActions } from "./types";

/** A quiz, midterm or final: the start screen, the attempt in progress, or the results. */
export function QuizView({
  quiz,
  studentName,
  locale,
  actions,
}: {
  quiz: Quiz;
  studentName: string;
  locale: "ka" | "en";
  actions: QuizActions;
}) {
  if (quiz.attempt?.status === "in_progress") {
    // Keyed by attempt, so a second try starts with fresh local state.
    return <QuizPlayer key={quiz.attempt._id} quiz={quiz} studentName={studentName} locale={locale} actions={actions} />;
  }
  return <QuizCover quiz={quiz} onStart={actions.start} />;
}
