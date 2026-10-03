import { notFound } from "next/navigation";
import { SandboxDemo } from "@/components/dev/SandboxDemo";

/** The code sandbox with a sample task and no backend. Development only. */
export default function DevSandboxPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <SandboxDemo />;
}
