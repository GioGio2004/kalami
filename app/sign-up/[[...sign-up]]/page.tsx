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
      body="One account for every course you take on Kalami, at university, school or with a tutor. It takes about a minute."
      visual={
        <StepsCard
          title="Three short steps"
          done={0}
          steps={[
            { title: "Create your account", text: "Email or Google, nothing else." },
            { title: "Tell us where you study", text: "University details, or skip them." },
            { title: "Read the honesty notice", text: "What is measured, and what never is." },
          ]}
        />
      }
    >
      <div className="flex flex-col items-center gap-4">
        <p className="max-w-sm text-center text-sm text-graphite">
          Use the email your teacher or university knows, so their invites reach you.
        </p>
        <SignUp fallbackRedirectUrl="/onboarding" />
      </div>
    </AuthShell>
  );
}
