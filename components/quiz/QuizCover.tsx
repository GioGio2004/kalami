"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ContactCard } from "@/components/contact/ContactCard";
import { Markdown } from "@/components/sandbox/Markdown";
import { TaskPlayer } from "@/components/sandbox/TaskPlayer";
import { ComputerOnly } from "@/components/tasks/ComputerOnly";
import { Button } from "@/components/ui/buttons";
import { ArrowLeft, Check, Clock, Cross, ListChecks, Monitor, Shield } from "@/components/ui/icons";
import { errorMessage } from "@/lib/errors";
import { useCanFullscreen, useIsMobile } from "@/lib/useDevice";
import { formatWhen, KIND_LABEL, type Quiz, type QuizAnswers, type QuizQuestion, type SavedValue } from "./types";

const QUESTION_ABOUT_THIS = { en: "Question about this?", ka: "კითხვა გაქვს ამაზე?" };

const INTEGRITY_RULES: Record<Quiz["assessment"]["integrityLevel"], string[]> = {
  off: ["Practice: nothing is watched, but pasting into answers is still off."],
  standard: [
    "Pasting into answers and copying the questions are off.",
    "Leaving this tab or window is noted for your lecturer, with the time away.",
    "Your name is shown faintly over the questions.",
  ],
  strict: [
    "It runs in fullscreen. Leaving fullscreen is noted, and the questions hide until you come back.",
    "Leaving this tab or window is noted for your lecturer, with the time away.",
    "Pasting into answers and copying the questions are off.",
  ],
};

