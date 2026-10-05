"use client";

import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Enter, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Check, Shield } from "@/components/ui/icons";
import { ConnectSnippets } from "./ConnectSnippets";

const EXAMPLE_PROMPTS = [
  "Go through my last quiz in Web basics and explain every question I got wrong.",
  "Explain the CSS box model from this week's lesson like I'm new to it, then quiz me.",
  "What's due this week, and which lessons should I read first?",
  "Make five practice questions from the lesson on selectors.",
  "Where in my courses was margin collapsing covered?",
  "Look at my submitted recipe-page task and tell me what my lecturer's comments mean.",
];

/** How a student connects their own AI assistant to Kalami, and what it can see. */
export function AssistantView({ origin }: { origin: string }) {
  return (
    <div className="rounded-[2.25rem] bg-panel px-3 pb-3 pt-8 sm:rounded-[2.75rem] sm:px-10 sm:pb-8 sm:pt-14 lg:px-12">
      <div className="max-w-3xl px-2 sm:px-1">
        <Enter as="p" kind="left" delay={0.15} className="-rotate-2 font-hand text-[1.8rem] leading-none text-graphite">
          Study with your own assistant
        </Enter>
        <AnimatedHeading as="h1" delay={0.25} className="mt-3 text-4xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-6xl">
          Connect your AI to your courses
        </AnimatedHeading>
        <Enter as="p" delay={0.5} className="mt-5 text-lg leading-relaxed text-graphite">
          Kalami is an MCP server. Add it to Claude, ChatGPT or any assistant that supports it, sign in with your Kalami
          account, and it can read your lessons, materials and deadlines, and go through the work you&apos;ve finished
          with you: what you answered, what was right, and why.
        </Enter>
      </div>

      <div className="mt-10 grid gap-4 *:min-w-0 lg:grid-cols-12">
        <section className="notch-top rounded-[2rem] bg-card p-6 pt-8 sm:p-8 sm:pt-10 lg:col-span-7">
          <StepHeading n={1} title="Add Kalami to your assistant" />
          <p className="mt-2 text-[15px] leading-relaxed text-graphite">
            Pick the app you use and follow its steps. It asks you to sign in to Kalami once; use the account you study
            with.
          </p>
          <div className="mt-5">
            <ConnectSnippets origin={origin} />
          </div>
        </section>

        <section className="rounded-[2rem] bg-charcoal p-6 text-paper sm:p-8 lg:col-span-5">
          <span className="grid size-12 place-items-center rounded-full bg-charcoal-soft text-paper">
            <Shield className="size-5" />
          </span>
          <h2 className="mt-8 text-2xl font-medium tracking-tight">What it can and can&apos;t see</h2>
          <ul className="mt-5 space-y-3 text-[15px]">
            {[
              ["Can", "your courses, every published lesson, the materials and links, what's due"],
              ["Can", "work you've finished: the questions, your answers, your score and your lecturer's comments"],
              ["Can", "what was right and the explanations, where your lecturer shows them"],
              ["Can’t", "see a quiz, exam or task you're still doing, or one you could still retake"],
              ["Can’t", "answer, submit or change anything in Kalami"],
              ["Can’t", "see other students, or anything your lecturer keeps hidden"],
            ].map(([verb, what]) => (
              <li key={what} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${verb === "Can" ? "bg-highlighter text-ink" : "bg-paper/15 text-paper"}`}
                >
                  {verb}
                </span>
                <span className="leading-relaxed text-paper/85">{what}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-paper/60">
            Finished means submitted and no retake left. Until then your assistant only sees that the work exists.
          </p>
        </section>

        <section className="rounded-[2rem] bg-card p-6 sm:p-8 lg:col-span-12">
          <StepHeading n={2} title="Then just ask" />
          <RevealGroup as="ul" stagger={0.06} className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <RevealItem as="li" kind="up" key={prompt} className="flex items-start gap-3 rounded-2xl bg-panel px-4 py-3 text-[15px] leading-relaxed">
                <Check className="mt-1 size-4 shrink-0 text-graphite" />
                <span>{prompt}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      </div>
    </div>
  );
}

function StepHeading({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-highlighter">{n}</span>
      <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
    </div>
  );
}
