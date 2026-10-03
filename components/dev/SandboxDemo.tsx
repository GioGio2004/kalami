"use client";

import { useState } from "react";
import { TaskPlayer } from "@/components/sandbox/TaskPlayer";
import type { LineComment, SandboxTask } from "@/components/sandbox/types";
import type { CheckRule } from "@/lib/checks";
import sample from "./sampleTask.json";

// The sample is written the way an agent sends it (checks without ids); the server numbers them like this.
const withIds = (checks: object[], prefix: string) =>
  checks.map((check, i) => ({ ...check, id: `${prefix}${i + 1}` }) as CheckRule);

const TASK: SandboxTask = {
  files: sample.starterFiles,
  steps: sample.steps.map((step, s) => ({ ...step, checks: withIds(step.checks, `s${s + 1}c`) })),
  assets: sample.assets,
};
const HIDDEN = withIds(sample.hiddenChecks, "h");

export function SandboxDemo() {
  const [mode, setMode] = useState<"student" | "lecturer" | "review">("student");
  const [locale, setLocale] = useState<"ka" | "en">("ka");
  const [events, setEvents] = useState(0);
  const [notes, setNotes] = useState<LineComment[]>([]);
  return (
    <main className="h-dvh p-3 sm:p-5">
      <TaskPlayer
        key={mode}
        mode={mode}
        readOnly={mode === "review"}
        locale={locale}
        comments={notes}
        onAddComment={
          mode === "review"
            ? async (file, line, text) => setNotes((n) => [...n, { id: `n${n.length}`, file, line, text }])
            : undefined
        }
        onDeleteComment={mode === "review" ? (id) => setNotes((n) => n.filter((c) => c.id !== id)) : undefined}
        task={TASK}
        intro={sample.prompt}
        initialFiles={TASK.files}
        watermark={mode === "student" ? "Nino Beridze" : undefined}
        hiddenChecks={mode === "student" ? [] : HIDDEN}
        solution={sample.solution}
        onIntegrity={() => setEvents((n) => n + 1)}
        header={
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-graphite">Dev · sample task</p>
            <h1 className="text-2xl font-medium tracking-tight">Profile card</h1>
          </div>
        }
        actions={
          <>
            <span className="text-sm text-graphite">{events} blocked</span>
            <button
              onClick={() => setLocale(locale === "ka" ? "en" : "ka")}
              className="h-9 rounded-full border border-line px-4 text-sm font-medium"
            >
              {locale === "ka" ? "ქართ" : "EN"}
            </button>
            {(["student", "lecturer", "review"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`h-9 rounded-full px-4 text-sm font-medium capitalize ${mode === m ? "bg-ink text-paper" : "border border-line"}`}
              >
                {m}
              </button>
            ))}
          </>
        }
      />
    </main>
  );
}
