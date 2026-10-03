import Link from "next/link";
import type { ReactNode } from "react";
import { KalamiMark } from "@/components/Logo";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { DrawPath, Float } from "@/components/motion/primitives";
import { Reveal } from "@/components/motion/Reveal";
import { Check, Sparkle } from "@/components/ui/icons";

/** A highlighter loop drawn behind a floating card (shown with the cards, from xl up). */
function Loop({ d, className }: { d: string; className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className={`pointer-events-none absolute hidden xl:block ${className}`}
    >
      <DrawPath d={d} delay={0.4} duration={1.6} stroke="var(--highlighter-deep)" strokeWidth={2.5} />
    </svg>
  );
}

/** Pops in, then drifts forever; every card gets its own rhythm. */
function FloatingCard({
  className,
  phase = 0,
  children,
}: {
  className: string;
  phase?: number;
  children: ReactNode;
}) {
  return (
    <Float
      className={`absolute hidden xl:block ${className}`}
      amplitude={8 + phase * 2}
      duration={5 + phase * 0.9}
      delay={phase * 0.7}
      rotate={0.8}
    >
      <Reveal
        kind="pop"
        delay={0.2 + phase * 0.15}
        className="rounded-2xl border border-line bg-card p-4 shadow-[0_18px_40px_-24px_rgba(20,20,20,0.45)]"
      >
        {children}
      </Reveal>
    </Float>
  );
}

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden px-4 py-28 sm:px-6 sm:py-40">
      <div className="relative mx-auto max-w-[76rem]">
        <Loop
          className="-left-10 -top-16 size-56"
          d="M150 30C110 4 40 14 24 60c-14 40 10 92 60 104 46 11 90-14 96-56 5-34-20-62-52-60"
        />
        <FloatingCard className="left-0 top-0 w-60 -rotate-3">
          <p className="text-xs text-graphite">Join code · Web basics</p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-[0.12em]">KLM-4821</p>
          <p className="mt-2 text-xs text-graphite">28 students joined</p>
        </FloatingCard>

        <Loop
          className="-right-8 -top-10 size-52"
          d="M40 40c40-30 120-26 140 18 18 40-6 100-60 110-50 9-96-22-96-62 0-30 24-50 52-48"
        />
        <FloatingCard phase={1} className="right-4 top-4 w-64 rotate-2">
          <p className="text-sm font-medium">Midterm · submitted</p>
          <ul className="mt-2 space-y-1.5 text-xs text-graphite">
            {["Ana B.", "Luka T.", "Mariam S."].map((name) => (
              <li key={name} className="flex items-center justify-between">
                {name}
                <span className="flex items-center gap-1 text-ok">
                  <Check className="size-3.5" />
                  Graded
                </span>
              </li>
            ))}
          </ul>
        </FloatingCard>

        <FloatingCard phase={2} className="bottom-0 left-10 w-56 rotate-2">
          <p className="font-hand text-[1.45rem] leading-tight text-red-pen">
            Good structure. Where&apos;s your &lt;nav&gt;?
          </p>
          <p className="mt-1 text-xs text-graphite">Red pen · line 4</p>
        </FloatingCard>

        <Loop
          className="-bottom-12 -right-6 size-48"
          d="M30 120c-6-50 40-92 90-84 44 7 68 50 50 88-17 36-66 46-100 26"
        />
        <FloatingCard phase={3} className="bottom-6 right-0 w-60 -rotate-2">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-highlighter">
              <Check className="size-4" />
            </span>
            <p className="text-sm font-medium">Honesty notice accepted</p>
          </div>
          <p className="mt-2 text-xs text-graphite">Version 1 · read in Georgian</p>
        </FloatingCard>

        <div className="relative mx-auto max-w-2xl text-center">
          <Reveal kind="pop" className="flex items-center justify-center gap-3 text-ink">
            <Sparkle className="size-6" />
            <KalamiMark className="size-10" />
            <Sparkle className="size-6" />
          </Reveal>
          <AnimatedHeading
            as="h2"
            className="mt-8 text-5xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-7xl"
          >
            Bring Kalami to your university.
          </AnimatedHeading>
          <Reveal as="p" delay={0.3} className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-graphite">
            Start with a free pilot for one semester. Built in Georgia, in Georgian, with your
            lecturers.
          </Reveal>
          <Reveal delay={0.45} className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/sign-up"
              className="rounded-full bg-ink px-7 py-3.5 text-base font-medium text-paper transition-transform active:scale-[0.98]"
            >
              Start as a student
            </Link>
            <a
              href="mailto:hello@kalami.space"
              className="rounded-full border border-ink/15 px-7 py-3.5 text-base font-medium transition-colors hover:bg-panel"
            >
              Talk to us
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
