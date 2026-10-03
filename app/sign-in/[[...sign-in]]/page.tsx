import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/AuthShell";
import { NotebookMock } from "@/components/landing/mockups";
import { Scribble } from "@/components/ui/Scribble";

export default function SignInPage() {
  return (
    <AuthShell
      note="Welcome back"
      title={
        <>
          Back to your <Scribble>notebook</Scribble>.
        </>
      }
      body="Lessons, quizzes and your lecturer's notes, right where you left them."
      visual={
        <div className="max-w-md -rotate-2 rounded-[2rem] bg-card p-5 shadow-[0_30px_60px_-35px_rgba(20,20,20,0.45)]">
          <NotebookMock />
        </div>
      }
    >
      <SignIn fallbackRedirectUrl="/dashboard" />
    </AuthShell>
  );
}
