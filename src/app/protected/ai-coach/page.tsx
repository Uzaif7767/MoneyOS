import { AICoachPageClient } from "@/components/ai-coach/AICoachPageClient";

export const metadata = {
  title: "AI Coach | MoneyOS",
  description: "Ask questions about your MoneyOS finances.",
};

export default function AICoachPage() {
  return <AICoachPageClient />;
}
