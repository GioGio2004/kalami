"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE } from "@/components/motion/Reveal";

export type Slide = {
  id: string;
  eyebrow: string;
  badge?: string;
  title: ReactNode;
  body: string;
  tone: "light" | "dark";
  mock: ReactNode;
};

const textGroup: Variants = {
  off: {},
  on: { transition: { staggerChildren: 0.11, delayChildren: 0.12 } },
};
const textItem: Variants = {
  off: { opacity: 0, y: 28 },
  on: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const mockItem: Variants = {
  off: { opacity: 0, x: 48, rotate: 2 },
  on: { opacity: 1, x: 0, rotate: 0, transition: { duration: 0.9, ease: EASE, delay: 0.2 } },
};

/** Big rounded feature cards that peek in from the sides, with pager dots. */
export function FeatureCarousel({ slides }: { slides: Slide[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // Nothing plays until the carousel itself is on screen.
  const ready = useInView(scroller, { once: true, amount: 0.35 });

  useEffect(() => {
    const root = scroller.current;
    if (!root) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Not isIntersecting: a neighbour peeking in at the edge still "intersects".
          if (entry.intersectionRatio >= 0.6) {
            setActive(Number((entry.target as HTMLElement).dataset.index));
          }
        }
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll("[data-index]").forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  function goTo(index: number) {
    const root = scroller.current;
    const slide = root?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!root || !slide) {
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.scrollTo({
      left: slide.offsetLeft - (root.clientWidth - slide.clientWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <div>
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(1rem,calc((100vw-76rem)/2))] pb-2"
      >
        {slides.map((slide, index) => {
          const on = ready && index === active;
          return (
            <article
              key={slide.id}
              data-index={index}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}: ${slide.eyebrow}`}
              className="w-[min(76rem,calc(100vw-2.5rem))] shrink-0 snap-center"
            >
              {/* The slide in focus grows to full size; its neighbours sit slightly back. */}
              <motion.div
                animate={{ scale: on ? 1 : 0.955 }}
                transition={{ duration: 0.6, ease: EASE }}
                className={`grid h-full items-center gap-8 rounded-[2.5rem] p-6 sm:p-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:p-14 ${
                  slide.tone === "dark" ? "bg-charcoal text-paper" : "bg-panel text-ink"
                }`}
              >
                <motion.div variants={textGroup} initial="off" animate={on ? "on" : "off"}>
                  <motion.div variants={textItem} className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] opacity-55">
                      {slide.eyebrow}
                    </span>
                    {slide.badge && (
                      <span className="rounded-full bg-red-pen/15 px-2.5 py-1 text-xs font-semibold text-red-pen">
                        {slide.badge}
                      </span>
                    )}
                  </motion.div>
                  <motion.h3
                    variants={textItem}
                    className="mt-6 text-4xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-[3.6rem]"
                  >
                    {slide.title}
                  </motion.h3>
                  <motion.p variants={textItem} className="mt-6 max-w-lg text-lg leading-relaxed opacity-70">
                    {slide.body}
                  </motion.p>
                </motion.div>
                <motion.div
                  variants={mockItem}
                  initial="off"
                  animate={on ? "on" : "off"}
                  className="rounded-[2rem] bg-card p-4 text-ink sm:p-6"
                >
                  {slide.mock}
                </motion.div>
              </motion.div>
            </article>
          );
        })}
      </div>

      <div className="mt-7 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show ${slide.eyebrow}`}
            aria-current={index === active}
            onClick={() => goTo(index)}
            className="relative h-2.5 rounded-full bg-ink/20 transition-[width,background-color] duration-300 hover:bg-ink/40"
            style={{ width: index === active ? "2.5rem" : "0.625rem" }}
          >
            {index === active && (
              <motion.span layoutId="carousel-dot" className="absolute inset-0 rounded-full bg-ink" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
