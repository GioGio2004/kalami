"use client";

import type { ClipboardEvent, DragEvent } from "react";
import { Check } from "@/components/ui/icons";
import type { Answer, QuizQuestion, SavedValue } from "./types";

const ESSAY_LIMIT = 20_000;

/**
 * The answer field for one question that isn't code. Pasting and dropping text
 * are blocked and counted, like in the code editor (KALAMI.md §6.1).
 */
export function AnswerInput({
  question,
  value,
  disabled,
  onChange,
  onBlocked,
}: {
  question: QuizQuestion;
  value: SavedValue | undefined;
  disabled: boolean;
  onChange: (answer: Answer) => void;
  onBlocked: (event: "pasteBlocked" | "dropBlocked") => void;
}) {
  const blockPaste = (event: ClipboardEvent) => {
    event.preventDefault();
    onBlocked("pasteBlocked");
  };
  const blockDrop = (event: DragEvent) => {
    event.preventDefault();
    onBlocked("dropBlocked");
  };

  switch (question.type) {
    case "single":
    case "multiple": {
      const multiple = question.type === "multiple";
      const chosen = new Set(
        value?.type === "single" ? [value.optionId] : value?.type === "multiple" ? value.optionIds : [],
      );
      return (
        <fieldset disabled={disabled}>
          <legend className="sr-only">{multiple ? "Pick every right answer" : "Pick one answer"}</legend>
          <p className="mb-3 text-sm text-graphite">{multiple ? "Pick every right answer." : "Pick one."}</p>
          <ul className="space-y-2">
            {(question.options ?? []).map((option) => {
              const on = chosen.has(option.id);
              return (
                <li key={option.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 text-[15px] transition has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink ${
                      on ? "border-ink bg-highlighter/40" : "border-line bg-card hover:border-ink/30"
                    }`}
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={question._id}
                      checked={on}
                      onChange={() => {
                        if (!multiple) {
                          onChange({ type: "single", optionId: option.id });
                          return;
                        }
                        const next = new Set(chosen);
                        if (on) next.delete(option.id);
                        else next.add(option.id);
                        // Keep the options' order, whatever order they were clicked in.
                        onChange({
                          type: "multiple",
                          optionIds: (question.options ?? []).map((o) => o.id).filter((id) => next.has(id)),
                        });
                      }}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center border-[1.5px] ${
                        multiple ? "rounded-md" : "rounded-full"
                      } ${on ? "border-ink bg-ink text-paper" : "border-graphite/50"}`}
                    >
                      {on && (multiple ? <Check className="size-3.5" /> : <span className="size-2 rounded-full bg-paper" />)}
                    </span>
                    <span className="min-w-0 whitespace-pre-wrap break-words">{option.text}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      );
    }
    case "short":
      return (
        <label className="block">
          <span className="mb-2 block text-sm text-graphite">Your answer</span>
          <input
            type="text"
            value={value?.type === "short" ? value.text : ""}
            maxLength={500}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => onChange({ type: "short", text: event.target.value })}
            onPaste={blockPaste}
            onDrop={blockDrop}
            className="h-13 w-full rounded-2xl border border-line bg-card px-4 text-[15px] outline-none transition focus:border-ink disabled:opacity-60"
          />
        </label>
      );
    case "essay": {
      const text = value?.type === "essay" ? value.text : "";
      return (
        <label className="block">
          <span className="mb-2 flex items-baseline justify-between text-sm text-graphite">
            Your answer
            <span className="tabular-nums">{text.length > ESSAY_LIMIT * 0.9 ? `${text.length} / ${ESSAY_LIMIT}` : ""}</span>
          </span>
          <textarea
            value={text}
            maxLength={ESSAY_LIMIT}
            disabled={disabled}
            spellCheck={false}
            onChange={(event) => onChange({ type: "essay", text: event.target.value })}
            onPaste={blockPaste}
            onDrop={blockDrop}
            className="min-h-64 w-full resize-y rounded-2xl border border-line bg-card px-4 py-3 text-[15px] leading-relaxed outline-none transition focus:border-ink disabled:opacity-60"
          />
        </label>
      );
    }
    case "code":
      return null;
  }
}
