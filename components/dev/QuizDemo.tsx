"use client";

import { useMemo, useState } from "react";
import { QuizView } from "@/components/quiz/QuizView";
import type { Quiz, QuizActions, QuizAnswers, SavedValue } from "@/components/quiz/types";

// The quiz player with sample questions and no backend: start, answer, submit,
// see the results. Development only (app/dev/quiz).

type Id<T extends string> = string & { __tableName: T };
const id = <T extends string>(value: string) => value as Id<T>;

const QUESTIONS: Quiz["questions"] = [
  {
    _id: id<"questions">("q1"),
    type: "single",
    prompt: "Which tag makes a **link**?",
    points: 2,
    options: [
      { id: "o1", text: "<a>" },
      { id: "o2", text: "<link>" },
      { id: "o3", text: "<href>" },
    ],
  },
  {
    _id: id<"questions">("q2"),
    type: "multiple",
    prompt: "Which of these are block elements?",
    points: 1,
    options: [
      { id: "o1", text: "<div>" },
      { id: "o2", text: "<span>" },
      { id: "o3", text: "<p>" },
    ],
  },
  { _id: id<"questions">("q3"), type: "short", prompt: "What does `CSS` stand for?", points: 1.5 },
  { _id: id<"questions">("q4"), type: "essay", prompt: "Why do semantic tags like `<nav>` matter? Two or three sentences.", points: 3 },
  {
    _id: id<"questions">("q5"),
    type: "code",
    prompt: "Write your first heading.",
    points: 2,
    code: {
      files: [{ name: "index.html", content: "<h1></h1>\n" }],
      steps: [
        {
          title: "A heading with your name",
          instructions: "Put your first name inside the `<h1>`.",
          checks: [{ id: "s1c1", label: "The h1 has text", type: "text", selector: "h1", contains: "a" }],
        },
      ],
      assets: [],
    },
  },
];

const KEY: Record<string, { correct?: string[]; accepted?: string[] }> = {
  q1: { correct: ["o1"] },
  q2: { correct: ["o1", "o3"] },
  q3: { accepted: ["Cascading Style Sheets"] },
};

function points(questionId: string, value: SavedValue | undefined, max: number): number | undefined {
  const key = KEY[questionId];
  if (key === undefined) return undefined;
  if (value?.type === "single") return key.correct?.includes(value.optionId) ? max : 0;
  if (value?.type === "multiple") {
    const ok = value.optionIds.length === key.correct?.length && value.optionIds.every((o) => key.correct?.includes(o));
    return ok ? max : 0;
  }
  if (value?.type === "short") {
    return key.accepted?.some((a) => a.toLowerCase() === value.text.trim().toLowerCase()) ? max : 0;
  }
  return 0;
}

export function QuizDemo() {
  const [level, setLevel] = useState<Quiz["assessment"]["integrityLevel"]>("standard");
  const [answers, setAnswers] = useState<QuizAnswers>([]);
  const [quiz, setQuiz] = useState<Quiz>(() => ({
    course: { _id: id<"courses">("c1"), title: "HTML & CSS Fundamentals" },
    assessment: {
      _id: id<"assessments">("a1"),
      kind: "quiz",
      title: "Week 1 Quiz: HTML Basics",
      instructions: "Answer every question. Your answers save as you go.",
      state: "open",
      closesAt: undefined,
      timeLimitMin: 5,
      integrityLevel: "standard",
      resultsVisibility: "full_after_close",
      totalPoints: 9.5,
      questionCount: QUESTIONS.length,
      codeQuestionCount: 1,
      attemptsAllowed: 2,
    },
    attemptsUsed: 0,
    attempt: null,
    questions: [],
    review: [],
    comments: [],
    serverNow: Date.now(),
  }));

  const actions: QuizActions = useMemo(
    () => ({
      start: async () => {
        const startedAt = Date.now();
        setAnswers([]);
        setQuiz((q) => ({
          ...q,
          attemptsUsed: q.attemptsUsed + 1,
          attempt: {
            _id: id<"attempts">(`t${q.attemptsUsed + 1}`),
            number: q.attemptsUsed + 1,
            status: "in_progress",
            startedAt,
            deadlineAt: startedAt + (q.assessment.timeLimitMin ?? 5) * 60_000,
            autoSubmitted: false,
            maxScore: q.assessment.totalPoints,
            pendingGrading: false,
          },
          questions: QUESTIONS,
          review: [],
          serverNow: Date.now(),
        }));
      },
      saveAnswer: async (questionId, answer) => {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const savedAt = Date.now();
        setAnswers((a) => [...a.filter((x) => x.questionId !== questionId), { questionId, value: answer, savedAt }]);
        return { savedAt };
      },
      saveCode: async (questionId, files) => {
        const savedAt = Date.now();
        setAnswers((a) => [...a.filter((x) => x.questionId !== questionId), { questionId, value: { type: "code", files }, savedAt }]);
        return { savedAt };
      },
      submit: async () => {
        setQuiz((q) => {
          const review = QUESTIONS.map((question) => {
            const value = answers.find((a) => a.questionId === question._id)?.value;
            return {
              questionId: question._id,
              points: points(question._id, value, question.points),
              correctOptionIds: KEY[question._id]?.correct,
              acceptedAnswers: KEY[question._id]?.accepted,
              explanation: question._id === "q1" ? "<link> connects a stylesheet; <a> is the link people click." : undefined,
            };
          });
          const score = review.reduce((sum, r) => sum + (r.points ?? 0), 0);
          const essay = answers.find((a) => a.questionId === "q4")?.value;
          return {
            ...q,
            assessment: { ...q.assessment, state: "closed" },
            attempt: q.attempt && {
              ...q.attempt,
              status: "submitted",
              submittedAt: Date.now(),
              autoSubmitted: Date.now() >= (q.attempt.deadlineAt ?? Infinity),
              score,
              pendingGrading: essay?.type === "essay" && essay.text.trim() !== "",
            },
            review,
          };
        });
      },
      reportIntegrity: async () => undefined,
    }),
    [answers],
  );

  return (
    <main className="mx-auto w-full max-w-[72rem] px-3 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-graphite">Integrity level:</span>
        {(["off", "standard", "strict"] as const).map((l) => (
          <button
            key={l}
            onClick={() => {
              setLevel(l);
              setQuiz((q) => ({ ...q, assessment: { ...q.assessment, integrityLevel: l } }));
            }}
            className={`rounded-full px-3 py-1 ${level === l ? "bg-ink text-paper" : "bg-panel"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <QuizView quiz={quiz} answers={answers} studentName="Nino Beridze" locale="en" actions={actions} />
    </main>
  );
}
