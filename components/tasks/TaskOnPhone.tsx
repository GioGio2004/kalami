import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { ArrowLeft } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";
import { ComputerOnly } from "./ComputerOnly";

type Task = FunctionReturnType<typeof api.learn.task>;

/** A code task opened on a phone or tablet: where it stands, and where to do it. */
export function TaskOnPhone({ task }: { task: Task }) {
  const { attempt } = task;
  return (
    <div className="rounded-[2.4rem] bg-panel px-4 pb-4 pt-7">
      <Link href={`/courses/${task.course._id}`} className="inline-flex items-center gap-1.5 text-sm text-graphite hover:text-ink">
        <ArrowLeft className="size-4" />
        {task.course.title}
      </Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-graphite">Code task</p>
      <h1 className="mt-1 text-3xl font-medium leading-tight tracking-[-0.03em]">{task.assessment.title}</h1>
      {attempt?.status === "submitted" ? (
        <p className="mt-3 text-[15px] text-ink">
          Submitted
          {attempt.score !== undefined && (
            <>
              {" · "}
              <span className="font-semibold tabular-nums">{attempt.score}</span> / {attempt.maxScore} points
            </>
          )}
        </p>
      ) : (
        <p className="mt-3 text-[15px] text-graphite">
          {attempt ? "In progress. Your work is saved." : "Not started yet."}
          {task.assessment.closesAt &&
            ` Due ${new Date(task.assessment.closesAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.`}
        </p>
      )}
      {attempt?.feedback && <p className="mt-3 font-hand text-2xl leading-tight text-red-pen">“{attempt.feedback}”</p>}
      <div className="mt-6">
        <ComputerOnly>
          {attempt?.status === "submitted"
            ? "Your code, the checks and your lecturer’s notes open on a computer."
            : "Coding needs a keyboard and room for the editor and the preview. Open Kalami on a computer to start or continue; anything you already wrote is waiting there."}
        </ComputerOnly>
      </div>
    </div>
  );
}
