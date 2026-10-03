"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CurrentUserContext, type CurrentUser, type Me } from "@/components/CurrentUserProvider";
import { DashboardView } from "@/components/dashboard/DashboardView";
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

const views: Record<string, string> = {
  "onboarding-1": "Onboarding · step 1",
  "onboarding-2": "Onboarding · step 2",
  "onboarding-3": "Onboarding · step 3",
  "onboarding-reaccept": "Onboarding · re-accepting a new notice",
  dashboard: "Dashboard",
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
      return (
        <>
          <PillHeader homeHref="/dashboard" links={[{ href: "/dashboard", label: "Dashboard" }]} actions={fakeAvatar} />
          <main className="mx-auto w-full max-w-[88rem] flex-1 px-3 pb-10 pt-5 sm:px-6">
            <DashboardView me={student} />
          </main>
        </>
      );
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
