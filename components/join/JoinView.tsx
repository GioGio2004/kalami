"use client";

import { SignOutButton } from "@clerk/nextjs";
import type { FunctionReturnType } from "convex/server";
import { useRouter } from "next/navigation";
import { Fragment, useState, type ReactNode } from "react";
import type { CurrentUser, Me } from "@/components/CurrentUserProvider";
import { ArrowButton, ArrowLink, ButtonLink, buttonClass } from "@/components/ui/buttons";
import { FormError } from "@/components/ui/form";
import { Mail, Notebook, Users } from "@/components/ui/icons";
import { LoadingScreen, StatusScreen, WritingDots } from "@/components/ui/StatusScreen";
import type { api } from "@/convex-api/api";
import { errorMessage } from "@/lib/errors";
import { STAFF_APP_URL, onboardingUrlFor, signInUrlFor, signUpUrlFor } from "@/lib/urls";

type LinkPreview = NonNullable<FunctionReturnType<typeof api.groups.preview>>;
type EmailPreview = NonNullable<FunctionReturnType<typeof api.groups.previewEmailInvite>>;
/** What a join page knows about its invite. A shared group link has no email, status or expiry. */
export type JoinInvite = LinkPreview & Partial<Pick<EmailPreview, "email" | "status" | "expiresAt">>;

const isStaffOnly = (me: Me) => me.isStaff && !me.isSuperAdmin;
const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/**
 * The page a group invite opens: the shared link (`/join/<code>`) or a personal
 * email invite (`/join/invite/<token>`). Works signed out; every account state
 * gets its own next step. `invite` is undefined while loading and null for a
 * dead link. The page wires the queries; the dev gallery passes samples.
 */
export function JoinView({
  kind,
  invite,
  viewer,
  path,
  now,
  onAccept,
  doneHref = "/dashboard",
  header,
}: {
  kind: "link" | "email";
  invite: JoinInvite | null | undefined;
  viewer: CurrentUser;
  /** This page, for coming back after sign-in, sign-up, onboarding or sign-out. */
  path: string;
  /** When the page opened; email invites past `expiresAt` show as expired. */
  now: number;
  onAccept: () => Promise<unknown>;
  /** Where a successful join goes. */
  doneHref?: string;
  header?: ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const me = viewer.status === "ready" ? viewer.me : null;
  const onboarded = me !== null && !me.needsOnboarding && !isStaffOnly(me);
  const home = onboarded
    ? { href: "/dashboard", label: "Go to dashboard" }
    : { href: "/", label: "Go to Kalami home" };

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      await onAccept();
      router.push(doneHref);
    } catch (caught) {
      setError(errorMessage(caught));
      setBusy(false);
    }
  }

  let screen: ReactNode;
  if (invite === undefined) {
    screen = <LoadingScreen label="Opening your invite" />;
  } else if (invite === null || invite.status === "revoked") {
    screen = (
      <StatusScreen note="Hmm, that didn't work" title={`This invite ${kind === "link" ? "link " : ""}doesn't work any more`}>
        <p>Ask your teacher for a new one.</p>
        <Actions>
          <ButtonLink href={home.href} variant="outline">
            {home.label}
          </ButtonLink>
        </Actions>
      </StatusScreen>
    );
  } else if (invite.alreadyMember && !busy) {
    // (While a join is in flight the preview flips to member; stay put until we navigate.)
    screen = (
      <StatusScreen note="Good news" title={`You're already in ${invite.groupName}`}>
        <InviteTicket invite={invite} />
        <p>Its courses are waiting on your dashboard.</p>
        <Actions>
          <ArrowLink href="/dashboard">Go to dashboard</ArrowLink>
        </Actions>
      </StatusScreen>
    );
  } else if (invite.status === "accepted" && !busy) {
    screen = (
      <StatusScreen note="Already used" title="This invite has been accepted">
        <InviteTicket invite={invite} />
        {me === null ? (
          <>
            <p>
              If that was you, sign in with <Email address={invite.email} /> to see your group.
            </p>
            <Actions>
              <ArrowLink href={signInUrlFor(path)}>Sign in</ArrowLink>
            </Actions>
          </>
        ) : (
          <>
            <p>
              It was accepted from another account. If that was you, sign in with{" "}
              <Email address={invite.email} />. Otherwise, ask your teacher for the group link.
            </p>
            <Actions>
              <SignOutButton redirectUrl={path}>
                <button type="button" className={buttonClass("ink")}>
                  Sign out
                </button>
              </SignOutButton>
              <ButtonLink href={home.href} variant="outline">
                {home.label}
              </ButtonLink>
            </Actions>
          </>
        )}
      </StatusScreen>
    );
  } else if (invite.expiresAt !== undefined && invite.expiresAt < now) {
    screen = (
      <StatusScreen note="Missed it by a bit" title="This invite has expired">
        <InviteTicket invite={invite} />
        <p>Ask your teacher to send it again, or to share the group link with you.</p>
        <Actions>
          <ButtonLink href={home.href} variant="outline">
            {home.label}
          </ButtonLink>
        </Actions>
      </StatusScreen>
    );
  } else {
    screen = (
      <StatusScreen note="You're invited!" title={`Join ${invite.groupName}`}>
        <InviteTicket invite={invite} />
        <NextStep
          kind={kind}
          invite={invite}
          viewer={viewer}
          path={path}
          home={home}
          busy={busy}
          error={error}
          onAccept={accept}
        />
      </StatusScreen>
    );
  }

  return (
    <>
      {header}
      {screen}
    </>
  );
}

