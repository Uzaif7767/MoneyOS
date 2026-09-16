"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { completeOnboardingAction } from "@/lib/actions/onboardingActions";
import type { OnboardingFormErrors } from "@/types";

export function OnboardingForm() {
  const router = useRouter();

  // Wizard Step State (Step 1: Core Financials, Step 2: Optional Savings Goal)
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields State (all initially empty strings - NO fake default values)
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [currentBalance, setCurrentBalance] = useState<string>("");
  const [nextIncomeDate, setNextIncomeDate] = useState<string>("");
  const [safetyBuffer, setSafetyBuffer] = useState<string>("");

  // Optional First Savings Goal
  const [goalTitle, setGoalTitle] = useState<string>("");
  const [goalTargetAmount, setGoalTargetAmount] = useState<string>("");
  const [goalTargetDate, setGoalTargetDate] = useState<string>("");

  // UI state: errors, submission loading, completion success
  const [errors, setErrors] = useState<OnboardingFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Step 1 Client Validation
  const validateStep1 = (): boolean => {
    const newErrors: OnboardingFormErrors = {};

    const incomeVal = Number(monthlyIncome);
    if (!monthlyIncome || monthlyIncome.trim() === "") {
      newErrors.monthlyIncome = "Monthly income is required.";
    } else if (isNaN(incomeVal) || incomeVal < 0) {
      newErrors.monthlyIncome = "Please enter a valid non-negative income amount.";
    }

    const balanceVal = Number(currentBalance);
    if (!currentBalance || currentBalance.trim() === "") {
      newErrors.currentBalance = "Current available balance is required.";
    } else if (isNaN(balanceVal) || balanceVal < 0) {
      newErrors.currentBalance = "Please enter a valid non-negative balance amount.";
    }

    if (!nextIncomeDate || nextIncomeDate.trim() === "") {
      newErrors.nextIncomeDate = "Next income date is required.";
    } else {
      const d = new Date(nextIncomeDate);
      if (isNaN(d.getTime())) {
        newErrors.nextIncomeDate = "Please select a valid date.";
      }
    }

    const bufferVal = Number(safetyBuffer);
    if (!safetyBuffer || safetyBuffer.trim() === "") {
      newErrors.safetyBuffer = "Safety buffer amount is required.";
    } else if (isNaN(bufferVal) || bufferVal < 0) {
      newErrors.safetyBuffer = "Please enter a valid non-negative safety buffer amount.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Optional Goal Client Validation
  const validateStep2 = (): boolean => {
    const newErrors: OnboardingFormErrors = {};

    const isStarted = Boolean(goalTitle.trim() || goalTargetAmount.trim() || goalTargetDate.trim());

    if (isStarted) {
      if (!goalTitle.trim()) {
        newErrors.goalTitle = "Please provide a name for your savings goal.";
      }
      const targetVal = Number(goalTargetAmount);
      if (!goalTargetAmount || goalTargetAmount.trim() === "") {
        newErrors.goalTargetAmount = "Target amount is required if setting a goal.";
      } else if (isNaN(targetVal) || targetVal <= 0) {
        newErrors.goalTargetAmount = "Target amount must be a positive number greater than 0.";
      }
      if (goalTargetDate) {
        const gd = new Date(goalTargetDate);
        if (isNaN(gd.getTime())) {
          newErrors.goalTargetDate = "Please select a valid target date.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate both steps
    const step1Valid = validateStep1();
    const step2Valid = validateStep2();

    if (!step1Valid) {
      setStep(1);
      return;
    }
    if (!step2Valid) {
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        monthlyIncome: Number(monthlyIncome),
        currentBalance: Number(currentBalance),
        nextIncomeDate,
        safetyBuffer: Number(safetyBuffer),
        ...(goalTitle.trim() ? { goalTitle: goalTitle.trim() } : {}),
        ...(goalTargetAmount.trim() ? { goalTargetAmount: Number(goalTargetAmount) } : {}),
        ...(goalTargetDate.trim() ? { goalTargetDate } : {}),
      };

      const result = await completeOnboardingAction(payload);

      if (!result.success) {
        setErrors(result.errors || { form: result.message || "Failed to complete onboarding." });
        setIsSubmitting(false);
        return;
      }

      setIsCompleted(true);
      setTimeout(() => {
        router.push("/protected");
        router.refresh();
      }, 1200);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "An unexpected error occurred. Please try again." });
      setIsSubmitting(false);
    }
  };

  const progressPercentage = step === 1 ? 50 : 100;

  if (isCompleted) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <Card className="text-center p-8 border-emerald-200 bg-white shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <svg
              className="w-8 h-8 text-emerald-600 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">You&apos;re All Set!</h2>
          <p className="text-slate-600 text-sm mb-6 font-medium leading-relaxed">
            Your financial foundation has been saved securely. Redirecting you to your MoneyOS workspace...
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-xs mx-auto">
            <div className="bg-emerald-500 h-full w-full animate-pulse" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Context */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200/60 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          MoneyOS Onboarding
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Welcome to MoneyOS
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          Set up your core financial numbers to personalize your workspace and enable daily financial clarity in Indian Rupees (₹).
        </p>
      </div>

      <Card className="shadow-sm border-slate-200/90 overflow-hidden">
        {/* Progress Bar Header */}
        <div className="px-6 sm:px-8 pt-6 pb-2 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
            <span>
              Step {step} of 2: {step === 1 ? "Financial Foundation" : "First Savings Goal"}
            </span>
            <span className="text-emerald-700 font-extrabold">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-slate-200/80" />
        </div>

        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              {step === 1 ? "Configure Financial Foundation" : "Set Your First Savings Goal"}
            </CardTitle>
            <CardDescription className="text-xs">
              {step === 1
                ? "Enter your actual current income and safety parameters."
                : "Optionally define a target savings goal to track towards."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Global Form Error Message */}
            {errors.form && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 shadow-2xs">
                <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.form}</span>
              </div>
            )}

            {step === 1 ? (
              <>
                {/* 1. Monthly Income */}
                <div className="space-y-1.5">
                  <Label htmlFor="monthlyIncome" className="text-xs font-bold text-slate-700">
                    Monthly Income <span className="text-rose-500">*</span>
                  </Label>
                  <MoneyInput
                    id="monthlyIncome"
                    placeholder="e.g. 75000"
                    value={monthlyIncome}
                    onChange={(e) => {
                      setMonthlyIncome(e.target.value);
                      if (errors.monthlyIncome) setErrors({ ...errors, monthlyIncome: undefined });
                    }}
                    error={Boolean(errors.monthlyIncome)}
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Your estimated total net monthly take-home income.
                  </p>
                  {errors.monthlyIncome && (
                    <p className="text-xs text-rose-600 font-medium">{errors.monthlyIncome}</p>
                  )}
                </div>

                {/* 2. Current Available Balance */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentBalance" className="text-xs font-bold text-slate-700">
                    Current Available Balance <span className="text-rose-500">*</span>
                  </Label>
                  <MoneyInput
                    id="currentBalance"
                    placeholder="e.g. 45000"
                    value={currentBalance}
                    onChange={(e) => {
                      setCurrentBalance(e.target.value);
                      if (errors.currentBalance) setErrors({ ...errors, currentBalance: undefined });
                    }}
                    error={Boolean(errors.currentBalance)}
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Total liquid cash available right now across your accounts.
                  </p>
                  {errors.currentBalance && (
                    <p className="text-xs text-rose-600 font-medium">{errors.currentBalance}</p>
                  )}
                </div>

                {/* 3. Next Income Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="nextIncomeDate" className="text-xs font-bold text-slate-700">
                    Next Income Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="nextIncomeDate"
                    type="date"
                    value={nextIncomeDate}
                    onChange={(e) => {
                      setNextIncomeDate(e.target.value);
                      if (errors.nextIncomeDate) setErrors({ ...errors, nextIncomeDate: undefined });
                    }}
                    error={Boolean(errors.nextIncomeDate)}
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    The next date you expect to receive a paycheck or income deposit.
                  </p>
                  {errors.nextIncomeDate && (
                    <p className="text-xs text-rose-600 font-medium">{errors.nextIncomeDate}</p>
                  )}
                </div>

                {/* 4. Safety Buffer Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="safetyBuffer" className="text-xs font-bold text-slate-700">
                    Safety Buffer Amount <span className="text-rose-500">*</span>
                  </Label>
                  <MoneyInput
                    id="safetyBuffer"
                    placeholder="e.g. 10000"
                    value={safetyBuffer}
                    onChange={(e) => {
                      setSafetyBuffer(e.target.value);
                      if (errors.safetyBuffer) setErrors({ ...errors, safetyBuffer: undefined });
                    }}
                    error={Boolean(errors.safetyBuffer)}
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Minimum cushion you want untouched for unexpected expenses.
                  </p>
                  {errors.safetyBuffer && (
                    <p className="text-xs text-rose-600 font-medium">{errors.safetyBuffer}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs font-medium text-emerald-900 mb-2">
                  💡 This step is optional. You can set up your first goal now or skip and complete setup.
                </div>

                {/* Goal Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="goalTitle" className="text-xs font-bold text-slate-700">Savings Goal Name (Optional)</Label>
                  <Input
                    id="goalTitle"
                    type="text"
                    placeholder="e.g. Emergency Fund, New Laptop"
                    value={goalTitle}
                    onChange={(e) => {
                      setGoalTitle(e.target.value);
                      if (errors.goalTitle) setErrors({ ...errors, goalTitle: undefined });
                    }}
                    error={Boolean(errors.goalTitle)}
                  />
                  {errors.goalTitle && (
                    <p className="text-xs text-rose-600 font-medium">{errors.goalTitle}</p>
                  )}
                </div>

                {/* Target Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="goalTargetAmount" className="text-xs font-bold text-slate-700">Target Amount (Optional)</Label>
                  <MoneyInput
                    id="goalTargetAmount"
                    placeholder="e.g. 50000"
                    value={goalTargetAmount}
                    onChange={(e) => {
                      setGoalTargetAmount(e.target.value);
                      if (errors.goalTargetAmount) setErrors({ ...errors, goalTargetAmount: undefined });
                    }}
                    error={Boolean(errors.goalTargetAmount)}
                  />
                  {errors.goalTargetAmount && (
                    <p className="text-xs text-rose-600 font-medium">{errors.goalTargetAmount}</p>
                  )}
                </div>

                {/* Optional Target Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="goalTargetDate" className="text-xs font-bold text-slate-700">Target Date (Optional)</Label>
                  <Input
                    id="goalTargetDate"
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => {
                      setGoalTargetDate(e.target.value);
                      if (errors.goalTargetDate) setErrors({ ...errors, goalTargetDate: undefined });
                    }}
                    error={Boolean(errors.goalTargetDate)}
                  />
                  {errors.goalTargetDate && (
                    <p className="text-xs text-rose-600 font-medium">{errors.goalTargetDate}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-slate-100 mt-4 pt-6">
            {step === 1 ? (
              <div />
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="font-semibold text-xs"
              >
                ← Back
              </Button>
            )}

            {step === 1 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="ml-auto font-bold"
              >
                Next: Savings Goal →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto font-bold min-w-[160px]"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving Profile...
                  </span>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
