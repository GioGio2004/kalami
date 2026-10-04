"use client";

import { ConvexError } from "convex/values";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { CourseView } from "@/components/courses/CourseView";
import { CurrentUserContext, type CurrentUser, type Me } from "@/components/CurrentUserProvider";
import type { UseCourse } from "@/components/dashboard/CourseCard";
import { DashboardView, type MyGroup, type MyInvite } from "@/components/dashboard/DashboardView";
import { JoinView, type JoinInvite } from "@/components/join/JoinView";
import { Bell } from "@/components/notifications/NotificationBell";
import type { Inbox } from "@/components/notifications/NotificationsPanel";
import { TaskOnPhone } from "@/components/tasks/TaskOnPhone";
import {
  OnboardingWizard,
  type HonestyNotice,
  type University,
} from "@/components/onboarding/OnboardingWizard";
import { StudentAccount } from "@/components/StudentAccount";
import { PillHeader } from "@/components/ui/PillHeader";
import { LoadingScreen } from "@/components/ui/StatusScreen";

// Development-only screen gallery with sample data: lets signed-in screens be
// reviewed without an account. The route 404s in production.

const gori: University = {
  _id: "sample_gori" as University["_id"],
  name: { ka: "გორის სახელმწიფო უნივერსიტეტი", en: "Gori State University" },
  slug: "gori-state",
  status: "active",
};
const tsu: University = {
  _id: "sample_tsu" as University["_id"],
  name: { ka: "თბილისის სახელმწიფო უნივერსიტეტი", en: "Tbilisi State University" },
  slug: "tsu",
  status: "active",
};

const newStudent: Me = {
  _id: "sample_user" as Me["_id"],
  email: "ana@example.com",
  firstName: "Ana",
  locale: "en",
  memberships: [],
  isStaff: false,
  isSuperAdmin: false,
  honestyAccepted: false,
  student: null,
  needsOnboarding: true,
};
const student: Me = {
  ...newStudent,
  lastName: "Beridze",
  honestyAccepted: true,
  needsOnboarding: false,
  memberships: [{ role: "student", universityId: gori._id }],
  student: {
    universityId: gori._id,
    universityName: gori.name,
    faculty: "Computer Science",
    group: "CS-101",
    year: 2,
  },
};
// Private lessons: an onboarded student without a university.
const schoolStudent: Me = {
  ...student,
  email: "luka@example.com",
  firstName: "Luka",
  lastName: "Kapanadze",
  memberships: [{ role: "student" }],
  student: {},
};
const lecturer: Me = {
  ...newStudent,
  email: "nino@gsu.edu.ge",
  firstName: "Nino",
  isStaff: true,
  needsOnboarding: false,
  memberships: [{ role: "lecturer", universityId: gori._id }],
};

const fakeAvatar = (
  <span className="grid size-10 place-items-center rounded-full bg-highlighter text-sm font-semibold">AB</span>
);

