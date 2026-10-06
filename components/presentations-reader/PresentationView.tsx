"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useRef } from "react";
import { ContactCard } from "@/components/contact/ContactCard";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter } from "@/components/motion/Reveal";
import { DeckPlayer, type DeckPlayerHandle } from "@/components/presentations/DeckPlayer";
import { Button, ButtonLink } from "@/components/ui/buttons";
import { ArrowLeft, Expand } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { THEME_INFO, type Deck } from "@/lib/presentation";

export type Presentation = FunctionReturnType<typeof api.presentations.read>;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
const QUESTION = { en: "A question about this presentation?", ka: "კითხვა ამ პრეზენტაციაზე?" };

/**
 * A presentation as the student watches it: a quiet header (course › week,
 * the title, Present), then the deck in Kalami's player with the room of the
 * whole page: the arrow keys work straight away, a tap moves on, Present goes
 * full screen. Below: back to the course, and a way to ask.
 */
export function PresentationView({ presentation }: { presentation: Presentation }) {
  const courseHref = `/courses/${presentation.course._id}`;
  const player = useRef<DeckPlayerHandle>(null);
  const deck: Deck = { theme: presentation.theme, slides: presentation.slides };
  const count = presentation.slides.length;

  return (
    <article className="mx-auto w-full max-w-[76rem]">
      <Enter as="header" kind="up" className="px-1 sm:px-2">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
            <li className="min-w-0">
              <Link
                href={courseHref}
                className={`inline-flex max-w-full items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-ink ring-1 ring-line transition hover:bg-panel ${focusRing}`}
              >
                <ArrowLeft className="size-3.5 shrink-0" />
                <span className="truncate">{presentation.course.title}</span>
              </Link>
            </li>
            <li aria-hidden="true" className="text-graphite/60">
              ›
            </li>
            <li className="min-w-0 truncate text-graphite">{presentation.week.title}</li>
          </ol>
        </nav>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div className="min-w-0 flex-1 basis-[26rem]">
            <AnimatedHeading
              as="h1"
              className="text-4xl font-medium leading-[1.02] tracking-[-0.04em] hyphens-auto wrap-anywhere sm:text-[3.25rem]"
            >
              {presentation.title}
            </AnimatedHeading>
            <p className="mt-3 text-[15px] text-graphite">
              Presentation · {count} slide{count === 1 ? "" : "s"} · {THEME_INFO[presentation.theme].label}
              <span className="hidden sm:inline"> · ← → or Space to move · F for full screen</span>
            </p>
          </div>
          <Button onClick={() => player.current?.present()}>
            <Expand className="size-4" />
            Present
          </Button>
        </div>
      </Enter>

      <div className="mt-7 sm:mt-9">
        <DeckPlayer ref={player} deck={deck} title={presentation.title} />
      </div>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-[2rem] bg-panel px-5 py-4 sm:mt-16 sm:px-6">
        <ButtonLink href={courseHref} variant="outline" className="bg-card max-sm:w-full">
          <ArrowLeft className="size-4" />
          Back to course
        </ButtonLink>
        <ContactCard
          variant="compact"
          label={QUESTION}
          courseId={presentation.course._id}
          weekId={presentation.week._id}
          initialTopic="other"
        />
      </footer>
    </article>
  );
}

/** NOT_FOUND from the player: unpublished, removed, or a course the student isn't in. */
export function PresentationNotFound({ courseHref }: { courseHref: string }) {
  return (
    <div className="rounded-[2.25rem] bg-panel px-6 py-14 sm:rounded-[2.75rem] sm:px-12">
      <p className="-rotate-2 font-hand text-[1.8rem] leading-none text-graphite">Hmm</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">This presentation isn&apos;t available</h1>
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
