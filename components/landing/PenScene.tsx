"use client";

import { useAnimationFrame, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

// Actual pen strokes, including the separate K arm and the final dot over the i.
const kalami = [
  { d: "M181 244 Q176 275 171 308", duration: 0.65 },
  { d: "M213 247 Q193 264 178 278 Q193 282 209 310", duration: 0.8 },
  { d: "M242 280 C219 265 211 312 229 308 Q240 304 244 278 L238 302 Q237 316 252 300", duration: 1.05 },
  { d: "M252 299 C271 275 279 238 268 245 C254 255 248 307 261 308 Q270 308 279 298", duration: 0.95 },
  { d: "M303 279 C281 269 274 311 290 308 Q299 303 304 279 L299 301 Q298 315 311 300", duration: 1.05 },
  { d: "M311 303 L317 280 L314 303 C323 272 337 274 331 302 C341 273 353 276 346 301 Q344 315 359 300", duration: 1.3 },
  { d: "M368 280 L362 302 Q360 316 378 301", duration: 0.6 },
  { d: "M370 265 l0.8 -1.5", duration: 0.16 },
];
const words = [
  { name: "Kalami", strokes: kalami },
  { name: "Build an idea", strokes: [
    { d: "M174 223 L381 223 Q391 223 391 233 L391 339 Q391 349 381 349 L174 349 Q164 349 164 339 L164 233 Q164 223 174 223", duration: 1.35 },
    { d: "M165 249 L390 249", duration: 0.45 },
    { d: "M183 267 L259 267", duration: 0.65 },
    { d: "M184 299 L245 299 L245 327 L184 327 Z", duration: 0.55 },
    { d: "M280 267 L373 267 L373 327 L280 327 Z", duration: 0.7 },
    { d: "M291 315 L315 288 L334 306 L347 295 L363 315", duration: 0.55 },
  ] },
  { name: "Make your mark", strokes: [
    { d: "M330 232 C245 196 190 250 205 306 C221 366 323 372 356 313 C381 268 354 232 330 232", duration: 1.5 },
    { d: "M241 281 L272 313 L337 249", duration: 0.9 },
    { d: "M186 375 Q278 355 378 372", duration: 0.55 },
  ] },
];
const gap = 0.18;
const durations = words.map(({ strokes }) => strokes.reduce((sum, stroke) => sum + stroke.duration + gap, 0) + 3.5);
const cycleTime = durations.reduce((sum, duration) => sum + duration, 0);

/** Native SVG transforms keep the nib and ink in exactly the same coordinate space. */
export function PenScene() {
  const ref = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[][]>(words.map(() => []));
  const wordGroups = useRef<(SVGGElement | null)[]>([]);
  const pen = useRef<SVGGElement>(null);
  const ink = useRef<SVGGElement>(null);
  const elapsed = useRef(0);
  const chapterLabel = useRef<SVGTextElement>(null);
  const burst = useRef<SVGGElement>(null);
  const accents = useRef<SVGGElement>(null);
  const floating = useRef<SVGGElement>(null);
  const reduce = useReducedMotion();
  const visible = useInView(ref);

  useEffect(() => {
    elapsed.current = 0;
    burst.current?.setAttribute("opacity", "0");
    accents.current?.setAttribute("opacity", "0");
    if (chapterLabel.current) chapterLabel.current.textContent = "01 / THE FIRST SPARK";
    paths.current.flat().forEach((path) => {
      path?.setAttribute("stroke-dashoffset", reduce === false ? "1" : "0");
      path?.setAttribute("opacity", reduce === false ? "0" : "1");
    });
    wordGroups.current.forEach((group, index) => group?.setAttribute("visibility", index === 0 ? "visible" : "hidden"));
    ink.current?.setAttribute("opacity", "1");
    pen.current?.setAttribute("transform", "translate(390 335) rotate(24) scale(0.72) translate(0 -294)");
  }, [reduce]);

  useAnimationFrame((_, delta) => {
    if (reduce !== false || !visible || document.hidden || !pen.current) return;
    elapsed.current += Math.min(delta, 64) / 1000;
    let time = elapsed.current % cycleTime;
    let wordIndex = 0;
    while (wordIndex < words.length - 1 && time >= durations[wordIndex]) {
      time -= durations[wordIndex];
      wordIndex++;
    }
    if (chapterLabel.current) chapterLabel.current.textContent = ["01 / THE FIRST SPARK", "02 / AN IDEA TAKES SHAPE", "03 / MADE BY YOU"][wordIndex];
    floating.current?.setAttribute("transform", `translate(0 ${Math.sin(elapsed.current * 1.4) * 5})`);
    const strokes = words[wordIndex].strokes;
    const currentPaths = paths.current[wordIndex];
    const writingTime = durations[wordIndex] - 3.5;
    wordGroups.current.forEach((group, index) => group?.setAttribute("visibility", index === wordIndex ? "visible" : "hidden"));
    const reveal = Math.max(0, Math.min(1, (time - writingTime) * 3));
    const fade = 1 - Math.max(0, (time - writingTime - 2) / 1.5);
    accents.current?.setAttribute("opacity", String(wordIndex === 1 ? reveal * fade : 0));
    burst.current?.setAttribute("opacity", String(wordIndex === 2 ? reveal * fade : 0));
    burst.current?.setAttribute("transform", `translate(280 283) scale(${0.75 + reveal * 0.25}) translate(-280 -283)`);
    let start = 0;
    let tip = { x: 181, y: 244 };
    let lifted = false;
    for (let index = 0; index < strokes.length; index++) {
      const path = currentPaths[index];
      const stroke = strokes[index];
      if (!path) continue;
      const raw = Math.max(0, Math.min(1, (time - start) / stroke.duration));
      // Changing pressure and speed within a stroke, without jittering off the ink.
      const progress = raw - Math.sin(raw * Math.PI * 4) * 0.045;
      path.setAttribute("stroke-dashoffset", String(1 - progress));
      path.setAttribute("opacity", raw > 0 ? "1" : "0");
      if (time >= start && time < start + stroke.duration) {
        tip = path.getPointAtLength(path.getTotalLength() * progress);
      } else if (time >= start + stroke.duration && time < start + stroke.duration + gap) {
        const from = path.getPointAtLength(path.getTotalLength());
        const next = currentPaths[index + 1];
        const to = next?.getPointAtLength(0) ?? from;
        const travel = (time - start - stroke.duration) / gap;
        tip = { x: from.x + (to.x - from.x) * travel, y: from.y + (to.y - from.y) * travel - Math.sin(travel * Math.PI) * 8 };
        lifted = true;
      }
      start += stroke.duration + gap;
    }
    if (time >= writingTime) {
      const rest = time - writingTime;
      const lastPath = currentPaths[strokes.length - 1];
      const from = lastPath?.getPointAtLength(lastPath.getTotalLength()) ?? { x: 370, y: 264 };
      const nextStart = paths.current[(wordIndex + 1) % words.length][0]?.getPointAtLength(0) ?? { x: 181, y: 244 };
      const settle = Math.min(rest / 0.5, 1);
      const returnProgress = Math.max(0, (rest - 2.7) / 0.8);
      const parked = { x: from.x + (393 - from.x) * settle, y: from.y + (335 - from.y) * settle };
      tip = { x: parked.x + (nextStart.x - parked.x) * returnProgress, y: parked.y + (nextStart.y - parked.y) * returnProgress - Math.sin(returnProgress * Math.PI) * 16 };
      tip.y += Math.sin(rest * 4) * 1.5;
      ink.current?.setAttribute("opacity", String(1 - Math.max(0, (rest - 2) / 1.5)));
      lifted = true;
    } else {
      ink.current?.setAttribute("opacity", "1");
    }
    const angle = 24 + Math.sin(elapsed.current * 5) * (lifted ? 3 : 0.8);
    pen.current.setAttribute("transform", `translate(${tip.x} ${tip.y}) rotate(${angle}) scale(0.72) translate(0 -294)`);
  });

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none relative mx-auto aspect-square w-full max-w-[550px] select-none">
      <svg viewBox="0 0 560 560" className="absolute inset-0 size-full overflow-visible">
        <circle cx="280" cy="280" r="225" fill="var(--ink)" />
        <circle cx="280" cy="280" r="204" fill="none" stroke="var(--paper)" strokeOpacity="0.12" />
        <circle cx="280" cy="280" r="244" fill="none" stroke="var(--ink)" strokeOpacity="0.2" strokeDasharray="2 12" />
        <rect x="101" y="119" width="335" height="355" rx="15" fill="var(--highlighter)" transform="rotate(4 280 280)" />
        <rect x="100" y="115" width="335" height="355" rx="15" fill="var(--panel-strong)" transform="rotate(-2 280 280)" />
        <g transform="rotate(-8 280 280)">
          <rect x="95" y="110" width="335" height="355" rx="15" fill="var(--card)" stroke="var(--line)" />
          {[185, 230, 275, 320, 365, 410].map((line) => <path key={line} d={`M120 ${line} H405`} stroke="var(--line)" />)}
          <path d="M155 110V465" stroke="var(--red-pen)" strokeOpacity="0.25" />
          <text ref={chapterLabel} x="171" y="168" fill="var(--graphite)" fontSize="10" letterSpacing="1.3" fontFamily="var(--font-mono)">01 / THE FIRST SPARK</text>
          <g ref={accents} opacity="0">
            <rect x="185" y="300" width="59" height="26" rx="4" fill="var(--highlighter)" />
            <circle cx="179" cy="236" r="3" fill="var(--red-pen)" />
            <circle cx="192" cy="236" r="3" fill="var(--highlighter-deep)" />
            <circle cx="205" cy="236" r="3" fill="var(--graphite)" />
            <text x="194" y="317" fill="var(--ink)" fontSize="9" fontFamily="var(--font-mono)">Let&apos;s go ↗</text>
          </g>
          <g ref={burst} opacity="0">
            <circle cx="282" cy="283" r="70" fill="var(--highlighter)" />
            {Array.from({ length: 10 }, (_, i) => {
              const angle = i * Math.PI / 5;
              return <path key={i} d={`M${(282 + Math.cos(angle) * 102).toFixed(3)} ${(283 + Math.sin(angle) * 102).toFixed(3)} l${(Math.cos(angle) * 13).toFixed(3)} ${(Math.sin(angle) * 13).toFixed(3)}`} stroke={i % 3 === 0 ? "var(--red-pen)" : "var(--highlighter-deep)"} strokeWidth="4" strokeLinecap="round" />;
            })}
          </g>
          <g ref={ink}>
            {words.map((word, wordIndex) => (
              <g key={word.name} data-word={word.name} visibility={wordIndex === 0 ? "visible" : "hidden"} ref={(node) => { wordGroups.current[wordIndex] = node; }}>
                {word.strokes.map((stroke, index) => <path key={stroke.d} ref={(node) => { paths.current[wordIndex][index] = node; }} d={stroke.d} pathLength="1" strokeDasharray="1" strokeDashoffset="0" fill="none" stroke="var(--ink)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />)}
              </g>
            ))}
          </g>
          <path d="M190 430 Q275 415 365 427" stroke="var(--highlighter)" strokeWidth="12" strokeLinecap="round" />
          <g ref={pen} transform="translate(390 335) rotate(24) scale(0.72) translate(0 -294)">
            <rect x="-14" y="3" width="51" height="227" rx="22" fill="var(--ink)" fillOpacity="0.09" transform="translate(13 17)" />
            <rect x="-20" y="0" width="40" height="212" rx="19" fill="var(--ink)" />
            <path d="M-10 25V170" stroke="var(--paper)" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
            <path d="M13 18V89Q13 101 5 101" fill="none" stroke="var(--highlighter)" strokeWidth="5" strokeLinecap="round" />
            <path d="M-20 178H20V198H-20Z" fill="var(--highlighter)" />
            <path d="M-17 210H17L22 240L0 294L-22 240Z" fill="var(--highlighter)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
            <path d="M0 250V294" stroke="var(--ink)" strokeWidth="2" /><circle cy="245" r="5" fill="var(--ink)" />
          </g>
        </g>
        <g ref={floating}>
          <g transform="translate(22 118) rotate(-12)">
            <rect width="138" height="73" rx="14" fill="var(--highlighter)" />
            <text x="17" y="28" fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink)">THE INGREDIENT</text>
            <text x="17" y="54" fontSize="24" fontFamily="var(--font-hand)" fill="var(--ink)">a little curiosity.</text>
          </g>
          <g transform="translate(352 414) rotate(9)">
            <rect width="161" height="84" rx="14" fill="var(--highlighter)" />
            <text x="17" y="29" fontSize="11" fontFamily="var(--font-mono)" fill="var(--ink)">&lt;made-by-you /&gt;</text>
            <text x="17" y="60" fontSize="26" fontFamily="var(--font-hand)" fill="var(--ink)">That&apos;s the point.</text>
          </g>
        </g>
      </svg>
      <span className="absolute bottom-[2%] left-1/2 -translate-x-1/2 whitespace-nowrap font-hand text-2xl text-graphite">An idea. A little practice. Something yours.</span>
    </div>
  );
}

