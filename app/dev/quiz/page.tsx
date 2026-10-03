import { notFound } from "next/navigation";
import { QuizDemo } from "@/components/dev/QuizDemo";

/** The quiz player with sample questions and no backend. Development only. */
export default function DevQuizPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <QuizDemo />;
}
