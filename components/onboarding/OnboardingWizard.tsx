"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import type { GenericId as Id } from "convex/values";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Me } from "@/components/CurrentUserProvider";
import { HonestyNoticeArticle, type HonestyNotice } from "@/components/HonestyNoticeArticle";
import { Enter } from "@/components/motion/Reveal";
import { ArrowButton, Button } from "@/components/ui/buttons";
import { CheckCard, Field, FormError, Segmented, TextInput } from "@/components/ui/form";
import { ArrowLeft, Building, Check, Lock } from "@/components/ui/icons";
import { api } from "@/convex-api/api";
import { errorMessage } from "@/lib/errors";

export type University = FunctionReturnType<typeof api.universities.listActive>[number];
export type { HonestyNotice };
type OnboardingValues = FunctionArgs<typeof api.users.completeStudentOnboarding>;
type Locale = Me["locale"];

type Draft = {
  firstName: string;
  lastName: string;
  locale: Locale;
  universityId: string;
  faculty: string;
  group: string;
  year: number;
  studentNumber: string;
};

// Steps slide in from the side you are heading towards and out the other way.
const slide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 56 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: (direction: number) => ({ opacity: 0, x: direction * -56, transition: { duration: 0.2 } }),
};

const STEPS = [
  { title: "About you", text: "Your name, as your lecturer knows it." },
  { title: "Your university", text: "Faculty, group and year." },
  { title: "Honesty notice", text: "What is measured, and what never is." },
];

const LANGUAGES = [
  { value: "ka", label: "ქართული" },
  { value: "en", label: "English" },
] as const;

const YEARS = [1, 2, 3, 4, 5, 6].map((year) => ({ value: year, label: String(year) }));

