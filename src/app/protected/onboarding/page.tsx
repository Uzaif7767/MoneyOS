import { syncUserProfile } from "@/lib/services/userService";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Onboarding | MoneyOS",
  description: "Set up your core financial foundation in MoneyOS.",
};

export default async function OnboardingPage() {
  const profile = await syncUserProfile();

  if (profile?.hasCompletedOnboarding) {
    redirect("/protected");
  }

  return (
    <div className="min-h-full flex items-center justify-center">
      <OnboardingForm />
    </div>
  );
}
