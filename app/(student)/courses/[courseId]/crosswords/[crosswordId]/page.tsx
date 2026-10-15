"use client";

import { useMutation, useQuery_experimental as useQueryState } from "convex/react";
import { ConvexError, type GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { CrosswordNotFound, CrosswordPuzzle } from "@/components/crossword-player/CrosswordPuzzle";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";
import { errorCode } from "@/lib/errors";

export default function CrosswordPage() {
  const params = useParams<{ courseId: string; crosswordId: string }>();
  const crosswordId = params.crosswordId as GenericId<"crosswords">;
  // Errors come back as values: a crossword the student can't see (NOT_FOUND) or a
  // malformed link gets a calm "not available" here instead of the error page.
  const result = useQueryState({ query: api.crosswords.read, args: { crosswordId } });
  const saveProgress = useMutation(api.crosswords.saveProgress);
  const reveal = useMutation(api.crosswords.reveal);

  if (result.status === "error") {
    const notFound = errorCode(result.error) === "NOT_FOUND" || !(result.error instanceof ConvexError);
    if (notFound) {
      return <CrosswordNotFound courseHref={`/courses/${params.courseId}`} />;
    }
    throw result.error;
  }
  if (result.status === "pending") {
    return <LoadingScreen label="Opening crossword" />;
  }
  return (
    <CrosswordPuzzle
      // A new version of the puzzle (the teacher changed the words) starts fresh.
      key={`${result.data._id}:${result.data.cells.length}:${result.data.width}x${result.data.height}`}
      puzzle={result.data}
      onSave={(letters, check) => saveProgress({ crosswordId, letters, check })}
      onReveal={(cells) => reveal({ crosswordId, cells })}
    />
  );
}
