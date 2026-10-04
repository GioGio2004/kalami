"use client";

import type { FunctionArgs, FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button, buttonClass } from "@/components/ui/buttons";
import { Dialog } from "@/components/ui/Dialog";
import { FormError, TextArea, TextInput } from "@/components/ui/form";
import { ArrowRight, ArrowUpRight, Check, Clock } from "@/components/ui/icons";
import { WritingDots } from "@/components/ui/StatusScreen";
import type { api } from "@/convex-api/api";
import {
  buildDraft,
  CARD,
  deliveryNote,
  draftLang,
  missingAnswers,
  newClientOpId,
  RECIPIENT_HINT,
  RECIPIENT_LABEL,
  TOPICS,
  topicDef,
  type ContactOptions,
  type Lang,
  type Topic,
} from "@/lib/contact";
import { errorCode, errorMessage, retryAfterMs } from "@/lib/errors";

export type StartArgs = FunctionArgs<typeof api.messages.start>;
export type MyConversation = FunctionReturnType<typeof api.messages.mine>[number];
type LecturerId = ContactOptions["lecturers"][number]["userId"];
export type RecipientChoice = { recipient: "admin" } | { recipient: "lecturer"; lecturerId: LecturerId };

/** Where the card sits: what Kalami attaches (the server keeps only what the student can see). */
export type ContactTarget = {
  courseId?: NonNullable<StartArgs["courseId"]>;
  weekId?: NonNullable<StartArgs["weekId"]>;
  assessmentId?: NonNullable<StartArgs["assessmentId"]>;
  initialTopic?: Topic;
};

// Server limits (convex/model/messages.ts).
const MAX_SUBJECT = 150;
const MAX_BODY = 5000;
const MAX_CUSTOM_TOPIC = 80;
const MAX_ANSWER = 2000;
const WEEK = 7 * 24 * 60 * 60 * 1000;

type Text = Record<Lang, string>;

