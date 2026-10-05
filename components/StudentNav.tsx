"use client";

import { useQuery } from "convex/react";
import type { ReactNode } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { api } from "@/convex-api/api";

/**
 * The student header: Dashboard, Messages (with the unread count) and Honesty.
 * `unread` overrides the live count (the dev gallery has no backend).
 */
export function StudentNav({ actions, unread }: { actions: ReactNode; unread?: number }) {
  const current = useCurrentUser();
  const pathname = usePathname();
  // The count needs the signed-in user's row, so it waits for onboarding to finish.
  const ready = current.status === "ready" && !current.me.needsOnboarding;
  const live = useQuery(api.messages.unreadCount, ready && unread === undefined ? {} : "skip");
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/messages", label: "Messages", count: unread ?? live },
    { href: "/assistant", label: "Study assistant" },
    { href: "/honesty", label: "Privacy & rules" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
      <a href="#student-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-ink focus:p-3 focus:text-paper">Skip to content</a>
      <div className="mx-auto flex max-w-[1290px] flex-wrap items-center gap-x-8 px-4 sm:px-6">
        <Link href="/dashboard" aria-label="Kalami dashboard" className="my-4 shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"><Logo /></Link>
        <nav aria-label="Student navigation" className="no-scrollbar order-3 flex w-full gap-1 overflow-x-auto lg:order-none lg:w-auto lg:self-stretch">
          {links.map((link) => {
            const active = pathname === link.href || (link.href === "/dashboard" && (pathname.startsWith("/courses") || pathname === "/dev/ui")) || pathname.startsWith(`${link.href}/`);
            return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm transition focus-visible:outline-2 focus-visible:-outline-offset-4 ${active ? "border-ink font-semibold text-ink" : "border-transparent text-graphite hover:border-line hover:text-ink"}`}>{link.label}{Boolean(link.count) && <span className="rounded-md bg-highlighter px-1.5 py-0.5 text-[11px] font-semibold text-ink" aria-label={`${link.count} unread messages`}>{link.count! > 99 ? "99+" : link.count}</span>}</Link>;
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3">{actions}</div>
      </div>
    </header>
  );
}
