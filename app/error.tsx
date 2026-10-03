"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/buttons";
import { StatusScreen } from "@/components/ui/StatusScreen";
import { errorMessage } from "@/lib/errors";

/** Last stop for failed renders outside the student pages (landing, onboarding, sign-in). */
export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen note="Hmm, that didn't work" title="This page didn’t open">
      <p>{errorMessage(error)}</p>
      <p>Try again in a moment. If it keeps happening, start over from the home page.</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Go home
        </ButtonLink>
      </div>
    </StatusScreen>
  );
}
