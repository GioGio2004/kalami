"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ContactCard } from "@/components/contact/ContactCard";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Folder, Globe } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { lessonPath } from "@/lib/urls";
import { AssessmentRow, type CourseItem } from "./AssessmentRow";

type Course = FunctionReturnType<typeof api.learn.course>;
type Week = Course["weeks"][number];

const sectionHeading = "px-1 text-xs font-semibold uppercase tracking-[0.12em] text-graphite";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
/** A row inside an open week: a lesson, the Drive folder or a link. */
const rowClass = `group flex items-center gap-3 rounded-2xl bg-panel/60 p-3 pr-4 transition hover:bg-panel ${focusRing}`;

const CANT_OPEN = { en: "Can't open something?", ka: "რამე არ იხსნება?" };

const isExam = (item: CourseItem) => item.kind === "midterm" || item.kind === "final";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** "2 lessons · 3 materials · 1 quiz": what a closed week holds. */
function weekSummary(week: Week, work: CourseItem[]): string {
  const materials = (week.driveUrl ? 1 : 0) + week.links.length;
  const tasks = work.filter((item) => item.kind === "task").length;
  const quizzes = work.length - tasks;
  const parts = [
    week.lessons.length > 0 && plural(week.lessons.length, "lesson", "lessons"),
    materials > 0 && plural(materials, "material", "materials"),
    tasks > 0 && plural(tasks, "task", "tasks"),
    quizzes > 0 && plural(quizzes, "quiz", "quizzes"),
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" · ") : "Nothing here yet";
}

/**
 * A course, week by week: each week's lessons, materials and work in a card
 * (the latest one open), then the exams, then any work outside a week.
 */
