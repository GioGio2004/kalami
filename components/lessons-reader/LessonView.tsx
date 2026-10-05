"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { ContactCard } from "@/components/contact/ContactCard";
import { LessonSlides } from "@/components/lessons/LessonSlides";
import type { LessonBlock } from "@/components/lessons/types";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/buttons";
import { ArrowLeft, ArrowRight, Check } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { lessonPath } from "@/lib/urls";

export type Lesson = FunctionReturnType<typeof api.lessons.read>;
type Neighbour = NonNullable<Lesson["next"]>;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.12em]";

const QUESTION = { en: "Question about this lesson?", ka: "კითხვა გაქვს ამ გაკვეთილზე?" };

/** About how long the words take to read (code counts a little extra; videos aren't counted). */
export function readingMinutes(blocks: LessonBlock[]): number {
  let words = 0;
  const count = (text?: string) => {
    if (text) words += text.split(/\s+/).filter(Boolean).length;
  };
  for (const block of blocks) {
    switch (block.type) {
      case "text":
        count(block.md);
        break;
      case "callout":
        count(block.title);
        count(block.md);
        break;
      case "code":
        words += block.code.split("\n").length * 4;
        count(block.caption);
        break;
      case "image":
        count(block.caption);
        break;
      case "video":
        count(block.caption);
        break;
      case "steps":
        count(block.title);
        for (const step of block.steps) {
          count(step.title);
          count(step.md);
        }
        break;
      case "check":
        count(block.check.prompt);
        for (const option of block.check.options ?? []) count(option.text);
        break;
    }
  }
  return Math.max(1, Math.round(words / 200));
}

/**
 * A lesson as the student reads it: a compact header (course › week, the
 * title, how long it is), then the lecturer's blocks as slides, one block per
 * slide, so the slide gets the room. Below: the way on to other lessons (next,
 * or a note that this is the latest), back to the course, and a way to ask.
 */
export function LessonView({ lesson }: { lesson: Lesson }) {
  const courseHref = `/courses/${lesson.course._id}`;
  const minutes = readingMinutes(lesson.blocks);
  const slides = lesson.blocks.length;
  const alone = !lesson.previous;

  return (
    <article className="mx-auto w-full max-w-[52rem]">
      <Enter
        as="header"
        kind="scale"
        className="rounded-[2rem] bg-panel px-5 py-5 sm:rounded-[2.25rem] sm:px-8 sm:py-6"
      >
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-graphite">
            <li className="min-w-0">
              <Link
                href={courseHref}
                className={`rounded-full underline decoration-ink/25 underline-offset-4 transition hover:text-ink hover:decoration-ink ${focusRing}`}
              >
                {lesson.course.title}
              </Link>
            </li>
            <li aria-hidden="true" className="text-graphite/60">
              ›
            </li>
            <li className="min-w-0">{lesson.week.title}</li>
          </ol>
        </nav>
        <AnimatedHeading
          as="h1"
          className="mt-3 text-3xl font-medium leading-[1.05] tracking-[-0.035em] hyphens-auto wrap-anywhere sm:text-4xl"
        >
          {lesson.title}
        </AnimatedHeading>
        {slides > 0 && (
          <p className="mt-2 text-sm text-graphite">
            {slides} slide{slides === 1 ? "" : "s"} · about {minutes} min
          </p>
        )}
      </Enter>

      {/* Paragraphs get a little more air than elsewhere. */}
      <div className="mt-5 sm:mt-6 [&_li]:leading-[1.75] [&_p]:leading-[1.75]">
        <LessonSlides
          blocks={lesson.blocks}
          label={lesson.title}
          empty={<p className="px-2 text-[17px] text-graphite">This lesson is empty for now.</p>}
        />
      </div>

      <footer className="mt-12 rounded-[2.25rem] bg-panel p-3 sm:mt-16 sm:rounded-[2.75rem] sm:p-5">
        <nav aria-label="Other lessons" className="grid grid-cols-1 gap-3 *:min-w-0 sm:grid-cols-2">
          {lesson.next ? (
            <NextCard courseId={lesson.course._id} lesson={lesson.next} wide={alone} />
          ) : (
            <LatestCard wide={alone} />
          )}
          {lesson.previous && <PreviousCard courseId={lesson.course._id} lesson={lesson.previous} />}
        </nav>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 px-2 pb-2 sm:px-1 sm:pb-0">
          <ButtonLink href={courseHref} variant="outline" className="bg-card max-sm:w-full">
            <ArrowLeft className="size-4" />
            Back to course
          </ButtonLink>
          <ContactCard
            variant="compact"
            label={QUESTION}
            courseId={lesson.course._id}
            weekId={lesson.week._id}
            initialTopic="other"
          />
        </div>
      </footer>
    </article>
  );
}

