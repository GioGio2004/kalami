"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import type { Me } from "@/components/CurrentUserProvider";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/buttons";
import { ArrowRight, Camera, Check, Clock, Code, Mic, Monitor, Notebook, Shield } from "@/components/ui/icons";
import { api } from "@/convex-api/api";
import { errorMessage } from "@/lib/errors";

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

function Chip({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className={`grid size-12 shrink-0 place-items-center rounded-full ${dark ? "bg-charcoal-soft text-paper" : "bg-panel text-ink"}`}
    >
      {children}
    </span>
  );
}

export function DashboardView({ me }: { me: Me }) {
  const [greeting] = useState(() => greetingFor(new Date().getHours()));
  const courses = useQuery(api.learn.myCourses, {});
  const upNext = useQuery(api.learn.upNext, {});
  const student = me.student;
  const facts = student
    ? [
        student.universityName[me.locale],
        student.faculty,
        student.group && `Group ${student.group}`,
        student.year && `Year ${student.year}`,
      ].filter((fact): fact is string => Boolean(fact))
    : [];

  return (
    <Enter kind="scale" className="rounded-[2.75rem] bg-panel px-4 pb-4 pt-10 sm:px-10 sm:pb-8 sm:pt-14 lg:px-12">
      <div className="grid gap-8 px-1 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div>
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
            <RevealGroup as="ul" stagger={0.1} delay={0.6} className="mt-7 flex flex-wrap gap-2">
              {facts.map((fact) => (
                <RevealItem as="li" kind="pop" key={fact} className="rounded-full bg-card px-4 py-2 text-sm">
                  {fact}
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
        <Enter as="p" delay={0.7} className="max-w-sm text-lg leading-relaxed text-graphite lg:justify-self-end lg:pb-2">
          Your notebook is ready. Courses, deadlines and your lecturer&apos;s notes will collect
          here.
        </Enter>
      </div>

      <RevealGroup stagger={0.14} delay={0.5} className="mt-10 grid gap-4 *:min-w-0 lg:grid-cols-12">
        <RevealItem as="section" kind="scale" hover className="notch-top rounded-[2rem] bg-card p-6 sm:p-8 lg:col-span-8">
          <div className="flex items-center gap-4">
            <Chip>
              <Notebook className="size-5" />
            </Chip>
            <h2 className="text-2xl font-medium tracking-tight">My courses</h2>
            <span className="ml-auto rounded-full bg-panel px-3 py-1 text-sm tabular-nums text-graphite">
              {courses?.length ?? "…"}
            </span>
          </div>
          {courses !== undefined && courses.length > 0 ? (
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {courses.map((course) => (
                <li key={course._id}>
                  <Link
                    href={`/courses/${course._id}`}
                    className="group flex h-full flex-col rounded-2xl border border-line p-5 transition hover:border-ink/25 hover:bg-panel/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-lg font-medium leading-snug">{course.title}</span>
                      {course.openCount > 0 && (
                        <span className="shrink-0 rounded-full bg-highlighter px-2.5 py-1 text-xs font-semibold">
                          {course.openCount} open
                        </span>
                      )}
                    </span>
                    <span className="mt-1 text-sm text-graphite">
                      {[course.lecturer, course.semester].filter(Boolean).join(" · ")}
                    </span>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                      Open
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
          <div className="mt-7 rounded-2xl border-2 border-dashed border-line p-5 sm:p-6">
            <p className="font-medium">No courses yet</p>
            <p className="mt-1 text-sm text-graphite">Here&apos;s what happens next:</p>
            <ol className="mt-5 grid gap-4 sm:grid-cols-3">
              {NEXT_STEPS.map((item, index) => (
                <li key={item.title} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-panel text-sm font-semibold text-graphite">
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
          )}
        </RevealItem>

        <RevealItem as="section" kind="scale" hover className="flex flex-col rounded-[2rem] bg-charcoal p-6 text-paper sm:p-8 lg:col-span-4">
          <div className="flex items-start justify-between">
            <Chip dark>
              <Shield className="size-5" />
            </Chip>
            <span className="flex items-center gap-1.5 rounded-full bg-highlighter px-3 py-1 text-xs font-semibold text-ink">
              <Check className="size-3.5" />
              Accepted
            </span>
          </div>
          <h2 className="mt-8 text-2xl font-medium tracking-tight">Honesty notice</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-paper/65">
            Time on lessons and integrity counters during tasks and exams. Never recordings.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm">
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
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-6 text-sm font-medium text-paper underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            Read it again
            <ArrowRight className="size-4" />
          </Link>
        </RevealItem>

        <RevealItem as="section" kind="scale" hover className="rounded-[2rem] bg-card p-6 sm:p-8 lg:col-span-5">
          <div className="flex items-center gap-4">
            <Chip>
              <Clock className="size-5" />
            </Chip>
            <h2 className="text-2xl font-medium tracking-tight">Up next</h2>
          </div>
          {upNext !== undefined && upNext.length > 0 ? (
            <ul className="mt-6 space-y-2">
              {upNext.map((item) => (
                <li key={item._id}>
                  <Link
                    href={item.playable ? `/tasks/${item._id}` : `/courses/${item.courseId}`}
                    className="group flex items-center gap-3 rounded-2xl border border-line p-4 transition hover:border-ink/25 hover:bg-panel/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{item.title}</span>
                      <span className="block truncate text-sm text-graphite">
                        {item.courseTitle}
                        {item.closesAt &&
                          ` · due ${new Date(item.closesAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-panel px-3 py-1 text-xs font-semibold">
                      {item.started ? "Continue" : "Start"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p className="mt-7 -rotate-1 font-hand text-[1.7rem] text-graphite">Nothing due. Enjoy it.</p>
              <p className="mt-2 text-[15px] leading-relaxed text-graphite">
                Open tasks and deadlines line up here, nearest first.
              </p>
            </>
          )}
        </RevealItem>

        <RevealItem as="section" kind="scale" hover className="rounded-[2rem] bg-highlighter p-6 sm:p-8 lg:col-span-7">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 className="text-3xl font-medium tracking-[-0.03em]">Got a join code?</h2>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink/75">
                Your lecturer gives you a 6-character code. Type it here to join their course.
              </p>
              <JoinForm />
            </div>
            <div
              className="notch-sides flex items-center gap-4 rounded-[1.4rem] bg-ink py-3 pl-5 pr-4 text-paper [--notch-y:50%]"
              aria-hidden
            >
              <div>
                <p className="text-xs text-paper/55">A code looks like</p>
                <p className="font-mono text-xl font-semibold tracking-[0.14em]">K7MP4Q</p>
              </div>
            </div>
          </div>
        </RevealItem>
      </RevealGroup>
    </Enter>
  );
}

function JoinForm() {
  const join = useMutation(api.learn.join);
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await join({ code });
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
    <form onSubmit={submit} className="mt-5 max-w-md">
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
          <Code className="size-4" />
          {busy ? "Joining…" : "Join"}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-pen">{error}</p>}
    </form>
  );
}
