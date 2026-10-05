"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { LiveMonitorMock, NotebookMock, SandboxMock } from "./mockups";

export function LearningJourney() {
  return (
    <section id="inside" className="mx-auto grid max-w-[80rem] scroll-mt-28 gap-10 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <div className="self-start lg:sticky lg:top-36">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-graphite">The Kalami rhythm</p>
        <h2 className="mt-5 text-5xl font-medium leading-[1.02] tracking-[-0.05em] sm:text-6xl">Small steps.<br />Real understanding.</h2>
        <p className="mt-6 max-w-sm text-lg leading-relaxed text-graphite">From that first “how does this work?” to the moment it clicks. One connected place for students and lecturers.</p>
        <p className="mt-8 font-hand text-2xl text-graphite">Follow the ink ↓</p>
        <div aria-hidden="true" className="mt-8 hidden h-32 w-px bg-gradient-to-b from-ink/30 to-transparent lg:block" />
      </div>
      <div className="min-w-0 space-y-12 sm:space-y-20">
        <Chapter number="01" title="Find your starting point." body="Your courses and lessons, together. Pick up an idea, explore an example, and come back whenever you need." tone="bg-panel"><NotebookMock /></Chapter>
        <Chapter number="02" title="Learn by doing the thing." body="Write the code. See what changes. Turn a concept into something you can actually make." tone="bg-highlighter/30"><SandboxMock /></Chapter>
        <Chapter number="03" title="See where support matters." body="During assessments, lecturers can follow progress and activity. Signals start a conversation; the lecturer makes the judgment." tone="bg-panel"><LiveMonitorMock /></Chapter>
      </div>
    </section>
  );
}

function Chapter({ number, title, body, tone, children }: { number: string; title: string; body: string; tone: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "start 30%"] });
  const y = useTransform(scrollYProgress, [0, 1], [45, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [2, 0]);
  return (
    <motion.article ref={ref} style={{ y: reduce ? 0 : y, rotate: reduce ? 0 : rotate }} className={`min-w-0 rounded-[2rem] p-5 sm:p-8 ${tone}`}>
      <div className="mb-7 flex items-center justify-between"><span className="font-mono text-sm text-graphite">/ {number}</span><span className="text-[10px] uppercase tracking-[0.16em] text-graphite">Illustrative product view</span></div>
      <div className="min-w-0 overflow-hidden rounded-2xl bg-card p-3 shadow-[0_12px_35px_-20px_#14141440] sm:p-5">{children}</div>
      <h3 className="mt-8 text-3xl font-medium tracking-[-0.035em]">{title}</h3>
      <p className="mt-3 max-w-lg leading-relaxed text-graphite">{body}</p>
    </motion.article>
  );
}
