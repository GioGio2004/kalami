import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { StudentGate } from "@/components/StudentGate";
import { StudentNav } from "@/components/StudentNav";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <StudentGate>
      <OfflineBanner />
      <StudentNav
        actions={
          <>
            <NotificationBell />
            <UserButton />
          </>
        }
      />
      {/* The bottom padding keeps clear of the home indicator in the installed app. */}
      <main id="student-content" tabIndex={-1} className="mx-auto w-full max-w-[88rem] flex-1 px-3 pb-[max(2.5rem,calc(1.25rem+env(safe-area-inset-bottom)))] pt-5 sm:px-6">
        {children}
      </main>
    </StudentGate>
  );
}
