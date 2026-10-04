import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { StudentGate } from "@/components/StudentGate";
import { StudentNav } from "@/components/StudentNav";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <StudentGate>
      <StudentNav
        actions={
          <>
            <NotificationBell />
            <UserButton />
          </>
        }
      />
      <main className="mx-auto w-full max-w-[88rem] flex-1 px-3 pb-10 pt-5 sm:px-6">{children}</main>
    </StudentGate>
  );
}
