"use client";

import { useQuery_experimental as useQueryState } from "convex/react";
import { ConvexError, type GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { PresentationNotFound, PresentationView } from "@/components/presentations-reader/PresentationView";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";
import { errorCode } from "@/lib/errors";

export default function PresentationPage() {
  const params = useParams<{ courseId: string; presentationId: string }>();
  // Errors come back as values: a presentation the student can't see (NOT_FOUND) or a
  // malformed link gets a calm "not available" here instead of the error page.
  const result = useQueryState({
    query: api.presentations.read,
    args: { presentationId: params.presentationId as GenericId<"presentations"> },
  });

  if (result.status === "error") {
    const notFound = errorCode(result.error) === "NOT_FOUND" || !(result.error instanceof ConvexError);
    if (notFound) {
      return <PresentationNotFound courseHref={`/courses/${params.courseId}`} />;
    }
    // Anything else is unexpected: let the student error page handle it.
    throw result.error;
  }
  if (result.status === "pending") {
    return <LoadingScreen label="Opening presentation" />;
  }
  return <PresentationView presentation={result.data} />;
}
