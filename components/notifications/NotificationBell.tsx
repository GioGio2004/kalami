"use client";

import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { Bell as BellIcon } from "@/components/ui/icons";
import { api } from "@/convex-api/api";
import { NotificationsPanel, type Inbox } from "./NotificationsPanel";

/**
 * The bell in the header: a badge with the unread count, and the panel. Closing
 * the panel marks everything as read. `inbox` is undefined while loading.
 */
export function Bell({
  inbox,
  onMarkAllRead,
  defaultOpen = false,
  now: fixedNow,
}: {
  inbox: Inbox | undefined;
  onMarkAllRead: () => void;
  defaultOpen?: boolean;
  /** For the gallery, so "2 hours ago" renders the same on the server and in the browser. */
  now?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [openedAt, setOpenedAt] = useState(() => fixedNow ?? Date.now());
  const wrapper = useRef<HTMLDivElement>(null);
  const unread = inbox?.unread ?? 0;

  const close = useCallback(() => {
    setOpen(false);
    if (unread > 0) onMarkAllRead();
  }, [unread, onMarkAllRead]);

  // A tap anywhere else closes the dropdown (the phone sheet has its own backdrop).
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Element | null;
      if (target?.closest("[data-notifications-panel]") || wrapper.current?.contains(target)) return;
      close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  function toggle() {
    if (open) {
      close();
      return;
    }
    setOpenedAt(fixedNow ?? Date.now());
    setOpen(true);
  }

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className="relative grid size-10 place-items-center rounded-full text-ink transition hover:bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {/* Remounts when the count changes, so the bell rings for each new one. */}
        <motion.span
          key={unread}
          initial={{ rotate: 0 }}
          animate={unread > 0 ? { rotate: [0, -16, 14, -10, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="grid origin-top place-items-center"
        >
          <BellIcon className="size-5" />
        </motion.span>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-pen px-1 text-[11px] font-semibold text-paper tabular-nums"
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <NotificationsPanel inbox={inbox} now={openedAt} open={open} onClose={close} onMarkAllRead={onMarkAllRead} />
    </div>
  );
}

/** The bell wired to Convex, for signed-in students. */
export function NotificationBell() {
  const current = useCurrentUser();
  const ready = current.status === "ready" && !current.me.needsOnboarding;
  const inbox = useQuery(api.notifications.inbox, ready ? {} : "skip");
  const markAllRead = useMutation(api.notifications.markAllRead);
  const onMarkAllRead = useCallback(() => {
    markAllRead().catch(() => undefined);
  }, [markAllRead]);
  return <Bell inbox={inbox} onMarkAllRead={onMarkAllRead} />;
}
