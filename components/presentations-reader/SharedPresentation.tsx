"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { KalamiMark } from "@/components/Logo";
import { DeckPlayer, type DeckPlayerHandle } from "@/components/presentations/DeckPlayer";
import { THEMES, themeStyle } from "@/components/presentations/themes";
import { ButtonLink } from "@/components/ui/buttons";
import { Check, Copy, Expand } from "@/components/ui/icons";
import { StatusScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";
import { THEME_INFO, type Deck, type DeckTheme } from "@/lib/presentation";

export type SharedDeck = NonNullable<FunctionReturnType<typeof api.presentations.shared>>;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(color:--deck-fg)";

/**
 * The page's column. The deck is what people came for, so on a wide but short
 * screen (a laptop) the column narrows until a 16:9 slide and its controls fit
 * the window together; the header and footer line up with it.
 */
const frame = "mx-auto w-full max-w-[min(80rem,calc((100dvh_-_6.5rem)*16/9_+_4rem))] px-4 sm:px-8";

/**
 * The page behind a presentation's share link. Anyone with the link watches,
 * signed in or not. The deck is live: what the lecturer saves shows up here,
 * and a link that's turned off or replaced turns into "not available".
 * `theme` comes from the server's own read, so even the loading screen is
 * already in the deck's colours.
 */
export function SharedPresentation({ token, theme }: { token: string; theme: DeckTheme | null }) {
  const deck = useQuery(api.presentations.shared, { token });
  if (deck === undefined) {
    return <SharedLoading theme={theme} />;
  }
  if (deck === null) {
    return <SharedLinkOff />;
  }
  return <SharedPresentationView presentation={deck} />;
}

/**
 * A shared presentation, full page, in the deck's own world: its background
 * and glows around Kalami's player, the title, who shared it, Present and a
 * way to pass the link on. The address keeps the slide (#5), so a reload or
 * a copied address opens on the same slide.
 */
export function SharedPresentationView({ presentation }: { presentation: SharedDeck }) {
  const player = useRef<DeckPlayerHandle>(null);
  const t = THEMES[presentation.theme];
  const deck: Deck = { theme: presentation.theme, slides: presentation.slides };
  const count = presentation.slides.length;
  const [start] = useState(() => slideFromHash(count));
  useCanvas(t.bg);

  return (
    <div
      style={themeStyle(presentation.theme)}
      className="relative isolate flex min-h-dvh flex-1 flex-col overflow-hidden bg-(--deck-bg) text-(--deck-fg)"
    >
      {/* The deck's glows, softly, behind the whole page. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-72 -top-96 size-[52rem] rounded-full opacity-70 blur-3xl" style={{ background: t.glow[0] }} />
        <div className="absolute -bottom-[28rem] -left-64 size-[48rem] rounded-full opacity-70 blur-3xl" style={{ background: t.glow[1] }} />
      </div>

      <header className={`${frame} flex items-center justify-between gap-3 pt-[calc(1rem+env(safe-area-inset-top))] sm:pt-7`}>
        <Link href="/" className={`flex items-center gap-2.5 rounded-full ${focusRing}`}>
          <KalamiMark className="size-9 shrink-0" />
          <span className="text-[1.2rem] font-semibold tracking-[-0.03em]">Kalami</span>
        </Link>
        <div className="flex items-center gap-2">
          <PassItOn title={presentation.title} />
          <button
            type="button"
            onClick={() => player.current?.present()}
            className={`inline-flex h-10 items-center gap-2 rounded-full bg-(--deck-fg) px-4 text-sm font-medium text-(--deck-bg) transition hover:opacity-90 active:scale-[0.98] sm:h-11 sm:px-5 ${focusRing}`}
          >
            <Expand className="size-4" />
            Present
          </button>
        </div>
      </header>

      <main className={`${frame} flex-1 pb-10 pt-8 sm:pt-12`}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--deck-muted)">
          Presentation · {count} slide{count === 1 ? "" : "s"} · {THEME_INFO[presentation.theme].label}
        </p>
        {/* In the deck's own display face; Chalk's handwriting runs larger, as on its slides. */}
        <h1
          className="mt-3 max-w-5xl text-[length:calc(2.25rem*var(--deck-display-scale))] leading-[1.02] hyphens-auto wrap-anywhere sm:text-[length:calc(3.75rem*var(--deck-display-scale))]"
          style={{ fontFamily: "var(--deck-display)", fontWeight: t.displayWeight, letterSpacing: t.tracking }}
        >
          {presentation.title}
        </h1>
        <p className="mt-4 text-[15px] text-(--deck-muted)">
          Shared by {presentation.sharedBy}
          <span className="hidden sm:inline"> · ← → or Space to move · F for full screen</span>
        </p>

        <div className="mt-8 sm:mt-10 [&_[data-deck-stage]]:ring-1 [&_[data-deck-stage]]:ring-(color:--deck-line)">
          <DeckPlayer
            ref={player}
            deck={deck}
            title={presentation.title}
            speakerNotes={presentation.notes}
            followIndex={start}
            onIndexChange={rememberSlide}
          />
        </div>
      </main>

      <footer className={`${frame} pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-8`}>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-dashed border-(color:--deck-line) pt-6 text-sm text-(--deck-muted)">
          <p className="max-w-xl">
            Made with <span className="font-medium text-(--deck-fg)">Kalami</span>, where lecturers build presentations like
            this one, with the lessons, quizzes and exams around them.
          </p>
          <Link href="/" className={`inline-flex items-center gap-1.5 rounded-full font-medium text-(--deck-fg) hover:underline ${focusRing}`}>
            What&apos;s Kalami?
          </Link>
        </div>
      </footer>
    </div>
  );
}

/** While the deck loads: its own colours already, and Kalami's mark breathing. */
function SharedLoading({ theme }: { theme: DeckTheme | null }) {
  useCanvas(theme ? THEMES[theme].bg : null);
  return (
    <main
      aria-busy="true"
      style={theme ? themeStyle(theme) : undefined}
      className={`flex min-h-dvh flex-1 items-center justify-center ${theme ? "bg-(--deck-bg)" : ""}`}
    >
      <KalamiMark className="size-11 animate-pulse" />
      <span className="sr-only" role="status">
        Opening presentation
      </span>
    </main>
  );
}

/** The link was turned off or replaced (or never existed): nothing about what it was. */
export function SharedLinkOff() {
  return (
    <StatusScreen note="Hmm" title="This link doesn't work any more">
      <p>
        The presentation isn&apos;t shared with this link now: sharing was stopped, or the link was replaced with a new
        one. Ask whoever sent it for a fresh link.
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/" variant="outline" className="max-sm:w-full">
          What&apos;s Kalami?
        </ButtonLink>
      </div>
    </StatusScreen>
  );
}

/**
 * Passing the link on: the phone's own share sheet where there is one (a
 * touch screen), copying it everywhere else. Always the deck's link from the
 * start, without the slide.
 */
function PassItOn({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  async function pass() {
    const url = `${window.location.origin}${window.location.pathname}`;
    if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissed: nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard refused (an insecure context): the address bar still has it.
    }
  }

  return (
    <button
      type="button"
      onClick={() => void pass()}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium ring-1 ring-(color:--deck-line) transition hover:bg-(--deck-surface) sm:h-11 sm:px-4 ${focusRing}`}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      <span className="max-sm:sr-only">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
}

/** Paints the page behind the app in the deck's background, so overscrolling past the edges stays in it. */
function useCanvas(color: string | null) {
  useEffect(() => {
    if (color === null) return;
    const root = document.documentElement;
    const before = root.style.backgroundColor;
    root.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
    return () => {
      root.style.backgroundColor = before;
      document.body.style.backgroundColor = "";
    };
  }, [color]);
}

/** The slide in the address (#5 is the fifth), as an index; the first slide without one. */
function slideFromHash(total: number): number {
  if (typeof window === "undefined") return 0;
  const match = /^#(\d{1,3})$/.exec(window.location.hash);
  const slide = match ? Number(match[1]) : 1;
  return Math.min(Math.max(slide, 1), Math.max(total, 1)) - 1;
}

/** Keeps the address on the current slide without adding to the history. */
function rememberSlide(index: number) {
  const hash = index === 0 ? "" : `#${index + 1}`;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
}
