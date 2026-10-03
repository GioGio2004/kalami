"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { buttonClass } from "@/components/ui/buttons";
import { ArrowRight, Clock, Code, ListChecks, Lock, Monitor } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { formatWhen } from "@/lib/time";
import { useIsMobile } from "@/lib/useDevice";
import { assessmentPath } from "@/lib/urls";

export type CourseItem = FunctionReturnType<typeof api.learn.course>["assessments"][number];

export const KIND_LABEL: Record<CourseItem["kind"], string> = {
  task: "Task",
  quiz: "Quiz",
  midterm: "Midterm",
  final: "Final exam",
};

export function itemStatus(item: CourseItem): string {
  if (item.result?.status === "submitted") {
    return item.result.score !== undefined
      ? `Submitted · ${item.result.score} / ${item.totalPoints} points`
      : "Submitted";
  }
  if (item.state === "upcoming") return item.opensAt ? `Opens ${formatWhen(item.opensAt)}` : "Not open yet";
  if (item.state === "closed") return item.result ? "Closed · not submitted" : "Closed";
  if (item.result?.status === "in_progress") return "In progress";
  return item.closesAt ? `Open until ${formatWhen(item.closesAt)}` : "Open";
}

function Action({ item, mobile }: { item: CourseItem; mobile: boolean }) {
  if (!item.playable) {
    return <span className="text-sm text-graphite">Opens in a later update</span>;
  }
  if (item.state === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-graphite">
        <Lock className="size-4" /> Locked
      </span>
    );
  }
  const label =
    item.result?.status === "submitted" || item.state === "closed"
      ? "View"
      : item.result?.status === "in_progress"
        ? "Continue"
        : "Start";
  // Code tasks open on computers only; the link still shows where the task stands.
  if (mobile && item.kind === "task" && label !== "View") {
    return (
      <Link
        href={assessmentPath(item.kind, item._id)}
        className="inline-flex items-center gap-1.5 rounded-full bg-panel px-3 py-1.5 text-sm text-graphite"
      >
        <Monitor className="size-4" /> On a computer
      </Link>
    );
  }
  return (
    <Link
      href={assessmentPath(item.kind, item._id)}
      className={buttonClass(label === "View" ? "outline" : "ink", "sm")}
    >
      {label}
      <ArrowRight className="size-4" />
    </Link>
  );
}

/** One task, quiz or exam in a course list: what it is, where it stands, what to do. */
export function AssessmentRow({ item, compact = false }: { item: CourseItem; compact?: boolean }) {
  const mobile = useIsMobile();
  const done = item.state === "closed" || item.result?.status === "submitted";
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 ${
        compact ? "rounded-2xl bg-panel/60 p-4" : "rounded-[1.6rem] bg-card p-5 sm:p-6"
      } ${done ? "opacity-80" : ""}`}
    >
      {!compact && (
        <span className="hidden size-12 shrink-0 place-items-center rounded-full bg-panel sm:grid">
          {item.kind === "task" ? <Code className="size-5" /> : <ListChecks className="size-5" />}
        </span>
      )}
      <div className="min-w-0 flex-1 basis-full sm:basis-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-graphite">{KIND_LABEL[item.kind]}</p>
        <p className={`mt-0.5 font-medium leading-snug ${compact ? "text-[15px]" : "text-lg"}`}>{item.title}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-graphite">
          <Clock className="size-4 shrink-0" />
          {itemStatus(item)}
        </p>
      </div>
      <Action item={item} mobile={mobile} />
    </div>
  );
}
