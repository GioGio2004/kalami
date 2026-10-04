"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { sendErrorText } from "@/components/contact/Composer";
import { Button, ButtonLink } from "@/components/ui/buttons";
import { FormError, TextArea } from "@/components/ui/form";
import { ArrowLeft, ArrowUpRight, Folder, ListChecks, Mail, Notebook } from "@/components/ui/icons";
import { deliveryNote, newClientOpId, type Lang } from "@/lib/contact";
import { errorMessage } from "@/lib/errors";
import { formatShort } from "@/lib/time";
import { assessmentPath } from "@/lib/urls";
import { StatusChip } from "./MessagesView";
import { KALAMI_TEAM, topicText, type Thread } from "./labels";

const T = {
  back: { en: "Messages", ka: "შეტყობინებები" },
  to: { en: "To", ka: "ვის:" },
  course: { en: "Course", ka: "კურსი" },
  week: { en: "Week", ka: "კვირა" },
  opensInNewTab: { en: "(opens in a new tab)", ka: "(იხსნება ახალ ჩანართში)" },
  older: { en: "Older messages aren't shown.", ka: "ძველი შეტყობინებები არ ჩანს." },
  you: { en: "You", ka: "შენ" },
  emailed: { en: "email sent", ka: "ელფოსტა გაიგზავნა" },
  reply: { en: "Write a reply", ka: "პასუხის დაწერა" },
  placeholder: { en: "Write it as you'd say it…", ka: "დაწერე ისე, როგორც იტყოდი…" },
  send: { en: "Send", ka: "გაგზავნა" },
  sending: { en: "Sending…", ka: "იგზავნება…" },
  reopensHint: {
    en: "This one is resolved. Writing again reopens it.",
    ka: "ეს საკითხი მოგვარებულია. ახალი შეტყობინება მას თავიდან გახსნის.",
  },
  markResolved: { en: "Mark as resolved", ka: "მოგვარებულია" },
  reopen: { en: "Reopen", ka: "თავიდან გახსნა" },
  working: { en: "Saving…", ka: "ინახება…" },
  notFoundNote: { en: "Hmm", ka: "ჰმმ" },
  notFoundTitle: { en: "We couldn't find this conversation", ka: "ეს მიმოწერა ვერ ვიპოვეთ" },
  notFoundText: {
    en: "It may have been removed, or it belongs to another account. Your other messages are still in Messages.",
    ka: "შეიძლება წაშლილია ან სხვა ანგარიშს ეკუთვნის. დანარჩენი შეტყობინებები „შეტყობინებებშია“.",
  },
  allMessages: { en: "All my messages", ka: "ყველა შეტყობინება" },
} satisfies Record<string, Record<Lang, string>>;

const KIND_TEXT: Record<"task" | "quiz" | "midterm" | "final", Record<Lang, string>> = {
  task: { en: "Task", ka: "დავალება" },
  quiz: { en: "Quiz", ka: "ქვიზი" },
  midterm: { en: "Midterm", ka: "შუალედური" },
  final: { en: "Final exam", ka: "ფინალური გამოცდა" },
};

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/**
 * One conversation from the student's side: what they wrote, the replies, a
 * reply box and Resolve / Reopen. Messages are plain text, never HTML. No
 * "seen" marks: the student only learns that the email went out.
 */
