"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { ContactCard } from "@/components/contact/ContactCard";
import { CrosswordBoard } from "@/components/crossword/CrosswordBoard";
import { downloadCrosswordPdf } from "@/components/crossword/pdf";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/buttons";
import { ArrowLeft } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";

export type Puzzle = FunctionReturnType<typeof api.crosswords.read>;
type SaveResult = FunctionReturnType<typeof api.crosswords.saveProgress>;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
const QUESTION = { en: "A question about this crossword?", ka: "კითხვა ამ კროსვორდზე?" };

/**
 * A crossword as the student solves it: a quiet header (course › week, the
 * title), then the board (components/crossword/CrosswordBoard): tap a square
 * or a clue and type the word in the little window that opens; it goes
 * straight into the grid and is saved. Full screen and a PDF to print are
 * on the board. The answers stay on the server: Check, Reveal and "solved"
 * ask it.
 */
export function CrosswordPuzzle({
  puzzle,
  onSave,
  onReveal,
}: {
  puzzle: Puzzle;
  onSave: (letters: string[], check: boolean) => Promise<SaveResult>;
  onReveal: (cells: number[]) => Promise<{ cell: number; letter: string }[]>;
}) {
  const courseHref = `/courses/${puzzle.course._id}`;
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
                <span className="truncate">{puzzle.course.title}</span>
              </Link>
            </li>
            <li aria-hidden="true" className="text-graphite/60">
              ›
            </li>
            <li className="min-w-0 truncate text-graphite">{puzzle.week.title}</li>
          </ol>
        </nav>
        <AnimatedHeading as="h1" className="mt-6 text-4xl font-medium leading-[1.02] tracking-[-0.04em] hyphens-auto wrap-anywhere sm:text-[3.25rem]">
          {puzzle.title}
        </AnimatedHeading>
        <p className="mt-3 text-[15px] text-graphite">
          Crossword · {puzzle.words.length} words · practice, not graded · tap a square or a clue to fill in its word
        </p>
      </Enter>

      <div className="mt-7 sm:mt-9">
        <CrosswordBoard
          title={puzzle.title}
          width={puzzle.width}
          height={puzzle.height}
          cells={puzzle.cells}
          words={puzzle.words}
          initial={puzzle.progress}
          onSave={onSave}
          onReveal={onReveal}
          onDownloadPdf={() =>
            downloadCrosswordPdf({
              title: puzzle.title,
              subtitle: `${puzzle.course.title} · ${puzzle.week.title}`,
              width: puzzle.width,
              height: puzzle.height,
              cells: puzzle.cells,
              words: puzzle.words,
            })
          }
        />
      </div>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-[2rem] bg-panel px-5 py-4 sm:mt-16 sm:px-6">
        <ButtonLink href={courseHref} variant="outline" className="bg-card max-sm:w-full">
          <ArrowLeft className="size-4" />
          Back to course
        </ButtonLink>
        <ContactCard variant="compact" label={QUESTION} courseId={puzzle.course._id} weekId={puzzle.week._id} initialTopic="other" />
      </footer>
    </article>
  );
}

/** NOT_FOUND: unpublished, removed, or a course the student isn't in. */
export function CrosswordNotFound({ courseHref }: { courseHref: string }) {
  return (
    <div className="rounded-[2.25rem] bg-panel px-6 py-14 sm:rounded-[2.75rem] sm:px-12">
      <p className="-rotate-2 font-hand text-[1.8rem] leading-none text-graphite">Hmm</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">This crossword isn&apos;t available</h1>
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
