"use client";

import { UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { JoinView } from "@/components/join/JoinView";
import { PillHeader } from "@/components/ui/PillHeader";
import { api } from "@/convex-api/api";

/** A group's shared invite link. Public: people open it before they have an account. */
export default function JoinGroupPage() {
  const { code } = useParams<{ code: string }>();
  const path = usePathname();
  const viewer = useCurrentUser();
  const invite = useQuery(api.groups.preview, { code });
  const join = useMutation(api.groups.join);
  const [now] = useState(() => Date.now());
  return (
    <JoinView
      kind="link"
      invite={invite}
      viewer={viewer}
      path={path}
      now={now}
      onAccept={() => join({ code })}
      header={<PillHeader homeHref="/" actions={<UserButton />} />}
    />
  );
}
