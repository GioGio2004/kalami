"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Cross } from "@/components/ui/icons";

/**
 * A modal on the native <dialog> element: focus trapping, Escape and the
 * backdrop come for free. Styled as a paper card floating over dimmed ink.
 * With `sheet`, phones get it as a sheet from the bottom of the screen.
 *
 * The children fill a column as tall as the screen allows: give the part that
 * should scroll `min-h-0 flex-1 overflow-y-auto`. (Same approach as the staff
 * app's Dialog, plus the sheet and the scrolling column.)
 */
export function Dialog({
  open,
  onClose,
  label,
  size = "md",
  sheet = false,
  closeLabel = "Close",
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Accessible name; the visible title lives in the children. */
  label: string;
  size?: "md" | "lg";
  sheet?: boolean;
  closeLabel?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // Where the current click started. A text selection dragged out of a field and
  // released over the backdrop also fires `click` on the dialog, and must not close it.
  const pressedOnBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // The page behind stays still while the dialog is open (phones scroll it otherwise).
  useEffect(() => {
    if (!open) {
      return;
    }
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  const width = size === "lg" ? "max-w-4xl" : "max-w-2xl";
  const sheetClass = sheet
    ? "max-sm:mb-0 max-sm:max-h-[calc(100dvh-0.75rem)] max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:starting:open:translate-y-16"
    : "";

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onPointerDown={(event) => {
        // Clicks on the backdrop land on the dialog element itself.
        pressedOnBackdrop.current = event.target === ref.current;
      }}
      onClick={(event) => {
        if (pressedOnBackdrop.current && event.target === ref.current) {
          onClose();
        }
        pressedOnBackdrop.current = false;
      }}
      className={`m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] ${width} overflow-hidden rounded-[2.25rem] bg-paper p-0 text-ink shadow-2xl shadow-ink/30 transition-[opacity,translate] duration-300 ease-out backdrop:bg-ink/45 backdrop:backdrop-blur-[2px] starting:open:translate-y-6 starting:open:opacity-0 motion-reduce:transition-none ${sheetClass}`}
    >
      {open && (
        <div className="relative flex max-h-[inherit] flex-col">
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-panel text-graphite transition hover:bg-panel-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <Cross className="size-4" />
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}
