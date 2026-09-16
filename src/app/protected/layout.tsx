import { syncUserProfile } from "@/lib/services/userService";
import { Sidebar } from "@/components/navigation/Sidebar";
import { MobileHeader } from "@/components/navigation/MobileHeader";
import { MobileNav } from "@/components/navigation/MobileNav";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { FloatingAICoach } from "@/components/ai-coach/FloatingAICoach";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Synchronize Clerk user profile with Firestore (/users/{clerkUserId})
  const profile = await syncUserProfile();

  // If user has not completed onboarding, force clean onboarding flow view
  if (!profile?.hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-8">
        <main className="w-full">
          <OnboardingForm />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 pb-20 md:pb-8 min-w-0 w-full">
        <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 min-w-0 w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Persistent Floating AI Coach Launcher */}
      <FloatingAICoach />
    </div>
  );
}
