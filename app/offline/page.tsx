import type { Metadata } from "next";
import { KalamiMark } from "@/components/Logo";

export const metadata: Metadata = { title: "Offline · Kalami" };
// Served by the service worker when a page can't be fetched, so it must be a plain, static page.
export const dynamic = "force-static";

/** What the installed app shows without a connection. Nothing here needs JavaScript. */
export default function OfflinePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-[2.25rem] bg-panel p-8 sm:p-10">
        <KalamiMark className="size-11" />
        <p className="mt-8 -rotate-1 font-hand text-[1.6rem] leading-none text-graphite">No connection</p>
        <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.03em] sm:text-4xl">You&apos;re offline</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-graphite">
          Kalami needs a connection to load your courses and save your work. Once you&apos;re back online, open it again:
          nothing you submitted is lost.
        </p>
        <a
          href="/dashboard"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-[15px] font-medium text-paper transition hover:bg-ink/85"
        >
          Try again
        </a>
      </div>
    </main>
  );
}
