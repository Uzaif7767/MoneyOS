import { auth } from "@clerk/nextjs/server";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhatIsMoneyOS } from "@/components/landing/WhatIsMoneyOS";
import { SafeToSpendSection } from "@/components/landing/SafeToSpendSection";
import { CoreFeatures } from "@/components/landing/CoreFeatures";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeatureEcosystem } from "@/components/landing/FeatureEcosystem";
import { InteractivePreviews } from "@/components/landing/InteractivePreviews";
import { TrustSection } from "@/components/landing/TrustSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <LandingNavbar userId={userId} />
      <main>
        <HeroSection userId={userId} />
        <WhatIsMoneyOS />
        <SafeToSpendSection />
        <CoreFeatures />
        <HowItWorks />
        <FeatureEcosystem />
        <InteractivePreviews />
        <TrustSection />
        <FinalCTA userId={userId} />
      </main>
      <LandingFooter />
    </div>
  );
}
