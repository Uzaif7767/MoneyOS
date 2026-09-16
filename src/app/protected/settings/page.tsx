import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUserProfile } from "@/lib/services/userService";
import { getDashboardData } from "@/lib/services/dashboardService";
import { SettingsManager } from "@/components/settings/SettingsManager";

export const metadata = {
  title: "Settings & Profile | MoneyOS",
  description: "View profile details, configure financial parameters, and manage Safe-to-Spend settings.",
};

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Synchronize Clerk user profile with Firestore if necessary
  await syncUserProfile();

  // Load existing user profile, bills, and goals to calculate Safe-to-Spend integration
  const dashboardData = await getDashboardData();

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-50/50">
      <SettingsManager
        initialProfile={dashboardData.userProfile}
        upcomingBillsTotal={dashboardData.upcomingBillsTotal}
        goalAllocationTotal={dashboardData.goalAllocationTotal}
        initialGoals={dashboardData.goals}
      />
    </main>
  );
}
