"use client";

import { useCurrentUser } from "@/components/CurrentUserProvider";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default function DashboardPage() {
  const current = useCurrentUser();
  // StudentGate only renders this page for onboarded students.
  if (current.status !== "ready") {
    return null;
  }
  return <DashboardView me={current.me} />;
}
