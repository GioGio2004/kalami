"use client";

import { SignOutButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { useCurrentUser, type Me } from "@/components/CurrentUserProvider";
import { ButtonLink, buttonClass } from "@/components/ui/buttons";
import { LoadingScreen, StatusScreen } from "@/components/ui/StatusScreen";
import { STAFF_APP_URL } from "@/lib/urls";

/**
 * Renders `children` for signed-in student accounts and keeps staff accounts out.
 * This is the fence, not the lock: Convex re-checks the role in every function.
 */
export function StudentAccount({ children }: { children: (me: Me) => ReactNode }) {
  const current = useCurrentUser();

  switch (current.status) {
    case "loading":
      return <LoadingScreen />;
    case "error":
      return (
        <StatusScreen note="Hmm, that didn't work" title="Something went wrong">
          <p>{current.message}</p>
        </StatusScreen>
      );
    case "signed-out":
      return (
        <StatusScreen note="Nice to see you" title="Sign in to open your notebook">
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/sign-in">Sign in</ButtonLink>
            <ButtonLink href="/sign-up" variant="outline">
              Create an account
            </ButtonLink>
          </div>
        </StatusScreen>
      );
    case "ready":
      // Staff stay out; the super admin is exempt from the student/staff split.
      if (!current.me.isStaff || current.me.isSuperAdmin) {
        return <>{children(current.me)}</>;
      }
      return (
        <StatusScreen note="Wrong door" title="This is a staff account">
          <p>
            You&apos;re signed in as <strong className="text-ink">{current.me.email}</strong>, a
            lecturer or admin account. The student notebook is for students only.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={STAFF_APP_URL} className={buttonClass("ink")}>
              Open Kalami AntiCheat
            </a>
            <SignOutButton>
              <button className={buttonClass("outline")}>Sign out</button>
            </SignOutButton>
          </div>
        </StatusScreen>
      );
  }
}
