import { SignUp } from "@clerk/nextjs";
import { AuthShell, StepsCard } from "@/components/AuthShell";
import { Scribble } from "@/components/ui/Scribble";

export default function SignUpPage() {
  return (
    <AuthShell
      note="Your own work, by your own hand."
      title={
        <>
          Start your <Scribble>notebook</Scribble>.
        </>
      }
      body="One account for every course your university runs on Kalami. It takes about a minute."
      visual={
        <StepsCard
          title="Three short steps"
          done={0}
          steps={[
            { title: "Create your account", text: "Email or Google, nothing else." },
            { title: "Tell us your university", text: "Faculty, group and year." },
            { title: "Read the honesty notice", text: "What is measured, and what never is." },
          ]}
        />
      }
    >
      <div className="flex flex-col items-center gap-4">
        <p className="max-w-sm text-center text-sm text-graphite">
          Have a university email? Use it here, so your lecturer can recognise you.
        </p>
        <SignUp fallbackRedirectUrl="/onboarding" />
      </div>
    </AuthShell>
  );
}
