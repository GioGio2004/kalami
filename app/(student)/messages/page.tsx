"use client";

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { MessagesView } from "@/components/messages/MessagesView";
import { api } from "@/convex-api/api";

const MINUTE = 60_000;

export default function MessagesPage() {
  const current = useCurrentUser();
  const ready = current.status === "ready";
  const conversations = useQuery(api.messages.mine, ready ? {} : "skip");
  // Ticks once a minute, so "5 minutes ago" keeps up while the page is open.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), MINUTE);
    return () => window.clearInterval(timer);
  }, []);
  // StudentGate only renders this page for onboarded students.
  if (!ready) {
    return null;
  }
  return <MessagesView conversations={conversations} now={now} lang={current.me.locale} />;
}
