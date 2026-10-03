"use client";

import type { ReactNode } from "react";
import { Redirect } from "@/components/Redirect";
import { StudentAccount } from "@/components/StudentAccount";

/** Student pages: onboarded students only; everyone else goes to /onboarding first. */
export function StudentGate({ children }: { children: ReactNode }) {
  return (
    <StudentAccount>
      {(me) => (me.needsOnboarding ? <Redirect to="/onboarding" /> : children)}
    </StudentAccount>
  );
}
