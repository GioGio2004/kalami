"use client";

import type { FunctionReturnType } from "convex/server";
import type { GenericId as Id } from "convex/values";
import Link from "next/link";
import { AssessmentRow, type CourseItem } from "@/components/courses/AssessmentRow";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
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

/** A course on the dashboard: closed, one line; open, everything in it. */
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
  const summary = nextDue
    ? `${nextDue.closesAt ? `Due ${formatShort(nextDue.closesAt)} · ` : ""}${nextDue.title}`
    : [course.lecturer, course.semester].filter(Boolean).join(" · ");
  return (
    <ExpandableCard
      icon={<Notebook className="size-5" />}
      title={course.title}
      summary={summary}
      aside={
        course.openCount > 0 && (
          <span className="shrink-0 rounded-full bg-highlighter px-2.5 py-1 text-xs font-semibold">
            {course.openCount} open
          </span>
        )
      }
      open={open}
      onToggle={onToggle}
    >
      <CourseBody course={course} useCourse={useCourse} />
    </ExpandableCard>
  );
}

function CourseBody({ course, useCourse }: { course: MyCourse; useCourse: UseCourse }) {
  const detail = useCourse(course._id);
  return (
    <div className="border-t border-line pt-4">
      {course.description && <p className="mb-4 text-[15px] leading-relaxed text-graphite">{course.description}</p>}
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
