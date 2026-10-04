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
import { loadDrafts, saveLabel, useAutosave, type Draft } from "@/lib/useAutosave";

type Task = FunctionReturnType<typeof api.learn.task>;
type QuestionId = Task["questions"][number]["_id"];

/** Autosave waits this long after the last keystroke. */
const AUTOSAVE_MS = 1500;

export function TaskView({ task, studentName, locale }: { task: Task; studentName: string; locale: "ka" | "en" }) {
  const submitted = task.attempt?.status === "submitted";
  const readOnly = submitted || task.assessment.state === "closed";
  const [index, setIndex] = useState(0);
  const question = task.questions[Math.min(index, task.questions.length - 1)];
  const draftKey = `kalami:draft:task:${task.assessment._id}`;

  const save = useMutation(api.learn.saveCodeWork);
  const submit = useMutation(api.learn.submit);
  const reportCounts = useMutation(api.learn.reportIntegrityCounts);
  const [confirming, setConfirming] = useState(false);
  const [unsaved, setUnsaved] = useState<number[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // The server's clock, from every save that comes back; the files carry no time until then.
  const skew = useRef(0);
  const serverNow = useCallback(() => Date.now() + skew.current, []);
  const autosave = useAutosave<QuestionId, CodeFile[]>({
    draftKey,
    now: serverNow,
    save: async (questionId, files) => {
      const result = await save({ assessmentId: task.assessment._id, questionId, files });
      skew.current = result.savedAt - Date.now();
    },
  });
  const { adopt } = autosave;

  // Once, on mount: work this tab had on its way last time, if the server has nothing newer.
  const [initial] = useState(() => {
    const drafts = loadDrafts<QuestionId, CodeFile[]>(draftKey);
    const kept = new Map<QuestionId, Draft<CodeFile[]>>();
    for (const [questionId, draft] of drafts) {
      const server = task.responses.find((r) => r.questionId === questionId)?.savedAt ?? -1;
      if (draft.at > server && !readOnly) kept.set(questionId, draft);
    }
    return kept;
  });
  // The latest local copy per part, so switching parts keeps the work; the player only reads it when it opens.
  const latest = useRef(new Map<QuestionId, CodeFile[]>());
  const [snapshots, setSnapshots] = useState(
    () => new Map<QuestionId, CodeFile[]>([...initial].map(([questionId, draft]) => [questionId, draft.item])),
  );
  useEffect(() => {
    for (const [questionId, draft] of initial) latest.current.set(questionId, draft.item);
    if (initial.size > 0) adopt([...initial]);
  }, [initial, adopt]);

  const integrity = useIntegrity({
    level: task.assessment.integrityLevel,
    enabled: !readOnly,
    channelKey: task.assessment._id,
    report: (counts) => reportCounts({ assessmentId: task.assessment._id, counts }),
  });

  const onFilesChange = useCallback(
    (files: CodeFile[]) => {
      if (question === undefined) return;
      latest.current.set(question._id, files);
      autosave.queue(question._id, files, AUTOSAVE_MS);
    },
    [autosave, question],
  );

  const onIntegrity = useCallback((event: IntegrityEvent) => integrity.count(event), [integrity]);

  const comments: LineComment[] = useMemo(
    () =>
      task.comments
        .filter((c) => c.questionId === question?._id)
        .map((c) => ({ id: c._id, file: c.file, line: c.line, text: c.text, author: c.author })),
    [task.comments, question?._id],
  );

  async function onSubmit(force = false) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const saved = await autosave.flush();
      if (!saved && !force) {
        setUnsaved(
          autosave
            .unsavedKeys()
            .map((id) => task.questions.findIndex((q) => q._id === id) + 1)
            .filter((n) => n > 0),
        );
        return;
      }
      await submit({ assessmentId: task.assessment._id });
      autosave.clear();
      setConfirming(false);
      setUnsaved(null);
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
              void autosave.flush();
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
      {readOnly ? null : unsaved !== null ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-red-pen">
            {unsaved.length === 1 ? "One part isn’t saved yet" : `${unsaved.length} parts aren’t saved yet`}
            {task.questions.length > 1 && unsaved.length > 0 && ` (part ${unsaved.join(", ")})`}.
          </span>
          <Button size="sm" variant="ghost" onClick={() => setUnsaved(null)} disabled={submitting}>
            Keep working
          </Button>
          <Button size="sm" variant="outline" onClick={() => void onSubmit(false)} disabled={submitting}>
            Try again
          </Button>
          <Button size="sm" variant="danger" onClick={() => void onSubmit(true)} disabled={submitting}>
            Submit anyway
          </Button>
        </div>
      ) : confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-graphite">Submit for grading? You can&apos;t change it afterwards.</span>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={submitting}>
            Keep working
          </Button>
          <Button size="sm" variant="lime" onClick={() => void onSubmit(false)} disabled={submitting}>
            {submitting ? "Submitting…" : "Yes, submit"}
          </Button>
        </div>
      ) : (
        <>
          <span aria-live="polite" className={`text-sm ${autosave.state === "error" ? "text-red-pen" : "text-graphite"}`}>
            {saveLabel(autosave.state, autosave.error, autosave.unsavedCount)}
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
        onSaveNow={() => void autosave.flush()}
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
