import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex-api/api";
import { topicDef, type Lang, type Topic } from "@/lib/contact";

export type Conversation = FunctionReturnType<typeof api.messages.mine>[number];
export type Thread = FunctionReturnType<typeof api.messages.thread>;
export type ConversationStatus = Conversation["status"];

/** What the student sees: their message went out, someone answered, or it's done. */
export const STATUS_LABEL: Record<ConversationStatus, Record<Lang, string>> = {
  open: { en: "Sent", ka: "გაგზავნილი" },
  answered: { en: "Replied", ka: "უპასუხეს" },
  resolved: { en: "Resolved", ka: "მოგვარებული" },
};

/** Replied stands out (there's something to read); Sent and Resolved stay quiet. */
export const STATUS_TONE: Record<ConversationStatus, string> = {
  open: "bg-panel text-graphite",
  answered: "bg-highlighter text-ink",
  resolved: "bg-ok/12 text-ok",
};

/** The topic as the student picked it: its label, or their own words for "My own topic". */
export function topicText(item: { topic: Topic; customTopic?: string }, lang: Lang): string {
  return item.topic === "other" && item.customTopic ? item.customTopic : topicDef(item.topic).label[lang];
}

export const KALAMI_TEAM: Record<Lang, string> = { en: "Kalami team", ka: "კალამის გუნდი" };
