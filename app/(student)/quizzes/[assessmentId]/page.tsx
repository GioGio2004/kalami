"use client";

import { useMutation, useQuery } from "convex/react";
import type { GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { QuizView } from "@/components/quiz/QuizView";
import type { QuizActions } from "@/components/quiz/types";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";

export default function QuizPage() {
  const params = useParams<{ assessmentId: string }>();
  const assessmentId = params.assessmentId as GenericId<"assessments">;
  const quiz = useQuery(api.learn.quiz, { assessmentId });
  const current = useCurrentUser();
  const start = useMutation(api.learn.startAttempt);
  const saveAnswer = useMutation(api.learn.saveQuizAnswer);
  const saveCode = useMutation(api.learn.saveCodeWork);
  const submit = useMutation(api.learn.submit);
  const report = useMutation(api.learn.reportIntegrityCounts);

  const actions: QuizActions = useMemo(
    () => ({
      start: () => start({ assessmentId }),
      saveAnswer: (questionId, answer) => saveAnswer({ assessmentId, questionId, answer }),
      saveCode: (questionId, files) => saveCode({ assessmentId, questionId, files }),
      submit: () => submit({ assessmentId }),
      reportIntegrity: (counts) => report({ assessmentId, counts }),
    }),
    [assessmentId, start, saveAnswer, saveCode, submit, report],
  );

  if (quiz === undefined || current.status !== "ready") {
    return <LoadingScreen label="Opening" />;
  }
  const name = [current.me.firstName, current.me.lastName].filter(Boolean).join(" ") || current.me.email;
  return <QuizView quiz={quiz} studentName={name} locale={current.me.locale} actions={actions} />;
}
