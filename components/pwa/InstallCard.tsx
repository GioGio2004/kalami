"use client";

import { useState } from "react";
import { KalamiMark } from "@/components/Logo";
import { Button } from "@/components/ui/buttons";
import { dismissInstall, installDismissed, isIos } from "@/lib/pwa";
import { useInstallPrompt, useStandalone } from "./usePwa";

export type InstallPlatform = "chrome" | "ios";

/** The iOS share icon: a box with an arrow out of its top. */
function ShareIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M8 7l4-4 4 4M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
    </svg>
  );
}

/**
 * "Install Kalami": on Android and desktop Chrome a real button (the browser's
 * install dialog); on iPhone and iPad the three taps Safari needs, since there
 * is no API. Notifications on iPhone only work from the Home Screen app, which
 * is why the card is worth a moment.
 */
export function InstallCardView({
  platform,
  busy = false,
  onInstall,
  onDismiss,
}: {
  platform: InstallPlatform;
  busy?: boolean;
  onInstall?: () => void;
  onDismiss: () => void;
}) {
  return (
    <section
      aria-label="Install Kalami"
      className="notch-sides rounded-[1.8rem] bg-charcoal px-5 py-5 text-paper [--notch-y:50%] sm:rounded-[2rem] sm:px-7 sm:py-6"
    >
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-[0.9rem] bg-paper/10">
          <KalamiMark className="size-8" />
        </span>
        <div className="min-w-0 flex-1 basis-60">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-highlighter">
            {platform === "ios" ? "On your iPhone" : "Kalami as an app"}
          </p>
          <h2 className="mt-1 text-xl font-medium leading-snug tracking-tight sm:text-2xl">
            {platform === "ios" ? "Add Kalami to your Home Screen" : "Install Kalami"}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-paper/70">
            {platform === "ios"
              ? "Opens full screen like an app, and it's the only way to get notifications about new work and deadlines on an iPhone."
              : "Opens from your home screen, full screen, with notifications about new work and deadlines."}
          </p>
          {platform === "ios" && (
            <ol className="mt-4 space-y-2.5 text-sm">
              {[
                <>
                  Tap <ShareIcon className="mx-1 inline size-4 align-[-3px]" /> <strong>Share</strong> at the bottom of Safari.
                </>,
                <>
                  Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>.
                </>,
                <>Open Kalami from your home screen and turn notifications on under the bell.</>,
              ].map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-highlighter text-xs font-semibold text-ink">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed text-paper/90">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 sm:pl-16">
        {platform === "chrome" && (
          <Button variant="lime" disabled={busy} onClick={onInstall}>
            {busy ? "Opening…" : "Install"}
          </Button>
        )}
        <Button variant="ghost" className="text-paper/80 hover:bg-paper/10 hover:text-paper" onClick={onDismiss}>
          {platform === "ios" ? "Got it" : "Not now"}
        </Button>
      </div>
    </section>
  );
}

/** The card as the dashboard shows it: only in a browser tab, only where installing makes sense, until dismissed. */
export function InstallCard() {
  const standalone = useStandalone();
  const { state, prompt } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => installDismissed());
  const [busy, setBusy] = useState(false);
  const [ios] = useState(() => isIos());

  if (standalone || dismissed || state === "installed") return null;

  function dismiss() {
    dismissInstall();
    setDismissed(true);
  }

  if (state === "prompt") {
    return (
      <InstallCardView
        platform="chrome"
        busy={busy}
        onInstall={async () => {
          setBusy(true);
          const outcome = await prompt();
          setBusy(false);
          if (outcome === "dismissed") dismiss();
        }}
        onDismiss={dismiss}
      />
    );
  }
  if (ios) return <InstallCardView platform="ios" onDismiss={dismiss} />;
  return null;
}