function asUser(value: CurrentUser, children: ReactNode) {
  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

const gate = <StudentAccount>{() => null}</StudentAccount>;

const HOUR = 60 * 60 * 1000;
// Fixed, so the server's render and the browser's agree to the minute.
const NOW = Date.UTC(2026, 9, 5, 8, 0);
const id = <T extends string>(value: string) => value as string & { __tableName: T };
const courseId = id<"courses">("sample_course");

const myCourses: Parameters<typeof DashboardView>[0]["courses"] = [
  { _id: courseId, title: "HTML & CSS Fundamentals", lecturer: "Gio Khvichia", semester: "Fall 2026", archived: false, openCount: 2 },
  { _id: id<"courses">("sample_course_2"), title: "Basics of Web Technologies", lecturer: "Gio Khvichia", archived: false, openCount: 0 },
];
const upNext: Parameters<typeof DashboardView>[0]["upNext"] = [
  { _id: id<"assessments">("a_quiz"), kind: "quiz", title: "Week 1 Quiz: HTML Basics", courseId, courseTitle: "HTML & CSS Fundamentals", closesAt: NOW + 30 * HOUR, started: false, playable: true },
  { _id: id<"assessments">("a_task"), kind: "task", title: "Week 1 Lab: Your First HTML Document", courseId, courseTitle: "HTML & CSS Fundamentals", closesAt: NOW + 72 * HOUR, started: true, playable: true },
];
const course: ComponentProps<typeof CourseView>["course"] = {
  _id: courseId,
  title: "HTML & CSS Fundamentals",
  description: "A hands-on introduction to building web pages: HTML structure, then styling with CSS.",
  semester: "Fall 2026",
  lecturer: "Gio Khvichia",
  archived: false,
  assessments: [
    { _id: id<"assessments">("a_task"), kind: "task", title: "Week 1 Lab: Your First HTML Document", state: "open", closesAt: NOW + 72 * HOUR, totalPoints: 10, questionCount: 1, playable: true, result: { status: "in_progress" } },
    { _id: id<"assessments">("a_quiz"), kind: "quiz", title: "Week 1 Quiz: HTML Basics", state: "open", closesAt: NOW + 30 * HOUR, totalPoints: 11, questionCount: 11, playable: true, result: null },
    { _id: id<"assessments">("a_mid"), kind: "midterm", title: "Midterm", state: "upcoming", opensAt: NOW + 240 * HOUR, totalPoints: 30, questionCount: 20, playable: true, result: null },
    { _id: id<"assessments">("a_old"), kind: "quiz", title: "Warm-up quiz", state: "closed", totalPoints: 5, questionCount: 5, playable: true, result: { status: "submitted", score: 4 } },
  ],
  materials: [
    { _id: id<"materials">("m_week1"), title: "Week 1: HTML structure", description: "Slides, the starter files and this week's reading.", source: "drive", url: "https://drive.google.com/drive/folders/sample-week-1", host: "drive.google.com" },
    { _id: id<"materials">("m_week2"), title: "Week 2: Styling with CSS", source: "drive", url: "https://drive.google.com/drive/folders/sample-week-2", host: "drive.google.com" },
    { _id: id<"materials">("m_mdn"), title: "MDN: Getting started with the web", description: "Read the HTML and CSS basics before Thursday's lab.", source: "link", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started", host: "developer.mozilla.org" },
  ],
};
const task: ComponentProps<typeof TaskOnPhone>["task"] = {
  course: { _id: courseId, title: "HTML & CSS Fundamentals" },
  assessment: {
    _id: id<"assessments">("a_task"),
    title: "Week 1 Lab: Your First HTML Document",
    state: "open",
    closesAt: NOW + 72 * HOUR,
    integrityLevel: "standard",
    resultsVisibility: "score",
    totalPoints: 10,
  },
  questions: [],
  attempt: { status: "in_progress", startedAt: NOW - HOUR, autoSubmitted: false, maxScore: 10 },
  responses: [],
  hiddenChecks: [],
  comments: [],
  unsupported: 0,
};
const sampleJoin = async (code: string) =>
  code === "K7MP4Q" ? { ok: true as const, courseId } : { ok: false as const, message: "No open course has this code." };
const emptyCourse: ComponentProps<typeof CourseView>["course"] = {
  ...course,
  _id: myCourses[1]._id,
  title: myCourses[1].title,
  description: undefined,
  semester: undefined,
  assessments: [],
  materials: [],
};
const useSampleCourse: UseCourse = (id) => (id === courseId ? course : emptyCourse);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const sampleAction = async () => {
  await wait(800);
};
const myInvites: MyInvite[] = [
  { token: "sample_invite", groupName: "Frontend Club", teacher: "Nino Beridze", expiresAt: NOW + 6 * 24 * HOUR },
];
const myGroups: MyGroup[] = [
  { _id: id<"groups">("sample_group"), name: "CS-101 · Fall 2026", teacher: "Gio Khvichia", joinedAt: NOW - 20 * 24 * HOUR },
  { _id: id<"groups">("sample_group_2"), name: "Web Lab, Thursdays", teacher: "Gio Khvichia", joinedAt: NOW - 3 * 24 * HOUR },
];
const dashboardProps: ComponentProps<typeof DashboardView> = {
  me: student,
  courses: myCourses,
  upNext,
  invites: myInvites,
  groups: myGroups,
  onJoin: sampleJoin,
  onAcceptInvite: sampleAction,
  onLeaveGroup: sampleAction,
  useCourse: useSampleCourse,
};

const groupLink: JoinInvite = { groupName: "CS-101 · Fall 2026", teacher: "Gio Khvichia", courseCount: 2, alreadyMember: false };
const emailInvite: JoinInvite = { ...groupLink, email: student.email, status: "pending", expiresAt: NOW + 6 * 24 * HOUR };
/** Each join page state: the invite, who is looking, and what pressing Join does. */
const joinViews: Record<string, { kind: "link" | "email"; invite: JoinInvite | null; viewer: CurrentUser; onAccept?: () => Promise<unknown> }> = {
  "join-signed-out": { kind: "link", invite: groupLink, viewer: { status: "signed-out" } },
  "join-ready": {
    kind: "link",
    invite: groupLink,
    viewer: { status: "ready", me: student },
    onAccept: async () => {
      await wait(800);
      throw new ConvexError({ code: "CONFLICT", message: "This group is full (500 students). Ask your teacher." });
    },
  },
  "join-onboarding": { kind: "link", invite: groupLink, viewer: { status: "ready", me: newStudent } },
  "join-member": { kind: "link", invite: { ...groupLink, alreadyMember: true }, viewer: { status: "ready", me: student } },
  "join-staff": { kind: "link", invite: groupLink, viewer: { status: "ready", me: lecturer } },
  "join-dead": { kind: "link", invite: null, viewer: { status: "signed-out" } },
  "invite-signed-out": { kind: "email", invite: emailInvite, viewer: { status: "signed-out" } },
  "invite-ready": { kind: "email", invite: emailInvite, viewer: { status: "ready", me: student } },
  "invite-wrong-email": {
    kind: "email",
    invite: { ...emailInvite, email: "ana.beridze@school.edu.ge" },
    viewer: { status: "ready", me: student },
  },
  "invite-expired": { kind: "email", invite: { ...emailInvite, expiresAt: NOW - HOUR }, viewer: { status: "signed-out" } },
  "invite-used": { kind: "email", invite: { ...emailInvite, status: "accepted" }, viewer: { status: "signed-out" } },
};

/** Onboarding views: who is setting up, on which step, with which universities on Kalami. */
const onboardingViews: Record<string, { me: Me; step: number; universities: University[] }> = {
  "onboarding-1": { me: newStudent, step: 0, universities: [gori, tsu] },
  "onboarding-2": { me: newStudent, step: 1, universities: [gori, tsu] },
  "onboarding-2-no-universities": { me: newStudent, step: 1, universities: [] },
  "onboarding-3": { me: newStudent, step: 2, universities: [gori, tsu] },
  "onboarding-reaccept": { me: student, step: 1, universities: [gori, tsu] },
  "onboarding-reaccept-school": { me: schoolStudent, step: 1, universities: [gori, tsu] },
};

const inbox: Inbox = {
  unread: 2,
  emailEnabled: true,
  emailBlocked: false,
  items: [
    {
      _id: id<"notifications">("n1"),
      _creationTime: NOW - 2 * HOUR,
      kind: "due_24h",
      assessmentKind: "quiz",
      title: "Week 1 Quiz: HTML Basics",
      courseTitle: "HTML & CSS Fundamentals",
      courseId,
      dueAt: NOW + 22 * HOUR,
      href: "/quizzes/a_quiz",
      read: false,
    },
    {
      _id: id<"notifications">("n2"),
      _creationTime: NOW - 26 * HOUR,
      kind: "published",
      assessmentKind: "task",
      title: "Week 1 Lab: Your First HTML Document",
      courseTitle: "HTML & CSS Fundamentals",
      courseId,
      dueAt: NOW + 72 * HOUR,
      href: "/tasks/a_task",
      read: false,
    },
    {
      _id: id<"notifications">("n3"),
      _creationTime: NOW - 4 * 24 * HOUR,
      kind: "published",
      assessmentKind: "quiz",
      title: "Warm-up quiz",
      courseTitle: "HTML & CSS Fundamentals",
      courseId,
      href: "/quizzes/a_old",
      read: true,
    },
  ],
};

function studentPage(children: ReactNode, { bellOpen = false, empty = false } = {}) {
  return (
    <>
      <PillHeader
        homeHref="/dashboard"
        links={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/honesty", label: "Honesty" },
        ]}
        actions={
          <>
            <Bell
              inbox={empty ? { unread: 0, items: [], emailEnabled: true, emailBlocked: false } : inbox}
              onMarkAllRead={() => undefined}
              onSetEmail={() => undefined}
              defaultOpen={bellOpen}
              now={NOW}
            />
            {fakeAvatar}
          </>
        }
      />
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-3 pb-10 pt-5 sm:px-6">{children}</main>
    </>
  );
}

const views: Record<string, string> = {
  "onboarding-1": "Onboarding · step 1",
  "onboarding-2": "Onboarding · step 2 (university or not)",
  "onboarding-2-no-universities": "Onboarding · step 2, no universities on Kalami",
  "onboarding-3": "Onboarding · step 3",
  "onboarding-reaccept": "Onboarding · re-accepting a new notice",
  "onboarding-reaccept-school": "Onboarding · re-accepting, not at a university",
  dashboard: "Dashboard · with an invite and groups",
  "dashboard-empty": "Dashboard · no courses yet",
  "dashboard-invite": "Dashboard · new student without a university, one invite",
  notifications: "Dashboard · notifications open",
  course: "Course · with materials",
  "course-empty": "Course · nothing published yet",
  "join-signed-out": "Join link · signed out",
  "join-ready": "Join link · ready to join (pressing Join shows a sample error)",
  "join-onboarding": "Join link · signed in, setup not finished",
  "join-member": "Join link · already in the group",
  "join-staff": "Join link · staff account",
  "join-dead": "Join link · dead link",
  "invite-signed-out": "Email invite · signed out",
  "invite-ready": "Email invite · ready to accept",
  "invite-wrong-email": "Email invite · signed in with another address",
  "invite-expired": "Email invite · expired",
  "invite-used": "Email invite · already accepted",
  "task-phone": "Code task opened on a phone",
  "gate-staff": "Gate · staff account",
  "gate-signed-out": "Gate · signed out",
  "gate-error": "Gate · error",
  loading: "Loading",
};

export function StudentGallery({ view, notice }: { view?: string; notice: HonestyNotice }) {

  if (!view || !(view in views)) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-medium tracking-tight">Screen gallery</h1>
        <p className="mt-2 text-graphite">Sample data, development only.</p>
        <ul className="mt-8 space-y-2">
          {Object.entries(views).map(([key, label]) => (
            <li key={key}>
              <Link href={`/dev/ui?view=${key}`} className="underline underline-offset-4">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  const onboarding = onboardingViews[view];
  if (onboarding) {
    return (
      <OnboardingWizard
        me={onboarding.me}
        universities={onboarding.universities}
        notice={notice}
        initialStep={onboarding.step}
        onSubmit={sampleAction}
        header={<PillHeader homeHref="/" actions={fakeAvatar} />}
      />
    );
  }

  const join = joinViews[view];
  if (join) {
    return (
      <JoinView
        kind={join.kind}
        invite={join.invite}
        viewer={join.viewer}
        path={join.kind === "email" ? "/join/invite/sample_token" : "/join/sample_code"}
        now={NOW}
        onAccept={join.onAccept ?? sampleAction}
        doneHref="/dev/ui?view=dashboard"
        header={<PillHeader homeHref="/" actions={join.viewer.status === "ready" ? fakeAvatar : undefined} />}
      />
    );
  }

  switch (view) {
    case "dashboard":
      return studentPage(<DashboardView {...dashboardProps} />);
    case "dashboard-empty":
      return studentPage(<DashboardView {...dashboardProps} courses={[]} upNext={[]} invites={[]} groups={[]} />, {
        empty: true,
      });
    case "dashboard-invite":
      return studentPage(
        <DashboardView {...dashboardProps} me={schoolStudent} courses={[]} upNext={[]} groups={[]} />,
        { empty: true },
      );
    case "notifications":
      return studentPage(<DashboardView {...dashboardProps} invites={[]} />, { bellOpen: true });
    case "course":
      return studentPage(<CourseView course={course} />);
    case "course-empty":
      return studentPage(<CourseView course={emptyCourse} />);
    case "task-phone":
      return studentPage(<TaskOnPhone task={task} />);
    case "gate-staff":
      return asUser({ status: "ready", me: lecturer }, gate);
    case "gate-signed-out":
      return asUser({ status: "signed-out" }, gate);
    case "gate-error":
      return asUser({ status: "error", message: "The Kalami backend didn't accept the session." }, gate);
    default:
      return <LoadingScreen />;
  }
}
