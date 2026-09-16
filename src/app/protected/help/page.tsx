import { Suspense } from "react";
import { HelpCenter } from "@/components/help/HelpCenter";

export const metadata = {
  title: "Help & Learn | MoneyOS",
  description:
    "Master MoneyOS, understand Safe-to-Spend calculations, and learn how to manage your personal finances.",
};

export default function HelpPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500 animate-pulse font-medium">
          Loading Help & Learn Center...
        </div>
      }
    >
      <HelpCenter />
    </Suspense>
  );
}
