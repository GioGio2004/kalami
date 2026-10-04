"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { ArrowButton } from "@/components/ui/buttons";
import { Mail, Pen } from "@/components/ui/icons";
import { CARD, type Lang } from "@/lib/contact";
import type { ContactTarget } from "./Composer";
import { ConnectedComposer, type ComposerHostProps } from "./ConnectedComposer";

export type { ContactTarget } from "./Composer";
export type { ComposerHostProps } from "./ConnectedComposer";

/** Renders the composer a card opens. A function, not a component, so it is never recreated. */
export type RenderComposer = (props: ComposerHostProps) => ReactNode;

const ComposerHostContext = createContext<RenderComposer>((props) => <ConnectedComposer {...props} />);

/** Swaps the composer behind every card inside it: the dev gallery's renders sample data. */
export function ContactComposerProvider({
  render,
  children,
}: {
  render: RenderComposer;
  children: ReactNode;
}) {
  return <ComposerHostContext.Provider value={render}>{children}</ComposerHostContext.Provider>;
}

/**
 * "Something wrong? Let's bother someone": a friendly way to write to a real
 * person (the lecturer or the Kalami team) with the context already filled in.
 * `compact` is a small inline link ("Can't open it? Write a message") for rows
 * and result screens. Tapping either only opens the composer; nothing is
 * created until the student presses Send.
 */
export function ContactCard({
  variant = "card",
  label,
  lang: langOverride,
  className = "",
  ...target
}: ContactTarget & {
  variant?: "card" | "compact";
  /** The compact trigger's lead-in, before "Write a message". */
  label?: Record<Lang, string>;
  /** Overrides the student's own language (the gallery shows both). */
  lang?: Lang;
  className?: string;
}) {
  const current = useCurrentUser();
  const lang: Lang = langOverride ?? (current.status === "ready" ? current.me.locale : "en");
  const renderComposer = useContext(ComposerHostContext);
  const [open, setOpen] = useState(false);
  // The composer (and its queries) only exists once the card has been tapped.
  const [mounted, setMounted] = useState(false);

  function openComposer() {
    setMounted(true);
    setOpen(true);
  }

  // In a portal: the dialog can't sit inside the rows and paragraphs that hold the trigger.
  const composer = mounted
    ? createPortal(renderComposer({ open, onClose: () => setOpen(false), lang, target }), document.body)
    : null;

  if (variant === "compact") {
    return (
      <>
        <button
          type="button"
          onClick={openComposer}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={`group inline-flex max-w-full items-start gap-2 rounded-full py-1 text-left text-sm leading-snug transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${className}`}
        >
          <Pen className="mt-0.5 size-4 shrink-0 text-graphite transition group-hover:text-ink" />
          <span className="min-w-0">
            {label && <span className="text-graphite">{label[lang]} </span>}
            <span className="font-medium text-ink underline decoration-ink/30 underline-offset-4 transition group-hover:decoration-ink">
              {CARD.action[lang]}
            </span>
          </span>
        </button>
        {composer}
      </>
    );
  }

  return (
    <section className={`rounded-[1.6rem] bg-card p-5 sm:rounded-[2rem] sm:p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-highlighter text-ink">
          <Mail className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          {/* The handwriting font is Latin only; Georgian gets a calmer size in the sans. */}
          <h2
            className={
              lang === "ka"
                ? "text-lg font-medium leading-snug tracking-tight"
                : "-rotate-1 font-hand text-[1.75rem] leading-[1.05] tracking-tight"
            }
          >
            {CARD.headline[lang]}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-graphite">{CARD.supporting[lang]}</p>
        </div>
      </div>
      <ArrowButton
        onClick={openComposer}
        aria-label={CARD.actionLabel[lang]}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="mt-5 max-sm:w-full max-sm:justify-between"
      >
        {CARD.action[lang]}
      </ArrowButton>
      {composer}
    </section>
  );
}
