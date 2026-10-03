import type { FunctionReturnType } from "convex/server";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Sparkle } from "@/components/ui/icons";
import type { api } from "@/convex-api/api";

export type HonestyNotice = FunctionReturnType<typeof api.honesty.current>;

/** The honesty notice on a notebook page: red margin line, a red-pen note in the corner. */
export function HonestyNoticeArticle({ text }: { text: HonestyNotice["en"] }) {
  return (
    <article className="relative rounded-[1.75rem] bg-paper py-8 pl-10 pr-6 sm:pl-14 sm:pr-10">
      <span aria-hidden className="absolute inset-y-0 left-5 border-l-2 border-red-pen/35 sm:left-8" />
      <p className="absolute -top-3.5 right-6 rotate-3 rounded-full bg-card px-3.5 py-1 font-hand text-xl text-red-pen shadow-sm">
        worth reading properly!
      </p>
      <h3 className="text-2xl font-medium tracking-[-0.03em]">{text.title}</h3>
      <p className="mt-3 leading-relaxed text-graphite">{text.intro}</p>
      <RevealGroup stagger={0.14} delay={0.15} className="mt-7 space-y-6">
        {text.sections.map((section) => (
          <RevealItem as="section" kind="up" key={section.heading}>
            <h4 className="font-semibold">{section.heading}</h4>
            <ul className="mt-2 space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed">
                  <Sparkle className="mt-1.5 size-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
    </article>
  );
}
