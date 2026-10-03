"use client";

import { useQuery } from "convex/react";
import type { GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { TaskView } from "@/components/tasks/TaskView";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";

export default function TaskPage() {
  const params = useParams<{ assessmentId: string }>();
  const task = useQuery(api.learn.task, { assessmentId: params.assessmentId as GenericId<"assessments"> });
  const current = useCurrentUser();
  if (task === undefined || current.status !== "ready") {
    return <LoadingScreen label="Opening task" />;
  }
  const name = [current.me.firstName, current.me.lastName].filter(Boolean).join(" ") || current.me.email;
  return <TaskView task={task} studentName={name} locale={current.me.locale} />;
}
