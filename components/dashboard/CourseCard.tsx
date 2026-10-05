"use client";

import type { FunctionReturnType } from "convex/server";
import type { GenericId as Id } from "convex/values";
import Link from "next/link";
import { AssessmentRow, type CourseItem } from "@/components/courses/AssessmentRow";
import { useId } from "react";
import { ArrowRight, Notebook } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { formatShort } from "@/lib/time";

export type MyCourse = FunctionReturnType<typeof api.learn.myCourses>[number];
export type CourseDetail = FunctionReturnType<typeof api.learn.course>;
/** Loads a course's work when its card opens. A hook: the page wires it to Convex, the gallery to samples. */
export type UseCourse = (courseId: Id<"courses">) => CourseDetail | undefined;

type Group = "open" | "upcoming" | "done";

const GROUPS: { id: Group; label: string }[] = [
  { id: "open", label: "To do" },
  { id: "upcoming", label: "Coming up" },
  { id: "done", label: "Finished" },
];

function groupOf(item: CourseItem): Group {
  if (item.state === "upcoming") return "upcoming";
  if (item.state === "closed" || item.result?.status === "submitted") return "done";
  return "open";
}

/** Direct course navigation, with an optional task list loaded on demand. */
export function CourseCard({
  course,
  nextDue,
  open,
  onToggle,
  useCourse,
}: {
  course: MyCourse;
  /** The nearest open work in this course, if any (from the up-next list). */
  nextDue?: { title: string; closesAt?: number };
  open: boolean;
  onToggle: () => void;
  useCourse: UseCourse;
}) {
  const bodyId = useId();
  const summary = nextDue
    ? `${nextDue.closesAt ? `Due ${formatShort(nextDue.closesAt)} · ` : ""}${nextDue.title}`
    : [course.lecturer, course.semester].filter(Boolean).join(" · ");
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_2px_8px_-5px_rgba(20,20,20,0.12)] transition-shadow hover:shadow-[0_6px_22px_-14px_rgba(20,20,20,0.2)]">
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-panel"><Notebook className="size-5" /></span>
          <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${course.openCount > 0 ? "bg-highlighter/50 text-ink" : "bg-panel/60 text-graphite"}`}>{course.openCount > 0 ? `${course.openCount} open task${course.openCount === 1 ? "" : "s"}` : "Course materials"}</span>
        </div>
        <h3 className="max-w-2xl text-xl font-semibold leading-snug tracking-[-0.025em] wrap-anywhere"><Link href={`/courses/${course._id}`} className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">{course.title}</Link></h3>
        <p className="mt-2 text-sm leading-relaxed text-graphite">{[course.lecturer, course.semester].filter(Boolean).join(" · ")}</p>
        {course.description && <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-relaxed text-graphite">{course.description}</p>}
        {nextDue && <p className="mt-4 border-l-2 border-highlighter-deep pl-3 text-sm leading-relaxed">{summary}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/courses/${course._id}`} aria-label={`Open course: ${course.title}`} className="inline-flex min-h-11 items-center gap-5 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">Open course<ArrowRight className="size-4 text-highlighter" /></Link>
          <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={bodyId} className="min-h-11 rounded-xl px-3 text-sm text-graphite transition hover:bg-panel hover:text-ink focus-visible:outline-2">{open ? "Hide tasks −" : "View tasks +"}</button>
        </div>
      </div>
      <div id={bodyId} hidden={!open} className="px-5 pb-5 sm:px-6 sm:pb-6">{open && <CourseBody course={course} useCourse={useCourse} />}</div>
    </article>
  );
}

function CourseBody({ course, useCourse }: { course: MyCourse; useCourse: UseCourse }) {
  const detail = useCourse(course._id);
  return (
    <div className="border-t border-line pt-4">
      {detail === undefined ? (
        <div className="space-y-2" aria-busy="true">
          <div className="h-16 animate-pulse rounded-2xl bg-panel/60" />
          <div className="h-16 animate-pulse rounded-2xl bg-panel/60" />
        </div>
      ) : detail.assessments.length === 0 ? (
        <p className="text-sm leading-relaxed text-graphite">
          {detail.weeks.length > 0
            ? "No tasks or quizzes yet. Lessons and materials are on the course page."
            : "Nothing here yet. Tasks and quizzes appear when your lecturer publishes them."}
        </p>
      ) : (
        GROUPS.map((group) => {
          const items = detail.assessments.filter((item) => groupOf(item) === group.id);
          if (items.length === 0) return null;
          return (
            <div key={group.id} className="mt-4 first:mt-0">
              <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-graphite">{group.label}</h3>
              <ul className="mt-2 space-y-2">
                {items.map((item) => (
                  <li key={item._id}>
                    <AssessmentRow item={item} compact />
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
      <Link
        href={`/courses/${course._id}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Course page
        {/* Lessons and materials live on the course page, week by week; say so, or nobody finds them from here. */}
        {detail !== undefined && detail.weeks.length > 0 &&
          ` · ${detail.weeks.length} week${detail.weeks.length === 1 ? "" : "s"}`}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
