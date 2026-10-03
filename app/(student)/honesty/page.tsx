"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { useCurrentUser, type Me } from "@/components/CurrentUserProvider";
import { HonestyNoticeArticle } from "@/components/HonestyNoticeArticle";
import { Enter } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/buttons";
import { Segmented } from "@/components/ui/form";
import { ArrowLeft } from "@/components/ui/icons";
import { WritingDots } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";

const LANGUAGES = [
  { value: "ka", label: "ქართული" },
  { value: "en", label: "English" },
] as const;

/** The honesty notice the student accepted, to re-read any time. */
export default function HonestyPage() {
  const current = useCurrentUser();
  const notice = useQuery(api.honesty.current, {});
  const [locale, setLocale] = useState<Me["locale"] | null>(null);
  const shown = locale ?? (current.status === "ready" ? current.me.locale : "en");

  return (
    <Enter kind="scale" className="rounded-[2.75rem] bg-panel px-4 pb-4 pt-10 sm:px-10 sm:pb-8 sm:pt-14 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="-rotate-2 font-hand text-[1.8rem] leading-none text-graphite">You accepted this</p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Honesty notice</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-graphite">
          What Kalami measures during tasks and exams, and what it never does. Come back to it any
          time.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <ButtonLink href="/dashboard" variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Dashboard
          </ButtonLink>
          <Segmented
            label="Notice language"
            value={shown}
            options={LANGUAGES}
            onChange={setLocale}
          />
        </div>
        <div className="mt-8">
          {notice === undefined ? (
            <div className="flex justify-center py-16">
              <WritingDots label="Loading the notice" />
            </div>
          ) : (
            <HonestyNoticeArticle text={notice[shown]} />
          )}
        </div>
      </div>
    </Enter>
  );
}
