"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import type { UserProfile, Goal } from "@/types";
import { updateFinancialSettingsAction, SettingsFormErrors } from "@/lib/actions/settingsActions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  UserIcon,
  SettingsIcon,
  RupeeSignIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LogOutIcon,
  GoalsIcon,
  ArrowRightIcon,
  SlidersIcon,
  PieChartIcon,
} from "@/components/ui/icons";

interface SettingsManagerProps {
  initialProfile: UserProfile | null;
  upcomingBillsTotal: number;
  goalAllocationTotal: number;
  initialGoals: Goal[];
}

export function SettingsManager({
  initialProfile,
  upcomingBillsTotal,
  goalAllocationTotal,
  initialGoals,
}: SettingsManagerProps) {
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();

  // Financial form state
  const [monthlyIncome, setMonthlyIncome] = useState<string>(
    initialProfile?.monthlyIncome !== undefined ? String(initialProfile.monthlyIncome) : ""
  );
  const [currentBalance, setCurrentBalance] = useState<string>(
    initialProfile?.currentBalance !== undefined ? String(initialProfile.currentBalance) : ""
  );
  const [nextIncomeDate, setNextIncomeDate] = useState<string>(
    initialProfile?.nextIncomeDate || ""
  );
  const [safetyBuffer, setSafetyBuffer] = useState<string>(
    initialProfile?.safetyBuffer !== undefined ? String(initialProfile.safetyBuffer) : ""
  );

  // Status & Feedback state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<SettingsFormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate live preview of Safe-to-Spend
  const numCurrentBalance = Number(currentBalance) || 0;
  const numSafetyBuffer = Number(safetyBuffer) || 0;
  const safeToSpendPool = numCurrentBalance - upcomingBillsTotal - goalAllocationTotal - numSafetyBuffer;

  let daysUntilNextIncome = 1;
  if (nextIncomeDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(nextIncomeDate);
    nextDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    daysUntilNextIncome = Math.max(1, diffDays);
  }
  const dailySafeSpend = safeToSpendPool / daysUntilNextIncome;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage(null);

    const payload = {
      monthlyIncome,
      currentBalance,
      nextIncomeDate,
      safetyBuffer,
    };

    const result = await updateFinancialSettingsAction(payload);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.message || "Financial settings saved successfully!");
      setTimeout(() => setSuccessMessage(null), 6000);
    } else {
      setErrors(result.errors || { form: result.message || "Failed to update settings." });
    }
  };

  const displayName = user?.fullName || initialProfile?.displayName || "MoneyOS User";
  const primaryEmail = user?.primaryEmailAddress?.emailAddress || initialProfile?.email || "No email linked";
  const userImageUrl = user?.imageUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Settings & Profile"
        description="Manage your authenticated profile, core financial parameters, and safe-to-spend settings."
        badgeText="Control Center"
        badgeIcon={SettingsIcon}
        action={
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 font-semibold text-xs flex items-center gap-1.5 shadow-2xs">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Clerk Authenticated</span>
          </Badge>
        }
      />

      {/* Section Cards */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* 1. PROFILE SECTION */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold">Authenticated Profile</CardTitle>
                  <CardDescription className="text-xs">
                    Real profile data from Clerk authentication service.
                  </CardDescription>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => openUserProfile()}
                className="gap-2 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-700"
              >
                <SlidersIcon className="w-4 h-4 text-slate-500" />
                <span>Manage Profile</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {userImageUrl ? (
                  <img
                    src={userImageUrl}
                    alt={displayName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-2xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center shadow-2xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1 min-w-0 flex-1">
                  <h2 className="text-xl font-extrabold text-slate-900 leading-tight break-words">
                    {displayName}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium break-all">{primaryEmail}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Verified Account
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {user?.id ? `${user.id.slice(0, 12)}...` : "Authenticated"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. FINANCIAL SETTINGS & SAFE-TO-SPEND SECTION */}
        <Card>
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                <RupeeSignIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold">Financial Parameters</CardTitle>
                <CardDescription className="text-xs">
                  Configure monthly income, available balance, next income date, and safety buffer in Indian Rupees (₹).
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Form Feedback Alerts */}
              {errors.form && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-2xs font-medium">
                  <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errors.form}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 shadow-2xs">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Settings Saved</span>
                    <span className="font-medium text-xs text-emerald-700">{successMessage}</span>
                  </div>
                </div>
              )}

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Monthly Income */}
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome" className="text-slate-700 font-bold text-xs uppercase tracking-wide flex items-center justify-between">
                    <span>Monthly Income (₹ INR)</span>
                    <span className="text-[11px] text-slate-400 font-normal lowercase">Expected earnings</span>
                  </Label>
                  <MoneyInput
                    id="monthlyIncome"
                    placeholder="e.g. 75000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    error={Boolean(errors.monthlyIncome)}
                  />
                  {errors.monthlyIncome && (
                    <p className="text-xs text-rose-600 font-medium">{errors.monthlyIncome}</p>
                  )}
                </div>

                {/* Current Balance */}
                <div className="space-y-2">
                  <Label htmlFor="currentBalance" className="text-slate-700 font-bold text-xs uppercase tracking-wide flex items-center justify-between">
                    <span>Current Available Balance (₹ INR)</span>
                    <span className="text-[11px] text-slate-400 font-normal lowercase">Liquid cash</span>
                  </Label>
                  <MoneyInput
                    id="currentBalance"
                    placeholder="e.g. 45000"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(e.target.value)}
                    error={Boolean(errors.currentBalance)}
                  />
                  {errors.currentBalance && (
                    <p className="text-xs text-rose-600 font-medium">{errors.currentBalance}</p>
                  )}
                </div>

                {/* Next Income Date */}
                <div className="space-y-2">
                  <Label htmlFor="nextIncomeDate" className="text-slate-700 font-bold text-xs uppercase tracking-wide flex items-center justify-between">
                    <span>Next Income Date</span>
                    <span className="text-[11px] text-slate-400 font-normal lowercase">Next salary payout</span>
                  </Label>
                  <Input
                    id="nextIncomeDate"
                    type="date"
                    value={nextIncomeDate}
                    onChange={(e) => setNextIncomeDate(e.target.value)}
                    error={Boolean(errors.nextIncomeDate)}
                  />
                  {errors.nextIncomeDate && (
                    <p className="text-xs text-rose-600 font-medium">{errors.nextIncomeDate}</p>
                  )}
                </div>

                {/* Safety Buffer Amount */}
                <div className="space-y-2">
                  <Label htmlFor="safetyBuffer" className="text-slate-700 font-bold text-xs uppercase tracking-wide flex items-center justify-between">
                    <span>Safety Buffer Amount (₹ INR)</span>
                    <span className="text-[11px] text-slate-400 font-normal lowercase">Reserved emergency fund</span>
                  </Label>
                  <MoneyInput
                    id="safetyBuffer"
                    placeholder="e.g. 10000"
                    value={safetyBuffer}
                    onChange={(e) => setSafetyBuffer(e.target.value)}
                    error={Boolean(errors.safetyBuffer)}
                  />
                  {errors.safetyBuffer && (
                    <p className="text-xs text-rose-600 font-medium">{errors.safetyBuffer}</p>
                  )}
                </div>
              </div>

              {/* LIVE SAFE-TO-SPEND FORMULA PREVIEW */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-extrabold text-xs tracking-wider text-emerald-300 uppercase">
                      Live Safe-to-Spend Preview
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    MoneyOS Calculation Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                      Safe-to-Spend Pool
                    </span>
                    <span className={`text-xl font-extrabold ${safeToSpendPool >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      ₹{safeToSpendPool.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Balance - (Bills + Goals + Buffer)
                    </span>
                  </div>

                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                      Days to Next Income
                    </span>
                    <span className="text-xl font-extrabold text-slate-100">
                      {daysUntilNextIncome} {daysUntilNextIncome === 1 ? "day" : "days"}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {nextIncomeDate ? nextIncomeDate : "No date set"}
                    </span>
                  </div>

                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                      Daily Safe Spend
                    </span>
                    <span className={`text-xl font-extrabold ${dailySafeSpend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      ₹{Math.max(0, Math.floor(dailySafeSpend)).toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-slate-400">/day</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Pool ÷ Days to Income
                    </span>
                  </div>
                </div>

                {/* Deductions Breakdown details */}
                <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-6 gap-y-1 pt-2 border-t border-slate-700/40">
                  <span>Upcoming Bills: <strong className="text-slate-200">₹{upcomingBillsTotal.toLocaleString("en-IN")}</strong></span>
                  <span>Goal Allocation: <strong className="text-slate-200">₹{goalAllocationTotal.toLocaleString("en-IN")}</strong></span>
                  <span>Safety Buffer: <strong className="text-slate-200">₹{numSafetyBuffer.toLocaleString("en-IN")}</strong></span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto font-bold px-8 shadow-xs"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving Parameters...</span>
                    </div>
                  ) : (
                    <span>Save Financial Settings</span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 3. SAVINGS GOALS INTEGRATION SUMMARY */}
        <Card>
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                  <GoalsIcon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold">Savings Goals Integration</CardTitle>
                  <CardDescription className="text-xs">
                    Real savings goals registered in your MoneyOS account.
                  </CardDescription>
                </div>
              </div>

              <Link href="/protected/goals">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                  <span>Manage Goals</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {initialGoals.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Your goals reserve money in your Safe-to-Spend formula so you stay on track:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {initialGoals.map((goal) => {
                    const progress = goal.targetAmount > 0 
                      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                      : 0;

                    return (
                      <div
                        key={goal.id}
                        className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">
                              {goal.name || goal.title}
                            </h3>
                            {goal.targetDate && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                                <CalendarIcon className="w-3 h-3 text-slate-400" />
                                <span>Target: {goal.targetDate}</span>
                              </div>
                            )}
                          </div>
                          <Badge variant="emerald" className="text-[10px] font-bold">
                            {progress}% Saved
                          </Badge>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700">Saved: ₹{goal.currentAmount.toLocaleString("en-IN")}</span>
                            <span className="text-slate-400">Target: ₹{goal.targetAmount.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <GoalsIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">No Savings Goals Set Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    You haven&apos;t set up any savings goals yet. Creating a goal automatically allocates money safely towards your long-term plans.
                  </p>
                </div>
                <Link href="/protected/goals" className="inline-block pt-1">
                  <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
                    <span>Create Your First Goal</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. ACCOUNT ACTIONS & SYSTEM PREFERENCES */}
        <Card>
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold">Account & System Preferences</CardTitle>
                <CardDescription className="text-xs">
                  System configuration, currency standard, and session actions.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Currency Badge */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Currency Standard
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                    ₹ / INR (Indian Rupee)
                  </span>
                </div>
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-[10px] font-bold">
                  India V1 Locked
                </Badge>
              </div>

              {/* Security Status */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Data Architecture
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                    Isolated User Document
                  </span>
                </div>
                <Badge variant="emerald" className="text-[10px] font-bold">
                  Clerk Scoped
                </Badge>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-medium">
                <span>Signed in as <strong className="text-slate-800">{primaryEmail}</strong></span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openUserProfile()}
                  className="flex-1 sm:flex-none text-xs font-semibold"
                >
                  Manage Clerk Account
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ redirectUrl: "/sign-in" })}
                  className="flex-1 sm:flex-none text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-2"
                >
                  <LogOutIcon className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
