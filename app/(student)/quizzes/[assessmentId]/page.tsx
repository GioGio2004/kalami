"use client";

import { useMutation, useQuery_experimental as useQueryState } from "convex/react";
import type { GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { QuizView } from "@/components/quiz/QuizView";
import type { QuizActions } from "@/components/quiz/types";
import { isUnavailable, NotAvailable } from "@/components/ui/NotAvailable";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";

export default function QuizPage() {
  const params = useParams<{ assessmentId: string }>();
  const assessmentId = params.assessmentId as GenericId<"assessments">;
  // Bumped at the opening time, so a quiz that wasn't open yet is asked for again (see learn.quiz).
  const [refresh, setRefresh] = useState(0);
  // Two subscriptions: the quiz itself (stable during an attempt) and the answers (change on every save).
  // Errors come back as values: something the student can't open gets a calm screen, not the error page.
  const quiz = useQueryState({ query: api.learn.quiz, args: { assessmentId, refresh } });
  const answers = useQueryState({ query: api.learn.quizAnswers, args: { assessmentId } });
  const current = useCurrentUser();
  const start = useMutation(api.learn.startAttempt);
  const saveAnswer = useMutation(api.learn.saveQuizAnswer);
  const saveCode = useMutation(api.learn.saveCodeWork);
  const submit = useMutation(api.learn.submit);
  const report = useMutation(api.learn.reportIntegrityCounts);
  const onOpen = useCallback(() => setRefresh((r) => r + 1), []);

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

  const failed = quiz.status === "error" ? quiz.error : answers.status === "error" ? answers.error : null;
  if (failed !== null) {
    if (isUnavailable(failed)) {
      return (
        <NotAvailable title="This isn't available">
          It may not be published yet, your lecturer may have taken it down, or the link is wrong. If you expected
          to see it here, ask your lecturer.
        </NotAvailable>
      );
    }
    // Anything else is unexpected: the student error page handles it.
    throw failed;
  }
  if (quiz.status !== "success" || answers.status !== "success" || current.status !== "ready") {
    return <LoadingScreen label="Opening" />;
  }
  const name = [current.me.firstName, current.me.lastName].filter(Boolean).join(" ") || current.me.email;
  return (
    <QuizView
      quiz={quiz.data}
      answers={answers.data.answers}
      studentName={name}
      locale={current.me.locale}
      actions={actions}
      onOpen={onOpen}
    />
  );
}
