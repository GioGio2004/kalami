"use client";

import { ConvexError } from "convex/values";
import Link from "next/link";
import { useState, type ComponentProps, type ReactNode } from "react";
import { AssistantView } from "@/components/assistant/AssistantView";
import { Composer, type StartArgs } from "@/components/contact/Composer";
import { ContactCard, ContactComposerProvider, type ComposerHostProps } from "@/components/contact/ContactCard";
import { CourseView } from "@/components/courses/CourseView";
import { CurrentUserContext, type CurrentUser, type Me } from "@/components/CurrentUserProvider";
import type { UseCourse } from "@/components/dashboard/CourseCard";
import { DashboardView, type MyGroup, type MyInvite } from "@/components/dashboard/DashboardView";
import { JoinView, type JoinInvite } from "@/components/join/JoinView";
import { LessonNotFound, LessonView } from "@/components/lessons-reader/LessonView";
import type { Conversation, Thread } from "@/components/messages/labels";
import { MessagesView } from "@/components/messages/MessagesView";
import { ThreadView } from "@/components/messages/ThreadView";
import { Bell } from "@/components/notifications/NotificationBell";
import type { Inbox } from "@/components/notifications/NotificationsPanel";
import { InstallCardView } from "@/components/pwa/InstallCard";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { PushSettingView } from "@/components/pwa/PushSetting";
import type { PushState } from "@/components/pwa/usePush";
import { TaskOnPhone } from "@/components/tasks/TaskOnPhone";
import {
  OnboardingWizard,
  type HonestyNotice,
  type University,
} from "@/components/onboarding/OnboardingWizard";
import { StudentAccount } from "@/components/StudentAccount";
import { StudentNav } from "@/components/StudentNav";
import { Button } from "@/components/ui/buttons";
import { PillHeader } from "@/components/ui/PillHeader";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { buildDraft, type ContactOptions } from "@/lib/contact";
import { SAMPLE_DECK } from "@/components/presentations/samples";
import { PresentationView } from "@/components/presentations-reader/PresentationView";
import { sampleLastLesson, sampleLesson } from "./sampleLessons";

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
const weekId1 = id<"weeks">("w_1");
const weekId2 = id<"weeks">("w_2");
const weekId3 = id<"weeks">("w_3");
const lessonId = (value: string) => id<"lessons">(value);
const course: ComponentProps<typeof CourseView>["course"] = {
  _id: courseId,
  title: "HTML & CSS Fundamentals",
  description: "A hands-on introduction to building web pages: HTML structure, then styling with CSS.",
  semester: "Fall 2026",
  lecturer: "Gio Khvichia",
  archived: false,
  weeks: [
    {
      _id: weekId1,
      title: "Week 1 · HTML structure",
      description: "How a web page is put together, and your first page from scratch.",
      lessons: [
        { _id: lessonId("l_what_html"), title: "What HTML is for" },
        { _id: lessonId("l_first_page"), title: "Your first page" },
      ],
      presentations: [{ _id: id<"presentations">("p_web"), title: "How the web works", theme: "ink", slideCount: 15 }],
      driveUrl: "https://drive.google.com/drive/folders/sample-week-1",
      links: [
        { id: "k1", title: "MDN: Getting started with the web", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started", host: "developer.mozilla.org" },
      ],
    },
    {
      _id: weekId2,
      title: "Week 2 · Styling with CSS",
      lessons: [
        { _id: lessonId("l_selectors"), title: "Selectors and properties" },
        { _id: lessonId("l_colours"), title: "Colours and fonts" },
      ],
      presentations: [],
      driveUrl: "https://drive.google.com/drive/folders/sample-week-2",
      links: [],
    },
    {
      _id: weekId3,
      title: "Week 3 · The box model",
      description: "Every element is a box. This week you'll size and space them on purpose.",
      lessons: [
        { _id: lessonId("l_box_model"), title: "The CSS box model" },
        { _id: lessonId("l_margins"), title: "Margins that collapse" },
      ],
      presentations: [
        { _id: id<"presentations">("p_box"), title: "Boxes all the way down", theme: "aurora", slideCount: 9 },
        { _id: id<"presentations">("p_margin"), title: "Margins, visually", theme: "chalk", slideCount: 6 },
      ],
      driveUrl: "https://drive.google.com/drive/folders/sample-week-3",
      links: [
        { id: "k2", title: "MDN: The box model", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model", host: "developer.mozilla.org" },
        { id: "k3", title: "web.dev Learn CSS: Box model", url: "https://web.dev/learn/css/box-model", host: "web.dev" },
      ],
    },
  ],
  assessments: [
    { _id: id<"assessments">("a_old"), kind: "quiz", title: "Warm-up quiz", state: "closed", totalPoints: 5, questionCount: 5, playable: true, result: { status: "submitted", score: 4 }, weekId: weekId1 },
    { _id: id<"assessments">("a_task"), kind: "task", title: "Week 1 Lab: Your First HTML Document", state: "open", closesAt: NOW + 72 * HOUR, totalPoints: 10, questionCount: 1, playable: true, result: { status: "in_progress" }, weekId: weekId1 },
    { _id: id<"assessments">("a_quiz"), kind: "quiz", title: "Week 1 Quiz: HTML Basics", state: "open", closesAt: NOW + 30 * HOUR, totalPoints: 11, questionCount: 11, playable: true, result: null, weekId: weekId1 },
    { _id: id<"assessments">("a_w3_quiz"), kind: "quiz", title: "Week 3 Quiz: The box model", state: "upcoming", opensAt: NOW + 50 * HOUR, totalPoints: 8, questionCount: 8, playable: true, result: null, weekId: weekId3 },
    { _id: id<"assessments">("a_mid"), kind: "midterm", title: "Midterm", state: "upcoming", opensAt: NOW + 240 * HOUR, totalPoints: 30, questionCount: 20, playable: true, result: null },
    { _id: id<"assessments">("a_final"), kind: "final", title: "Final exam", state: "upcoming", opensAt: NOW + 1200 * HOUR, totalPoints: 40, questionCount: 30, playable: true, result: null },
    { _id: id<"assessments">("a_bonus"), kind: "task", title: "Bonus: Build your own homepage", state: "open", closesAt: NOW + 400 * HOUR, totalPoints: 5, questionCount: 1, playable: true, result: null },
  ],
  // Legacy flat list; the course page reads weeks now.
  materials: [],
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
  weeks: [],
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
  unread: 3,
  emailEnabled: true,
  emailBlocked: false,
  items: [
    {
      _id: id<"notifications">("n0"),
      _creationTime: NOW - 20 * 60 * 1000,
      kind: "announcement",
      title: "Library closed on Friday",
      courseTitle: "Gori State University",
      body: "The main library is closed this Friday for maintenance. The reading rooms on the second floor stay open until 18:00.",
      href: "/dashboard",
      read: false,
    },
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

function studentPage(
  children: ReactNode,
  { bellOpen = false, empty = false, push = "on" as PushState }: { bellOpen?: boolean; empty?: boolean; push?: PushState } = {},
) {
  return (
    // Every contact card in the gallery opens the sample composer instead of the Convex one.
    <ContactComposerProvider render={renderSampleComposer}>
      <OfflineBanner />
      <StudentNav
        unread={empty ? 0 : conversations.filter((item) => item.unread).length}
        actions={
          <>
            <Bell
              inbox={empty ? { unread: 0, items: [], emailEnabled: true, emailBlocked: false } : inbox}
              onMarkAllRead={() => undefined}
              onSetEmail={() => undefined}
              push={
                <PushSettingView
                  state={push}
                  error={null}
                  tested={push === "on" ? "Sent to 2 devices. It should arrive in a moment." : null}
                  onEnable={() => undefined}
                  onDisable={() => undefined}
                  onTest={() => undefined}
                />
              }
              defaultOpen={bellOpen}
              now={NOW}
            />
            {fakeAvatar}
          </>
        }
      />
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-3 pb-10 pt-5 sm:px-6">{children}</main>
    </ContactComposerProvider>
  );
}

// --- Contact card and messages ------------------------------------------------------------

const gio = { userId: id<"users">("sample_gio"), name: "Gio Khvichia", via: ["HTML & CSS Fundamentals"] };
const nino = { userId: id<"users">("sample_nino"), name: "Nino Beridze", via: ["Web Lab, Thursdays"] };
const week1 = course.weeks[0];
const sampleCourse = { _id: courseId, title: course.title, locale: "en" as const };
const sampleStudent = { name: "Ana Beridze", email: student.email, locale: "en" as const };
const weekContext = (week: (typeof course.weeks)[number]) => ({ _id: week._id, title: week.title, url: week.driveUrl });

/** Opened from "Can't open something?" on Week 1: the course's lecturer, and the week attached. */
const weekOptions: ContactOptions = {
  student: sampleStudent,
  lecturers: [gio],
  adminAvailable: true,
  context: { course: sampleCourse, week: weekContext(week1) },
};
/** Opened from the dashboard: every lecturer across the student's courses and groups. */
const generalOptions: ContactOptions = {
  student: sampleStudent,
  lecturers: [{ ...gio, via: ["HTML & CSS Fundamentals", "CS-101 · Fall 2026"] }, nino],
  adminAvailable: true,
  context: {},
};

/** What the server would send for a card's ids. */
function sampleOptionsFor({ courseId: forCourse, weekId, assessmentId }: ComposerHostProps["target"]): ContactOptions {
  if (forCourse === undefined) return generalOptions;
  const week = course.weeks.find((item) => item._id === weekId);
  const assessment = course.assessments.find((item) => item._id === assessmentId);
  return {
    ...weekOptions,
    context: {
      course: sampleCourse,
      ...(week ? { week: weekContext(week) } : {}),
      ...(assessment ? { assessment: { _id: assessment._id, title: assessment.title, kind: assessment.kind } } : {}),
    },
  };
}

const sampleSend = async (args: StartArgs) => {
  await wait(900);
  return args.topic === "app_problem" ? "sample_conversation_2" : "sample_conversation";
};

function SampleComposer({ open, onClose, lang, target }: ComposerHostProps) {
  return (
    <Composer
      open={open}
      onClose={onClose}
      lang={lang}
      options={sampleOptionsFor(target)}
      recent={conversations}
      initialTopic={target.initialTopic}
      onSend={sampleSend}
      now={NOW}
    />
  );
}
const renderSampleComposer = (props: ComposerHostProps) => <SampleComposer {...props} />;

/** A composer that starts open over the page; closing it leaves the page (whose cards open it again). */
function OpenComposer(props: Omit<ComponentProps<typeof Composer>, "open" | "onClose" | "onSend" | "now" | "lang">) {
  const [open, setOpen] = useState(true);
  return (
    <>
      {!open && (
        <div className="mb-3 flex justify-end">
          <Button variant="lime" size="sm" onClick={() => setOpen(true)}>
            Open the composer again
          </Button>
        </div>
      )}
      <Composer {...props} lang="en" open={open} onClose={() => setOpen(false)} onSend={sampleSend} now={NOW} />
    </>
  );
}

const weekAnswer = { what: "It says “You need access” and offers to request it." };
const firstDraft = buildDraft({
  lang: "en",
  topic: "materials_access",
  customTopic: "",
  recipient: "lecturer",
  recipientName: gio.name,
  studentName: sampleStudent.name,
  context: weekOptions.context,
  answers: weekAnswer,
});

const conversations: Conversation[] = [
  {
    _id: id<"conversations">("sample_conversation"),
    recipient: "lecturer",
    recipientName: gio.name,
    topic: "materials_access",
    subject: firstDraft.subject,
    status: "answered",
    lastMessageAt: NOW - 2 * HOUR,
    lastMessageFrom: "staff",
    messageCount: 3,
    unread: true,
    courseId,
    courseTitle: course.title,
  },
  {
    _id: id<"conversations">("sample_conversation_2"),
    recipient: "admin",
    recipientName: "Kalami team",
    topic: "app_problem",
    subject: "Problem in Kalami",
    status: "open",
    lastMessageAt: NOW - 26 * HOUR,
    lastMessageFrom: "student",
    messageCount: 1,
    unread: false,
  },
  {
    _id: id<"conversations">("sample_conversation_3"),
    recipient: "lecturer",
    recipientName: gio.name,
    topic: "other",
    customTopic: "Lab partner for week 3",
    subject: "Lab partner for week 3",
    status: "resolved",
    lastMessageAt: NOW - 9 * 24 * HOUR,
    lastMessageFrom: "student",
    messageCount: 2,
    unread: false,
    courseId,
    courseTitle: course.title,
  },
];

const thread: Thread = {
  _id: conversations[0]._id,
  viewer: "student",
  recipient: "lecturer",
  recipientName: gio.name,
  studentName: sampleStudent.name,
  topic: "materials_access",
  subject: firstDraft.subject,
  status: "answered",
  context: weekOptions.context,
  truncated: false,
  messages: [
    {
      _id: id<"conversationMessages">("sample_message_1"),
      _creationTime: NOW - 5 * HOUR,
      from: "student",
      senderName: sampleStudent.name,
      mine: true,
      body: firstDraft.body,
      emailed: true,
    },
    {
      _id: id<"conversationMessages">("sample_message_2"),
      _creationTime: NOW - 3 * HOUR,
      from: "staff",
      senderName: gio.name,
      mine: false,
      body: "Thanks for telling me, Ana. Checking it now.",
      emailed: true,
    },
    {
      _id: id<"conversationMessages">("sample_message_3"),
      _creationTime: NOW - 2 * HOUR,
      from: "staff",
      senderName: gio.name,
      mine: false,
      body: "The folder was still private, sorry about that. It's shared now:\nhttps://drive.google.com/drive/folders/sample-week-1\n\nTry again and tell me if it still doesn't open.",
      emailed: true,
    },
  ],
};
const resolvedThread: Thread = {
  ...thread,
  status: "resolved",
  messages: [
    ...thread.messages,
    {
      _id: id<"conversationMessages">("sample_message_4"),
      _creationTime: NOW - HOUR,
      from: "student",
      senderName: sampleStudent.name,
      mine: true,
      body: "It opens now. Thank you!",
      emailed: true,
    },
  ],
};

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
  notifications: "Dashboard · notifications open (push on for this device)",
  "notifications-push-off": "Dashboard · notifications open, push off",
  "notifications-push-iphone": "Dashboard · notifications open on an iPhone in Safari (install first)",
  "notifications-push-blocked": "Dashboard · notifications open, push blocked in the browser",
  "notifications-push-insecure": "Dashboard · notifications open over plain http (phone on the LAN)",
  "pwa-install": "Dashboard · install card (Android / desktop Chrome)",
  "pwa-install-ios": "Dashboard · install card (iPhone: Add to Home Screen guide)",
  course: "Course · three weeks with lessons and materials, exams, other work",
  "course-empty": "Course · nothing published yet",
  lesson: "Lesson · every block type, with previous and next",
  presentation: "Presentation · every slide type (Ink)",
  "presentation-aurora": "Presentation · every slide type (Aurora)",
  "presentation-paper": "Presentation · every slide type (Paper)",
  "lesson-last": "Lesson · the latest one (no next lesson)",
  "lesson-not-found": "Lesson · not available",
  assistant: "AI assistant · connect your own assistant to Kalami",
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
  "contact-card": "Contact · the card and the compact triggers (en and ka)",
  "contact-composer": "Contact · composer: lecturer, can't open Week 1 (an earlier message on it)",
  "contact-composer-admin": "Contact · composer: something in Kalami isn't working (Kalami team suggested)",
  "contact-sent": "Contact · message sent",
  messages: "Messages · list",
  "messages-empty": "Messages · nothing yet",
  thread: "Messages · a conversation with replies",
  "thread-resolved": "Messages · a resolved conversation",
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
    case "notifications-push-off":
      return studentPage(<DashboardView {...dashboardProps} invites={[]} />, { bellOpen: true, push: "off" });
    case "notifications-push-iphone":
      return studentPage(<DashboardView {...dashboardProps} invites={[]} />, { bellOpen: true, push: "needs-install" });
    case "notifications-push-blocked":
      return studentPage(<DashboardView {...dashboardProps} invites={[]} />, { bellOpen: true, push: "blocked" });
    case "notifications-push-insecure":
      return studentPage(<DashboardView {...dashboardProps} invites={[]} />, { bellOpen: true, push: "insecure" });
    case "pwa-install":
      return studentPage(
        <DashboardView {...dashboardProps} invites={[]} install={<InstallCardView platform="chrome" onInstall={() => undefined} onDismiss={() => undefined} />} />,
      );
    case "pwa-install-ios":
      return studentPage(
        <DashboardView {...dashboardProps} invites={[]} install={<InstallCardView platform="ios" onDismiss={() => undefined} />} />,
      );
    case "course":
      return studentPage(<CourseView course={course} />);
    case "course-empty":
      return studentPage(<CourseView course={emptyCourse} />);
    case "lesson":
      return studentPage(<LessonView lesson={sampleLesson} />);
    case "presentation":
    case "presentation-aurora":
    case "presentation-paper":
      return studentPage(
        <PresentationView
          presentation={{
            _id: id<"presentations">("p_web"),
            title: "How the web works",
            theme: view === "presentation" ? "ink" : view === "presentation-aurora" ? "aurora" : "paper",
            slides: SAMPLE_DECK.slides,
            course: { _id: courseId, title: "HTML & CSS Fundamentals" },
            week: { _id: weekId1, title: "Week 1 · HTML structure" },
          }}
        />,
      );
    case "lesson-last":
      return studentPage(<LessonView lesson={sampleLastLesson} />);
    case "lesson-not-found":
      return studentPage(<LessonNotFound courseHref="/dev/ui?view=course" />);
    case "assistant":
      return studentPage(<AssistantView origin="https://app.kalami.space" />);
    case "task-phone":
      return studentPage(<TaskOnPhone task={task} />);
    case "contact-card":
      return studentPage(<ContactCardSamples />);
    case "contact-composer":
      return studentPage(
        <>
          <OpenComposer
            options={weekOptions}
            recent={conversations}
            initialTopic="materials_access"
            initialRecipient={{ recipient: "lecturer", lecturerId: gio.userId }}
            initialAnswers={weekAnswer}
          />
          <CourseView course={course} />
        </>,
      );
    case "contact-composer-admin":
      return studentPage(
        <>
          <OpenComposer
            options={generalOptions}
            initialTopic="app_problem"
            initialAnswers={{ what: "The quiz froze after question 3, and the timer kept running." }}
          />
          <DashboardView {...dashboardProps} invites={[]} />
        </>,
      );
    case "contact-sent":
      return studentPage(
        <>
          <OpenComposer
            options={weekOptions}
            initialTopic="materials_access"
            initialSent={{ conversationId: "sample_conversation", recipientName: gio.name }}
          />
          <CourseView course={course} />
        </>,
      );
    case "messages":
      return studentPage(<MessagesView conversations={conversations} now={NOW} />);
    case "messages-empty":
      return studentPage(<MessagesView conversations={[]} now={NOW} />, { empty: true });
    case "thread":
      return studentPage(<ThreadView thread={thread} onReply={sampleAction} onResolve={sampleAction} />);
    case "thread-resolved":
      return studentPage(<ThreadView thread={resolvedThread} onReply={sampleAction} onResolve={sampleAction} />);
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

/** The full card in both languages, and the compact triggers as they appear in rows and result screens. */
function ContactCardSamples() {
  const quiz = course.assessments[1];
  return (
    <div className="rounded-[2.25rem] bg-panel px-3 pb-3 pt-8 sm:rounded-[2.75rem] sm:px-10 sm:pb-8 sm:pt-10">
      <p className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-graphite sm:px-1">The card</p>
      <div className="mt-3 grid gap-3 *:min-w-0 lg:grid-cols-2">
        <ContactCard lang="en" />
        <ContactCard lang="ka" />
      </div>
      <p className="mt-8 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-graphite sm:px-1">Compact triggers</p>
      <div className="mt-3 grid justify-items-start gap-3 rounded-[1.6rem] bg-card p-5 sm:rounded-[2rem] sm:p-6">
        <ContactCard
          variant="compact"
          lang="en"
          label={{ en: "Can't open something?", ka: "რამე არ იხსნება?" }}
          courseId={courseId}
          weekId={week1._id}
          initialTopic="materials_access"
        />
        <ContactCard
          variant="compact"
          lang="en"
          label={{ en: "Question about this?", ka: "კითხვა გაქვს ამაზე?" }}
          courseId={courseId}
          assessmentId={quiz._id}
          initialTopic="grade"
        />
        <ContactCard variant="compact" lang="en" label={{ en: "Keeps happening?", ka: "ისევ ასე ხდება?" }} initialTopic="app_problem" />
        <ContactCard
          variant="compact"
          lang="ka"
          label={{ en: "Can't open something?", ka: "რამე არ იხსნება?" }}
          courseId={courseId}
          weekId={week1._id}
          initialTopic="materials_access"
        />
      </div>
    </div>
  );
}