/** The notebook-page onboarding: profile, university, honesty notice. */
export function OnboardingWizard({
  me,
  universities,
  notice,
  onSubmit,
  header,
  initialStep = 0,
}: {
  me: Pick<Me, "firstName" | "lastName" | "locale" | "student">;
  universities: University[];
  notice: HonestyNotice;
  onSubmit: (values: OnboardingValues) => Promise<void>;
  header?: ReactNode;
  initialStep?: number;
}) {
  // Once set, a student's university is locked; only an admin can move them.
  const lockedUniversity = me.student;
  const [step, setStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<Draft>({
    firstName: me.firstName ?? "",
    lastName: me.lastName ?? "",
    locale: me.locale,
    universityId:
      lockedUniversity?.universityId ?? (universities.length === 1 ? universities[0]._id : ""),
    faculty: me.student?.faculty ?? "",
    group: me.student?.group ?? "",
    year: me.student?.year ?? 1,
    studentNumber: me.student?.studentNumber ?? "",
  });
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const card = useRef<HTMLElement>(null);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function goTo(nextStep: number) {
    setError(null);
    setDirection(nextStep >= step ? 1 : -1);
    setStep(nextStep);
    if (card.current && card.current.getBoundingClientRect().top < 0) {
      card.current.scrollIntoView({ block: "start" });
    }
  }

  function onNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1 && !draft.universityId) {
      setError("Choose your university.");
      return;
    }
    goTo(step + 1);
  }

  async function onFinish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted) {
      setError("Tick the box to accept the honesty notice.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onSubmit({
        firstName: draft.firstName,
        lastName: draft.lastName,
        universityId: draft.universityId as Id<"universities">,
        faculty: draft.faculty,
        group: draft.group,
        year: draft.year,
        studentNumber: draft.studentNumber.trim() || undefined,
        locale: draft.locale,
        honestyVersion: notice.version,
      });
      // users.me updates reactively and the page moves on by itself.
    } catch (e) {
      setError(errorMessage(e));
      setPending(false);
    }
  }

  const text = notice[draft.locale];
  const otherLocale: Locale = draft.locale === "ka" ? "en" : "ka";

  return (
    <div className="flex flex-1 flex-col">
      {header}
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-5 px-3 py-6 *:min-w-0 sm:px-6 lg:grid-cols-[21rem_1fr] lg:gap-8 lg:py-10">
        <Enter as="div" kind="left" className="lg:sticky lg:top-28">
        <aside className="rounded-[2.25rem] bg-panel p-6 sm:p-8">
          <Enter as="p" kind="pop" delay={0.2} className="-rotate-2 font-hand text-[1.7rem] leading-none text-graphite">
            Welcome to Kalami!
          </Enter>
          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.035em]">
            Set up your notebook
          </h1>
          <p className="mt-2 text-sm text-graphite">Three short steps, about a minute.</p>

          <ol className="mt-8 hidden space-y-1 lg:block">
            {STEPS.map((item, index) => (
              <li key={item.title}>
                <button
                  type="button"
                  disabled={index > step || pending}
                  onClick={() => goTo(index)}
                  className="flex w-full items-start gap-3.5 rounded-2xl p-2.5 text-left transition enabled:hover:bg-card/70 disabled:cursor-default"
                >
                  <StepDot index={index} step={step} />
                  <span>
                    <span className={`block font-medium ${index > step ? "text-graphite" : ""}`}>
                      {item.title}
                    </span>
                    <span className="text-sm text-graphite">{item.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex gap-1.5 lg:hidden" aria-hidden>
            {STEPS.map((item, index) => (
              <span key={item.title} className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/15">
                <motion.span
                  className="block h-full rounded-full bg-ink"
                  initial={false}
                  animate={{ width: index <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            ))}
          </div>
        </aside>
        </Enter>

        <Enter kind="up" delay={0.15}>
        <section
          ref={card}
          className="scroll-mt-28 rounded-[2.25rem] border border-line bg-card p-6 shadow-[0_30px_70px_-50px_rgba(20,20,20,0.5)] sm:p-10"
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div key={step} custom={direction} variants={slide} initial="enter" animate="center" exit="exit">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-graphite">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
            {STEPS[step].title}
          </h2>

          {step === 0 && (
            <form onSubmit={onNext} className="mt-8 space-y-6">
              <Field
                label="Language · ენა"
                hint="Used for your university's name and the honesty notice. Most screens are in English for now."
              >
                <div>
                  <Segmented
                    label="Language"
                    value={draft.locale}
                    options={LANGUAGES}
                    onChange={(locale) => update("locale", locale)}
                  />
                </div>
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="First name" htmlFor="firstName">
                  <TextInput
                    id="firstName"
                    required
                    maxLength={60}
                    autoComplete="given-name"
                    value={draft.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                  />
                </Field>
                <Field label="Last name" htmlFor="lastName">
                  <TextInput
                    id="lastName"
                    required
                    maxLength={60}
                    autoComplete="family-name"
                    value={draft.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                  />
                </Field>
              </div>
              <p className="text-sm text-graphite">
                Write it the way it appears in your university records, in Georgian if that is how
                your lecturer knows you.
              </p>
              <StepActions error={error} />
            </form>
          )}

          {step === 1 && (
            <form onSubmit={onNext} className="mt-8 space-y-6">
              {/* min-w-0: fieldsets default to min-content width, which would undo the truncation. */}
              <fieldset className="min-w-0 space-y-2">
                <legend className="mb-2 text-sm font-medium">University</legend>
                {lockedUniversity ? (
                  <div className="flex items-center gap-4 rounded-2xl border border-line bg-panel/60 p-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-card">
                      <Lock className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        {lockedUniversity.universityName[draft.locale]}
                      </span>
                      <span className="block text-xs text-graphite">
                        Set at sign-up. Ask your university&apos;s admin if this is wrong.
                      </span>
                    </span>
                  </div>
                ) : universities.length === 0 ? (
                  <p className="rounded-2xl bg-panel p-4 text-sm text-graphite">
                    Your university hasn&apos;t joined Kalami yet. Ask your university&apos;s admin
                    to set it up, then come back here.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {universities.map((university) => {
                      const selected = draft.universityId === university._id;
                      return (
                        <label
                          key={university._id}
                          className={`flex min-w-0 cursor-pointer items-center gap-4 rounded-2xl border p-4 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-highlighter/60 ${
                            selected ? "border-ink bg-highlighter/25" : "border-line hover:border-ink/25"
                          }`}
                        >
                          <input
                            type="radio"
                            name="universityId"
                            value={university._id}
                            checked={selected}
                            onChange={() => update("universityId", university._id)}
                            className="sr-only"
                          />
                          <span
                            className={`grid size-11 shrink-0 place-items-center rounded-full ${selected ? "bg-highlighter" : "bg-panel"}`}
                          >
                            <Building className="size-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium">{university.name[draft.locale]}</span>
                            <span className="block truncate text-xs text-graphite">
                              {university.name[otherLocale]}
                            </span>
                          </span>
                          <span
                            aria-hidden
                            className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-ink" : "border-ink/25"}`}
                          >
                            {selected && <span className="size-2.5 rounded-full bg-ink" />}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {!lockedUniversity && universities.length > 0 && (
                  <p className="flex items-start gap-2 pt-1 text-xs leading-relaxed text-graphite">
                    <Lock className="mt-px size-3.5 shrink-0" />
                    Choose carefully: once you finish setup, you can&apos;t change your university.
                    Only your university&apos;s admin can move you.
                  </p>
                )}
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Faculty"
                  htmlFor="faculty"
                  hint="Write it the way your university does. Lecturers use it to find you on their course list."
                >
                  <TextInput
                    id="faculty"
                    required
                    maxLength={120}
                    placeholder="e.g. Computer Science"
                    value={draft.faculty}
                    onChange={(e) => update("faculty", e.target.value)}
                  />
                </Field>
                <Field
                  label="Group"
                  htmlFor="group"
                  hint="Copy it exactly from your timetable, so your lecturer can match you to their group."
                >
                  <TextInput
                    id="group"
                    required
                    maxLength={40}
                    placeholder="e.g. CS-101"
                    value={draft.group}
                    onChange={(e) => update("group", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Year">
                <div>
                  <Segmented
                    label="Year of study"
                    value={draft.year}
                    options={YEARS}
                    onChange={(year) => update("year", year)}
                  />
                </div>
              </Field>
              <Field
                label="Student ID"
                htmlFor="studentNumber"
                optional
                hint="The number on your student card. It helps lecturers match you to their list, even if two students share a name."
              >
                <TextInput
                  id="studentNumber"
                  maxLength={40}
                  value={draft.studentNumber}
                  onChange={(e) => update("studentNumber", e.target.value)}
                />
              </Field>
              <StepActions error={error} onBack={() => goTo(0)} />
            </form>
          )}

          {step === 2 && (
            <form onSubmit={onFinish} className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[15px] text-graphite">Read it in the language you prefer.</p>
                <Segmented
                  label="Notice language"
                  value={draft.locale}
                  options={LANGUAGES}
                  onChange={(locale) => update("locale", locale)}
                />
              </div>

              <HonestyNoticeArticle text={text} />

              <CheckCard checked={accepted} onChange={setAccepted}>
                {draft.locale === "ka"
                  ? "წავიკითხე და ვეთანხმები კეთილსინდისიერების შეტყობინებას."
                  : "I have read the honesty notice and I accept it."}
              </CheckCard>
              <StepActions error={error} onBack={() => goTo(1)} final pending={pending} />
            </form>
          )}
          </motion.div>
          </AnimatePresence>
        </section>
        </Enter>
      </main>
    </div>
  );
}

function StepDot({ index, step }: { index: number; step: number }) {
  if (index < step) {
    // Finishing a step stamps the tick on with a little spring.
    return (
      <motion.span
        initial={{ scale: 0.3, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 13 }}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-highlighter"
      >
        <Check className="size-4" />
      </motion.span>
    );
  }
  return (
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
        index === step ? "bg-ink text-paper" : "border border-ink/15 text-graphite"
      }`}
    >
      {index + 1}
    </span>
  );
}

function StepActions({
  error,
  onBack,
  final = false,
  pending = false,
}: {
  error: string | null;
  onBack?: () => void;
  final?: boolean;
  pending?: boolean;
}) {
  return (
    <div className="space-y-4 border-t border-line pt-6">
      {error && <FormError>{error}</FormError>}
      <div className="flex items-center justify-between gap-3">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} disabled={pending}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : (
          <span />
        )}
        <ArrowButton type="submit" tone={final ? "lime" : "ink"} disabled={pending}>
          {final ? (pending ? "Opening your notebook…" : "Open my notebook") : "Continue"}
        </ArrowButton>
      </div>
    </div>
  );
}
