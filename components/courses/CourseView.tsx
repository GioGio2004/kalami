"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { ContactCard } from "@/components/contact/ContactCard";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { buttonClass } from "@/components/ui/buttons";
import { ArrowLeft, ArrowUpRight, Folder, Globe } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { AssessmentRow } from "./AssessmentRow";

type Course = FunctionReturnType<typeof api.learn.course>;
type Material = Course["materials"][number];

const sectionHeading = "px-1 text-xs font-semibold uppercase tracking-[0.12em] text-graphite";

const CANT_OPEN = { en: "Can't open it?", ka: "არ იხსნება?" };

export function CourseView({ course }: { course: Course }) {
  const hasMaterials = course.materials.length > 0;
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

      {hasMaterials && (
        <section aria-labelledby="materials-heading" className="mt-8">
          <h2 id="materials-heading" className={sectionHeading}>
            Materials · {course.materials.length}
          </h2>
          <RevealGroup as="ul" stagger={0.08} className="mt-3 space-y-3">
            {course.materials.map((material) => (
              <RevealItem as="li" kind="up" key={material._id}>
                <MaterialRow material={material} courseId={course._id} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}

      {/* The heading only earns its place once there is a materials list above it. */}
      {hasMaterials && <h2 className={`mt-8 ${sectionHeading}`}>Tasks and quizzes</h2>}
      {course.assessments.length === 0 ? (
        <div className={`${hasMaterials ? "mt-3" : "mt-8"} rounded-[2rem] bg-card p-8 text-center`}>
          <p className="-rotate-1 font-hand text-[1.7rem] text-graphite">Nothing here yet.</p>
          <p className="mt-2 text-[15px] text-graphite">Tasks and quizzes appear here when your lecturer publishes them.</p>
        </div>
      ) : (
        <RevealGroup as="ul" stagger={0.08} className={`${hasMaterials ? "mt-3" : "mt-8"} space-y-3`}>
          {course.assessments.map((item) => (
            <RevealItem as="li" kind="up" key={item._id}>
              <AssessmentRow item={item} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      <ContactCard courseId={course._id} className="mt-8" />
    </Enter>
  );
}

/** One week's materials: a shared Google Drive folder or a link the lecturer keeps elsewhere. */
function MaterialRow({ material, courseId }: { material: Material; courseId: Course["_id"] }) {
  const drive = material.source === "drive";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[1.6rem] bg-card p-5 sm:p-6">
      <span className="hidden size-12 shrink-0 place-items-center rounded-full bg-panel sm:grid">
        {drive ? <Folder className="size-5" /> : <Globe className="size-5" />}
      </span>
      <div className="min-w-0 flex-1 basis-full sm:basis-0">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
          {drive ? "Google Drive" : "Link"}
        </p>
        <p className="mt-0.5 text-lg font-medium leading-snug">{material.title}</p>
        {material.description && (
          <p className="mt-1 text-[15px] leading-relaxed text-graphite">{material.description}</p>
        )}
        {/* On phones the icon chip is hidden, so the icon moves down to this line. */}
        <p className="mt-1 flex items-start gap-1.5 text-sm text-graphite">
          {drive ? (
            <>
              <Folder className="mt-0.5 size-4 shrink-0 sm:hidden" />
              Opens in Google Drive. No Google sign-in needed.
            </>
          ) : (
            <>
              <Globe className="mt-0.5 size-4 shrink-0 sm:hidden" />
              <span className="min-w-0 break-all">{material.host}</span>
            </>
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <a
          href={material.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("ink", "sm")}
        >
          Open materials
          <span className="sr-only">: {material.title} (opens in a new tab)</span>
          <ArrowUpRight className="size-4" />
        </a>
        <ContactCard
          variant="compact"
          label={CANT_OPEN}
          courseId={courseId}
          materialId={material._id}
          initialTopic="materials_access"
        />
      </div>
    </div>
  );
}
