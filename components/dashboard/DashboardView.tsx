"use client";

import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { PenScene } from "@/components/landing/PenScene";
import { ContactCard } from "@/components/contact/ContactCard";
import type { Me } from "@/components/CurrentUserProvider";
import { Button } from "@/components/ui/buttons";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { ArrowRight, Check, Clock, Mail, Monitor, Shield, Sparkle, Users } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { errorMessage } from "@/lib/errors";
import { formatShort } from "@/lib/time";
import { useIsMobile } from "@/lib/useDevice";
import { assessmentPath } from "@/lib/urls";
import { CourseCard, type MyCourse, type UseCourse } from "./CourseCard";

const NEXT_STEPS = [
  { title: "Join your class", text: "With the invite link or code your teacher gives you." },
  { title: "Take quizzes and exams", text: "They open right here, in your notebook." },
  { title: "Know the rules first", text: "Integrity rules are explained before each exam." },
];

type UpNextItem = FunctionReturnType<typeof api.learn.upNext>[number];
export type JoinResult = FunctionReturnType<typeof api.learn.join>;
export type MyInvite = FunctionReturnType<typeof api.groups.myInvites>[number];
export type MyGroup = FunctionReturnType<typeof api.groups.mine>[number];

/** Courses are directly accessible; task details load on demand. Undefined data stays in a loading state. */
export function DashboardView({
  me,
  courses,
  upNext,
  invites,
  groups,
  onJoin,
  onAcceptInvite,
  onLeaveGroup,
  useCourse,
  install,
}: {
  me: Me;
  courses: MyCourse[] | undefined;
  upNext: UpNextItem[] | undefined;
  /** Open invites to the student's own address, expired ones already left out. */
  invites: MyInvite[] | undefined;
  groups: MyGroup[] | undefined;
  onJoin: (code: string) => Promise<JoinResult>;
  onAcceptInvite: (token: string) => Promise<unknown>;
  onLeaveGroup: (groupId: MyGroup["_id"]) => Promise<unknown>;
  useCourse: UseCourse;
  /** The "install Kalami" card (components/pwa/InstallCard), when there is something to offer. */
  install?: ReactNode;
}) {
  const [search, setSearch] = useState("");
  // Only cards the student toggled; the rest follow the defaults below.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isOpen = (id: string, fallback: boolean) => toggled[id] ?? fallback;
  const toggle = (id: string, fallback: boolean) => () =>
    setToggled((current) => ({ ...current, [id]: !(current[id] ?? fallback) }));

  const student = me.student;
  const facts = student
    ? [
        student.universityName?.[me.locale],
        student.faculty,
        student.group && `Group ${student.group}`,
        student.year && `Year ${student.year}`,
      ].filter((fact): fact is string => Boolean(fact))
    : [];
  const noCourses = courses !== undefined && courses.length === 0;
  const shownCourses = courses?.filter((course) => `${course.title} ${course.lecturer ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="mx-auto max-w-[1320px] rounded-[2.25rem] bg-panel px-4 py-8 sm:rounded-[2.75rem] sm:px-9 sm:py-10">
      <header className="relative mb-9 px-2 sm:min-h-[225px] sm:pr-64">
        <div aria-hidden="true" className="pointer-events-none absolute -right-3 -top-6 w-32 select-none sm:-right-5 sm:-top-10 sm:w-72"><PenScene encouragement decoration /></div>
        <p className="mb-3 -rotate-1 font-hand text-[1.8rem] leading-none text-graphite">Good to see you,</p>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <h1 className="pr-24 text-5xl font-medium leading-[1.05] sm:pr-0 tracking-[-0.045em] wrap-anywhere sm:text-6xl">{me.firstName ?? "there"}</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-graphite">A clear place to focus. Pick up where your curiosity takes you.</p>
          </div>
          <div className="flex gap-6 rounded-[1.5rem] bg-card/70 px-5 py-4 text-sm">
            <div><span className="block text-2xl font-semibold tabular-nums">{courses?.length ?? "—"}</span><span className="text-graphite">Courses</span></div>
            <div className="border-l border-line pl-6"><span className="block text-2xl font-semibold tabular-nums">{upNext?.length ?? "—"}</span><span className="text-graphite">Open tasks</span></div>
          </div>
        </div>
        {facts.length > 0 && <ul aria-label="Student details" className="mt-5 flex flex-wrap gap-2 text-sm text-graphite">{facts.map((fact) => <li key={fact} className="rounded-full bg-card px-4 py-2">{fact}</li>)}</ul>}
      </header>
      {invites !== undefined && invites.length > 0 && <ul aria-label="Group invites" className="mb-6 grid gap-3">{invites.map((invite) => <li key={invite.token}><InviteStrip invite={invite} onAccept={onAcceptInvite} /></li>)}</ul>}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-6">
        <div className="min-w-0 lg:hidden"><UpNextCard items={upNext} /></div>
        <section aria-labelledby="courses-heading" className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div><h2 id="courses-heading" className="text-xl font-semibold tracking-tight">My courses</h2><p className="mt-1 text-sm text-graphite">Lessons, materials, and your next steps.</p></div>
            <label className="flex w-full items-center rounded-full border border-transparent bg-card px-4 focus-within:ring-2 focus-within:ring-ink/20 sm:w-56">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4 shrink-0 text-graphite"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
              <span className="sr-only">Search courses</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a course" className="h-11 w-full min-w-0 bg-transparent pl-2 text-sm outline-none" />
            </label>
          </div>
          {courses === undefined ? <div aria-busy="true" aria-label="Loading courses" className="space-y-4">{[0, 1].map((key) => <div key={key} className="h-48 animate-pulse rounded-2xl border border-line bg-panel/50" />)}</div> : noCourses ? (
            <div className="rounded-[2rem] border-2 border-dashed border-line bg-card p-7 sm:p-9">
              <h3 className="text-lg font-semibold">Your next chapter starts here</h3><p className="mt-2 text-sm text-graphite">Join a class with a code or accept an invitation from your lecturer.</p>
              <a href="#join-code" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-ink px-4 text-sm font-medium text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">Enter a join code</a><ol className="mt-7 space-y-5">{NEXT_STEPS.map((item, index) => <li key={item.title} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-panel text-xs font-semibold">{index + 1}</span><div><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-sm text-graphite">{item.text}</p></div></li>)}</ol>
            </div>
          ) : shownCourses?.length === 0 ? <div role="status" className="rounded-[2rem] bg-card p-8"><p className="font-medium">No matching courses</p><p className="mt-2 text-sm text-graphite">Try a course title or lecturer&apos;s name.</p><button onClick={() => setSearch("")} className="mt-4 min-h-11 text-sm font-medium underline underline-offset-4">Clear search</button></div> : (
            <ul className="space-y-4">{shownCourses?.map((course) => <li key={course._id}><CourseCard course={course} nextDue={upNext?.find((item) => item.courseId === course._id)} open={isOpen(`course:${course._id}`, false)} onToggle={toggle(`course:${course._id}`, false)} useCourse={useCourse} /></li>)}</ul>
          )}
          <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-charcoal p-6 text-paper" aria-label="Learning support">
            <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-highlighter text-ink"><Sparkle className="size-4" /></span><div><h3 className="text-sm font-semibold">A little help with the next step</h3><p className="mt-1 max-w-md text-sm leading-relaxed text-paper/70">Revisit a lesson or explore your finished work with your AI assistant.</p></div></div>
            <Link href="/assistant" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-highlighter px-4 text-sm font-medium text-ink transition hover:brightness-95 focus-visible:outline-2">Study assistant <ArrowRight className="size-4" /></Link>
          </section>
          {install && <div className="mt-5">{install}</div>}
        </section>
        <aside aria-label="Tasks and student resources" className="min-w-0 space-y-5">
          <div className="hidden lg:block"><UpNextCard items={upNext} /></div>
          <section className="rounded-[2rem] bg-highlighter p-6">
            <h2 className="text-lg font-medium">Got a join code?</h2><p className="mb-4 mt-1 text-sm leading-relaxed text-graphite">Enter the code from your lecturer.</p><JoinForm onJoin={onJoin} />
          </section>
          {groups !== undefined && groups.length > 0 && <GroupsCard groups={groups} onLeave={onLeaveGroup} open={isOpen("groups", false)} onToggle={toggle("groups", false)} />}
          <section className="rounded-[2rem] bg-card p-6">
            <h2 className="font-hand text-2xl">Here when you need us</h2><p className="mb-3 mt-2 text-sm leading-relaxed text-graphite">Ask your lecturer a question or get help from the Kalami team.</p><ContactCard variant="compact" lang={me.locale} className="min-h-11 items-center" />
            <Link href="/honesty" className="mt-4 flex min-h-11 items-center gap-2 border-t border-line pt-4 text-xs text-graphite transition hover:text-ink"><Shield className="size-4" />Your privacy & assessment rules<ArrowRight className="ml-auto size-3.5" /></Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

/** Open work across every course, nearest deadline first. */
function UpNextCard({ items }: { items: UpNextItem[] | undefined }) {
  const headingId = useId();
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
    <section className="rounded-[2rem] bg-card p-5" aria-labelledby={headingId}>
      <div className="mb-4 flex items-center gap-2"><Clock className="size-4 text-graphite" /><h2 id={headingId} className="text-lg font-medium">Up next</h2>{items && items.length > 0 && <span className="ml-auto rounded-md bg-highlighter/50 px-2 py-0.5 text-xs font-semibold">{items.length}</span>}</div>
      <p className="mb-4 text-sm text-graphite">{summary}</p>
      <div className="border-t border-line pt-4">
        {items === undefined || items.length === 0 ? (
          <p className="text-sm leading-relaxed text-graphite">Your open tasks appear here, with the nearest deadline first.</p>
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
    </section>
  );
}

/** "Nino invited you to Web Dev 101", with Accept. Accepted invites leave the list by themselves. */
function InviteStrip({ invite, onAccept }: { invite: MyInvite; onAccept: (token: string) => Promise<unknown> }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setState("busy");
    setError(null);
    try {
      await onAccept(invite.token);
      setState("done");
    } catch (caught) {
      setError(errorMessage(caught));
      setState("idle");
    }
  }

  return (
    <div className="rounded-2xl border border-highlighter-deep/40 bg-highlighter/15 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-highlighter">
          <Mail className="size-5" />
        </span>
        <p className="min-w-0 flex-1 basis-44 text-[15px] leading-snug">
          <span className="font-medium">{invite.teacher}</span> invited you to{" "}
          <span className="font-medium">{invite.groupName}</span>
        </p>
        <Button onClick={accept} disabled={state !== "idle"} className="max-sm:w-full">
          {state === "done" ? (
            <>
              <Check className="size-4" />
              Joined
            </>
          ) : state === "busy" ? (
            "Accepting…"
          ) : (
            "Accept"
          )}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-pen">
          {error}
        </p>
      )}
    </div>
  );
}

/** The groups the student is in, each with a Leave that asks first. */
function GroupsCard({
  groups,
  onLeave,
  open,
  onToggle,
}: {
  groups: MyGroup[];
  onLeave: (groupId: MyGroup["_id"]) => Promise<unknown>;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <ExpandableCard
      icon={<Users className="size-5" />}
      className="rounded-[2rem]!"
      title="My groups"
      summary={groups.map((group) => group.name).join(" · ")}
      aside={
        <span className="hidden shrink-0 rounded-full bg-panel px-2.5 py-1 text-xs font-semibold tabular-nums sm:inline">
          {groups.length}
        </span>
      }
      open={open}
      onToggle={onToggle}
    >
      <div className="border-t border-line pt-4">
        <p className="text-sm leading-relaxed text-graphite">
          Courses your teachers share with a group show up here by themselves.
        </p>
        <ul className="mt-3 space-y-2">
          {groups.map((group) => (
            <li key={group._id}>
              <GroupRow group={group} onLeave={onLeave} />
            </li>
          ))}
        </ul>
      </div>
    </ExpandableCard>
  );
}

function GroupRow({ group, onLeave }: { group: MyGroup; onLeave: (groupId: MyGroup["_id"]) => Promise<unknown> }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leave() {
    setBusy(true);
    setError(null);
    try {
      // On success the group leaves the list and this row unmounts.
      await onLeave(group._id);
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-panel/60 p-4">
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="block font-medium leading-snug">{group.name}</span>
          <span className="mt-0.5 block truncate text-sm text-graphite">{group.teacher}</span>
        </span>
        {!confirming && (
          <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
            Leave
          </Button>
        )}
      </div>
      {confirming && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-sm leading-relaxed text-graphite">
            Leave {group.name}? Courses you only have through this group leave your dashboard. To
            come back later, ask your teacher for the invite link.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-pen">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="danger" size="sm" onClick={leave} disabled={busy}>
              {busy ? "Leaving…" : "Leave group"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
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
    <form onSubmit={submit} className="space-y-2">
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
      {error && <p role="alert" className="mt-2 text-sm font-medium text-red-pen">{error}</p>}
    </form>
  );
}