/** Under the ticket of a live invite: what this viewer can do about it. */
function NextStep({
  kind,
  invite,
  viewer,
  path,
  home,
  busy,
  error,
  onAccept,
}: {
  kind: "link" | "email";
  invite: JoinInvite;
  viewer: CurrentUser;
  path: string;
  home: { href: string; label: string };
  busy: boolean;
  error: string | null;
  onAccept: () => void;
}) {
  switch (viewer.status) {
    case "loading":
      return (
        <div>
          <WritingDots label="Checking your account" />
        </div>
      );
    case "error":
      return <FormError>{viewer.message}</FormError>;
    case "signed-out":
      return (
        <>
          {invite.email ? (
            <p>
              Create a free account or sign in with <Email address={invite.email} />. The invite only works
              for that address.
            </p>
          ) : (
            <p>Create a free Kalami account, or sign in, to join the group.</p>
          )}
          <Actions>
            <ArrowLink href={signUpUrlFor(path)}>Create account</ArrowLink>
            <ButtonLink href={signInUrlFor(path)} variant="outline">
              Sign in
            </ButtonLink>
          </Actions>
        </>
      );
  }

  const me = viewer.me;
  if (isStaffOnly(me)) {
    return (
      <>
        <p>
          You&apos;re signed in as <Email address={me.email} />, a lecturer or admin account. Staff
          accounts can&apos;t join groups as students.
        </p>
        <Actions>
          <a href={STAFF_APP_URL} className={buttonClass("ink")}>
            Open Kalami AntiCheat
          </a>
          <SignOutButton redirectUrl={path}>
            <button type="button" className={buttonClass("outline")}>
              Sign out
            </button>
          </SignOutButton>
        </Actions>
      </>
    );
  }

  // The server only accepts a personal invite from the invited address: say so before they try.
  if (invite.email && !sameEmail(invite.email, me.email)) {
    return (
      <>
        <p role="status" className="flex items-start gap-2.5 rounded-2xl bg-warn/15 px-4 py-3 text-sm text-ink">
          <Mail className="mt-0.5 size-4 shrink-0" />
          <span>
            This invite is for <Email address={invite.email} />, but you&apos;re signed in as{" "}
            <Email address={me.email} />.
          </span>
        </p>
        <p>
          Sign out and sign back in with that address, or ask your teacher for the group link
          instead.
        </p>
        <Actions>
          <SignOutButton redirectUrl={path}>
            <button type="button" className={buttonClass("ink")}>
              Sign out
            </button>
          </SignOutButton>
          {home.href === "/dashboard" && (
            <ButtonLink href={home.href} variant="outline">
              {home.label}
            </ButtonLink>
          )}
        </Actions>
      </>
    );
  }

  if (me.needsOnboarding) {
    return (
      <>
        <p>One quick step first: set up your notebook. It takes about a minute, then you come right back here.</p>
        <Actions>
          <ArrowLink href={onboardingUrlFor(path)}>Set up my account</ArrowLink>
        </Actions>
      </>
    );
  }

  return (
    <>
      <p>
        {invite.courseCount > 0
          ? `The group's ${plural(invite.courseCount, "course")} will show up on your dashboard straight away.`
          : "Courses your teacher shares with the group will show up on your dashboard."}
      </p>
      {error && <FormError>{error}</FormError>}
      <Actions>
        <ArrowButton tone="lime" onClick={onAccept} disabled={busy}>
          {busy ? "Joining…" : kind === "email" ? "Accept invite" : "Join group"}
        </ArrowButton>
      </Actions>
    </>
  );
}

/** Who sent it, what comes with it and, for a personal invite, who it is for. */
function InviteTicket({ invite }: { invite: JoinInvite }) {
  return (
    <ul className="notch-sides space-y-3 rounded-[1.6rem] bg-card px-5 py-4 text-ink [--notch-y:50%]">
      <TicketRow icon={<Users className="size-5" />} label="Invited by">
        {invite.teacher}
      </TicketRow>
      {invite.courseCount > 0 && (
        <TicketRow icon={<Notebook className="size-5" />} label="Comes with">
          {plural(invite.courseCount, "course")}
        </TicketRow>
      )}
      {invite.email && (
        <TicketRow icon={<Mail className="size-5" />} label="Sent to">
          <Email address={invite.email} />
        </TicketRow>
      )}
    </ul>
  );
}

function TicketRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-panel">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs text-graphite">{label}</span>
        <span className="block font-medium leading-snug">{children}</span>
      </span>
    </li>
  );
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

/** An email address that wraps after its dots or before the @, not mid-word. */
function Email({ address = "" }: { address?: string }) {
  const parts: string[] = [];
  let part = "";
  for (const char of address) {
    if (char === "@" && part) {
      parts.push(part);
      part = "";
    }
    part += char;
    if (char === ".") {
      parts.push(part);
      part = "";
    }
  }
  if (part) parts.push(part);
  return (
    <strong className="font-medium text-ink [overflow-wrap:anywhere]">
      {parts.map((piece, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          {piece}
        </Fragment>
      ))}
    </strong>
  );
}