const T = {
  loading: { en: "Getting things ready", ka: "ვამზადებთ" },
  loadError: {
    en: "We couldn't load who you can write to. Close this and try again in a moment.",
    ka: "ვერ ჩავტვირთეთ, ვის შეგიძლია მისწერო. დახურე და ცოტა ხანში ისევ სცადე.",
  },
  close: { en: "Close", ka: "დახურვა" },
  who: { en: "Who should get it?", ka: "ვის მივწეროთ?" },
  suggested: { en: "Suggested", ka: "შემოთავაზებული" },
  team: { en: "Kalami team", ka: "კალამის გუნდი" },
  noAdmin: { en: "The Kalami team can't take messages right now.", ka: "კალამის გუნდი ახლა შეტყობინებებს ვერ იღებს." },
  noLecturer: {
    en: "No lecturer to write to yet. Join a course or a group first.",
    ka: "ჯერ ლექტორი არ გყავს. ჯერ კურსს ან ჯგუფს შეუერთდი.",
  },
  topic: { en: "What's it about?", ka: "რას ეხება?" },
  customTopic: { en: "Your topic", ka: "შენი თემა" },
  customTopicPlaceholder: { en: "In a few words", ka: "რამდენიმე სიტყვით" },
  pickTopic: { en: "Pick a topic and we'll prepare the message.", ka: "აირჩიე თემა და წერილს მოგიმზადებთ." },
  details: { en: "A little more", ka: "ცოტა დეტალი" },
  required: { en: "required", ka: "სავალდებულო" },
  optional: { en: "optional", ka: "არასავალდებულო" },
  message: { en: "Your message", ka: "შენი წერილი" },
  prepared: { en: "Prepared for you. Change anything you like.", ka: "მოგიმზადეთ. შეცვალე, რაც გინდა." },
  subject: { en: "Subject", ka: "სათაური" },
  body: { en: "Message", ka: "ტექსტი" },
  edited: {
    en: "You've edited it, so changes above won't touch your text.",
    ka: "ტექსტი შეცვალე, ამიტომ ზემოთ ცვლილებები მას აღარ შეეხება.",
  },
  rebuild: { en: "Rebuild from the template", ka: "შაბლონით თავიდან აწყობა" },
  topicChanged: {
    en: "You picked a new topic. Use its template, or keep what you wrote?",
    ka: "ახალი თემა აირჩიე. გამოვიყენოთ მისი შაბლონი, თუ დავტოვოთ შენი ტექსტი?",
  },
  useNew: { en: "Use the new template", ka: "ახალი შაბლონი" },
  keepMine: { en: "Keep my text", ka: "ჩემი ტექსტი დარჩეს" },
  adds: { en: "What Kalami adds", ka: "რას დაურთავს კალამი" },
  addsHint: {
    en: "Attached to your message, so you don't have to explain it.",
    ka: "ერთვის შენს წერილს, რომ ახსნა არ დაგჭირდეს.",
  },
  name: { en: "Your name", ka: "შენი სახელი" },
  course: { en: "Course", ka: "კურსი" },
  week: { en: "Week", ka: "კვირა" },
  opensInNewTab: { en: "(opens in a new tab)", ka: "(იხსნება ახალ ჩანართში)" },
  to: { en: "To", ka: "ადრესატი" },
  send: { en: "Send", ka: "გაგზავნა" },
  sending: { en: "Sending…", ka: "იგზავნება…" },
  cancel: { en: "Cancel", ka: "გაუქმება" },
  stillNeeded: { en: "Still needed:", ka: "კიდევ საჭიროა:" },
  topicLabel: { en: "Topic", ka: "თემა" },
  tooLong: { en: "The message is too long.", ka: "წერილი ძალიან გრძელია." },
  openIt: { en: "Open it", ka: "გახსნა" },
  sentText: { en: "When they reply, you'll find it in Messages.", ka: "პასუხს „შეტყობინებებში“ ნახავ." },
  openConversation: { en: "Open the conversation", ka: "საუბრის გახსნა" },
  done: { en: "Done", ka: "კარგი" },
  kept: { en: "Your message is still here.", ka: "შენი წერილი აქვეა." },
  failed: {
    en: "It didn't send. Try again in a moment. Your message is still here.",
    ka: "ვერ გაიგზავნა. ცოტა ხანში ისევ სცადე. შენი წერილი აქვეა.",
  },
} satisfies Record<string, Text>;

const KIND_TEXT: Record<"task" | "quiz" | "midterm" | "final", Text> = {
  task: { en: "Task", ka: "დავალება" },
  quiz: { en: "Quiz", ka: "ქვიზი" },
  midterm: { en: "Midterm", ka: "შუალედური" },
  final: { en: "Final exam", ka: "ფინალური გამოცდა" },
};

const sentTitle = (lang: Lang, name: string) =>
  lang === "ka" ? `შეტყობინება გაეგზავნა: ${name}` : `Message sent to ${name}`;

const earlierText = (lang: Lang, date: string) =>
  lang === "ka" ? `ამაზე უკვე მისწერე (${date}).` : `You already wrote about this on ${date}.`;

function rateLimitedText(lang: Lang, ms: number | undefined): string {
  const minutes = Math.max(1, Math.ceil((ms ?? 60_000) / 60_000));
  return lang === "ka"
    ? `მოკლე დროში რამდენიმე შეტყობინება გაგზავნე. ისევ სცადე ${minutes} წუთში. შენი წერილი აქვეა.`
    : `You've sent a few messages in a short time. Try again in ${minutes === 1 ? "a minute" : `${minutes} minutes`}. Your message is still here.`;
}

/** What to say when Send fails. The draft always stays. */
export function sendErrorText(error: unknown, lang: Lang): string {
  const code = errorCode(error);
  if (code === "RATE_LIMITED") {
    return rateLimitedText(lang, retryAfterMs(error));
  }
  if (code !== undefined) {
    return `${errorMessage(error)} ${T.kept[lang]}`;
  }
  return T.failed[lang];
}

const choiceKey = (choice: RecipientChoice) => (choice.recipient === "admin" ? "admin" : `lecturer:${choice.lecturerId}`);

const shortDate = (ms: number) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "sent"; conversationId: string; recipientName: string };

