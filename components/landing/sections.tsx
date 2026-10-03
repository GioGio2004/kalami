import type { ComponentType, SVGProps } from "react";
import { FeatureCarousel, type Slide } from "@/components/landing/FeatureCarousel";
import { HonestyVisual } from "@/components/landing/HonestyVisual";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Strike } from "@/components/motion/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Camera, Check, Mic, Monitor, Robot } from "@/components/ui/icons";
import {
  LiveMonitorMock,
  NotebookMock,
  SandboxMock,
  VariantsMock,
} from "@/components/landing/mockups";
import { CircledLabel, ScribbleUnderline } from "@/components/ui/Scribble";
import { SectionHeading } from "@/components/ui/SectionHeading";

const slides: Slide[] = [
  {
    id: "notebook",
    eyebrow: "For students · Notebook",
    title: (
      <>
        Lessons that read like your own{" "}
        <span className="whitespace-nowrap">
          <ScribbleUnderline>notebook</ScribbleUnderline>.
        </span>
      </>
    ),
    body: "Courses, lessons and deadlines in one calm place, in Georgian. Progress fills in like ink, and time only counts while you are actually reading.",
    tone: "light",
    mock: <NotebookMock />,
  },
  {
    id: "control-room",
    eyebrow: "AntiCheat · Live",
    badge: "Beta",
    title: "See who's stuck. And who's probably cheating.",
    body: "During an exam every student is a live row: progress, time away, tab switches, fullscreen exits. Unlock an attempt or add time in one click.",
    tone: "dark",
    mock: <LiveMonitorMock />,
  },
  {
    id: "sandbox",
    eyebrow: "Code tasks · Sandbox",
    title: "Typed by hand. Checked instantly.",
    body: "A real HTML and CSS editor with a live preview. No paste, no autocomplete. Checks run while students type, and again on the server when they submit.",
    tone: "light",
    mock: <SandboxMock />,
  },
  {
    id: "variants",
    eyebrow: "Variants · Per student",
    badge: "New",
    title: "Copying a friend's work doesn't work.",
    body: "Every student gets their own colours, texts and counts, generated from who they are. Same task, a different right answer for each person.",
    tone: "light",
    mock: <VariantsMock />,
  },
];

export function InsideSection() {
  return (
    <section id="inside" className="scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto max-w-[76rem] px-4 sm:px-6">
        <Reveal kind="left">
          <CircledLabel>What&apos;s inside</CircledLabel>
        </Reveal>
        <SectionHeading>One notebook for students. One control room for lecturers.</SectionHeading>
      </div>
      <div className="mt-12 sm:mt-16">
        <FeatureCarousel slides={slides} />
      </div>
    </section>
  );
}

const honestyPoints = [
  "Every line typed by hand: paste, drop and copying the task out are blocked",
  "Each student gets their own variant of every task",
  "Tab switches, time away and fullscreen exits counted live",
  "Flags are advice, not verdicts. The lecturer always decides",
  "No camera, no microphone, no screen recording. Ever",
];

export function HonestySection() {
  return (
    <section id="honesty" className="scroll-mt-28 px-4 pb-24 sm:px-6 sm:pb-32">
      <div className="mx-auto max-w-[76rem]">
        <Reveal as="p" kind="left" className="text-xs font-semibold uppercase tracking-[0.22em] text-graphite">
          How it stays honest
        </Reveal>
        <AnimatedHeading
          as="h2"
          className="mt-5 max-w-5xl text-5xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-7xl"
        >
          Make cheating annoying, visible and{" "}
          <span className="whitespace-nowrap">
            <ScribbleUnderline delay={0.9}>pointless</ScribbleUnderline>.
          </span>
        </AnimatedHeading>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-end lg:gap-16">
          <HonestyVisual />

          <div className="lg:pb-4">
            <Reveal as="p" delay={0.1} className="text-xl leading-relaxed sm:text-2xl">
              A browser can&apos;t stop a phone, and Kalami never pretends it can. Instead every
              shortcut leaves a trace, every student gets their own task, and the lecturer sees it
              all, live.
            </Reveal>
            <RevealGroup as="ul" stagger={0.12} delay={0.2} className="mt-9 space-y-4">
              {honestyPoints.map((point) => (
                <RevealItem as="li" kind="right" key={point} className="flex items-start gap-3.5 text-lg leading-snug">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-highlighter">
                    <Check className="size-4" />
                  </span>
                  {point}
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}

const neverRecorded: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  text: string;
}[] = [
  { icon: Camera, title: "No webcam", text: "Nobody watches your face." },
  { icon: Mic, title: "No microphone", text: "Nothing you say is heard or kept." },
  { icon: Monitor, title: "No screen recording", text: "Counters like time away, never video." },
  { icon: Robot, title: "No AI for students", text: "The AI helper is for lecturers only." },
];

export function PrivacySection() {
  return (
    <section id="privacy" className="scroll-mt-28 px-4 pb-24 sm:px-6 sm:pb-32">
      <Reveal kind="scale" amount={0.1} className="mx-auto max-w-[76rem] rounded-[2.5rem] bg-panel p-6 sm:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-end lg:gap-16">
          <div>
            <p className="-rotate-1 font-hand text-[1.7rem] leading-none text-graphite">
              Promised in plain words
            </p>
            <AnimatedHeading
              as="h2"
              className="mt-4 text-4xl font-medium leading-[1.02] tracking-[-0.04em] sm:text-5xl"
            >
              What Kalami never records.
            </AnimatedHeading>
          </div>
          <p className="text-lg leading-relaxed text-graphite">
            Students read exactly what is measured before they begin, and can see their own activity
            whenever they like. Counters, not recordings, kept only as long as the university agrees.
          </p>
        </div>
        <RevealGroup stagger={0.12} className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {neverRecorded.map(({ icon: Icon, title, text }) => (
            <RevealItem key={title} kind="up" hover className="rounded-[1.6rem] bg-card p-5">
              <span className="relative grid size-12 place-items-center rounded-full bg-panel">
                <Icon className="size-5" />
                <Strike />
              </span>
              <p className="mt-7 text-lg font-medium">{title}</p>
              <p className="mt-1 text-sm text-graphite">{text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Reveal>
    </section>
  );
}