/** The start screen before an attempt, and the results after one. */
export function QuizCover({
  quiz,
  answers,
  onStart,
  onOpen,
}: {
  quiz: Quiz;
  answers: QuizAnswers;
  /** Strict quizzes ask for fullscreen first; that has to happen inside the click. */
  onStart: () => Promise<unknown>;
  /** Not open yet: called at the opening time (and every few seconds after) to ask the server again. */
  onOpen?: () => void;
}) {
  const { assessment, attempt } = quiz;
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mobile = useIsMobile();
  const canFullscreen = useCanFullscreen();
  const submitted = attempt?.status === "submitted";
  const attemptsLeft = assessment.attemptsAllowed - quiz.attemptsUsed;
  // Strict exams need fullscreen, which some phones (iPhones) can't give a web page.
  const needsComputer = assessment.integrityLevel === "strict" && !canFullscreen;
  const canStart = assessment.state === "open" && attemptsLeft > 0 && assessment.questionCount > 0 && !needsComputer;

  async function start() {
    setStarting(true);
    setError(null);
    try {
      if (assessment.integrityLevel === "strict" && document.fullscreenElement === null) {
        await document.documentElement.requestFullscreen?.().catch(() => undefined);
      }
      await onStart();
    } catch (caught) {
      setError(errorMessage(caught));
      setStarting(false);
    }
  }

  const facts = [
    ...(assessment.state === "upcoming" && assessment.opensAt ? [`Opens ${formatWhen(assessment.opensAt)}`] : []),
    `${assessment.questionCount} question${assessment.questionCount === 1 ? "" : "s"} · ${assessment.totalPoints} points`,
    assessment.timeLimitMin ? `${assessment.timeLimitMin} minutes once you start` : "No time limit",
    assessment.closesAt ? `Closes ${formatWhen(assessment.closesAt)}` : "No closing date",
    assessment.attemptsAllowed === 1
      ? "One attempt"
      : `${assessment.attemptsAllowed} attempts, your best score counts (${Math.max(attemptsLeft, 0)} left)`,
  ];

  return (
    <div className="rounded-[2.75rem] bg-panel px-4 pb-4 pt-8 sm:px-10 sm:pb-8 sm:pt-10 lg:px-12">
      <Link href={`/courses/${quiz.course._id}`} className="inline-flex items-center gap-2 text-sm text-graphite hover:text-ink">
        <ArrowLeft className="size-4" />
        {quiz.course.title}
      </Link>
      <div className="mt-6 px-1">
        <p className="-rotate-1 font-hand text-[1.6rem] leading-none text-graphite">{KIND_LABEL[assessment.kind]}</p>
        <h1 className="mt-3 text-4xl font-medium leading-[0.95] tracking-[-0.04em] sm:text-6xl">{assessment.title}</h1>
      </div>

      <div className="mt-8 grid gap-4 *:min-w-0 lg:grid-cols-12">
        <section className="rounded-[2rem] bg-card p-6 sm:p-8 lg:col-span-7">
          {submitted ? (
            <Results quiz={quiz} answers={answers} />
          ) : (
            <>
              {assessment.instructions ? (
                <Markdown source={assessment.instructions} className="text-[15px] leading-relaxed" />
              ) : (
                <p className="text-[15px] leading-relaxed text-graphite">Read each question, answer, and submit when you’re done.</p>
              )}
              <ul className="mt-6 space-y-2.5">
                {facts.map((fact) => (
                  <li key={fact} className="flex items-start gap-3 text-[15px]">
                    <Clock className="mt-0.5 size-4 shrink-0 text-graphite" />
                    {fact}
                  </li>
                ))}
              </ul>
            </>
          )}
          {error && <p className="mt-5 rounded-2xl bg-red-pen/10 px-4 py-3 text-sm text-red-pen">{error}</p>}
          {!submitted && mobile && assessment.codeQuestionCount > 0 && !needsComputer && (
            <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-highlighter/40 px-4 py-3 text-sm leading-relaxed">
              <Monitor className="mt-0.5 size-4 shrink-0" />
              {assessment.codeQuestionCount === 1
                ? "One question is code, which only opens on a computer. You can start here and finish it on a computer before time runs out."
                : `${assessment.codeQuestionCount} questions are code, which only open on a computer. You can start here and finish those on a computer before time runs out.`}
            </p>
          )}
          {!submitted && needsComputer && assessment.state === "open" && (
            <div className="mt-6">
              <ComputerOnly title="Take this one on a computer">
                It runs in fullscreen, and this device can’t show a web page in fullscreen.
              </ComputerOnly>
            </div>
          )}
          {canStart ? (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button variant={submitted ? "outline" : "lime"} size="lg" onClick={start} disabled={starting}>
                {starting ? "Starting…" : submitted ? `Try again (attempt ${quiz.attemptsUsed + 1} of ${assessment.attemptsAllowed})` : "I understand, start"}
              </Button>
              {assessment.timeLimitMin && <span className="text-sm text-graphite">The timer starts when you press it.</span>}
            </div>
          ) : !submitted && !needsComputer && assessment.state === "upcoming" ? (
            <OpensIn opensAt={assessment.opensAt} serverNow={quiz.serverNow} onOpen={onOpen} />
          ) : !submitted && !needsComputer ? (
            <p className="mt-7 text-[15px] font-medium text-graphite">
              {assessment.state === "closed"
                ? "This is closed."
                : assessment.questionCount === 0
                  ? "There are no questions yet."
                  : "You’ve used all your attempts."}
            </p>
          ) : null}
          {/* Only here, before or after an attempt: never inside the running quiz. */}
          <div className="mt-7 border-t border-dashed border-ink/15 pt-4">
            <ContactCard
              variant="compact"
              label={QUESTION_ABOUT_THIS}
              courseId={quiz.course._id}
              assessmentId={assessment._id}
              initialTopic={submitted ? "grade" : "assignment"}
            />
          </div>
        </section>

        <section className="rounded-[2rem] bg-charcoal p-6 text-paper sm:p-8 lg:col-span-5">
          <span className="grid size-12 place-items-center rounded-full bg-charcoal-soft">
            {assessment.integrityLevel === "strict" ? <Monitor className="size-5" /> : <Shield className="size-5" />}
          </span>
          <h2 className="mt-6 text-2xl font-medium tracking-tight">While it runs</h2>
          <ul className="mt-4 space-y-3 text-[15px] text-paper/80">
            {INTEGRITY_RULES[assessment.integrityLevel].map((rule) => (
              <li key={rule} className="flex items-start gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-highlighter" />
                {rule}
              </li>
            ))}
            <li className="flex items-start gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-highlighter" />
              Answers save as you go. If the time runs out, what you saved is submitted for you.
            </li>
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-paper/55">
            Counters only: nothing is recorded. See the <Link href="/honesty" className="underline">honesty notice</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

function countdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h > 0 ? `${h}:` : ""}${String(m).padStart(h > 0 ? 2 : 1, "0")}:${String(s).padStart(2, "0")}`;
}

/** Not open yet: a countdown on the server's clock, and a fresh look at the opening time. */
function OpensIn({ opensAt, serverNow, onOpen }: { opensAt?: number; serverNow: number; onOpen?: () => void }) {
  // The device clock can be off; the server's time when the quiz was loaded corrects it.
  const [skew] = useState(() => serverNow - Date.now());
  const [now, setNow] = useState(() => serverNow);
  const asked = useRef(0);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + skew), 1000);
    return () => clearInterval(id);
  }, [skew]);
  const remaining = opensAt === undefined ? undefined : opensAt - now;
  useEffect(() => {
    // At the opening time, ask again; if the server still says "not yet" (clocks differ), ask every few seconds.
    if (remaining === undefined || remaining > 0 || onOpen === undefined) return;
    if (now - asked.current < 4000) return;
    asked.current = now;
    onOpen();
  }, [remaining, now, onOpen]);
  return (
    <div className="mt-7 rounded-2xl bg-panel px-5 py-4" aria-live="polite">
      <p className="text-[15px] font-medium">Not open yet</p>
      {remaining === undefined ? (
        <p className="mt-1 text-sm text-graphite">Your lecturer will open it. This page updates when they do.</p>
      ) : remaining > 0 ? (
        <p className="mt-1 text-sm text-graphite">
          Opens in <span className="font-mono text-base tabular-nums text-ink">{countdown(remaining)}</span>. Stay on this page:
          the start button appears by itself.
        </p>
      ) : (
        <p className="mt-1 text-sm text-graphite">Opening…</p>
      )}
    </div>
  );
}

function Results({ quiz, answers }: { quiz: Quiz; answers: QuizAnswers }) {
  const attempt = quiz.attempt!;
  const { assessment } = quiz;
  const waiting =
    assessment.resultsVisibility === "full_after_close" && assessment.state === "open"
      ? assessment.closesAt
        ? `Your score and the answers appear after it closes on ${formatWhen(assessment.closesAt)}.`
        : "Your score and the answers appear once your lecturer closes it."
      : "Your lecturer will share the results.";
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-graphite">
        <ListChecks className="size-4" />
        {attempt.autoSubmitted ? "Submitted automatically when the time ran out" : "Submitted"}
        {quiz.attemptsUsed > 1 && ` · attempt ${attempt.number}`}
      </p>
      {attempt.score !== undefined ? (
        <p className="mt-3 text-6xl font-medium tracking-[-0.04em] tabular-nums">
          {attempt.score}
          <span className="text-2xl text-graphite"> / {attempt.maxScore}</span>
        </p>
      ) : (
        <p className="mt-3 text-[15px] leading-relaxed text-graphite">{waiting}</p>
      )}
      {attempt.pendingGrading && attempt.score !== undefined && (
        <p className="mt-2 text-sm text-graphite">Written answers are still being graded, so this can go up.</p>
      )}
      {attempt.feedback && <p className="mt-4 font-hand text-2xl leading-tight text-red-pen">“{attempt.feedback}”</p>}
      {quiz.review.length > 0 && (
        <ol className="mt-8 space-y-4">
          {quiz.questions.map((question, index) => (
            <ReviewItem
              key={question._id}
              index={index}
              question={question}
              value={answers.find((a) => a.questionId === question._id)?.value}
              review={quiz.review.find((r) => r.questionId === question._id)}
              comments={quiz.comments.filter((c) => c.questionId === question._id)}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function answerText(question: QuizQuestion, value: SavedValue | undefined): string {
  if (value === undefined) return "No answer";
  const label = (id: string) => question.options?.find((o) => o.id === id)?.text ?? "?";
  switch (value.type) {
    case "single":
      return label(value.optionId);
    case "multiple":
      return value.optionIds.length === 0 ? "No answer" : value.optionIds.map(label).join(", ");
    case "short":
    case "essay":
      return value.text.trim() === "" ? "No answer" : value.text;
    case "code":
      return "Your code";
  }
}

function ReviewItem({
  index,
  question,
  value,
  review,
  comments,
}: {
  index: number;
  question: QuizQuestion;
  value: SavedValue | undefined;
  review: Quiz["review"][number] | undefined;
  comments: Quiz["comments"];
}) {
  const [open, setOpen] = useState(false);
  const points = review?.points;
  const full = points !== undefined && points >= question.points;
  const correct =
    review?.correctOptionIds?.map((id) => question.options?.find((o) => o.id === id)?.text ?? "?").join(", ") ??
    review?.acceptedAnswers?.join(" · ");
  return (
    <li className="rounded-[1.4rem] border border-line p-4">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
            points === undefined ? "bg-panel" : full ? "bg-highlighter" : "bg-red-pen/15 text-red-pen"
          }`}
        >
          {points === undefined ? null : full ? <Check className="size-3.5" /> : <Cross className="size-3.5" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-graphite">Question {index + 1}</p>
            <p className="text-sm tabular-nums text-graphite">
              {points === undefined ? "Not graded yet" : `${points} / ${question.points}`}
            </p>
          </div>
          <Markdown source={question.prompt} className="mt-1 text-[15px] leading-relaxed" />
          <p className="mt-2 whitespace-pre-wrap text-sm">
            <span className="text-graphite">Your answer: </span>
            {answerText(question, value)}
          </p>
          {correct && !full && (
            <p className="mt-1 text-sm">
              <span className="text-graphite">Correct: </span>
              {correct}
            </p>
          )}
          {review?.checks && review.checks.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {review.checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2 text-sm">
                  <span
                    className={`mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full ${check.passed ? "bg-highlighter" : "bg-red-pen/15 text-red-pen"}`}
                  >
                    {check.passed ? <Check className="size-3" /> : <Cross className="size-3" />}
                  </span>
                  <span className={check.passed ? "" : "text-ink/80"}>
                    {check.label}
                    {check.hidden && <span className="text-graphite"> · checked on submit</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {question.type === "code" && question.code && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
                Open your code
              </Button>
              {comments.length > 0 && (
                <span className="font-hand text-xl leading-none text-red-pen">
                  {comments.length} note{comments.length === 1 ? "" : "s"} from your lecturer
                </span>
              )}
            </div>
          )}
          {open && question.code && (
            <div className="fixed inset-0 z-40 flex flex-col bg-paper/95 p-3 backdrop-blur-sm sm:p-5">
              <div className="min-h-0 flex-1">
                <TaskPlayer
                  mode="student"
                  task={question.code}
                  intro={question.prompt}
                  initialFiles={value?.type === "code" ? value.files : question.code.files}
                  readOnly
                  header={<p className="truncate text-lg font-medium">Question {index + 1}: your code</p>}
                  actions={
                    <Button size="sm" onClick={() => setOpen(false)}>
                      Close
                    </Button>
                  }
                  hiddenResults={review?.checks?.filter((c) => c.hidden)}
                  comments={comments.map((c) => ({ id: c._id, file: c.file, line: c.line, text: c.text, author: c.author }))}
                />
              </div>
            </div>
          )}
          {review?.explanation && <p className="mt-2 font-hand text-xl leading-tight text-red-pen">{review.explanation}</p>}
        </div>
      </div>
    </li>
  );
}
