"use client";

import { useMutation, useQuery_experimental as useQueryState } from "convex/react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { api } from "@/convex-api/api";
import type { Lang } from "@/lib/contact";
import { errorMessage } from "@/lib/errors";
import { Composer, type ContactTarget } from "./Composer";

export type ComposerHostProps = {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  target: ContactTarget;
};

/**
 * The composer wired to Convex. Mounted when a card is first opened, so a card
 * that's never tapped costs nothing; opening it only reads (nothing is created
 * until Send). Errors come back as values, so a failed load shows a calm note
 * inside the dialog instead of taking over the page.
 */
export function ConnectedComposer({ open, onClose, lang, target }: ComposerHostProps) {
  const current = useCurrentUser();
  const ready = current.status === "ready" && !current.me.needsOnboarding;
  const { courseId, materialId, assessmentId, initialTopic } = target;
  const options = useQueryState({
    query: api.messages.contactOptionsFor,
    args: ready ? { courseId, materialId, assessmentId } : "skip",
  });
  const mine = useQueryState({ query: api.messages.mine, args: ready ? {} : "skip" });
  const start = useMutation(api.messages.start);

  return (
    <Composer
      open={open}
      onClose={onClose}
      lang={lang}
      options={options.status === "success" ? options.data : undefined}
      loadError={options.status === "error" ? errorMessage(options.error) : null}
      recent={mine.status === "success" ? mine.data : undefined}
      initialTopic={initialTopic}
      onSend={(args) => start(args)}
    />
  );
}
