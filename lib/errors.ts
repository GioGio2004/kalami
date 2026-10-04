import { ConvexError } from "convex/values";

/** Human-readable message from a failed Convex call (see convex/lib/errors.ts). */
export function errorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    const data: unknown = error.data;
    if (typeof data === "string") {
      return data;
    }
    if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}

/** The backend's own code for the failure (`CONFLICT`, `RATE_LIMITED`…), if it sent one. */
export function errorCode(error: unknown): string | undefined {
  if (error instanceof ConvexError && typeof error.data === "object" && error.data !== null && "code" in error.data) {
    const code = (error.data as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

/** How long a rate-limited call asked us to wait before trying again. */
export function retryAfterMs(error: unknown): number | undefined {
  if (error instanceof ConvexError && typeof error.data === "object" && error.data !== null && "retryAfterMs" in error.data) {
    const value = (error.data as { retryAfterMs?: unknown }).retryAfterMs;
    return typeof value === "number" && value > 0 ? value : undefined;
  }
  return undefined;
}
