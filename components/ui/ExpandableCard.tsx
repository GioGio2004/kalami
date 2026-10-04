"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { EASE } from "@/components/motion/Reveal";
import { ChevronDown } from "@/components/ui/icons";

type Tone = "card" | "charcoal" | "highlighter";

const TONES: Record<Tone, { card: string; chip: string; chevron: string; summary: string }> = {
  card: { card: "bg-card", chip: "bg-panel text-ink", chevron: "bg-panel text-ink", summary: "text-graphite" },
  charcoal: {
    card: "bg-charcoal text-paper",
    chip: "bg-charcoal-soft text-paper",
    chevron: "bg-charcoal-soft text-paper",
    summary: "text-paper/65",
  },
  highlighter: {
    card: "bg-highlighter text-ink",
    chip: "bg-ink text-highlighter",
    chevron: "bg-ink/10 text-ink",
    summary: "text-ink/70",
  },
};

/**
 * A card that opens on tap. The header is one big button that stays visible
 * when closed (title, a one-line summary, a chip); the body slides open under it.
 */
export function ExpandableCard({
  icon,
  title,
  summary,
  aside,
  open,
  onToggle,
  tone = "card",
  heading: Heading,
  className = "",
  children,
}: {
  icon?: ReactNode;
  title: ReactNode;
  summary?: ReactNode;
  /** A chip or count on the right, before the chevron. */
  aside?: ReactNode;
  open: boolean;
  onToggle: () => void;
  tone?: Tone;
  /** Wraps the toggle in a heading, so the card's title shows up in the page outline. */
  heading?: "h2" | "h3" | "h4";
  className?: string;
  children: ReactNode;
}) {
  const bodyId = useId();
  const styles = TONES[tone];
  const toggle = (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={bodyId}
      className="flex w-full items-center gap-3 p-4 text-left transition focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current sm:gap-4 sm:p-5"
    >
      {icon && <span className={`grid size-11 shrink-0 place-items-center rounded-full ${styles.chip}`}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-medium leading-snug tracking-tight sm:text-lg">{title}</span>
        {summary && <span className={`mt-0.5 block truncate text-sm ${styles.summary}`}>{summary}</span>}
      </span>
      {aside}
      <motion.span
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className={`grid size-8 shrink-0 place-items-center rounded-full ${styles.chevron}`}
        aria-hidden
      >
        <ChevronDown className="size-4" />
      </motion.span>
    </button>
  );
  return (
    <section className={`overflow-hidden rounded-[1.6rem] sm:rounded-[2rem] ${styles.card} ${className}`}>
      {Heading ? <Heading>{toggle}</Heading> : toggle}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            id={bodyId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