export function CourseView({ course }: { course: Course }) {
  // Only weeks the student toggled; the rest follow the default (latest open).
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const weekIds = new Set<string>(course.weeks.map((week) => week._id));
  const inWeek = (item: CourseItem) => item.weekId !== undefined && weekIds.has(item.weekId);
  const exams = course.assessments.filter(isExam);
  const other = course.assessments.filter((item) => !isExam(item) && !inWeek(item));
  const workIn = (week: Week) => course.assessments.filter((item) => !isExam(item) && item.weekId === week._id);
  const latestId = course.weeks.at(-1)?._id;
  const empty = course.weeks.length === 0 && course.assessments.length === 0;

  return (
    <Enter
      kind="scale"
      className="rounded-[2.25rem] bg-panel px-3 pb-3 pt-8 sm:rounded-[2.75rem] sm:px-10 sm:pb-8 sm:pt-10 lg:px-12"
    >
      <Link
        href="/dashboard"
        className={`ml-2 inline-flex items-center gap-2 rounded-full text-sm text-graphite hover:text-ink sm:ml-0 ${focusRing}`}
      >
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>
      <div className="mt-6 px-2 sm:px-1">
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

      {empty ? (
        <div className="mt-8 rounded-[1.6rem] bg-card px-6 py-10 text-center sm:rounded-[2rem]">
          <p className="-rotate-1 font-hand text-[1.7rem] leading-none text-graphite">Check back soon</p>
          <p className="mt-3 text-[15px] font-medium">Your lecturer hasn&apos;t published anything yet.</p>
          <p className="mt-1 text-sm text-graphite">Lessons, materials and tasks show up here when they do.</p>
        </div>
      ) : (
        <>
          {course.weeks.length > 0 && (
            <section aria-labelledby="weeks-heading" className="mt-8">
              <h2 id="weeks-heading" className={sectionHeading}>
                Weeks · {course.weeks.length}
              </h2>
              <RevealGroup as="ol" stagger={0.06} className="mt-3 grid grid-cols-1 gap-3 *:min-w-0">
                {course.weeks.map((week, index) => {
                  const fallback = week._id === latestId;
                  return (
                    <RevealItem as="li" kind="up" key={week._id}>
                      <WeekCard
                        week={week}
                        number={index + 1}
                        courseId={course._id}
                        work={workIn(week)}
                        latest={week._id === latestId}
                        open={toggled[week._id] ?? fallback}
                        onToggle={() =>
                          setToggled((current) => ({ ...current, [week._id]: !(current[week._id] ?? fallback) }))
                        }
                      />
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            </section>
          )}

          <section aria-labelledby="exams-heading" className="mt-8">
            <h2 id="exams-heading" className={sectionHeading}>
              Exams{exams.length > 0 && ` · ${exams.length}`}
            </h2>
            {exams.length === 0 ? (
              <p className="mt-3 rounded-[1.6rem] border-2 border-dashed border-line px-5 py-4 text-[15px] text-graphite sm:rounded-[2rem]">
                No exams yet. Midterms and finals show up here.
              </p>
            ) : (
              <WorkList items={exams} />
            )}
          </section>

          {other.length > 0 && (
            <section aria-labelledby="other-heading" className="mt-8">
              <h2 id="other-heading" className={sectionHeading}>
                Other work · {other.length}
              </h2>
              <WorkList items={other} />
            </section>
          )}
        </>
      )}

      <ContactCard courseId={course._id} className="mt-8" />
    </Enter>
  );
}

function WorkList({ items }: { items: CourseItem[] }) {
  return (
    <RevealGroup as="ul" stagger={0.08} className="mt-3 space-y-3">
      {items.map((item) => (
        <RevealItem as="li" kind="up" key={item._id}>
          <AssessmentRow item={item} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

/** One week: closed, its title and what's inside; open, the lessons, materials and work themselves. */
function WeekCard({
  week,
  number,
  courseId,
  work,
  latest,
  open,
  onToggle,
}: {
  week: Week;
  number: number;
  courseId: Course["_id"];
  work: CourseItem[];
  latest: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const hasMaterials = week.driveUrl !== undefined || week.links.length > 0;
  const nothing = week.lessons.length === 0 && !hasMaterials && work.length === 0;
  return (
    <ExpandableCard
      heading="h3"
      icon={
        <span
          className={`grid size-full place-items-center rounded-full text-base font-semibold tabular-nums ${
            latest ? "bg-highlighter text-ink" : ""
          }`}
        >
          {number}
        </span>
      }
      title={week.title}
      summary={weekSummary(week, work)}
      aside={
        latest && (
          // Phones keep the title's room; the lime number marks the latest week there.
          <>
            <span className="sr-only sm:hidden">Latest week</span>
            <span className="hidden shrink-0 rounded-full bg-highlighter px-2.5 py-1 text-xs font-semibold text-ink sm:inline">
              Latest
            </span>
          </>
        )
      }
      open={open}
      onToggle={onToggle}
    >
      <div className="space-y-6 border-t border-line pt-4">
        {week.description && (
          <p className="px-1 text-[15px] leading-relaxed text-graphite">{week.description}</p>
        )}

        {week.lessons.length > 0 && (
          <WeekPart title="Lessons">
            {week.lessons.map((lesson) => (
              <li key={lesson._id}>
                <Link href={lessonPath(courseId, lesson._id)} className={rowClass}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card">
                    <BookOpen className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 font-medium leading-snug wrap-anywhere">{lesson.title}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card px-3 py-1.5 text-sm font-medium">
                    Read
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </WeekPart>
        )}

        {hasMaterials && (
          <WeekPart title="Materials">
            {week.driveUrl && (
              <li>
                <a href={week.driveUrl} target="_blank" rel="noopener noreferrer" className={rowClass}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-highlighter text-ink">
                    <Folder className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug">
                      Open folder in Google Drive
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-graphite">
                      Opens in Google Drive. No Google sign-in needed.
                    </span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-graphite transition group-hover:text-ink" />
                </a>
              </li>
            )}
            {week.links.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className={rowClass}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card">
                    <Globe className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium leading-snug wrap-anywhere">
                      {link.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-graphite">{link.host}</span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-graphite transition group-hover:text-ink" />
                </a>
              </li>
            ))}
          </WeekPart>
        )}

        {work.length > 0 && (
          <WeekPart title="This week's tasks and quizzes">
            {work.map((item) => (
              <li key={item._id}>
                <AssessmentRow item={item} compact />
              </li>
            ))}
          </WeekPart>
        )}

        {nothing && <p className="px-1 text-sm text-graphite">Nothing in this week yet.</p>}

        <div className="border-t border-line px-1 pt-3">
          <ContactCard
            variant="compact"
            label={CANT_OPEN}
            courseId={courseId}
            weekId={week._id}
            initialTopic="materials_access"
          />
        </div>
      </div>
    </ExpandableCard>
  );
}

function WeekPart({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className={sectionHeading}>{title}</h4>
      <ul className="mt-2 space-y-2">{children}</ul>
    </div>
  );
}
