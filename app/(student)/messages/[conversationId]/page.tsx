"use client";

import { useMutation, useQuery_experimental as useQueryState } from "convex/react";
import { ConvexError, type GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { ThreadNotFound, ThreadView } from "@/components/messages/ThreadView";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";
import { errorCode } from "@/lib/errors";

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId as GenericId<"conversations">;
  const current = useCurrentUser();
  const ready = current.status === "ready";
  // Errors come back as values: a conversation that isn't ours (NOT_FOUND) or a
  // malformed link gets a calm "not found" here instead of the error page.
  const result = useQueryState({ query: api.messages.thread, args: ready ? { conversationId } : "skip" });
  const reply = useMutation(api.messages.reply);
  const resolve = useMutation(api.messages.resolve);
  const markRead = useMutation(api.messages.markRead);

  // Opening the thread, and each new reply while it's open, counts as read.
  // The student's own messages are never unread for them, so those don't need it.
  const thread = result.status === "success" ? result.data : undefined;
  const last = thread?.messages.at(-1);
  const lastId = last?._id;
  const lastIsTheirs = last !== undefined && !last.mine;
  useEffect(() => {
    if (lastId !== undefined && lastIsTheirs) {
      markRead({ conversationId }).catch(() => undefined);
    }
  }, [conversationId, lastId, lastIsTheirs, markRead]);

  if (!ready) {
    return null;
  }
  const lang = current.me.locale;
  if (result.status === "error") {
    const notFound = errorCode(result.error) === "NOT_FOUND" || !(result.error instanceof ConvexError);
    if (notFound) {
      return <ThreadNotFound lang={lang} />;
    }
    // Anything else is unexpected: let the student error page handle it.
    throw result.error;
  }
  if (thread === undefined) {
    return <LoadingScreen label="Opening conversation" />;
  }
  return (
    <ThreadView
      thread={thread}
      lang={lang}
      onReply={(args) => reply({ conversationId, ...args })}
      onResolve={(resolved) => resolve({ conversationId, resolved })}
    />
  );
}
