import { OnboardingScreen } from "@/components/OnboardingForm";
import { joinReturnPath } from "@/lib/urls";

/** `?next=/join/…` brings a student back to the invite they came from once setup is done. */
export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const { next } = await searchParams;
  return <OnboardingScreen next={joinReturnPath(next)} />;
}
