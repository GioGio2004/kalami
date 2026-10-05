"use client";

import { AssistantView } from "@/components/assistant/AssistantView";
import { useOrigin } from "@/lib/useOrigin";

// StudentGate (in the layout) only renders this page for onboarded students.
export default function AssistantPage() {
  return <AssistantView origin={useOrigin()} />;
}
