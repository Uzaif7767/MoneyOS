import { Suspense } from "react";
import { PlannerAIPlanPageClient } from "@/components/planner/PlannerAIPlanPageClient";

export const metadata = {
  title: "AI Monthly Money Plan | MoneyOS",
  description: "A personalized allocation proposal based on your planner inputs.",
};

export default function AIPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 animate-pulse font-medium">
          Loading AI Monthly Money Plan...
        </div>
      }
    >
      <PlannerAIPlanPageClient />
    </Suspense>
  );
}
