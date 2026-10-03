"use client";

import { UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import type { Me } from "@/components/CurrentUserProvider";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { PillHeader } from "@/components/ui/PillHeader";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";

export function OnboardingForm({ me }: { me: Me }) {
  const universities = useQuery(api.universities.listActive, {});
  const notice = useQuery(api.honesty.current, {});
  const completeOnboarding = useMutation(api.users.completeStudentOnboarding);

  if (universities === undefined || notice === undefined) {
    return <LoadingScreen />;
  }
  return (
    <OnboardingWizard
      me={me}
      universities={universities}
      notice={notice}
      onSubmit={async (values) => {
        await completeOnboarding(values);
      }}
      header={<PillHeader homeHref="/" actions={<UserButton />} />}
    />
  );
}
