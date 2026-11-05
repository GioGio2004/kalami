import { ConvexError } from "convex/values";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/buttons";
import { ArrowLeft } from "@/components/ui/icons";
import { errorCode } from "@/lib/errors";

/**
 * Whether a query error means "this isn't for you (any more)": unpublished,
 * archived, a course the student left, or a malformed link (a plain Error from
 * argument validation). Pages show NotAvailable for these instead of crashing.
 */
export function isUnavailable(error: Error): boolean {
  return errorCode(error) === "NOT_FOUND" || !(error instanceof ConvexError);
}

/** A calm full-width card for work that can't be opened, with the way back. */
export function NotAvailable({
  title,
  children,
  backHref = "/dashboard",
  backLabel = "My dashboard",
  note = "Hmm",
}: {
  title: string;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  note?: string;
}) {
  return (
    <div className="rounded-[2.25rem] bg-panel px-6 py-14 sm:rounded-[2.75rem] sm:px-12">
      <p className="-rotate-2 font-hand text-[1.8rem] leading-none text-graphite">{note}</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">{title}</h1>
      <div className="mt-4 max-w-md text-[15px] leading-relaxed text-graphite">{children}</div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={backHref} className="max-sm:w-full">
          <ArrowLeft className="size-4" />
          {backLabel}
        </ButtonLink>
        {backHref !== "/dashboard" && (
          <ButtonLink href="/dashboard" variant="ghost" className="max-sm:w-full">
            My dashboard
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
