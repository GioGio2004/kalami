"use client";

import { useQuery_experimental as useQueryState } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type { GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { TaskOnPhone } from "@/components/tasks/TaskOnPhone";
import { TaskView } from "@/components/tasks/TaskView";
import { isUnavailable, NotAvailable } from "@/components/ui/NotAvailable";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";
import { errorCode, errorMessage } from "@/lib/errors";
import { useIsMobile } from "@/lib/useDevice";

type Work = FunctionReturnType<typeof api.learn.taskWork>;

export default function TaskPage() {
  const params = useParams<{ assessmentId: string }>();
  const assessmentId = params.assessmentId as GenericId<"assessments">;
  // Errors come back as values: a task the student can't open gets a calm screen, not the error page.
  const task = useQueryState({ query: api.learn.task, args: { assessmentId } });
  const current = useCurrentUser();
  const mobile = useIsMobile();
  // The saved work is read once: every autosave would otherwise send all of it back.
  const [work, setWork] = useState<Work | undefined>(undefined);
  const live = useQueryState({
    query: api.learn.taskWork,
    args: work === undefined && !mobile ? { assessmentId } : "skip",
  });
  if (work === undefined && live.status === "success") {
    setWork(live.data);
  }

  const failed = task.status === "error" ? task.error : live.status === "error" ? live.error : null;
  if (failed !== null) {
    if (isUnavailable(failed)) {
      return (
        <NotAvailable title="This task isn't available">
          It may not be published yet, your lecturer may have taken it down, or the link is wrong. If you expected
          to see it here, ask your lecturer.
        </NotAvailable>
      );
    }
    if (errorCode(failed) === "CONFLICT") {
      // Not open yet: the course page shows when it opens.
      return (
        <NotAvailable title="This task isn't open yet" note="Soon" backHref="/dashboard">
          {errorMessage(failed)} Come back once it opens; your course page shows when that is.
        </NotAvailable>
      );
    }
    throw failed;
  }
  if (task.status !== "success" || current.status !== "ready") {
    return <LoadingScreen label="Opening task" />;
  }
  // Code tasks stay on computers for now; the editor isn't mounted at all on phones.
  if (mobile) {
    return <TaskOnPhone task={task.data} />;
  }
  if (work === undefined) {
    return <LoadingScreen label="Opening task" />;
  }
  const name = [current.me.firstName, current.me.lastName].filter(Boolean).join(" ") || current.me.email;
  return <TaskView task={task.data} work={work} studentName={name} locale={current.me.locale} />;
}
