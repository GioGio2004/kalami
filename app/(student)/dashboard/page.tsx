"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import type { UseCourse } from "@/components/dashboard/CourseCard";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { InstallCard } from "@/components/pwa/InstallCard";
import { api } from "@/convex-api/api";

/** A course's work loads only when its card is opened. */
const useCourse: UseCourse = (courseId) => useQuery(api.learn.course, { courseId });

export default function DashboardPage() {
  const current = useCurrentUser();
  const ready = current.status === "ready";
  const courses = useQuery(api.learn.myCourses, ready ? {} : "skip");
  const upNext = useQuery(api.learn.upNext, ready ? {} : "skip");
  const invites = useQuery(api.groups.myInvites, ready ? {} : "skip");
  const groups = useQuery(api.groups.mine, ready ? {} : "skip");
  const join = useMutation(api.learn.join);
  const acceptInvite = useMutation(api.groups.acceptEmailInvite);
  const leaveGroup = useMutation(api.groups.leave);
  // The server lists expired invites too; they are ours to hide.
  const [now] = useState(() => Date.now());
  // StudentGate only renders this page for onboarded students.
  if (!ready) {
    return null;
  }
  return (
    <DashboardView
      me={current.me}
      courses={courses}
      upNext={upNext}
      invites={invites?.filter((invite) => invite.expiresAt > now)}
      groups={groups}
      onJoin={(code) => join({ code })}
      onAcceptInvite={(token) => acceptInvite({ token })}
      onLeaveGroup={(groupId) => leaveGroup({ groupId })}
      useCourse={useCourse}
      install={<InstallCard />}
    />
  );
}
