import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { STAFF_APP_URL } from "@/lib/urls";

export function Footer() {
  return (
    <footer className="bg-charcoal px-4 pb-8 pt-14 text-paper sm:px-6">
      <Reveal amount={0.1} className="mx-auto max-w-[76rem]">
        <div className="flex flex-col gap-8 border-b border-paper/10 pb-10 md:flex-row md:items-center">
          <Logo tone="paper" />
          <span className="hidden h-8 border-l border-paper/15 md:block" />
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[15px] text-paper/60">
            <a href="#inside" className="hover:text-paper">
              What&apos;s inside
            </a>
            <a href="#honesty" className="hover:text-paper">
              How it stays honest
            </a>
            <a href="#levels" className="hover:text-paper">
              Integrity levels
            </a>
            <a href="#privacy" className="hover:text-paper">
              Privacy
            </a>
            <a href={STAFF_APP_URL} className="hover:text-paper">
              For lecturers
            </a>
            <Link href="/sign-in" className="hover:text-paper">
              Sign in
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-sm text-paper/45 sm:flex-row sm:justify-between">
          <p>© 2026 Kalami. Your own work, by your own hand.</p>
          <p>kalami.space</p>
        </div>
      </Reveal>
    </footer>
  );
}
