const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Tue 6 Oct, 18:00" in the device's own time zone. */
export function formatWhen(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "6 Oct, 18:00": for one-line summaries, where the weekday wouldn't fit. */
export function formatShort(ms: number): string {
  return new Date(ms).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });
}

/** "just now", "5 minutes ago", "in 2 hours", "yesterday"; the full date past a week. */
export function relativeTime(ms: number, now: number): string {
  const diff = ms - now;
  const abs = Math.abs(diff);
  if (abs < MINUTE) return "just now";
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < HOUR) return format.format(Math.round(diff / MINUTE), "minute");
  if (abs < DAY) return format.format(Math.round(diff / HOUR), "hour");
  if (abs < 7 * DAY) return format.format(Math.round(diff / DAY), "day");
  return formatWhen(ms);
}

/** Time until a deadline, for chips: "40 min left", "2 h left", "3 days left"; "closed" once past. */
export function timeLeft(closesAt: number, now: number): string {
  const diff = closesAt - now;
  if (diff <= 0) return "closed";
  if (diff < HOUR) return `${Math.max(1, Math.round(diff / MINUTE))} min left`;
  if (diff < DAY) return `${Math.round(diff / HOUR)} h left`;
  const days = Math.round(diff / DAY);
  return `${days} day${days === 1 ? "" : "s"} left`;
}
