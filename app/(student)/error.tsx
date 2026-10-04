"use client";

import { useEffect } from "react";
import { ContactCard } from "@/components/contact/ContactCard";
import { Button, ButtonLink } from "@/components/ui/buttons";
import { errorMessage } from "@/lib/errors";

const KEEPS_HAPPENING = { en: "Keeps happening?", ka: "ისევ ასე ხდება?" };

/** Catches thrown queries and failed renders on student pages; the header stays put. */
export default function StudentError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-[2.75rem] bg-panel px-6 py-14 sm:px-12">
      <p className="-rotate-2 font-hand text-[1.8rem] leading-none text-graphite">Hmm</p>
      <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">That page didn’t open</h1>
      <p className="mt-4 max-w-md text-lg text-graphite">{errorMessage(error)}</p>
      <p className="mt-2 max-w-md text-[15px] text-graphite">
        It might be a hiccup. Try again, or head back to your dashboard.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <ButtonLink href="/dashboard" variant="outline">
          Back to my dashboard
        </ButtonLink>
      </div>
      <ContactCard variant="compact" label={KEEPS_HAPPENING} initialTopic="app_problem" className="mt-6" />
    </div>
  );
}
