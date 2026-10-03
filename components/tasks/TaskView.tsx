"use client";

import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntegrity } from "@/components/integrity/useIntegrity";
import { TaskPlayer } from "@/components/sandbox/TaskPlayer";
import type { CodeFile, IntegrityEvent, LineComment } from "@/components/sandbox/types";
import { Button } from "@/components/ui/buttons";
import { ArrowLeft, Check, Monitor } from "@/components/ui/icons";
import { api } from "@/convex-api/api";
import { errorMessage } from "@/lib/errors";

type Task = FunctionReturnType<typeof api.learn.task>;
type QuestionId = Task["questions"][number]["_id"];
type SaveState = "saved" | "unsaved" | "saving" | "error";

/** Autosave waits this long after the last keystroke. */
const AUTOSAVE_MS = 1500;

function savedLabel(state: SaveState, error: string | null) {
  switch (state) {
    case "saved":
      return "Saved";
    case "saving":
      return "Saving…";
    case "unsaved":
      return "Unsaved changes";
    case "error":
      return error ?? "Couldn't save. Retrying when you type.";
  }
}

export function TaskView({ task, studentName, locale }: { task: Task; studentName: string; locale: "ka" | "en" }) {
  const submitted = task.attempt?.status === "submitted";
  const readOnly = submitted || task.assessment.state === "closed";
  const [index, setIndex] = useState(0);
  const question = task.questions[Math.min(index, task.questions.length - 1)];

  const save = useMutation(api.learn.saveCodeWork);
  const submit = useMutation(api.learn.submit);
  const reportCounts = useMutation(api.learn.reportIntegrityCounts);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Unsaved files per question, and the latest local copy so switching parts keeps the work.
  const pending = useRef(new Map<QuestionId, CodeFile[]>());
  const latest = useRef(new Map<QuestionId, CodeFile[]>());
  // What each part showed when the student left it; the player only reads it when it opens.
  const [snapshots, setSnapshots] = useState(new Map<QuestionId, CodeFile[]>());
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inFlight = useRef<Promise<void> | null>(null);

  const integrity = useIntegrity({
    level: task.assessment.integrityLevel,
    enabled: !readOnly,
    channelKey: task.assessment._id,
    report: (counts) => reportCounts({ assessmentId: task.assessment._id, counts }),
  });

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if (inFlight.current) await inFlight.current;
    if (pending.current.size === 0) return;
    const batch = [...pending.current];
    pending.current.clear();
    setSaveState("saving");
    const run = (async () => {
      for (const [questionId, files] of batch) {
        try {
          await save({ assessmentId: task.assessment._id, questionId, files });
        } catch (error) {
          // Keep the work for the next try.
          if (!pending.current.has(questionId)) pending.current.set(questionId, files);
          setSaveError(errorMessage(error));
          setSaveState("error");
          return;
        }
      }
      setSaveError(null);
      setSaveState(pending.current.size === 0 ? "saved" : "unsaved");
    })();
    inFlight.current = run;
    await run;
    inFlight.current = null;
  }, [save, task.assessment._id]);

  const onFilesChange = useCallback(
    (files: CodeFile[]) => {
      if (question === undefined) return;
      pending.current.set(question._id, files);
      latest.current.set(question._id, files);
      setSaveState("unsaved");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), AUTOSAVE_MS);
    },
    [flush, question],
  );

  const onIntegrity = useCallback((event: IntegrityEvent) => integrity.count(event), [integrity]);

  // Save on the way out; warn if a save is still pending when the tab closes.
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (pending.current.size > 0) {
        void flush();
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      void flush();
    };
  }, [flush]);

  const comments: LineComment[] = useMemo(
    () =>
      task.comments
        .filter((c) => c.questionId === question?._id)
        .map((c) => ({ id: c._id, file: c.file, line: c.line, text: c.text, author: c.author })),
    [task.comments, question?._id],
  );

  async function onSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await flush();
      await submit({ assessmentId: task.assessment._id });
      setConfirming(false);
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const header = (
    <div className="min-w-0">
      <Link href={`/courses/${task.course._id}`} className="inline-flex items-center gap-1.5 text-sm text-graphite hover:text-ink">
        <ArrowLeft className="size-4" />
        {task.course.title}
      </Link>
      <h1 className="truncate text-2xl font-medium tracking-[-0.02em] sm:text-3xl">{task.assessment.title}</h1>
    </div>
  );

  if (question === undefined) {
    return (
      <div className="rounded-[2rem] bg-panel p-8">
        {header}
        <p className="mt-4 text-graphite">This task has nothing to code in yet. Ask your lecturer.</p>
      </div>
    );
  }

  const parts =
    task.questions.length > 1 ? (
      <div className="flex gap-1 rounded-full bg-panel p-1">
        {task.questions.map((q, i) => (
          <button
            key={q._id}
            onClick={() => {
              void flush();
              setSnapshots(new Map(latest.current));
              setIndex(i);
            }}
            className={`h-8 rounded-full px-3 text-sm font-medium transition ${i === index ? "bg-ink text-paper" : "text-graphite hover:text-ink"}`}
          >
            Part {i + 1}
          </button>
        ))}
      </div>
    ) : null;

  const actions = (
    <>
      {parts}
      {readOnly ? null : confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-graphite">Submit for grading? You can&apos;t change it afterwards.</span>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={submitting}>
            Keep working
          </Button>
          <Button size="sm" variant="lime" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Yes, submit"}
          </Button>
        </div>
      ) : (
        <>
          <span aria-live="polite" className={`text-sm ${saveState === "error" ? "text-red-pen" : "text-graphite"}`}>
            {savedLabel(saveState, saveError)}
          </span>
          <Button size="sm" onClick={() => setConfirming(true)}>
            <Check className="size-4" />
            Submit
          </Button>
        </>
      )}
    </>
  );

  const attempt = task.attempt;
  const banner =
    submitted || task.assessment.state === "closed" || submitError ? (
      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[1.4rem] px-5 py-3 text-sm ${
          submitError ? "bg-red-pen/10 text-red-pen" : submitted ? "bg-highlighter text-ink" : "bg-panel text-graphite"
        }`}
      >
        {submitError ? (
          submitError
        ) : submitted && attempt ? (
          <>
            <span className="font-medium">
              {attempt.autoSubmitted ? "Submitted automatically when the task closed." : "Submitted. Your code is locked."}
            </span>
            {attempt.score !== undefined ? (
              <span>
                Score: <span className="font-semibold tabular-nums">{attempt.score}</span> / {attempt.maxScore}
              </span>
            ) : (
              <span>Your lecturer will share the results.</span>
            )}
            {attempt.feedback && <span className="w-full font-hand text-2xl leading-tight text-red-pen">“{attempt.feedback}”</span>}
          </>
        ) : (
          "This task is closed. Your last saved work is shown."
        )}
      </div>
    ) : null;

  const response = task.responses.find((r) => r.questionId === question._id);
  const hiddenResults = task.hiddenChecks
    .filter((hidden) => hidden.questionId === question._id)
    .flatMap((hidden) => {
      const result = response?.checkResults?.find((r) => r.id === hidden.id);
      return result ? [{ id: hidden.id, label: hidden.label, passed: result.passed }] : [];
    });
  const intro = [index === 0 ? task.assessment.instructions : undefined, question.prompt].filter(Boolean).join("\n\n");

  return (
    <div className="relative h-[calc(100dvh-7.5rem)] min-h-[34rem]">
      <TaskPlayer
        key={question._id}
        mode="student"
        task={question.code}
        intro={intro}
        initialFiles={snapshots.get(question._id) ?? response?.files ?? question.code.files}
        readOnly={readOnly}
        locale={locale}
        watermark={task.assessment.integrityLevel === "off" ? undefined : studentName}
        header={header}
        actions={actions}
        banner={banner}
        hiddenResults={hiddenResults}
        comments={comments}
        onFilesChange={onFilesChange}
        onIntegrity={onIntegrity}
        onSaveNow={() => void flush()}
      />
      {integrity.blocked && (
        <div className="absolute inset-0 z-20 grid place-items-center rounded-[2rem] bg-paper/95 p-6 backdrop-blur-sm">
          <div className="max-w-md text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-panel">
              <Monitor className="size-6" />
            </span>
            <h2 className="mt-5 text-2xl font-medium tracking-tight">
              {integrity.needsFullscreen ? "This task runs in fullscreen" : "Come back to continue"}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-graphite">
              {integrity.needsFullscreen
                ? "Your lecturer set this task to strict. Leaving fullscreen is noted for them, and your work waits here."
                : "Your work is hidden while this window isn't in front. Time away is noted for your lecturer."}
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
