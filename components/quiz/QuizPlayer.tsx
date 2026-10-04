"use client";

import { useCallback, useEffect, useRef, useState, type ClipboardEvent } from "react";
import { useIntegrity } from "@/components/integrity/useIntegrity";
import { Markdown } from "@/components/sandbox/Markdown";
import { TaskPlayer } from "@/components/sandbox/TaskPlayer";
import type { CodeFile, IntegrityEvent } from "@/components/sandbox/types";
import { ComputerOnly } from "@/components/tasks/ComputerOnly";
import { Button } from "@/components/ui/buttons";
import { ArrowLeft, ArrowRight, Check, Clock, Flag, Monitor } from "@/components/ui/icons";
import { errorMessage } from "@/lib/errors";
import { loadDrafts, saveLabel, useAutosave, type Draft } from "@/lib/useAutosave";
import { useIsMobile } from "@/lib/useDevice";
import { AnswerInput } from "./AnswerInput";
import {
  isAnswered,
  KIND_LABEL,
  type Answer,
  type QuestionId,
  type Quiz,
  type QuizActions,
  type QuizAnswers,
  type SavedValue,
} from "./types";

type Pending = { kind: "answer"; answer: Answer } | { kind: "code"; files: CodeFile[] };

/** Choices save at once; typing waits for a pause. */
const TEXT_SAVE_MS = 900;
const CODE_SAVE_MS = 1500;

