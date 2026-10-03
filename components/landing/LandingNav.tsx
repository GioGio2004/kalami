import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Enter } from "@/components/motion/Reveal";
import { ArrowUpRight } from "@/components/ui/icons";

const links = [
  { href: "#inside", label: "What's inside" },
  { href: "#honesty", label: "How it stays honest" },
  { href: "#levels", label: "Integrity levels" },
  { href: "#privacy", label: "Privacy" },
];

/** The floating pill navigation. */
export function LandingNav() {
  return (
    <div className="sticky top-3 z-50 px-3 sm:top-4 sm:px-6">
      <Enter kind="drop" className="mx-auto max-w-6xl">
        <header className="flex items-center gap-3 rounded-full border border-line bg-paper/80 py-2 pl-4 pr-2 shadow-[0_10px_40px_-18px_rgba(20,20,20,0.35)] backdrop-blur-md sm:pl-5">
        <Link href="/" aria-label="Kalami home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[15px] text-graphite transition-colors hover:bg-panel hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 lg:ml-3">
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="hidden rounded-full px-4 py-2.5 text-[15px] font-medium transition-colors hover:bg-panel sm:block"
            >
              Sign in
            </Link>
            <PillLink href="/sign-up">Get started</PillLink>
          </Show>
          <Show when="signed-in">
            <PillLink href="/dashboard">Open my notebook</PillLink>
          </Show>
        </div>
      </header>
      </Enter>
    </div>
  );
}

function PillLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 rounded-full bg-ink py-1.5 pl-5 pr-1.5 text-[15px] font-medium text-paper transition-transform active:scale-[0.98]"
    >
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-highlighter text-ink transition-transform duration-300 group-hover:rotate-45">
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}