export function ThreadView({
  thread,
  lang = "en",
  onReply,
  onResolve,
}: {
  thread: Thread;
  lang?: Lang;
  /** Sends a reply; called with the same `clientOpId` when retried. */
  onReply: (args: { clientOpId: string; body: string }) => Promise<unknown>;
  onResolve: (resolved: boolean) => Promise<unknown>;
}) {
  const uid = useId();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  // One id per reply being written: a retry after a timeout reuses it, so it's saved once.
  const [opId, setOpId] = useState(newClientOpId);
  const end = useRef<HTMLDivElement>(null);
  const resolved = thread.status === "resolved";
  const recipient = thread.recipient === "admin" ? KALAMI_TEAM[lang] : thread.recipientName;

  // A message arriving while the thread is open scrolls into view; opening the page doesn't jump.
  const seen = useRef(thread.messages.length);
  useEffect(() => {
    if (thread.messages.length > seen.current) {
      end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    seen.current = thread.messages.length;
  }, [thread.messages.length]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (body.trim() === "" || sending) return;
    setSending(true);
    setReplyError(null);
    try {
      await onReply({ clientOpId: opId, body: body.trim() });
      setOpId(newClientOpId());
      setBody("");
    } catch (caught) {
      setReplyError(sendErrorText(caught, lang));
    } finally {
      setSending(false);
    }
  }

  async function toggleResolved() {
    setResolving(true);
    setResolveError(null);
    try {
      await onResolve(!resolved);
    } catch (caught) {
      setResolveError(errorMessage(caught));
    } finally {
      setResolving(false);
    }
  }

  const { context } = thread;
  const contextLinks: ReactNode[] = [];
  if (context.course) {
    contextLinks.push(
      <Link key="course" href={`/courses/${context.course._id}`} className={`inline-flex items-center gap-1.5 underline-offset-4 hover:text-ink hover:underline ${focusRing}`}>
        <Notebook className="size-4 shrink-0" />
        <span className="sr-only">{T.course[lang]}: </span>
        {context.course.title}
      </Link>,
    );
  }
  if (context.material) {
    contextLinks.push(
      <a
        key="week"
        href={context.material.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 underline-offset-4 hover:text-ink hover:underline ${focusRing}`}
      >
        <Folder className="size-4 shrink-0" />
        <span className="sr-only">{T.week[lang]}: </span>
        {context.material.title}
        <ArrowUpRight className="size-3.5 shrink-0" />
        <span className="sr-only"> {T.opensInNewTab[lang]}</span>
      </a>,
    );
  }
  if (context.assessment) {
    contextLinks.push(
      <Link
        key="assessment"
        href={assessmentPath(context.assessment.kind, context.assessment._id)}
        className={`inline-flex items-center gap-1.5 underline-offset-4 hover:text-ink hover:underline ${focusRing}`}
      >
        <ListChecks className="size-4 shrink-0" />
        <span className="sr-only">{KIND_TEXT[context.assessment.kind][lang]}: </span>
        {context.assessment.title}
      </Link>,
    );
  }

  return (
    <div className="rounded-[2.25rem] bg-panel px-3 pb-3 pt-8 sm:rounded-[2.75rem] sm:px-10 sm:pb-8 sm:pt-10 lg:px-12">
      <Link href="/messages" className={`ml-2 inline-flex items-center gap-2 rounded-full text-sm text-graphite hover:text-ink sm:ml-1 ${focusRing}`}>
        <ArrowLeft className="size-4" />
        {T.back[lang]}
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-5 px-2 sm:px-1">
        <div className="min-w-0 max-w-4xl">
          <p className="-rotate-1 font-hand text-[1.6rem] leading-none text-graphite">{topicText(thread, lang)}</p>
          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.035em] wrap-anywhere sm:text-5xl">{thread.subject}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-[15px]">
            <span className="text-graphite">{T.to[lang]}</span>
            <span className="font-medium">{recipient}</span>
            <StatusChip status={thread.status} lang={lang} />
          </p>
          {contextLinks.length > 0 && (
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-graphite">{contextLinks}</p>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Button variant="outline" onClick={toggleResolved} disabled={resolving}>
            {resolving ? T.working[lang] : resolved ? T.reopen[lang] : T.markResolved[lang]}
          </Button>
          {resolveError && (
            <p role="alert" className="text-sm text-red-pen">
              {resolveError}
            </p>
          )}
        </div>
      </div>

      <section className="mt-8 max-w-4xl rounded-[1.6rem] bg-card p-3 sm:rounded-[2rem] sm:p-6">
        {thread.truncated && <p className="mb-4 text-center text-xs text-graphite">{T.older[lang]}</p>}
        <ol className="space-y-4">
          {thread.messages.map((message) => (
            <li key={message._id} className={`flex flex-col ${message.mine ? "items-end" : "items-start"}`}>
              <p className="px-2 text-xs text-graphite">
                <span className="font-medium text-ink">{message.mine ? T.you[lang] : message.senderName}</span>
                {" · "}
                <time dateTime={new Date(message._creationTime).toISOString()}>{formatShort(message._creationTime)}</time>
                {message.mine && message.emailed && (
                  <>
                    {" · "}
                    <span className="inline-flex items-center gap-1 align-middle">
                      <Mail className="size-3" />
                      {T.emailed[lang]}
                    </span>
                  </>
                )}
              </p>
              <div
                className={`mt-1 max-w-[88%] rounded-3xl px-4 py-3 sm:max-w-[80%] ${
                  message.mine ? "rounded-br-lg bg-ink text-paper" : "rounded-bl-lg bg-panel text-ink"
                }`}
              >
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed wrap-anywhere">{message.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div ref={end} />

        <form onSubmit={submit} className="mt-6 border-t border-dashed border-ink/15 pt-5">
          <label htmlFor={`${uid}-reply`} className="text-sm font-medium">
            {T.reply[lang]}
          </label>
          <TextArea
            id={`${uid}-reply`}
            className="mt-2"
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={5000}
            placeholder={T.placeholder[lang]}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 flex-1 basis-60 text-xs leading-relaxed text-graphite">
              {resolved ? T.reopensHint[lang] : deliveryNote(lang, recipient)}
            </p>
            <Button type="submit" disabled={sending || body.trim() === ""} className="max-sm:w-full">
              {sending ? T.sending[lang] : T.send[lang]}
            </Button>
          </div>
          {replyError && (
            <div className="mt-3">
              <FormError>{replyError}</FormError>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

/** For a conversation that isn't there (deleted, someone else's, or a broken link). */
export function ThreadNotFound({ lang = "en" }: { lang?: Lang }) {
  return (
    <div className="rounded-[2.25rem] bg-panel px-6 py-14 sm:rounded-[2.75rem] sm:px-12">
      <p className="-rotate-2 font-hand text-[1.8rem] leading-none text-graphite">{T.notFoundNote[lang]}</p>
      <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">{T.notFoundTitle[lang]}</h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-graphite">{T.notFoundText[lang]}</p>
      <ButtonLink href="/messages" variant="outline" className="mt-8">
        {T.allMessages[lang]}
      </ButtonLink>
    </div>
  );
}
