import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Ticker } from "@/components/motion/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { STAFF_APP_URL } from "@/lib/urls";
import { ArrowUpRight, Check, Code, Cross, Eye, Pen, Shield } from "@/components/ui/icons";
import { Scribble } from "@/components/ui/Scribble";

export function Hero() {
  return (
    <section className="px-3 pt-5 sm:px-6">
      <div className="mx-auto max-w-[88rem] rounded-[2.75rem] bg-panel px-5 pb-5 pt-14 sm:px-10 sm:pb-8 sm:pt-20 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Reveal
              as="p"
              kind="left"
              className="-rotate-2 font-hand text-[1.75rem] leading-none text-graphite sm:text-[2.2rem]"
            >
              Your own work, by your own hand.
            </Reveal>
            <AnimatedHeading
              as="h1"
              delay={0.2}
              className="mt-6 text-[2.85rem] font-medium leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-[5.5rem]"
            >
              Exams where cheating is hard to do and{" "}
              <span className="whitespace-nowrap">
                <Scribble delay={1.5}>easy to see</Scribble>.
              </span>
            </AnimatedHeading>
          </div>

          <div className="space-y-7 lg:pb-3">
            <RevealGroup stagger={0.12} delay={0.5} className="flex gap-2.5">
              <RevealItem kind="pop">
                <Chip>
                  <Pen className="size-6" />
                </Chip>
              </RevealItem>
              <RevealItem kind="pop">
                <Chip>
                  <Eye className="size-6" />
                </Chip>
              </RevealItem>
              <RevealItem kind="pop">
                <Chip>
                  <Shield className="size-6" />
                </Chip>
              </RevealItem>
            </RevealGroup>
            <Reveal as="p" delay={0.65} className="max-w-md text-lg leading-relaxed text-graphite">
              Students read lessons, practise and sit exams in a calm, Georgian-first notebook.
              Lecturers watch the class live and see who is working, who is stuck and who is
              probably cheating.
            </Reveal>
            <Reveal delay={0.8} className="flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-3 rounded-full bg-highlighter py-2 pl-6 pr-2 text-base font-medium text-ink transition-transform active:scale-[0.98]"
              >
                I&apos;m a student
                <span className="grid size-9 place-items-center rounded-full bg-ink text-highlighter transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <a
                href={STAFF_APP_URL}
                className="inline-flex items-center rounded-full border border-ink/15 px-6 py-3 text-base font-medium transition-colors hover:bg-card"
              >
                I&apos;m a lecturer
              </a>
            </Reveal>
          </div>
        </div>

        {/* min-w-0: truncated text inside the cards must not widen the grid column. */}
        <RevealGroup stagger={0.16} delay={0.3} className="mt-14 grid gap-4 *:min-w-0 lg:mt-20 lg:grid-cols-12">
          <ControlRoomCard />
          <CodeTaskCard />
          <RedPenCard />
        </RevealGroup>
      </div>
    </section>
  );
}

const chipTones = {
  card: "bg-card text-ink",
  panel: "bg-panel text-ink",
  dark: "bg-charcoal-soft text-paper",
};

/** Round icon chip; pick the tone that contrasts with what it sits on. */
function Chip({ children, tone = "card" }: { children: ReactNode; tone?: keyof typeof chipTones }) {
  return (
    <span className={`grid size-14 shrink-0 place-items-center rounded-full ${chipTones[tone]}`}>
      {children}
    </span>
  );
}

function CornerArrow({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`grid size-10 place-items-center rounded-full ${dark ? "bg-charcoal-soft text-paper" : "bg-panel text-ink"}`}
    >
      <ArrowUpRight className="size-4" />
    </span>
  );
}

const students = [
  { initials: "AB", name: "Ana B.", progress: "Question 7 of 20", status: "No flags", level: "ok" },
  {
    initials: "GK",
    name: "Giorgi K.",
    progress: "Question 3 of 20",
    status: (
      <>
        Away <Ticker start={42} suffix="s" /> · 3 tabs
      </>
    ),
    level: "warn",
  },
  {
    initials: "NM",
    name: "Nino M.",
    progress: "Attempt locked",
    status: "Left fullscreen ×2",
    level: "flag",
  },
] as const;

const levelStyles = {
  ok: { dot: "bg-ok", avatar: "bg-highlighter text-ink" },
  warn: { dot: "bg-warn", avatar: "bg-panel text-ink" },
  flag: { dot: "bg-red-pen", avatar: "bg-red-pen text-paper" },
};

