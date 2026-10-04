"use client";

import { useQuery } from "convex/react";
import type { ReactNode } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { PillHeader } from "@/components/ui/PillHeader";
import { api } from "@/convex-api/api";

/**
 * The student header: Dashboard, Messages (with the unread count) and Honesty.
 * `unread` overrides the live count (the dev gallery has no backend).
 */
export function StudentNav({ actions, unread }: { actions: ReactNode; unread?: number }) {
  const current = useCurrentUser();
  // The count needs the signed-in user's row, so it waits for onboarding to finish.
  const ready = current.status === "ready" && !current.me.needsOnboarding;
  const live = useQuery(api.messages.unreadCount, ready && unread === undefined ? {} : "skip");
  return (
    <PillHeader
      homeHref="/dashboard"
      links={[
        { href: "/dashboard", label: "Dashboard" },
        { href: "/messages", label: "Messages", badge: unread ?? live },
        // On phones the dashboard links to it; the header keeps room for Messages.
        { href: "/honesty", label: "Honesty", wideOnly: true },
      ]}
      actions={actions}
    />
  );
}
