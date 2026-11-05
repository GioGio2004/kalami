"use client";

import { useQuery_experimental as useQueryState } from "convex/react";
import type { GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { CourseView } from "@/components/courses/CourseView";
import { isUnavailable, NotAvailable } from "@/components/ui/NotAvailable";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";

export default function CoursePage() {
  const params = useParams<{ courseId: string }>();
  // Errors come back as values: a course the student isn't in (any more) gets a calm screen.
  const course = useQueryState({ query: api.learn.course, args: { courseId: params.courseId as GenericId<"courses"> } });
  if (course.status === "error") {
    if (isUnavailable(course.error)) {
      return (
        <NotAvailable title="This course isn't available">
          You may not have joined it, it may not be published yet, or the link is wrong. Your other courses are on
          your dashboard.
        </NotAvailable>
      );
    }
    throw course.error;
  }
  if (course.status !== "success") {
    return <LoadingScreen label="Opening course" />;
  }
  return <CourseView course={course.data} />;
}
