import { Suspense } from "react";
import { PlannerManager } from "@/components/planner/PlannerManager";

export const metadata = {
  title: "Monthly Money Planner | MoneyOS",
  description: "Build a clear plan for your upcoming month with MoneyOS.",
};

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 animate-pulse font-medium">
          Loading Monthly Money Planner...
        </div>
      }
    >
      <PlannerManager />
    </Suspense>
  );
}
