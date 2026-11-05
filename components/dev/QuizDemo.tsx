"use client";

import { useMemo, useState } from "react";
import { QuizView } from "@/components/quiz/QuizView";
import { runChecks, type CheckRule } from "@/lib/checks";
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
    prompt: "Make the **Start** button feel alive.",
    points: 4,
    code: {
      files: [
        {
          name: "index.html",
          content: '<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <button class="btn">Start</button>\n</body>\n</html>\n',
        },
        { name: "style.css", content: ".btn {\n\n}\n" },
      ],
      steps: [
        {
          title: "Style the button",
          instructions: "Give `.btn` a lime background (`#c6f432`) and fully round corners (`border-radius: 999px`).",
          hint: "Two declarations inside `.btn { }`.",
          checks: [
            { id: "s1c1", label: "The button is lime", type: "css", selector: ".btn", property: "background-color", equals: "#c6f432" },
            { id: "s1c2", label: "The corners are round", type: "css", selector: ".btn", property: "border-radius", equals: "999px" },
          ],
        },
        {
          title: "React to the mouse",
          instructions: "On `:hover` the button turns black, and `transition` makes the colour change take 0.3s.",
          checks: [
            { id: "s2c1", label: "Hovered, the button is black", type: "css", selector: ".btn:hover", property: "background-color", equals: "black" },
            { id: "s2c2", label: "The colour change takes 0.3s", type: "css", selector: ".btn", property: "transition-duration", equals: "0.3s" },
          ],
        },
        {
          title: "Make it pulse",
          instructions: "Write `@keyframes pulse` that scales the button up a little, and run it on `.btn` forever.",
          checks: [
            { id: "s3c1", label: "@keyframes pulse changes transform", type: "keyframes", name: "pulse", property: "transform" },
            { id: "s3c2", label: "The button runs the animation", type: "animation", selector: ".btn", property: "transform" },
          ],
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

/** The demo grades code in the browser, the way the server would. */
function codeChecks(rules: CheckRule[], value: SavedValue | undefined) {
  const files = value?.type === "code" ? value.files : [];
  const results = new Map(runChecks(files, rules).map((r) => [r.id, r.passed]));
  return rules.map((rule) => ({ id: rule.id, label: rule.label, passed: results.get(rule.id) ?? false, hidden: false }));
}

function points(questionId: string, value: SavedValue | undefined, max: number): number | undefined {
  const code = QUESTIONS.find((q) => q._id === questionId)?.code;
  if (code) {
    const checks = codeChecks(code.steps.flatMap((s) => s.checks), value);
    return Math.round((max * checks.filter((c) => c.passed).length * 100) / checks.length) / 100;
  }
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
      totalPoints: 11.5,
      questionCount: QUESTIONS.length,
      codeQuestionCount: 1,
      attemptsAllowed: 2,
      codeChecks: "live",
      codeHelp: true,
      codeAutoClose: false,
      codeSuggest: false,
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
              checks: question.code ? codeChecks(question.code.steps.flatMap((s) => s.checks), value) : undefined,
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
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-graphite">Kind:</span>
        {(["quiz", "midterm"] as const).map((kind) => (
          <button
            key={kind}
            onClick={() =>
              setQuiz((q) => ({
                ...q,
                assessment: {
                  ...q.assessment,
                  kind,
                  title: kind === "midterm" ? "Midterm: An animated button" : "Week 1 Quiz: HTML Basics",
                  codeChecks: kind === "midterm" ? "on_submit" : "live",
                  codeHelp: kind !== "midterm",
                },
              }))
            }
            className={`rounded-full px-3 py-1 ${quiz.assessment.kind === kind ? "bg-ink text-paper" : "bg-panel"}`}
          >
            {kind === "midterm" ? "midterm (checks on submit, no help)" : "quiz (live checks)"}
          </button>
        ))}
        <button
          onClick={() =>
            setQuiz((q) => ({
              ...q,
              assessment: { ...q.assessment, state: "upcoming", opensAt: Date.now() + 15_000 },
              serverNow: Date.now(),
            }))
          }
          className={`rounded-full px-3 py-1 ${quiz.assessment.state === "upcoming" ? "bg-ink text-paper" : "bg-panel"}`}
        >
          opens in 15 seconds
        </button>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-graphite">Typing aids:</span>
        {(
          [
            ["codeAutoClose", "auto-close tags"],
            ["codeSuggest", "tag suggestions"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setQuiz((q) => ({ ...q, assessment: { ...q.assessment, [key]: !q.assessment[key] } }))}
            aria-pressed={quiz.assessment[key]}
            className={`rounded-full px-3 py-1 ${quiz.assessment[key] ? "bg-ink text-paper" : "bg-panel"}`}
          >
            {label}: {quiz.assessment[key] ? "on" : "off"}
          </button>
        ))}
      </div>
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
      <QuizView
        quiz={quiz}
        answers={answers}
        studentName="Nino Beridze"
        locale="en"
        actions={actions}
        // The real page asks the server again; the demo opens it once the time has come.
        onOpen={() =>
          setQuiz((q) =>
            q.assessment.state === "upcoming" && Date.now() >= (q.assessment.opensAt ?? 0)
              ? { ...q, assessment: { ...q.assessment, state: "open" }, serverNow: Date.now() }
              : q,
          )
        }
      />
    </main>
  );
}
