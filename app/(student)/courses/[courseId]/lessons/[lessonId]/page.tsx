"use client";

import { useQuery_experimental as useQueryState } from "convex/react";
import { ConvexError, type GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { LessonNotFound, LessonView } from "@/components/lessons-reader/LessonView";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";
import { errorCode } from "@/lib/errors";

export default function LessonPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  // Errors come back as values: a lesson the student can't see (NOT_FOUND) or a
  // malformed link gets a calm "not available" here instead of the error page.
  const result = useQueryState({
    query: api.lessons.read,
    args: { lessonId: params.lessonId as GenericId<"lessons"> },
  });

  if (result.status === "error") {
    const notFound = errorCode(result.error) === "NOT_FOUND" || !(result.error instanceof ConvexError);
    if (notFound) {
      return <LessonNotFound courseHref={`/courses/${params.courseId}`} />;
    }
    // Anything else is unexpected: let the student error page handle it.
    throw result.error;
  }
  if (result.status === "pending") {
    return <LoadingScreen label="Opening lesson" />;
  }
  return <LessonView lesson={result.data} />;
}
