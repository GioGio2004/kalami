"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { CourseView } from "@/components/courses/CourseView";
import { CurrentUserContext, type CurrentUser, type Me } from "@/components/CurrentUserProvider";
import type { UseCourse } from "@/components/dashboard/CourseCard";
import { DashboardView } from "@/components/dashboard/DashboardView";
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
};
const useSampleCourse: UseCourse = (id) => (id === courseId ? course : emptyCourse);

const inbox: Inbox = {
  unread: 2,
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
            <Bell inbox={empty ? { unread: 0, items: [] } : inbox} onMarkAllRead={() => undefined} defaultOpen={bellOpen} now={NOW} />
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
  "onboarding-2": "Onboarding · step 2",
  "onboarding-3": "Onboarding · step 3",
  "onboarding-reaccept": "Onboarding · re-accepting a new notice",
  dashboard: "Dashboard",
  "dashboard-empty": "Dashboard · no courses yet",
  notifications: "Dashboard · notifications open",
  course: "Course",
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

  if (view.startsWith("onboarding")) {
    const reaccept = view === "onboarding-reaccept";
    return (
      <OnboardingWizard
        me={reaccept ? student : newStudent}
        universities={[gori, tsu]}
        notice={notice}
        initialStep={reaccept ? 1 : Number(view.slice(-1)) - 1}
        onSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }}
        header={<PillHeader homeHref="/" actions={fakeAvatar} />}
      />
    );
  }

  switch (view) {
    case "dashboard":
      return studentPage(
        <DashboardView me={student} courses={myCourses} upNext={upNext} onJoin={sampleJoin} useCourse={useSampleCourse} />,
      );
    case "dashboard-empty":
      return studentPage(
        <DashboardView me={student} courses={[]} upNext={[]} onJoin={sampleJoin} useCourse={useSampleCourse} />,
        { empty: true },
      );
    case "notifications":
      return studentPage(
        <DashboardView me={student} courses={myCourses} upNext={upNext} onJoin={sampleJoin} useCourse={useSampleCourse} />,
        { bellOpen: true },
      );
    case "course":
      return studentPage(<CourseView course={course} />);
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
