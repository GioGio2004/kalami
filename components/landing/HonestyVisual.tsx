"use client";

import { motion } from "motion/react";
import { CountUp, Float, Parallax } from "@/components/motion/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { PhoneFrame } from "@/components/ui/PhoneFrame";

const timeline = [
  { time: "10:04", event: "Left the tab · 12s" },
  { time: "10:17", event: "Large paste blocked" },
  { time: "10:31", event: "Left the tab · 30s" },
];

// Activity per minute; the tall amber ones are the flagged moments.
const activity = [
  { h: 34 }, { h: 52 }, { h: 88, flag: true }, { h: 40 }, { h: 30 }, { h: 76, flag: true },
  { h: 46 }, { h: 38 }, { h: 94, flag: true }, { h: 44 }, { h: 36 }, { h: 28 },
];

function IntegrityReportScreen() {
  return (
    <div className="flex h-full flex-col px-4 pb-5">
      <p className="text-[11px] text-graphite">Integrity report</p>
      <p className="text-base font-semibold tracking-tight">Giorgi K. · Midterm</p>

      <div className="mt-3 flex items-center gap-3.5 rounded-2xl bg-panel p-3.5">
        <svg viewBox="0 0 44 44" className="size-14 shrink-0 -rotate-90" aria-hidden>
          <circle cx="22" cy="22" r="18" fill="none" stroke="var(--line)" strokeWidth="5" />
          <motion.circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="var(--warn)"
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 0.45 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div>
          <CountUp to={9} delay={0.6} className="text-3xl font-semibold leading-none tabular-nums" />
          <p className="mt-1 text-[11px] text-graphite">Worth a look</p>
        </div>
      </div>

      <RevealGroup as="ul" stagger={0.18} delay={0.9} className="mt-3.5 space-y-2">
        {timeline.map((item) => (
          <RevealItem as="li" kind="left" key={item.time} className="flex items-center gap-2.5 text-[13px]">
            <span className="font-mono text-[11px] tabular-nums text-graphite">{item.time}</span>
            <span className="size-1.5 rounded-full bg-warn" />
            {item.event}
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="mt-4 text-[11px] text-graphite">Activity · per minute</p>
      <div className="mt-1.5 flex h-11 items-end gap-1" aria-hidden>
        {activity.map((bar, index) => (
          <motion.span
            key={index}
            className={`flex-1 rounded-[3px] ${bar.flag ? "bg-warn" : "bg-ink/15"}`}
            style={{ height: `${bar.h}%`, originY: 1 }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: "some" }}
            transition={{ duration: 0.55, delay: 1.2 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-4 text-[11px] font-medium">
        <span className="rounded-full bg-panel py-2.5 text-center">Dismiss</span>
        <span className="rounded-full bg-ink py-2.5 text-center text-paper">Talk to Giorgi</span>
      </div>
    </div>
  );
}

/** The lime panel: handwritten note, and a phone that floats and drifts as you scroll. */
export function HonestyVisual() {
  return (
    <div className="relative h-[40rem] overflow-hidden rounded-[2.5rem] bg-highlighter">
      <Reveal
        as="p"
        kind="pop"
        delay={0.5}
        className="absolute left-7 top-7 max-w-[11rem] -rotate-3 font-hand text-[1.6rem] leading-tight text-ink sm:left-10 sm:top-10"
      >
        Advice, not a verdict. You decide.
      </Reveal>
      <Parallax
        from={36}
        to={-28}
        className="absolute left-1/2 top-16 w-[17rem] -translate-x-1/2 sm:top-14 lg:left-auto lg:right-12 lg:translate-x-0"
      >
        <Reveal kind="scale" delay={0.15} amount={0.1}>
          <Float amplitude={9} duration={5.5}>
            <PhoneFrame>
              <IntegrityReportScreen />
            </PhoneFrame>
          </Float>
        </Reveal>
      </Parallax>
    </div>
  );
}
