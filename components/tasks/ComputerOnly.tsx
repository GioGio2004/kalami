import type { ReactNode } from "react";
import { Monitor } from "@/components/ui/icons";

/** In place of the code editor on phones and tablets: code tasks need a computer for now. */
export function ComputerOnly({ title = "Open this on a computer", children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="rounded-[1.6rem] border-2 border-dashed border-line bg-card p-6 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-panel">
        <Monitor className="size-5" />
      </span>
      <h2 className="mt-4 text-xl font-medium tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-graphite">
        {children ?? "Coding needs a keyboard and room for the editor and the preview, so code tasks only open on a computer."}
      </p>
    </div>
  );
}
