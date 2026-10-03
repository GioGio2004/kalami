"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Me } from "@/components/CurrentUserProvider";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/buttons";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { ArrowRight, Camera, Check, Clock, Code, Mic, Monitor, Shield } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { errorMessage } from "@/lib/errors";
import { formatShort } from "@/lib/time";
import { useIsMobile } from "@/lib/useDevice";
import { assessmentPath } from "@/lib/urls";
import { CourseCard, type MyCourse, type UseCourse } from "./CourseCard";

function greetingFor(hour: number) {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const NEXT_STEPS = [
  { title: "Join a course", text: "With the code your lecturer gives you." },
  { title: "Take quizzes and exams", text: "They open right here, in your notebook." },
  { title: "Know the rules first", text: "Integrity rules are explained before each exam." },
];

type UpNextItem = FunctionReturnType<typeof api.learn.upNext>[number];
export type JoinResult = FunctionReturnType<typeof api.learn.join>;

/**
 * The student's home: one column of cards that open on tap. What's due comes
 * first, then each course, then the join code and the honesty notice.
 * `courses` and `upNext` are undefined while loading.
 */
export function DashboardView({
  me,
  courses,
  upNext,
  onJoin,
  useCourse,
}: {
  me: Me;
  courses: MyCourse[] | undefined;
  upNext: UpNextItem[] | undefined;
  onJoin: (code: string) => Promise<JoinResult>;
  useCourse: UseCourse;
}) {
  const [greeting] = useState(() => greetingFor(new Date().getHours()));
  // Only cards the student toggled; the rest follow the defaults below.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isOpen = (id: string, fallback: boolean) => toggled[id] ?? fallback;
  const toggle = (id: string, fallback: boolean) => () =>
    setToggled((current) => ({ ...current, [id]: !(current[id] ?? fallback) }));

  const student = me.student;
  const facts = student
    ? [
        student.universityName[me.locale],
        student.faculty,
        student.group && `Group ${student.group}`,
        student.year && `Year ${student.year}`,
      ].filter((fact): fact is string => Boolean(fact))
    : [];
  const noCourses = courses !== undefined && courses.length === 0;
  const onlyCourse = courses !== undefined && courses.length === 1;

  return (
    <Enter kind="scale" className="rounded-[2.25rem] bg-panel px-3 pb-3 pt-8 sm:rounded-[2.75rem] sm:px-10 sm:pb-8 sm:pt-14 lg:px-12">
      <div className="px-2 sm:px-1">
        <Enter as="p" kind="left" delay={0.2} className="-rotate-2 font-hand text-[1.8rem] leading-none text-graphite">
          {greeting},
        </Enter>
        <AnimatedHeading
          as="h1"
          delay={0.3}
          className="mt-3 text-5xl font-medium leading-[0.95] tracking-[-0.045em] sm:text-7xl"
        >
          {me.firstName ?? "there"}
        </AnimatedHeading>
        {facts.length > 0 && (
          <RevealGroup as="ul" stagger={0.1} delay={0.6} className="mt-6 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <RevealItem as="li" kind="pop" key={fact} className="rounded-full bg-card px-4 py-2 text-sm">
                {fact}
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>

      <RevealGroup stagger={0.1} delay={0.4} className="mt-8 grid gap-3 *:min-w-0 lg:grid-cols-12 lg:items-start">
        <div className="grid gap-3 *:min-w-0 lg:col-span-7">
          <RevealItem kind="scale">
            <UpNextCard items={upNext} open={isOpen("next", true)} onToggle={toggle("next", true)} />
          </RevealItem>

          <RevealItem as="section" kind="scale">
            <h2 className="px-3 pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-graphite">
              My courses{courses !== undefined && ` · ${courses.length}`}
            </h2>
            {courses === undefined ? (
              <div className="mt-2 h-20 animate-pulse rounded-[1.6rem] bg-card/70 sm:rounded-[2rem]" aria-busy="true" />
            ) : noCourses ? (
              <div className="mt-2 rounded-[1.6rem] border-2 border-dashed border-line p-5 sm:rounded-[2rem] sm:p-6">
                <p className="font-medium">No courses yet</p>
                <p className="mt-1 text-sm text-graphite">Here&apos;s what happens next:</p>
                <ol className="mt-5 grid gap-4">
                  {NEXT_STEPS.map((item, index) => (
                    <li key={item.title} className="flex gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-card text-sm font-semibold text-graphite">
                        {index + 1}
                      </span>
                      <span>
                        <span className="block text-[15px] font-medium leading-snug">{item.title}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-graphite">{item.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <ul className="mt-2 grid gap-3 *:min-w-0">
                {courses.map((course) => (
                  <li key={course._id}>
                    <CourseCard
                      course={course}
                      nextDue={upNext?.find((item) => item.courseId === course._id)}
                      open={isOpen(`course:${course._id}`, onlyCourse)}
                      onToggle={toggle(`course:${course._id}`, onlyCourse)}
                      useCourse={useCourse}
                    />
                  </li>
                ))}
              </ul>
            )}
          </RevealItem>
        </div>

        <div className="grid gap-3 *:min-w-0 lg:col-span-5">
          <RevealItem kind="scale">
            <ExpandableCard
              tone="highlighter"
              icon={<Code className="size-5" />}
              title="Got a join code?"
              summary="6 characters from your lecturer"
              open={isOpen("join", noCourses)}
              onToggle={toggle("join", noCourses)}
            >
              <JoinForm onJoin={onJoin} />
              <div
                className="notch-sides mt-4 flex items-center gap-4 rounded-[1.4rem] bg-ink py-3 pl-5 pr-4 text-paper [--notch-y:50%]"
                aria-hidden
              >
                <div>
                  <p className="text-xs text-paper/55">A code looks like</p>
                  <p className="font-mono text-xl font-semibold tracking-[0.14em]">K7MP4Q</p>
                </div>
              </div>
            </ExpandableCard>
          </RevealItem>

          <RevealItem kind="scale">
            <ExpandableCard
              tone="charcoal"
              icon={<Shield className="size-5" />}
              title="Honesty notice"
              summary="Accepted · no recordings, ever"
              aside={
                <span className="hidden items-center gap-1.5 rounded-full bg-highlighter px-3 py-1 text-xs font-semibold text-ink sm:flex">
                  <Check className="size-3.5" />
                  Accepted
                </span>
              }
              open={isOpen("honesty", false)}
              onToggle={toggle("honesty", false)}
            >
              <div className="border-t border-paper/15 pt-4">
                <p className="text-[15px] leading-relaxed text-paper/70">
                  Kalami keeps time on lessons and integrity counters during tasks and exams. It never records you.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                  {[
                    { icon: Camera, label: "No camera" },
                    { icon: Mic, label: "No mic" },
                    { icon: Monitor, label: "No screen" },
                  ].map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2 rounded-full bg-charcoal-soft px-3 py-1.5">
                      <Icon className="size-4 text-paper/70" />
                      {label}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/honesty"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-paper underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
                >
                  Read it again
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </ExpandableCard>
          </RevealItem>
        </div>
      </RevealGroup>
    </Enter>
  );
}

/** Open work across every course, nearest deadline first. */
function UpNextCard({ items, open, onToggle }: { items: UpNextItem[] | undefined; open: boolean; onToggle: () => void }) {
  const mobile = useIsMobile();
  const nearest = items?.[0];
  const summary =
    items === undefined
      ? "Loading…"
      : items.length === 0
        ? "Nothing due. Enjoy it."
        : nearest?.closesAt
          ? `Nearest due ${formatShort(nearest.closesAt)}`
          : "No deadline yet";
  return (
    <ExpandableCard
      icon={<Clock className="size-5" />}
      title="Up next"
      summary={summary}
      aside={
        items !== undefined &&
        items.length > 0 && (
          <span className="hidden shrink-0 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-paper tabular-nums sm:inline">
            {items.length}
          </span>
        )
      }
      open={open}
      onToggle={onToggle}
    >
      <div className="border-t border-line pt-4">
        {items === undefined || items.length === 0 ? (
          <p className="text-sm leading-relaxed text-graphite">Open tasks and deadlines line up here, nearest first.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item._id}>
                <Link
                  href={item.playable ? assessmentPath(item.kind, item._id) : `/courses/${item.courseId}`}
                  className="group flex items-center gap-3 rounded-2xl bg-panel/60 p-4 transition hover:bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-medium leading-snug">{item.title}</span>
                    <span className="mt-0.5 block truncate text-sm text-graphite">
                      {item.closesAt && `Due ${formatShort(item.closesAt)} · `}
                      {item.courseTitle}
                    </span>
                  </span>
                  {mobile && item.kind === "task" ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card px-3 py-1 text-xs text-graphite">
                      <Monitor className="size-3.5" />
                      Computer
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-card px-3 py-1 text-xs font-semibold">
                      {item.started ? "Continue" : "Start"}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ExpandableCard>
  );
}

function JoinForm({ onJoin }: { onJoin: (code: string) => Promise<JoinResult> }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await onJoin(code);
      if (result.ok) {
        router.push(`/courses/${result.courseId}`);
        return;
      }
      setError(result.message);
      setBusy(false);
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="border-t border-ink/10 pt-4">
      <div className="flex gap-2">
        <label htmlFor="join-code" className="sr-only">
          Join code
        </label>
        <input
          id="join-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="K7MP4Q"
          autoComplete="off"
          spellCheck={false}
          maxLength={12}
          required
          className="h-12 min-w-0 flex-1 rounded-full border border-ink/15 bg-card px-5 font-mono text-lg font-semibold tracking-[0.14em] outline-none placeholder:text-ink/25 focus:border-ink focus:ring-4 focus:ring-ink/10"
        />
        <Button type="submit" size="lg" disabled={busy || code.trim().length < 4}>
          {busy ? "Joining…" : "Join"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-pen">{error}</p>}
    </form>
  );
}
