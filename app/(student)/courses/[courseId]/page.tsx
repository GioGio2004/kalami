"use client";

import { useQuery } from "convex/react";
import type { GenericId } from "convex/values";
import { useParams } from "next/navigation";
import { CourseView } from "@/components/courses/CourseView";
import { LoadingScreen } from "@/components/ui/StatusScreen";
import { api } from "@/convex-api/api";

export default function CoursePage() {
  const params = useParams<{ courseId: string }>();
  const course = useQuery(api.learn.course, { courseId: params.courseId as GenericId<"courses"> });
  if (course === undefined) {
    return <LoadingScreen label="Opening course" />;
  }
  return <CourseView course={course} />;
}
