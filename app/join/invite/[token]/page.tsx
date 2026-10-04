"use client";

import { UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { JoinView } from "@/components/join/JoinView";
import { PillHeader } from "@/components/ui/PillHeader";
import { api } from "@/convex-api/api";

/** The page a personal invite email opens. Public, like the group link. */
export default function EmailInvitePage() {
  const { token } = useParams<{ token: string }>();
  const path = usePathname();
  const viewer = useCurrentUser();
  const invite = useQuery(api.groups.previewEmailInvite, { token });
  const accept = useMutation(api.groups.acceptEmailInvite);
  const [now] = useState(() => Date.now());
  return (
    <JoinView
      kind="email"
      invite={invite}
      viewer={viewer}
      path={path}
      now={now}
      onAccept={() => accept({ token })}
      header={<PillHeader homeHref="/" actions={<UserButton />} />}
    />
  );
}
