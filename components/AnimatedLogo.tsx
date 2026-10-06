"use client";

import { motion, useReducedMotion } from "motion/react";

/** A small writing gesture, kept inside the original Kalami brand tile. */
export function AnimatedLogo() {
  const reduce = useReducedMotion();
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" aria-hidden="true" className="size-11 shrink-0">
        <rect width="40" height="40" rx="13" fill="var(--ink)" />
        <motion.path d="M10 32 Q17 28 24 32 Q28 34 31 30" fill="none" stroke="var(--highlighter)" strokeWidth="1.5" strokeLinecap="round"
          animate={reduce ? { pathLength: 1, opacity: 0.7 } : { pathLength: [0, 0, 1, 1, 0], opacity: [0, 1, 1, 0.7, 0] }} transition={{ duration: 5, times: [0, 0.15, 0.65, 0.85, 1], repeat: Infinity, ease: "easeInOut" }} />
        <motion.g style={{ transformOrigin: "20px 25px" }} animate={reduce ? { rotate: 0, x: 0, y: 0 } : { rotate: [-9, 5, -4, 7, -9], x: [-2, 1, -1, 2, -2], y: [0, -1, 0, -1, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M14 8h12v6L20 29l-6-15Z" fill="var(--highlighter)" stroke="var(--highlighter)" strokeLinejoin="round" />
          <path d="M20 19v10" stroke="var(--ink)" strokeWidth="1.5" /><circle cx="20" cy="17" r="2" fill="var(--ink)" />
        </motion.g>
      </svg>
      <span className="flex flex-col leading-none"><span className="text-[1.4rem] font-semibold tracking-[-0.04em]">Kalami</span><span className="mt-1 text-[11px] text-graphite">კალამი</span></span>
    </span>
  );
}
