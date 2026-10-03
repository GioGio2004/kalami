"use client";

import { OnboardingForm } from "@/components/OnboardingForm";
import { Redirect } from "@/components/Redirect";
import { StudentAccount } from "@/components/StudentAccount";

export default function OnboardingPage() {
  return (
    <StudentAccount>
      {(me) => (me.needsOnboarding ? <OnboardingForm me={me} /> : <Redirect to="/dashboard" />)}
    </StudentAccount>
  );
}