function watermarkStyle(name: string) {
  const safe = name.replace(/[<>&'"]/g, "");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='150'><text x='20' y='90' transform='rotate(-16 150 75)' fill='rgba(20,20,20,0.07)' font-size='15' font-family='sans-serif'>${safe}</text></svg>`;
  return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")` };
}

function clock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

/** Flags are only a reminder for the student, so they live in this browser tab. */
function loadFlags(key: string): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(key) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function toValue(item: Pending): SavedValue {
  return item.kind === "answer" ? item.answer : { type: "code", files: item.files };
}

/** One attempt in progress: a question per page, a navigator, the timer and autosave. */
export function QuizPlayer({
  quiz,
  answers,
  studentName,
  locale,
  actions,
}: {
  quiz: Quiz;
  answers: QuizAnswers;
  studentName: string;
  locale: "ka" | "en";
  actions: QuizActions;
}) {
  const { assessment } = quiz;
  const attempt = quiz.attempt!;
  const closed = assessment.state === "closed";
  const flagKey = `kalami:flags:${attempt._id}`;
  const draftKey = `kalami:draft:${attempt._id}`;

  // The server's clock, as far as we can tell: from the quiz, then from every save that comes back.
  // Only read in callbacks and effects, never while rendering.
  const skew = useRef(0);
  useEffect(() => {
    skew.current = quiz.serverNow - Date.now();
  }, [quiz.serverNow]);
  const serverNow = useCallback(() => Date.now() + skew.current, []);

  const autosave = useAutosave<QuestionId, Pending>({
    draftKey,
    now: serverNow,
    save: async (questionId, item) => {
      const result = item.kind === "answer" ? await actions.saveAnswer(questionId, item.answer) : await actions.saveCode(questionId, item.files);
      skew.current = result.savedAt - Date.now();
    },
  });
  const { adopt, isUnsaved } = autosave;

  // Once, on mount: the server's answers, plus work this tab had on its way when it was
  // last here if the server hasn't got something newer for that question.
  const [initial] = useState(() => {
    const map = new Map<QuestionId, SavedValue>(answers.map((a) => [a.questionId, a.value]));
    const drafts = loadDrafts<QuestionId, Pending>(draftKey);
    const kept = new Map<QuestionId, Draft<Pending>>();
    for (const [questionId, draft] of drafts) {
      const server = answers.find((a) => a.questionId === questionId)?.savedAt ?? -1;
      if (draft.at > server) {
        map.set(questionId, toValue(draft.item));
        kept.set(questionId, draft);
      }
    }
    return { values: map, drafts: kept };
  });
  const [values, setValues] = useState(initial.values);
  // When this student last changed each answer here (server time), so a server value
  // arriving later than our change can't roll it back.
  const lastLocal = useRef(new Map<QuestionId, number>());
  useEffect(() => {
    for (const [questionId, draft] of initial.drafts) lastLocal.current.set(questionId, draft.at);
    if (initial.drafts.size > 0) adopt([...initial.drafts]);
  }, [initial, adopt]);

  // Answers saved from another tab or device show up here, unless we're mid-change on that question.
  useEffect(() => {
    setValues((current) => {
      let next: Map<QuestionId, SavedValue> | null = null;
      for (const answer of answers) {
        if (isUnsaved(answer.questionId)) continue;
        if ((lastLocal.current.get(answer.questionId) ?? 0) > answer.savedAt) continue;
        if (JSON.stringify(current.get(answer.questionId)) === JSON.stringify(answer.value)) continue;
        next ??= new Map(current);
        next.set(answer.questionId, answer.value);
      }
      return next ?? current;
    });
  }, [answers, isUnsaved]);

  const [index, setIndex] = useState(0);
  const [flags, setFlags] = useState(() => loadFlags(flagKey));
  const [confirming, setConfirming] = useState(false);
  const [unsavedPrompt, setUnsavedPrompt] = useState<number[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mobile = useIsMobile();
  const submitStarted = useRef(false);

  const integrity = useIntegrity({
    level: assessment.integrityLevel,
    enabled: !closed,
    channelKey: assessment._id,
    report: actions.reportIntegrity,
  });

  const queue = useCallback(
    (questionId: QuestionId, save: Pending, delay: number) => {
      lastLocal.current.set(questionId, serverNow());
      setValues((current) => new Map(current).set(questionId, toValue(save)));
      autosave.queue(questionId, save, delay);
    },
    [autosave, serverNow],
  );

  /**
   * Saves whatever is left, then submits. Unless `force`, refuses while
   * something still isn't confirmed and asks the student what to do.
   */
  const submit = useCallback(
    async (force = false) => {
      if (submitStarted.current) return;
      setSubmitting(true);
      setSubmitError(null);
      const saved = await autosave.flush();
      if (!saved && !force) {
        const numbers = autosave
          .unsavedKeys()
          .map((id) => quiz.questions.findIndex((q) => q._id === id) + 1)
          .filter((n) => n > 0)
          .sort((a, b) => a - b);
        setSubmitting(false);
        setUnsavedPrompt(numbers);
        return;
      }
      submitStarted.current = true;
      try {
        await actions.submit();
        autosave.clear();
      } catch (error) {
        submitStarted.current = false;
        setSubmitting(false);
        setSubmitError(errorMessage(error));
      }
    },
    [actions, autosave, quiz.questions],
  );

  // The server's deadline, on the server's clock. When it passes, what is saved gets submitted.
  const deadlineAt = attempt.deadlineAt;
  const [now, setNow] = useState(() => quiz.serverNow);
  useEffect(() => {
    if (deadlineAt === undefined) return;
    const id = setInterval(() => setNow(serverNow()), 1000);
    return () => clearInterval(id);
  }, [deadlineAt, serverNow]);
  const remaining = deadlineAt === undefined ? undefined : deadlineAt - now;
  const timeUp = remaining !== undefined && remaining <= 0;
  useEffect(() => {
    if (deadlineAt === undefined) return;
    const delay = Math.max(0, deadlineAt - serverNow());
    // setTimeout can't wait longer than ~24 days; the server submits those anyway.
    if (delay > 2_000_000_000) return;
    const id = setTimeout(() => void submit(true), delay);
    return () => clearTimeout(id);
  }, [deadlineAt, serverNow, submit]);

  // Once the attempt is over, give the screen back.
  useEffect(
    () => () => {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    },
    [],
  );

  const question = quiz.questions[Math.min(index, quiz.questions.length - 1)];
  if (question === undefined) {
    return <p className="rounded-[2rem] bg-panel p-8 text-graphite">This has no questions. Ask your lecturer.</p>;
  }
  const locked = closed || submitting || timeUp;
  const value = values.get(question._id);
  const unanswered = quiz.questions.filter((q) => !isAnswered(values.get(q._id))).length;

  function toggleFlag() {
    setFlags((current) => {
      const next = new Set(current);
      if (next.has(question._id)) next.delete(question._id);
      else next.add(question._id);
      try {
        sessionStorage.setItem(flagKey, JSON.stringify([...next]));
      } catch {
        // Flags just won't survive a reload.
      }
      return next;
    });
  }

  function go(to: number) {
    void autosave.flush();
    setIndex(Math.max(0, Math.min(quiz.questions.length - 1, to)));
  }

  const blockCopy = (event: ClipboardEvent) => {
    event.preventDefault();
    integrity.count("copyBlocked");
  };
  const watermark = assessment.integrityLevel === "off" ? undefined : watermarkStyle(studentName);
  const lowTime = remaining !== undefined && remaining < 60_000;

  return (
    <div className="relative space-y-3">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[1.8rem] bg-panel px-5 py-4 sm:px-6">
        <div className="min-w-0 flex-1 basis-full sm:basis-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
            {KIND_LABEL[assessment.kind]} · {quiz.course.title}
          </p>
          <h1 className="truncate text-xl font-medium tracking-tight sm:text-2xl">{assessment.title}</h1>
        </div>
        {remaining !== undefined && (
          <span
            aria-live={lowTime ? "assertive" : "off"}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-lg tabular-nums ${
              lowTime ? "bg-red-pen text-paper" : "bg-card text-ink"
            }`}
          >
            <Clock className="size-4" />
            {clock(remaining)}
          </span>
        )}
        <span aria-live="polite" className={`mr-auto text-sm sm:mr-0 ${autosave.state === "error" ? "text-red-pen" : "text-graphite"}`}>
          {saveLabel(autosave.state, autosave.error, autosave.unsavedCount)}
        </span>
        <Button size="sm" onClick={() => setConfirming(true)} disabled={locked}>
          <Check className="size-4" />
          Submit
        </Button>
      </header>

      {(closed || submitError) && (
        <p className={`rounded-[1.4rem] px-5 py-3 text-sm ${submitError ? "bg-red-pen/10 text-red-pen" : "bg-panel text-graphite"}`}>
          {submitError ?? "This has closed. Your saved answers are being submitted."}
        </p>
      )}

      <nav aria-label="Questions" className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-full bg-panel p-1.5">
        {quiz.questions.map((q, i) => {
          const answered = isAnswered(values.get(q._id));
          const unsaved = autosave.unsavedCount > 0 && isUnsaved(q._id);
          const flagged = flags.has(q._id);
          return (
            <button
              key={q._id}
              onClick={() => go(i)}
              aria-current={i === index ? "step" : undefined}
              aria-label={`Question ${i + 1}${answered ? ", answered" : ""}${unsaved ? ", not saved yet" : ""}${flagged ? ", flagged" : ""}`}
              className={`relative grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums transition ${
                i === index
                  ? "bg-ink text-paper"
                  : answered
                    ? unsaved
                      ? "bg-highlighter/50 text-ink ring-2 ring-inset ring-warn"
                      : "bg-highlighter text-ink"
                    : "bg-card text-graphite hover:text-ink"
              }`}
            >
              {i + 1}
              {flagged && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-panel bg-red-pen" />}
            </button>
          );
        })}
      </nav>

      <section
        className={`rounded-[2rem] bg-card p-5 sm:p-8 ${question.type === "code" ? "" : "min-h-[22rem]"}`}
        style={watermark}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-graphite">
            Question {index + 1} of {quiz.questions.length}
          </p>
          <p className="text-sm tabular-nums text-graphite">
            {question.points} point{question.points === 1 ? "" : "s"}
          </p>
        </div>
        <div
          className="mt-3 select-none"
          onCopy={blockCopy}
          onCut={blockCopy}
          onContextMenu={(event) => event.preventDefault()}
        >
          {/* Code questions show their prompt inside the sandbox; phones get it here instead. */}
          {(question.type !== "code" || mobile) && <Markdown source={question.prompt} className="text-lg leading-relaxed" />}
        </div>
        <div className="mt-6">
          {question.type === "code" && question.code && mobile ? (
            <ComputerOnly title="This question needs a computer">
              Answer the others here, then open this {KIND_LABEL[assessment.kind].toLowerCase()} on a computer for this
              one before time runs out. Everything you answer is saved.
            </ComputerOnly>
          ) : question.type === "code" && question.code ? (
            <div className="h-[72dvh] min-h-[30rem]">
              <TaskPlayer
                key={question._id}
                mode="student"
                task={question.code}
                intro={question.prompt}
                initialFiles={value?.type === "code" ? value.files : question.code.files}
                readOnly={locked}
                locale={locale}
                watermark={assessment.integrityLevel === "off" ? undefined : studentName}
                onFilesChange={(files) => queue(question._id, { kind: "code", files }, CODE_SAVE_MS)}
                onIntegrity={(event: IntegrityEvent) => integrity.count(event)}
                onSaveNow={() => void autosave.flush()}
              />
            </div>
          ) : (
            <AnswerInput
              question={question}
              value={value}
              disabled={locked}
              onChange={(answer) =>
                queue(question._id, { kind: "answer", answer }, answer.type === "short" || answer.type === "essay" ? TEXT_SAVE_MS : 0)
              }
              onBlocked={(event) => integrity.count(event)}
            />
          )}
        </div>
      </section>

      <footer className="flex items-center justify-between gap-2 px-1">
        <Button variant="outline" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous question">
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <Button variant="ghost" onClick={toggleFlag} aria-pressed={flags.has(question._id)}>
          <Flag className={`size-4 ${flags.has(question._id) ? "text-red-pen" : ""}`} />
          {flags.has(question._id) ? (
            "Flagged"
          ) : (
            <>
              Flag<span className="hidden sm:inline"> for review</span>
            </>
          )}
        </Button>
        {index < quiz.questions.length - 1 ? (
          <Button onClick={() => go(index + 1)}>
            Next
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button variant="lime" onClick={() => setConfirming(true)} disabled={locked}>
            <span className="sm:hidden">Submit</span>
            <span className="hidden sm:inline">Review and submit</span>
          </Button>
        )}
      </footer>

      {(confirming || timeUp || unsavedPrompt !== null) && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="submit-title" className="w-full max-w-md rounded-[2rem] bg-paper p-7 shadow-xl">
            {unsavedPrompt !== null && !timeUp ? (
              <>
                <h2 id="submit-title" className="text-2xl font-medium tracking-tight">
                  {unsavedPrompt.length === 1 ? "One answer isn’t saved yet" : `${unsavedPrompt.length} answers aren’t saved yet`}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-graphite">
                  {unsavedPrompt.length > 0 && `Question${unsavedPrompt.length === 1 ? "" : "s"} ${unsavedPrompt.join(", ")}. `}
                  {autosave.error ?? "Kalami couldn’t reach the server."} Try again, or submit without them.
                </p>
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <Button variant="ghost" onClick={() => setUnsavedPrompt(null)}>
                    Keep working
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUnsavedPrompt(null);
                      void submit(false);
                    }}
                  >
                    Try again
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setUnsavedPrompt(null);
                      void submit(true);
                    }}
                  >
                    Submit without them
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 id="submit-title" className="text-2xl font-medium tracking-tight">
                  {timeUp ? "Time’s up" : "Submit your answers?"}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-graphite">
                  {timeUp
                    ? submitError
                      ? "We couldn't submit from here, but your saved answers are submitted for you within a minute."
                      : "Submitting what you saved…"
                    : unanswered > 0
                      ? `${unanswered} question${unanswered === 1 ? " has" : "s have"} no answer. You can’t change anything afterwards.`
                      : "Every question has an answer. You can’t change anything afterwards."}
                  {!timeUp && flags.size > 0 && ` ${flags.size} still flagged for review.`}
                </p>
                {!timeUp && (
                  <div className="mt-6 flex flex-wrap justify-end gap-2">
                    <Button variant="ghost" onClick={() => setConfirming(false)} disabled={submitting}>
                      Keep working
                    </Button>
                    <Button
                      variant="lime"
                      onClick={() => {
                        setConfirming(false);
                        void submit(false);
                      }}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting…" : "Yes, submit"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {integrity.blocked && !timeUp && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-paper/95 p-6 backdrop-blur-sm">
          <div className="max-w-md text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-panel">
              <Monitor className="size-6" />
            </span>
            <h2 className="mt-5 text-2xl font-medium tracking-tight">
              {integrity.needsFullscreen ? "This runs in fullscreen" : "Come back to continue"}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-graphite">
              {integrity.needsFullscreen
                ? "Your lecturer set this to strict. Leaving fullscreen is noted for them; the timer keeps running."
                : "The questions are hidden while this window isn't in front. Time away is noted for your lecturer."}
            </p>
            {integrity.needsFullscreen && (
              <Button className="mt-6" variant="lime" onClick={integrity.enterFullscreen}>
                Enter fullscreen
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
