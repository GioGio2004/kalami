import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { StudentGate } from "@/components/StudentGate";
import { PillHeader } from "@/components/ui/PillHeader";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <StudentGate>
      <PillHeader
        homeHref="/dashboard"
        links={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/honesty", label: "Honesty" },
        ]}
        actions={<UserButton />}
      />
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-3 pb-10 pt-5 sm:px-6">{children}</main>
    </StudentGate>
  );
}
