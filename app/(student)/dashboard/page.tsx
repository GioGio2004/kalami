"use client";

import { useMutation, useQuery } from "convex/react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import type { UseCourse } from "@/components/dashboard/CourseCard";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { api } from "@/convex-api/api";

/** A course's work loads only when its card is opened. */
const useCourse: UseCourse = (courseId) => useQuery(api.learn.course, { courseId });

export default function DashboardPage() {
  const current = useCurrentUser();
  const ready = current.status === "ready";
  const courses = useQuery(api.learn.myCourses, ready ? {} : "skip");
  const upNext = useQuery(api.learn.upNext, ready ? {} : "skip");
  const join = useMutation(api.learn.join);
  // StudentGate only renders this page for onboarded students.
  if (!ready) {
    return null;
  }
  return (
    <DashboardView
      me={current.me}
      courses={courses}
      upNext={upNext}
      onJoin={(code) => join({ code })}
      useCourse={useCourse}
    />
  );
}
