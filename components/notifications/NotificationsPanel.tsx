"use client";

import type { FunctionReturnType } from "convex/server";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { KIND_LABEL } from "@/components/courses/AssessmentRow";
import { EASE } from "@/components/motion/Reveal";
import { Bell, Clock, Cross, Sparkle } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { formatShort, relativeTime } from "@/lib/time";
import { useIsMobile } from "@/lib/useDevice";

export type Inbox = FunctionReturnType<typeof api.notifications.inbox>;
export type InboxItem = Inbox["items"][number];

function headline(item: InboxItem): string {
  switch (item.kind) {
    case "published":
      return `New ${KIND_LABEL[item.assessmentKind ?? "task"].toLowerCase()}`;
    case "due_24h":
      return "Due tomorrow";
    case "due_1h":
      return "Due in an hour";
    case "announcement":
      return `From ${item.courseTitle}`;
  }
}

function Row({ item, now, onOpen }: { item: InboxItem; now: number; onOpen: () => void }) {
  const fresh = item.kind === "published";
  const announcement = item.kind === "announcement";
  return (
    <Link
      href={item.href}
      onClick={onOpen}
      className={`flex gap-3 rounded-2xl px-3 py-3 transition hover:bg-panel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink ${
        item.read ? "" : "bg-highlighter/25"
      }`}
    >
      <span
        className={`relative grid size-10 shrink-0 place-items-center rounded-full ${
          fresh || announcement ? "bg-ink text-highlighter" : "bg-panel text-ink"
        }`}
      >
        {announcement ? <Bell className="size-4" /> : fresh ? <Sparkle className="size-4" /> : <Clock className="size-5" />}
        {!item.read && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-red-pen ring-2 ring-paper" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-graphite">{headline(item)}</span>
        <span className="mt-0.5 block font-medium leading-snug">{item.title}</span>
        {announcement && item.body !== undefined && (
          <span className="mt-1 line-clamp-3 block text-sm leading-relaxed text-ink/80">{item.body}</span>
        )}
        <span className="mt-1 block text-xs leading-relaxed text-graphite">
          {!announcement && item.courseTitle}
          {item.dueAt !== undefined && ` · due ${formatShort(item.dueAt)}`}
          {announcement ? relativeTime(item._creationTime, now) : ` · ${relativeTime(item._creationTime, now)}`}
        </span>
      </span>
    </Link>
  );
}

/**
 * The bell's list. A dropdown under the bell on computers, a sheet from the
 * bottom on phones. `inbox` is undefined while loading; `now` is when it opened.
 */
export function NotificationsPanel({
  inbox,
  now,
  open,
  onClose,
  onMarkAllRead,
  onSetEmail,
  push,
}: {
  inbox: Inbox | undefined;
  now: number;
  open: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  /** The switch at the bottom: emails about new work and deadlines. */
  onSetEmail: (enabled: boolean) => void;
  /** The push switch for this device (components/pwa/PushSetting), above the email one. */
  push?: ReactNode;
}) {
  const mobile = useIsMobile();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const content = (
    <div className="flex min-h-0 flex-1 flex-col" data-notifications-panel>
      <header className="flex items-center gap-3 px-5 pb-2 pt-4">
        <h2 className="text-lg font-medium tracking-tight">Notifications</h2>
        {inbox !== undefined && inbox.unread > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="ml-auto rounded-full px-2 py-1 text-sm text-graphite hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
          >
            Mark all read
          </button>
        )}
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`grid size-9 shrink-0 place-items-center rounded-full bg-panel ${
              inbox !== undefined && inbox.unread > 0 ? "" : "ml-auto"
            }`}
          >
            <Cross className="size-4" />
          </button>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {inbox === undefined ? (
          <p className="px-3 py-6 text-sm text-graphite">Loading…</p>
        ) : inbox.items.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-panel">
              <Bell className="size-5" />
            </span>
            <p className="mt-3 font-medium">Nothing yet</p>
            <p className="mt-1 text-sm leading-relaxed text-graphite">
              New work and deadline reminders show up here.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {inbox.items.map((item) => (
              <li key={item._id}>
                <Row item={item} now={now} onOpen={onClose} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {inbox !== undefined && (
        <footer className="space-y-3 border-t border-line px-5 py-3">
          {push}
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={inbox.emailEnabled && !inbox.emailBlocked}
              disabled={inbox.emailBlocked}
              onChange={(event) => onSetEmail(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-ink"
            />
            <span className="min-w-0">
              <span className="block font-medium">Email me about new work and deadlines</span>
              <span className="block text-xs leading-relaxed text-graphite">
                {inbox.emailBlocked
                  ? "Paused: an email to your address bounced. Ask your lecturer to check it with Kalami."
                  : "Sent to the address you signed up with. Every email has a link to stop them."}
              </span>
            </span>
          </label>
        </footer>
      )}
    </div>
  );

  if (mobile) {
    return createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              key="backdrop"
              type="button"
              aria-label="Close notifications"
              onClick={onClose}
              className="fixed inset-0 z-50 bg-ink/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-label="Notifications"
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] flex-col rounded-t-[2rem] bg-paper pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_60px_-24px_rgba(20,20,20,0.5)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line" aria-hidden />
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body,
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+12px)] z-50 flex max-h-[70vh] w-[22rem] flex-col overflow-hidden rounded-[1.6rem] border border-line bg-paper shadow-[0_24px_60px_-24px_rgba(20,20,20,0.45)]"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