export type ComposerProps = {
  open: boolean;
  onClose: () => void;
  /** The language of the composer itself (the student's); the draft follows `draftLang`. */
  lang: Lang;
  /** Undefined while loading. */
  options: ContactOptions | undefined;
  /** Set when the options couldn't load. */
  loadError?: string | null;
  /** The student's conversations, to point at an earlier one on the same topic. */
  recent?: MyConversation[];
  initialTopic?: Topic;
  /** Starts the conversation; resolves to its id. Called with the same `clientOpId` on a retry. */
  onSend: (args: StartArgs) => Promise<string>;
  /** Gallery only: a recipient already chosen, answers filled in, or the confirmation showing. */
  initialRecipient?: RecipientChoice;
  initialAnswers?: Record<string, string>;
  initialSent?: { conversationId: string; recipientName: string };
  /** Gallery only: a fixed "now", so dates render the same on the server and in the browser. */
  now?: number;
};

/**
 * The message composer: who gets it, the topic, a question or two, and a
 * prepared message the student can change before Send. The draft lives here
 * only (nothing is saved while typing) and survives closing and reopening;
 * after a message goes out, the next opening starts a fresh draft.
 */
export function Composer(props: ComposerProps) {
  const [draft, setDraft] = useState(0);
  return (
    <ComposerDraft
      key={draft}
      {...props}
      initialSent={draft === 0 ? props.initialSent : undefined}
      onFinished={() => setDraft((value) => value + 1)}
    />
  );
}

