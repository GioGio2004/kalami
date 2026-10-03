"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { buttonClass } from "@/components/ui/buttons";
import { ArrowLeft, ArrowRight, Clock, Code, ListChecks, Lock } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";

type Course = FunctionReturnType<typeof api.learn.course>;
type Item = Course["assessments"][number];

const KIND_LABEL: Record<Item["kind"], string> = {
  task: "Task",
  quiz: "Quiz",
  midterm: "Midterm",
  final: "Final exam",
};

function when(ms: number) {
  return new Date(ms).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function status(item: Item): string {
  if (item.result?.status === "submitted") {
    return item.result.score !== undefined
      ? `Submitted · ${item.result.score} / ${item.totalPoints} points`
      : "Submitted";
  }
  if (item.state === "upcoming") return item.opensAt ? `Opens ${when(item.opensAt)}` : "Not open yet";
  if (item.state === "closed") return item.result ? "Closed · not submitted" : "Closed";
  if (item.result?.status === "in_progress") return "In progress";
  return item.closesAt ? `Open until ${when(item.closesAt)}` : "Open";
}

function action(item: Item) {
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
  return (
    <Link
      href={`/tasks/${item._id}`}
      className={buttonClass(label === "View" ? "outline" : "ink", "sm")}
    >
      {label}
      <ArrowRight className="size-4" />
    </Link>
  );
}

export function CourseView({ course }: { course: Course }) {
  return (
    <Enter kind="scale" className="rounded-[2.75rem] bg-panel px-4 pb-4 pt-8 sm:px-10 sm:pb-8 sm:pt-10 lg:px-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-graphite hover:text-ink">
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>
      <div className="mt-6 px-1">
        <p className="-rotate-1 font-hand text-[1.6rem] leading-none text-graphite">
          {[course.lecturer, course.semester].filter(Boolean).join(" · ")}
        </p>
        <AnimatedHeading as="h1" className="mt-3 text-5xl font-medium leading-[0.95] tracking-[-0.045em] sm:text-6xl">
          {course.title}
        </AnimatedHeading>
        {course.description && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-graphite">{course.description}</p>}
        {course.archived && (
          <p className="mt-4 text-sm font-medium text-graphite">This course is archived. You can still look at your work.</p>
        )}
      </div>

      {course.assessments.length === 0 ? (
        <div className="mt-8 rounded-[2rem] bg-card p-8 text-center">
          <p className="-rotate-1 font-hand text-[1.7rem] text-graphite">Nothing here yet.</p>
          <p className="mt-2 text-[15px] text-graphite">Tasks and quizzes appear here when your lecturer publishes them.</p>
        </div>
      ) : (
        <RevealGroup as="ul" stagger={0.08} className="mt-8 space-y-3">
          {course.assessments.map((item) => (
            <RevealItem as="li" kind="up" key={item._id}>
              <div className="flex flex-wrap items-center gap-4 rounded-[1.6rem] bg-card p-5 sm:p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-panel">
                  {item.kind === "task" ? <Code className="size-5" /> : <ListChecks className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-graphite">{KIND_LABEL[item.kind]}</p>
                  <p className="mt-0.5 text-lg font-medium leading-snug">{item.title}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-graphite">
                    <Clock className="size-4" />
                    {status(item)}
                  </p>
                </div>
                {action(item)}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </Enter>
  );
}
