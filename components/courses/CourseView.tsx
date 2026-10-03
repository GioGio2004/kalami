"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ArrowLeft } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { AssessmentRow } from "./AssessmentRow";

type Course = FunctionReturnType<typeof api.learn.course>;

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
              <AssessmentRow item={item} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </Enter>
  );
}
