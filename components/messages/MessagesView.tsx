"use client";

import Link from "next/link";
import { ContactCard } from "@/components/contact/ContactCard";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ArrowRight } from "@/components/ui/icons";
import type { Lang } from "@/lib/contact";
import { relativeTime } from "@/lib/time";
import { KALAMI_TEAM, STATUS_LABEL, STATUS_TONE, topicText, type Conversation } from "./labels";

const T = {
  note: { en: "Your conversations", ka: "შენი მიმოწერა" },
  title: { en: "Messages", ka: "შეტყობინებები" },
  to: { en: "To", ka: "ვის:" },
  unread: { en: "New reply", ka: "ახალი პასუხი" },
  emptyNote: { en: "Nothing here yet.", ka: "აქ ჯერ არაფერია." },
  emptyText: {
    en: "When you write to your lecturer or the Kalami team, the conversation and their replies show up here.",
    ka: "როცა ლექტორს ან კალამის გუნდს მისწერ, მიმოწერა და პასუხები აქ გამოჩნდება.",
  },
  loading: { en: "Loading messages", ka: "იტვირთება" },
} satisfies Record<string, Record<Lang, string>>;

/**
 * The student's conversations, newest first: subject, who it went to, the
 * course, where it stands and when it last moved. `conversations` is
 * undefined while loading; `now` keeps "2 hours ago" fresh (and fixed in the gallery).
 */
export function MessagesView({
  conversations,
  now,
  lang = "en",
}: {
  conversations: Conversation[] | undefined;
  now: number;
  lang?: Lang;
}) {
  const hasAny = conversations !== undefined && conversations.length > 0;
  return (
    <Enter kind="scale" className="rounded-[2.25rem] bg-panel px-3 pb-3 pt-8 sm:rounded-[2.75rem] sm:px-10 sm:pb-8 sm:pt-10 lg:px-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-2 sm:px-1">
        <div>
          <p className="-rotate-2 font-hand text-[1.7rem] leading-none text-graphite">{T.note[lang]}</p>
          <AnimatedHeading as="h1" className="mt-3 text-5xl font-medium leading-[0.95] tracking-[-0.045em] sm:text-6xl">
            {T.title[lang]}
          </AnimatedHeading>
        </div>
        {hasAny && <ContactCard variant="compact" lang={lang} className="mb-1" />}
      </div>

      {conversations === undefined ? (
        <div className="mt-8 grid gap-2" aria-busy="true" aria-label={T.loading[lang]}>
          {[0, 1].map((key) => (
            <div key={key} className="h-24 animate-pulse rounded-[1.6rem] bg-card/70 sm:rounded-[2rem]" />
          ))}
        </div>
      ) : !hasAny ? (
        <div className="mt-8 grid gap-3 *:min-w-0 lg:grid-cols-12 lg:items-start">
          <div className="rounded-[1.6rem] border-2 border-dashed border-line p-6 text-center sm:rounded-[2rem] lg:col-span-7">
            <p className="-rotate-1 font-hand text-[1.7rem] text-graphite">{T.emptyNote[lang]}</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-graphite">{T.emptyText[lang]}</p>
          </div>
          <ContactCard lang={lang} className="lg:col-span-5" />
        </div>
      ) : (
        <RevealGroup as="ul" stagger={0.06} className="mt-8 grid gap-2">
          {conversations.map((item) => (
            <RevealItem as="li" kind="up" key={item._id}>
              <ConversationRow item={item} now={now} lang={lang} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </Enter>
  );
}

function ConversationRow({ item, now, lang }: { item: Conversation; now: number; lang: Lang }) {
  const recipient = item.recipient === "admin" ? KALAMI_TEAM[lang] : item.recipientName;
  return (
    <Link
      href={`/messages/${item._id}`}
      className={`group flex items-start gap-3 rounded-[1.6rem] p-4 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:items-center sm:gap-4 sm:rounded-[2rem] sm:p-5 ${
        item.unread ? "bg-card ring-2 ring-highlighter-deep/60" : "bg-card/80 hover:bg-card"
      }`}
    >
      <span className="mt-2 grid size-2.5 shrink-0 place-items-center sm:mt-0" aria-hidden>
        {item.unread && <span className="size-2.5 rounded-full bg-red-pen" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-graphite">{topicText(item, lang)}</span>
        <span className={`mt-0.5 line-clamp-2 leading-snug wrap-anywhere ${item.unread ? "font-semibold" : "font-medium"}`}>
          {item.unread && <span className="sr-only">{T.unread[lang]}: </span>}
          {item.subject}
        </span>
        <span className="mt-1 block truncate text-sm text-graphite">
          {T.to[lang]} {recipient}
          {item.courseTitle && ` · ${item.courseTitle}`}
        </span>
        <span className="mt-2.5 flex flex-wrap items-center gap-2 sm:hidden">
          <StatusChip status={item.status} lang={lang} />
          <span className="text-xs text-graphite">{relativeTime(Math.min(item.lastMessageAt, now), now, lang)}</span>
        </span>
      </span>
      <span className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
        <StatusChip status={item.status} lang={lang} />
        <span className="text-xs text-graphite">{relativeTime(Math.min(item.lastMessageAt, now), now, lang)}</span>
      </span>
      <ArrowRight className="mt-1 hidden size-4 shrink-0 text-graphite transition group-hover:translate-x-0.5 group-hover:text-ink sm:mt-0 sm:block" />
    </Link>
  );
}

export function StatusChip({ status, lang }: { status: Conversation["status"]; lang: Lang }) {
  return (
    <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[status]}`}>
      {STATUS_LABEL[status][lang]}
    </span>
  );
}
