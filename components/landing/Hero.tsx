import Link from "next/link";
import { STAFF_APP_URL } from "@/lib/urls";
import { ArrowUpRight } from "@/components/ui/icons";
import { PenScene } from "./PenScene";

export function Hero() {
  return (
    <section className="px-3 pt-5 sm:px-6">
      <div className="relative isolate mx-auto max-w-[88rem] overflow-hidden rounded-[2.5rem] bg-panel px-6 pb-7 pt-12 sm:px-12 sm:pt-20 lg:px-16">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-35 [background-image:radial-gradient(var(--graphite)_0.6px,transparent_0.6px)] [background-size:24px_24px]" />
        <div className="grid items-center gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative z-10">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-graphite"><span className="size-2 rounded-full bg-highlighter-deep" />A little structure. A lot of possibility.</p>
            <h1 className="mt-7 text-[clamp(3.3rem,6.5vw,6.5rem)] font-medium leading-[0.98] tracking-[-0.06em]">Good learning<br />starts with<br /><span className="relative inline-block"><span className="absolute inset-x-0 bottom-1 -z-10 h-[0.26em] -rotate-2 bg-highlighter" />your own hand.</span></h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-graphite">A place to learn, try, and show what you know. Lessons, hands-on practice, and honest assessments — all in Kalami.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up" className="inline-flex items-center gap-5 rounded-full bg-ink py-2 pl-6 pr-2 font-medium text-paper transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-4"><span>Open your notebook</span><span className="grid size-10 place-items-center rounded-full bg-highlighter text-ink"><ArrowUpRight className="size-4" /></span></Link>
              <a href={STAFF_APP_URL} className="inline-flex items-center rounded-full border border-ink/20 bg-paper/60 px-6 py-3 font-medium transition hover:bg-card">For lecturers ↗</a>
            </div>
          </div>
          <PenScene />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6 text-xs text-graphite lg:mt-12">
          <p className="font-hand text-xl">კალამი · Your next chapter starts here.</p>
          <a href="#inside" className="rounded-full px-2 py-2 font-medium uppercase tracking-[0.15em] hover:text-ink">Scroll to turn the page ↓</a>
        </div>
      </div>
    </section>
  );
}
