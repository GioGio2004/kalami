import type { Metadata } from "next";
import { Marquee } from "@/components/motion/Marquee";
import { ScrollProgress } from "@/components/motion/primitives";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { LearningJourney } from "@/components/landing/LearningJourney";
import { LandingNav } from "@/components/landing/LandingNav";
import { ScrollToTop } from "@/components/landing/ScrollToTop";
import { IntegrityLevels } from "@/components/landing/IntegrityLevels";
import { HonestySection, PrivacySection } from "@/components/landing/sections";

export const metadata: Metadata = {
  title: "Kalami · Learn, practise, make your mark",
};

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <LandingNav />
      {/* Clip sideways: items that slide in from the right would otherwise widen phones' pages. */}
      <main className="overflow-x-clip">
        <Hero />
        <LearningJourney />
        <Marquee
          className="mt-16 text-2xl font-medium tracking-[-0.02em] text-graphite sm:text-4xl"
          items={[
            "Typed by hand",
            "Live class view",
            "Per-student variants",
            "No camera, no mic",
            "Georgian-first",
            "Flags, not verdicts",
          ]}
        />
        <HonestySection />
        <IntegrityLevels />
        <PrivacySection />
        <ClosingCta />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