function ControlRoomCard() {
  return (
    <RevealItem
      as="article"
      kind="scale"
      hover
      className="notch-top flex flex-col gap-8 rounded-[2rem] bg-card p-5 sm:flex-row sm:p-7 lg:col-span-6"
    >
      <div className="flex flex-col justify-between gap-10 sm:w-[40%]">
        <Chip tone="panel">
          <Eye className="size-6" />
        </Chip>
        <div>
          <h3 className="text-2xl font-medium tracking-tight">Live control room</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-graphite">
            During an exam every student is a live row. You see it the moment someone leaves.
          </p>
          <a href="#inside" className="group mt-5 inline-flex items-center gap-3 font-medium">
            <span className="grid size-10 place-items-center rounded-full bg-highlighter transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
            See it
          </a>
        </div>
      </div>

      <div className="min-w-0 flex-1 rounded-[1.6rem] bg-panel/70 p-2.5">
        <div className="flex items-center justify-between px-3 pb-2 pt-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-graphite">
          <span>Midterm · Web basics</span>
          <span className="flex items-center gap-1.5 text-ok">
            <span className="size-1.5 animate-pulse rounded-full bg-ok" />
            Live
          </span>
        </div>
        <RevealGroup as="ul" stagger={0.18} delay={0.9} className="space-y-2">
          {students.map((student) => (
            <RevealItem
              as="li"
              kind="left"
              key={student.name}
              className="flex items-center gap-3 rounded-2xl bg-card px-3 py-2.5 shadow-[0_1px_0_rgba(20,20,20,0.04)]"
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${levelStyles[student.level].avatar}`}
              >
                {student.initials}
              </span>
              {/* Names never wrap; the status gives way and truncates instead. */}
              <div className="shrink-0">
                <p className="text-[15px] font-medium">{student.name}</p>
                <p className="text-xs text-graphite">{student.progress}</p>
              </div>
              <div className="ml-auto flex min-w-0 items-center gap-1.5 text-xs text-graphite">
                <span className={`size-2 shrink-0 rounded-full ${levelStyles[student.level].dot}`} />
                <span className="truncate">{student.status}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </RevealItem>
  );
}

function CodeTaskCard() {
  return (
    <RevealItem as="article" kind="scale" hover className="flex flex-col rounded-[2rem] bg-card p-5 sm:p-7 lg:col-span-3">
      <div className="flex items-start justify-between">
        <Chip tone="panel">
          <Code className="size-6" />
        </Chip>
        <CornerArrow />
      </div>
      <h3 className="mt-8 text-2xl font-medium tracking-tight">Code tasks</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-graphite">
        HTML and CSS typed by hand, checked while you write.
      </p>
      <ul className="mt-5 space-y-2 font-mono text-[13px]">
        <CheckRow passed>has &lt;nav&gt;</CheckRow>
        <CheckRow passed>3 menu items</CheckRow>
        <CheckRow passed={false}>.card uses flex</CheckRow>
      </ul>
      <div className="mt-auto pt-6">
        <div className="notch-sides flex items-center rounded-[1.4rem] bg-charcoal py-3 pl-5 pr-3 text-paper [--notch-y:50%]">
          <div className="flex-1">
            <p className="text-xs text-paper/55">Integrity · strict</p>
            <p className="text-lg font-medium leading-tight">Paste blocked</p>
          </div>
          <span className="mx-3 h-9 border-l border-dashed border-paper/25" />
          <span className="grid size-11 place-items-center rounded-full bg-highlighter text-ink">
            <Shield className="size-5" />
          </span>
        </div>
      </div>
    </RevealItem>
  );
}

function CheckRow({ passed, children }: { passed: boolean; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`grid size-5 place-items-center rounded-full ${passed ? "bg-highlighter text-ink" : "bg-red-pen/10 text-red-pen"}`}
      >
        {passed ? <Check className="size-3" /> : <Cross className="size-3" />}
      </span>
      <span className={passed ? "text-ink" : "text-red-pen"}>{children}</span>
    </li>
  );
}

function RedPenCard() {
  return (
    <RevealItem
      as="article"
      kind="scale"
      hover
      className="flex flex-col rounded-[2rem] bg-charcoal p-5 text-paper sm:p-7 lg:col-span-3"
    >
      <div className="flex items-start justify-between">
        <Chip tone="dark">
          <Pen className="size-6" />
        </Chip>
        <CornerArrow dark />
      </div>
      <h3 className="mt-8 text-2xl font-medium tracking-tight">Red-pen grading</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-paper/65">
        Mark a line, leave a note. It lands right on the student&apos;s work.
      </p>
      <div className="mt-auto space-y-2 pt-6">
        <p className="rounded-2xl bg-charcoal-soft px-4 py-3 font-mono text-[13px] text-paper/85">
          .card {"{"} display:{" "}
          <span className="underline decoration-red-pen decoration-wavy decoration-2 underline-offset-4">
            block
          </span>
          ; {"}"}
        </p>
        <Reveal
          as="p"
          kind="pop"
          delay={1.1}
          className="ml-5 -rotate-2 rounded-2xl bg-card px-4 py-2 font-hand text-[1.45rem] leading-tight text-red-pen"
        >
          Nice! Try flex →
        </Reveal>
      </div>
    </RevealItem>
  );
}
