"use client";

import { usePush, type PushState } from "./usePush";

const DESCRIPTION: Record<PushState, string> = {
  loading: "Checking this device…",
  insecure:
    "Notifications only work over a secure address (https). Open Kalami at its https address, not a plain http one, then turn this on.",
  unavailable: "Push isn't set up on this server yet (it has no notification keys).",
  unsupported:
    "This browser can't show notifications. Use Chrome on Android; on an iPhone, add Kalami to the Home Screen and open it from there.",
  "needs-install":
    "On an iPhone, add Kalami to your Home Screen first (the card on the dashboard shows how), then turn this on from there.",
  "no-worker":
    "Kalami's background worker couldn't start in this browser. Reload the page and try again; private browsing often blocks it.",
  blocked: "Blocked for Kalami in your browser's settings. Allow notifications there, then come back.",
  off: "A notification on this device when work is published or a deadline is near.",
  on: "On for this device.",
};

/** The "Notify this device" switch under the bell, with what the device can do. */
export function PushSettingView({
  state,
  busy = false,
  error,
  tested,
  onEnable,
  onDisable,
  onTest,
}: {
  state: PushState;
  busy?: boolean;
  error: string | null;
  tested: string | null;
  onEnable: () => void;
  onDisable: () => void;
  onTest: () => void;
}) {
  const switchable = state === "on" || state === "off";
  return (
    <div className="text-sm">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={state === "on"}
          disabled={!switchable || busy}
          onChange={(event) => (event.target.checked ? onEnable() : onDisable())}
          className="mt-0.5 size-4 shrink-0 accent-ink"
        />
        <span className="min-w-0">
          <span className="block font-medium">Notify this device</span>
          <span className="block text-xs leading-relaxed text-graphite">{busy ? "One moment…" : DESCRIPTION[state]}</span>
        </span>
      </label>
      {state === "on" && !busy && (
        <div className="mt-1.5 pl-7">
          <button
            type="button"
            onClick={onTest}
            className="text-xs font-medium underline underline-offset-4 hover:text-graphite focus-visible:outline-2 focus-visible:outline-ink"
          >
            Send a test notification
          </button>
          {tested && (
            <span role="status" className="mt-1 block text-xs text-ok">
              {tested}
            </span>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-1.5 pl-7 text-xs text-red-pen">
          {error}
        </p>
      )}
    </div>
  );
}

/** The switch wired to this device and the backend. */
export function PushSetting() {
  const push = usePush();
  return (
    <PushSettingView
      state={push.state}
      busy={push.busy}
      error={push.error}
      tested={push.tested}
      onEnable={() => void push.enable()}
      onDisable={() => void push.disable()}
      onTest={() => void push.test()}
    />
  );
}