/** The way on, in highlighter: the next lesson in the course. */
function NextCard({ courseId, lesson, wide }: { courseId: string; lesson: Neighbour; wide: boolean }) {
  return (
    <Link
      href={lessonPath(courseId, lesson._id)}
      className={`group flex min-h-32 flex-col justify-between gap-5 rounded-[1.6rem] bg-highlighter p-5 text-ink transition hover:brightness-95 sm:rounded-[2rem] sm:p-6 ${
        wide ? "sm:col-span-2" : ""
      } ${focusRing}`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className={`${eyebrow} text-ink/70`}>Next lesson</span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-highlighter transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="size-4" />
        </span>
      </span>
      <span className="text-lg font-medium leading-snug tracking-tight wrap-anywhere sm:text-xl">{lesson.title}</span>
    </Link>
  );
}

/** On the left on wider screens; after the way on, on phones. */
function PreviousCard({ courseId, lesson }: { courseId: string; lesson: Neighbour }) {
  return (
    <Link
      href={lessonPath(courseId, lesson._id)}
      className={`group flex min-h-32 flex-col justify-between gap-5 rounded-[1.6rem] bg-card p-5 transition hover:bg-paper sm:order-first sm:rounded-[2rem] sm:p-6 ${focusRing}`}
    >
      <span className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-panel transition-transform group-hover:-translate-x-0.5">
          <ArrowLeft className="size-4" />
        </span>
        <span className={`${eyebrow} text-graphite`}>Previous lesson</span>
      </span>
      <span className="text-lg font-medium leading-snug tracking-tight wrap-anywhere sm:text-xl">{lesson.title}</span>
    </Link>
  );
}

/** Instead of a next lesson: the student has read everything published so far. */
function LatestCard({ wide }: { wide: boolean }) {
  return (
    <div
      className={`flex min-h-32 flex-col justify-between gap-5 rounded-[1.6rem] bg-charcoal p-5 text-paper sm:rounded-[2rem] sm:p-6 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <span className="grid size-9 place-items-center rounded-full bg-highlighter text-ink">
        <Check className="size-4" />
      </span>
      <span>
        <span className="block text-lg font-medium leading-snug tracking-tight sm:text-xl">
          You&apos;ve reached the latest lesson
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-paper/65">
          New lessons show up on the course page when your lecturer publishes them.
        </span>
      </span>
    </div>
  );
}

/** NOT_FOUND from the reader: unpublished, removed, or a course the student isn't in. */
export function LessonNotFound({ courseHref }: { courseHref: string }) {
  return (
    <div className="rounded-[2.25rem] bg-panel px-6 py-14 sm:rounded-[2.75rem] sm:px-12">
      <p className="-rotate-2 font-hand text-[1.8rem] leading-none text-graphite">Hmm</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">This lesson isn&apos;t available</h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-graphite">
        It may not be published yet, or it was moved. The rest of the course is still there.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={courseHref} className="max-sm:w-full">
          <ArrowLeft className="size-4" />
          Back to the course
        </ButtonLink>
        <ButtonLink href="/dashboard" variant="ghost" className="max-sm:w-full">
          My dashboard
        </ButtonLink>
      </div>
    </div>
  );
}