function ComposerDraft({
  open,
  onClose,
  lang,
  options,
  loadError,
  recent,
  initialTopic,
  onSend,
  initialRecipient,
  initialAnswers,
  initialSent,
  now: fixedNow,
  onFinished,
}: ComposerProps & { onFinished: () => void }) {
  const uid = useId();
  // One id per draft: a double tap or a retry after a timeout is saved once.
  const [clientOpId] = useState(newClientOpId);
  const [now] = useState(() => fixedNow ?? Date.now());
  const [topic, setTopic] = useState<Topic | null>(initialTopic ?? null);
  const [picked, setPicked] = useState<RecipientChoice | null>(initialRecipient ?? null);
  const [customTopic, setCustomTopic] = useState("");
  const [answersByTopic, setAnswersByTopic] = useState<Partial<Record<Topic, Record<string, string>>>>(() =>
    initialTopic && initialAnswers ? { [initialTopic]: initialAnswers } : {},
  );
  // The student's own subject and message, once they edit them; null follows the template.
  const [subjectEdit, setSubjectEdit] = useState<string | null>(null);
  const [bodyEdit, setBodyEdit] = useState<string | null>(null);
  // The topic their edits were written for.
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [status, setStatus] = useState<Status>(initialSent ? { kind: "sent", ...initialSent } : { kind: "idle" });
  const sentHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status.kind === "sent") {
      sentHeading.current?.focus();
    }
  }, [status.kind]);

  function close() {
    if (status.kind === "sent") {
      onFinished();
    }
    onClose();
  }

  const lecturers = options?.lecturers ?? [];
  const adminAvailable = options?.adminAvailable ?? false;

  // The topic's suggestion, falling back to whoever is available.
  function suggestedChoice(): RecipientChoice | null {
    const firstLecturer: RecipientChoice | null =
      lecturers.length > 0 ? { recipient: "lecturer", lecturerId: lecturers[0].userId } : null;
    const admin: RecipientChoice | null = adminAvailable ? { recipient: "admin" } : null;
    const want = topic ? topicDef(topic).suggested : "lecturer";
    return want === "admin" ? (admin ?? firstLecturer) : (firstLecturer ?? admin);
  }
  const suggestion = suggestedChoice();
  const pickedValid =
    picked !== null &&
    (picked.recipient === "admin" ? adminAvailable : lecturers.some((lecturer) => lecturer.userId === picked.lecturerId));
  const choice = pickedValid ? picked : suggestion;
  const lecturer =
    choice?.recipient === "lecturer" ? lecturers.find((item) => item.userId === choice.lecturerId) : undefined;
  const recipientName = choice?.recipient === "admin" ? T.team[lang] : (lecturer?.name ?? "");

  const answers = (topic && answersByTopic[topic]) || {};
  const generated =
    topic && options && choice
      ? buildDraft({
          lang: draftLang(options),
          topic,
          customTopic,
          recipient: choice.recipient,
          recipientName: lecturer?.name ?? "",
          studentName: options.student.name,
          context: options.context,
          answers,
        })
      : null;
  const subject = subjectEdit ?? generated?.subject ?? "";
  const body = bodyEdit ?? generated?.body ?? "";
  const edited = subjectEdit !== null || bodyEdit !== null;
  const topicPrompt = edited && topic !== null && editTopic !== topic;

  const missing = topic ? missingAnswers(topic, answers, customTopic) : [];
  const tooLong = body.length > MAX_BODY;
  const canSend =
    topic !== null &&
    choice !== null &&
    missing.length === 0 &&
    subject.trim() !== "" &&
    body.trim() !== "" &&
    !tooLong &&
    status.kind !== "sending";

  // A conversation on the same topic and course from the last week, still open: point at it, never block.
  const courseId = options?.context.course?._id;
  const earlier =
    topic === null
      ? undefined
      : recent?.find(
          (item) =>
            item.topic === topic &&
            item.courseId === courseId &&
            (item.status === "open" || item.status === "answered") &&
            now - item.lastMessageAt < WEEK &&
            (topic !== "other" || (item.customTopic ?? "").toLowerCase() === customTopic.trim().toLowerCase()),
        );

  function setAnswer(id: string, value: string) {
    if (!topic) return;
    setAnswersByTopic((current) => ({ ...current, [topic]: { ...current[topic], [id]: value } }));
  }

  function editSubject(value: string) {
    if (!edited) setEditTopic(topic);
    setSubjectEdit(value);
  }

  function editBody(value: string) {
    if (!edited) setEditTopic(topic);
    setBodyEdit(value);
  }

  function applyTemplate() {
    setSubjectEdit(null);
    setBodyEdit(null);
    setEditTopic(null);
  }

  async function send() {
    if (!canSend || !options || !choice || !topic) return;
    setStatus({ kind: "sending" });
    const { context } = options;
    try {
      const conversationId = await onSend({
        clientOpId,
        recipient: choice.recipient,
        ...(choice.recipient === "lecturer" ? { lecturerId: choice.lecturerId } : {}),
        // What the server resolved, so context it dropped isn't sent back.
        ...(context.course ? { courseId: context.course._id } : {}),
        ...(context.week ? { weekId: context.week._id } : {}),
        ...(context.assessment ? { assessmentId: context.assessment._id } : {}),
        topic,
        ...(topic === "other" ? { customTopic: customTopic.trim() } : {}),
        subject: subject.trim(),
        body: body.trim(),
      });
      setStatus({ kind: "sent", conversationId, recipientName });
    } catch (caught) {
      setStatus({ kind: "error", message: sendErrorText(caught, lang) });
    }
  }

  const legend = "text-base font-medium tracking-tight";

  let content: ReactNode;
  if (status.kind === "sent") {
    content = (
      <div role="status" className="px-6 pb-10 pt-12 text-center sm:px-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-highlighter">
          <Check className="size-7" />
        </span>
        <h2 ref={sentHeading} tabIndex={-1} className="mt-5 text-2xl font-medium tracking-tight outline-none">
          {sentTitle(lang, status.recipientName)}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-graphite">{T.sentText[lang]}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link href={`/messages/${status.conversationId}`} onClick={close} className={`${buttonClass("ink", "md")} max-sm:w-full`}>
            {T.openConversation[lang]}
            <ArrowRight className="size-4" />
          </Link>
          <Button variant="outline" onClick={close} className="max-sm:w-full">
            {T.done[lang]}
          </Button>
        </div>
      </div>
    );
  } else if (options === undefined) {
    content = (
      <div className="px-6 pb-10 pt-6 sm:px-8">
        {loadError ? (
          <p role="alert" className="rounded-2xl bg-panel px-4 py-3 text-[15px] leading-relaxed text-graphite">
            {T.loadError[lang]}
          </p>
        ) : (
          <div className="flex justify-center py-8">
            <WritingDots label={T.loading[lang]} />
          </div>
        )}
      </div>
    );
  } else {
    const { context } = options;
    const questions = topic ? topicDef(topic).questions : [];
    content = (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 sm:px-8">
        <div className="space-y-8">
          {/* 1. Who */}
          <fieldset>
            <legend className={legend}>{T.who[lang]}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {lecturers.map((item) => {
                const value: RecipientChoice = { recipient: "lecturer", lecturerId: item.userId };
                return (
                  <ChoiceCard
                    key={item.userId}
                    name={`${uid}-recipient`}
                    checked={choice !== null && choiceKey(choice) === choiceKey(value)}
                    onChange={() => setPicked(value)}
                    eyebrow={RECIPIENT_LABEL.lecturer[lang]}
                    title={item.name}
                    detail={item.via.length > 0 ? item.via.join(" · ") : RECIPIENT_HINT.lecturer[lang]}
                    badge={topic && suggestion && choiceKey(suggestion) === choiceKey(value) ? T.suggested[lang] : undefined}
                  />
                );
              })}
              {lecturers.length === 0 && (
                <ChoiceCard
                  name={`${uid}-recipient`}
                  checked={false}
                  disabled
                  onChange={() => undefined}
                  eyebrow={RECIPIENT_LABEL.lecturer[lang]}
                  title={RECIPIENT_LABEL.lecturer[lang]}
                  detail={T.noLecturer[lang]}
                />
              )}
              <ChoiceCard
                name={`${uid}-recipient`}
                checked={choice?.recipient === "admin"}
                disabled={!adminAvailable}
                onChange={() => setPicked({ recipient: "admin" })}
                eyebrow={RECIPIENT_LABEL.admin[lang]}
                title={T.team[lang]}
                detail={adminAvailable ? RECIPIENT_HINT.admin[lang] : T.noAdmin[lang]}
                badge={topic && suggestion?.recipient === "admin" ? T.suggested[lang] : undefined}
              />
            </div>
          </fieldset>

          {/* 2. Topic */}
          <fieldset>
            <legend className={legend}>{T.topic[lang]}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {TOPICS.map((item) => (
                <TopicChip
                  key={item.id}
                  name={`${uid}-topic`}
                  checked={topic === item.id}
                  onChange={() => setTopic(item.id)}
                >
                  {item.label[lang]}
                </TopicChip>
              ))}
            </div>
            {topic === "other" && (
              <div className="mt-4 space-y-2">
                <QuestionLabel htmlFor={`${uid}-custom`} required lang={lang}>
                  {T.customTopic[lang]}
                </QuestionLabel>
                <TextInput
                  id={`${uid}-custom`}
                  value={customTopic}
                  onChange={(event) => setCustomTopic(event.target.value)}
                  placeholder={T.customTopicPlaceholder[lang]}
                  maxLength={MAX_CUSTOM_TOPIC}
                  aria-required
                  autoComplete="off"
                />
              </div>
            )}
            {earlier && (
              <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-panel px-4 py-3 text-sm leading-relaxed">
                <Clock className="mt-0.5 size-4 shrink-0 text-graphite" />
                <span>
                  {earlierText(lang, shortDate(earlier.lastMessageAt))}{" "}
                  <Link
                    href={`/messages/${earlier._id}`}
                    onClick={close}
                    className="font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {T.openIt[lang]}
                  </Link>
                </span>
              </p>
            )}
          </fieldset>

          {topic === null ? (
            <p className="rounded-2xl border-2 border-dashed border-line px-4 py-5 text-center text-[15px] text-graphite">
              {T.pickTopic[lang]}
            </p>
          ) : (
            <>
              {/* 3. The topic's questions */}
              {questions.length > 0 && (
                <section aria-labelledby={`${uid}-details`} className="space-y-4">
                  <h3 id={`${uid}-details`} className={legend}>
                    {T.details[lang]}
                  </h3>
                  {questions.map((question) => {
                    const fieldId = `${uid}-q-${topic}-${question.id}`;
                    const shared = {
                      id: fieldId,
                      value: answers[question.id] ?? "",
                      placeholder: question.placeholder[lang],
                      maxLength: MAX_ANSWER,
                      "aria-required": question.required,
                    };
                    return (
                      <div key={`${topic}-${question.id}`} className="space-y-2">
                        <QuestionLabel htmlFor={fieldId} required={question.required} lang={lang}>
                          {question.label[lang]}
                        </QuestionLabel>
                        {question.long ? (
                          <TextArea {...shared} rows={3} onChange={(event) => setAnswer(question.id, event.target.value)} />
                        ) : (
                          <TextInput
                            {...shared}
                            autoComplete="off"
                            onChange={(event) => setAnswer(question.id, event.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </section>
              )}

              {/* 4. Subject and message */}
              <section aria-labelledby={`${uid}-message`} className="space-y-4">
                <div>
                  <h3 id={`${uid}-message`} className={legend}>
                    {T.message[lang]}
                  </h3>
                  <p className="mt-1 text-sm text-graphite">{T.prepared[lang]}</p>
                </div>
                {topicPrompt && (
                  <div role="status" className="rounded-2xl bg-highlighter/40 p-4">
                    <p className="text-sm leading-relaxed">{T.topicChanged[lang]}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={applyTemplate}>
                        {T.useNew[lang]}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditTopic(topic)}>
                        {T.keepMine[lang]}
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor={`${uid}-subject`} className="block text-sm font-medium">
                    {T.subject[lang]}
                  </label>
                  <TextInput
                    id={`${uid}-subject`}
                    value={subject}
                    onChange={(event) => editSubject(event.target.value)}
                    maxLength={MAX_SUBJECT}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`${uid}-body`} className="block text-sm font-medium">
                    {T.body[lang]}
                  </label>
                  <TextArea
                    id={`${uid}-body`}
                    value={body}
                    onChange={(event) => editBody(event.target.value)}
                    rows={10}
                    className="field-sizing-content min-h-60"
                    maxLength={MAX_BODY}
                    aria-describedby={edited && !topicPrompt ? `${uid}-edited` : undefined}
                  />
                  {body.length > MAX_BODY - 500 && (
                    <p className={`text-right text-xs tabular-nums ${tooLong ? "text-red-pen" : "text-graphite"}`}>
                      {body.length} / {MAX_BODY}
                    </p>
                  )}
                </div>
                {edited && !topicPrompt && (
                  <p id={`${uid}-edited`} className="text-xs leading-relaxed text-graphite">
                    {T.edited[lang]}{" "}
                    <button
                      type="button"
                      onClick={applyTemplate}
                      className="font-medium text-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      {T.rebuild[lang]}
                    </button>
                  </p>
                )}
              </section>

              {/* 5. What Kalami adds */}
              <section aria-labelledby={`${uid}-adds`}>
                <h3 id={`${uid}-adds`} className={legend}>
                  {T.adds[lang]}
                </h3>
                <p className="mt-1 text-sm text-graphite">{T.addsHint[lang]}</p>
                <dl className="mt-3 grid gap-2">
                  <ContextRow label={T.name[lang]}>{options.student.name}</ContextRow>
                  {context.course && <ContextRow label={T.course[lang]}>{context.course.title}</ContextRow>}
                  {context.week && (
                    <ContextRow label={T.week[lang]}>
                      {context.week.url ? (
                        <a
                          href={context.week.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                        >
                          {context.week.title}
                          <ArrowUpRight className="size-3.5 shrink-0" />
                          <span className="sr-only"> {T.opensInNewTab[lang]}</span>
                        </a>
                      ) : (
                        context.week.title
                      )}
                    </ContextRow>
                  )}
                  {context.assessment && (
                    <ContextRow label={KIND_TEXT[context.assessment.kind][lang]}>{context.assessment.title}</ContextRow>
                  )}
                </dl>
              </section>
            </>
          )}

          {/* 6. Send */}
          <section className="rounded-[1.6rem] bg-card p-4 sm:p-5">
            {choice && (
              <>
                <p className="text-sm leading-relaxed text-graphite">{deliveryNote(lang, recipientName)}</p>
                <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]">
                  <span className="text-graphite">{T.to[lang]}:</span>
                  <span className="font-medium">{recipientName}</span>
                  <span className="rounded-full bg-panel px-2.5 py-0.5 text-xs font-medium text-graphite">
                    {RECIPIENT_LABEL[choice.recipient][lang]}
                  </span>
                </p>
              </>
            )}
            {topic !== null && missing.length > 0 && (
              <p className="mt-3 text-sm text-graphite">
                {T.stillNeeded[lang]}{" "}
                {missing
                  .map((question) => (question.id === "customTopic" ? T.topicLabel[lang] : question.label[lang]))
                  .join(" · ")}
              </p>
            )}
            {tooLong && <p className="mt-3 text-sm text-red-pen">{T.tooLong[lang]}</p>}
            {status.kind === "error" && (
              <div className="mt-3">
                <FormError>{status.message}</FormError>
              </div>
            )}
            <div className="mt-4 flex flex-wrap-reverse justify-end gap-2">
              <Button variant="ghost" onClick={close} className="max-sm:flex-1">
                {T.cancel[lang]}
              </Button>
              <Button variant="ink" onClick={send} disabled={!canSend} className="max-sm:flex-[2]">
                {status.kind === "sending" ? T.sending[lang] : T.send[lang]}
              </Button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onClose={close} label={CARD.action[lang]} closeLabel={T.close[lang]} sheet>
      {status.kind !== "sent" && (
        <header className="shrink-0 px-5 pb-4 pr-16 pt-5 sm:px-8 sm:pt-7">
          <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line sm:hidden" />
          <p
            className={
              lang === "ka"
                ? "text-sm leading-snug text-graphite"
                : "-rotate-1 font-hand text-[1.45rem] leading-none text-graphite"
            }
          >
            {CARD.headline[lang]}
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">{CARD.action[lang]}</h2>
        </header>
      )}
      {content}
    </Dialog>
  );
}

/** A recipient: a radio drawn as a card. Arrow keys move between them (native radio group). */
function ChoiceCard({
  name,
  checked,
  disabled = false,
  onChange,
  eyebrow,
  title,
  detail,
  badge,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  eyebrow: string;
  title: string;
  detail: string;
  badge?: string;
}) {
  return (
    <label
      className={`flex gap-3 rounded-2xl border p-4 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-highlighter/70 ${
        disabled
          ? "cursor-not-allowed border-dashed border-line bg-panel/60 text-graphite"
          : checked
            ? "cursor-pointer border-ink bg-highlighter/25"
            : "cursor-pointer border-line bg-card hover:border-ink/25"
      }`}
    >
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} className="sr-only" />
      <span
        aria-hidden
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition ${
          checked ? "border-ink bg-card" : "border-ink/25 bg-card"
        }`}
      >
        {checked && <span className="size-2.5 rounded-full bg-ink" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-graphite">{eyebrow}</span>
          {badge && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-highlighter">{badge}</span>}
        </span>
        <span className="mt-0.5 block font-medium leading-snug">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-graphite">{detail}</span>
      </span>
    </label>
  );
}

function TopicChip({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={`cursor-pointer rounded-full border px-4 py-2 text-sm leading-snug transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-highlighter/70 ${
        checked ? "border-ink bg-ink font-medium text-paper" : "border-line bg-card hover:border-ink/25"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

function QuestionLabel({
  htmlFor,
  required,
  lang,
  children,
}: {
  htmlFor: string;
  required: boolean;
  lang: Lang;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3 text-sm font-medium">
      {children}
      <span className={`shrink-0 text-xs font-normal ${required ? "text-ink" : "text-graphite"}`}>
        {required ? T.required[lang] : T.optional[lang]}
      </span>
    </label>
  );
}

function ContextRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-2xl bg-panel/70 px-4 py-2.5">
      <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-graphite">{label}</dt>
      <dd className="min-w-0 flex-1 text-[15px] font-medium wrap-anywhere">{children}</dd>
    </div>
  );
}
