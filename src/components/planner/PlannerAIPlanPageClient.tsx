"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SparklesIcon,
  PlannerIcon,
  CalendarIcon,
  WalletIcon,
  PieChartIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  RefreshIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  HomeIcon,
  UtensilsIcon,
  CarIcon,
  BriefcaseIcon,
  UserIcon,
  TagIcon,
  UsersIcon,
  CreditCardIcon,
  TvIcon,
  StethoscopeIcon,
  PiggyBankIcon,
  SlidersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "@/components/ui/icons";
import { getPlannerDraftAction } from "@/lib/actions/plannerActions";
import { generateAIPlanAction, optimizeAIPlanAction } from "@/lib/actions/plannerAIActions";
import {
  getPlannerPlanAction,
  savePlannerPlanAction,
  getPlannerPlanHistoryAction,
  getPlannerPlanVersionAction,
} from "@/lib/actions/plannerPlanActions";
import {
  calculatePlannerSummary,
  toSafeNum,
  recalculateEditedAIProposal,
} from "@/lib/planner/plannerCalculator";
import type {
  AIProposedPlanResult,
  AIOptimizationResult,
  OptimizationMode,
  AIOptimizationChange,
  CategoryId,
  AIDetailedCategory,
  AIProposedPlan,
  RecalculatedProposedSummary,
} from "@/lib/ai/planner";
import type { PlannerDraft, PlannerPlan, PlannerPlanVersion, PlannerPlanStatus } from "@/types";

function getCategoryIcon(id: CategoryId) {
  switch (id) {
    case "home_living":
      return <HomeIcon className="w-5 h-5 text-indigo-600" />;
    case "food_daily_living":
      return <UtensilsIcon className="w-5 h-5 text-emerald-600" />;
    case "transport":
      return <CarIcon className="w-5 h-5 text-sky-600" />;
    case "work_job":
      return <BriefcaseIcon className="w-5 h-5 text-amber-600" />;
    case "personal":
      return <UserIcon className="w-5 h-5 text-purple-600" />;
    case "subscriptions":
      return <TagIcon className="w-5 h-5 text-pink-600" />;
    case "family_responsibilities":
      return <UsersIcon className="w-5 h-5 text-rose-600" />;
    case "debt_obligations":
      return <CreditCardIcon className="w-5 h-5 text-red-600" />;
    case "lifestyle_entertainment":
      return <TvIcon className="w-5 h-5 text-violet-600" />;
    case "health":
      return <StethoscopeIcon className="w-5 h-5 text-teal-600" />;
    case "one_time_expenses":
      return <CalendarIcon className="w-5 h-5 text-orange-600" />;
    case "savings_future":
      return <PiggyBankIcon className="w-5 h-5 text-emerald-600" />;
    default:
      return <PieChartIcon className="w-5 h-5 text-slate-600" />;
  }
}

export function PlannerAIPlanPageClient() {
  const searchParams = useSearchParams();

  // Dynamic month options
  const monthOptions = useMemo(() => {
    const now = new Date();
    const options = [];

    for (let offset = 0; offset <= 2; offset++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const monthName = targetDate.toLocaleDateString("en-US", { month: "long" });
      const year = targetDate.getFullYear();
      const monthNumber = String(targetDate.getMonth() + 1).padStart(2, "0");
      const isNextMonth = offset === 1;

      options.push({
        id: `${year}-${monthNumber}`,
        label: `${monthName} ${year}`,
        isDefault: isNextMonth,
        subtitle:
          offset === 0
            ? "Current Month"
            : offset === 1
            ? "Upcoming Planning Month"
            : "Future Month",
      });
    }
    return options;
  }, []);

  const paramMonth = searchParams.get("month");
  const initialMonthId = useMemo(() => {
    if (paramMonth && monthOptions.some((m) => m.id === paramMonth)) {
      return paramMonth;
    }
    return monthOptions.find((m) => m.isDefault)?.id || monthOptions[0].id;
  }, [paramMonth, monthOptions]);

  const [selectedMonthId, setSelectedMonthId] = useState<string>(initialMonthId);

  const selectedMonthObj = useMemo(
    () => monthOptions.find((m) => m.id === selectedMonthId) || monthOptions[0],
    [monthOptions, selectedMonthId]
  );

  // Draft state
  const [isCheckingDraft, setIsCheckingDraft] = useState<boolean>(true);
  const [hasDraftData, setHasDraftData] = useState<boolean>(false);
  const [draft, setDraft] = useState<PlannerDraft | null>(null);

  // Generation state
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIProposedPlanResult | null>(null);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  // Phase 2.8 State: Editable Plan, Approval, Save, History
  const [planStatus, setPlanStatus] = useState<PlannerPlanStatus | "saved">("draft");
  const [isModified, setIsModified] = useState<boolean>(false);
  const [savedPlan, setSavedPlan] = useState<PlannerPlan | null>(null);
  const [planHistory, setPlanHistory] = useState<PlannerPlanVersion[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [loadingVersionId, setLoadingVersionId] = useState<string | null>(null);
  const [loadedVersionNumber, setLoadedVersionNumber] = useState<number | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [approvedAt, setApprovedAt] = useState<string | null>(null);


  const [editableCategories, setEditableCategories] = useState<AIDetailedCategory[]>([]);
  const [workingSummary, setWorkingSummary] = useState<RecalculatedProposedSummary | null>(null);

  // Optimization state (Phase 2.7)
  const [isOptimizingAI, setIsOptimizingAI] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<AIOptimizationResult | null>(null);
  const [selectedOptimizationMode, setSelectedOptimizationMode] = useState<OptimizationMode>("auto");

  const autoTrigger = searchParams.get("auto") === "true";

  // Handle explicit AI Generation
  const handleGeneratePlan = useCallback(async () => {
    setIsLoadingAI(true);
    setSaveError(null);
    setSaveSuccessMsg(null);
    try {
      const result = await generateAIPlanAction(selectedMonthId);
      setAiResult(result);
      if (result.success && result.proposal) {
        setEditableCategories(result.proposal.categories || []);
        setWorkingSummary(result.recalculatedSummary || null);
        setPlanStatus("draft");
        setIsModified(false);
        setApprovedAt(null);
      }
      setHasGenerated(true);
    } catch (err) {
      console.error("AI Plan generation error:", err);
      setAiResult({
        success: false,
        error: "AI plan could not be generated right now. Your saved planner data is safe. Please try again.",
      });
      setHasGenerated(true);
    } finally {
      setIsLoadingAI(false);
    }
  }, [selectedMonthId]);

  // Handle explicit AI Optimization trigger
  const handleOptimizePlan = useCallback(
    async (modeToUse?: OptimizationMode) => {
      if (!aiResult?.proposal) return;
      const targetMode = modeToUse || selectedOptimizationMode;
      setIsOptimizingAI(true);
      setSaveError(null);
      setSaveSuccessMsg(null);
      try {
        const workingProposal: AIProposedPlan = {
          ...aiResult.proposal,
          categories: editableCategories,
        };

        const result = await optimizeAIPlanAction(selectedMonthId, workingProposal, targetMode);
        setOptimizationResult(result);

        if (result.success && result.recalculated) {
          setEditableCategories(result.recalculated.updatedCategories);
          const newSummary: RecalculatedProposedSummary = {
            totalProposedSpending: result.recalculated.proposed.totalSpending,
            totalProposedSavings: result.recalculated.proposed.totalSavings,
            totalProposedSafetyBuffer: result.recalculated.proposed.safetyBuffer,
            totalProposedAllocations:
              result.recalculated.proposed.totalSpending +
              result.recalculated.proposed.totalSavings +
              result.recalculated.proposed.safetyBuffer,
            recalculatedRemainingMoney: result.recalculated.proposed.remainingMoney,
            plannedMonthlyIncome: result.recalculated.plannedMonthlyIncome,
            isAffordable: result.recalculated.proposed.isAffordable,
          };
          setWorkingSummary(newSummary);
          setPlanStatus("draft");
          setIsModified(true);
        }
      } catch (err) {
        console.error("AI Optimization error:", err);
        setOptimizationResult({
          success: false,
          error: "AI budget optimization is temporarily unavailable. Your saved planner data is safe.",
        });
      } finally {
        setIsOptimizingAI(false);
      }
    },
    [selectedMonthId, aiResult, editableCategories, selectedOptimizationMode]
  );

  const calcDraft = useMemo(() => {
    if (!draft) return null;
    return calculatePlannerSummary(draft, selectedMonthId);
  }, [draft, selectedMonthId]);

  const [prevSelectedMonthId, setPrevSelectedMonthId] = useState(selectedMonthId);
  if (selectedMonthId !== prevSelectedMonthId) {
    setPrevSelectedMonthId(selectedMonthId);
    setSaveError(null);
    setSaveSuccessMsg(null);
    setIsModified(false);
  }

  const autoTriggerRef = useRef(autoTrigger);
  autoTriggerRef.current = autoTrigger;

  const hasGeneratedRef = useRef(hasGenerated);
  hasGeneratedRef.current = hasGenerated;

  const handleGeneratePlanRef = useRef(handleGeneratePlan);
  handleGeneratePlanRef.current = handleGeneratePlan;

  // Check draft & saved plan & plan history on month change
  useEffect(() => {
    let active = true;

    getPlannerDraftAction(selectedMonthId)
      .then(async (res) => {
        if (!active) return;

        if (res.success && res.draft) {
          const d = res.draft;
          const totalIncome = toSafeNum(d.monthlyIncome);
          const calc = calculatePlannerSummary(d, selectedMonthId);

          const hasContent = totalIncome > 0 || calc.totalPlannedSpending > 0 || calc.savingsGoalAmount > 0;
          setHasDraftData(hasContent);
          setDraft(d);

          // Fetch saved plan from Firestore
          let hasSavedPlan = false;
          try {
            const planRes = await getPlannerPlanAction(selectedMonthId);
              if (active && planRes.success && planRes.plan) {
                const p = planRes.plan;
                setSavedPlan(p);
                setLoadedVersionNumber(p.version);
                setPlanStatus("saved");
                setApprovedAt(p.approvedAt || null);
                hasSavedPlan = true;


              if (p.proposal && typeof p.proposal === "object") {
                const prop = p.proposal as AIProposedPlan;
                const recap = p.recalculatedSummary as RecalculatedProposedSummary;
                setAiResult({
                  success: true,
                  proposal: prop,
                  recalculatedSummary: recap,
                });
                setEditableCategories(prop.categories || []);
                setWorkingSummary(recap || null);
                setHasGenerated(true);
              }
            } else if (active) {
              setSavedPlan(null);
              setPlanStatus("draft");
            }
          } catch (err) {
            console.error("Error fetching saved plan:", err);
          }

          // Fetch plan history
          setIsLoadingHistory(true);
          try {
            const histRes = await getPlannerPlanHistoryAction(selectedMonthId);
            if (active && histRes.success && histRes.history) {
              setPlanHistory(histRes.history);
            } else if (active) {
              setPlanHistory([]);
            }
          } catch (err) {
            console.error("Error fetching plan history:", err);
          } finally {
            if (active) setIsLoadingHistory(false);
          }

          if (hasContent && autoTriggerRef.current && !hasGeneratedRef.current && !hasSavedPlan) {
            handleGeneratePlanRef.current();
          }
        } else {
          setHasDraftData(false);
          setDraft(null);
          setSavedPlan(null);
          setPlanHistory([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch planner draft:", err);
        if (active) {
          setHasDraftData(false);
          setDraft(null);
        }
      })
      .finally(() => {
        if (active) setIsCheckingDraft(false);
      });

    return () => {
      active = false;
    };
  }, [selectedMonthId]);


  const handleMonthChange = (monthId: string) => {
    if (isModified) {
      const confirmLeave = window.confirm(
        "You have unsaved changes in your plan. Switching months will unload your unapproved edits. Continue?"
      );
      if (!confirmLeave) return;
    }

    setSelectedMonthId(monthId);
    setIsCheckingDraft(true);
    setAiResult(null);
    setHasGenerated(false);
    setOptimizationResult(null);
    setSaveError(null);
    setSaveSuccessMsg(null);
    setIsModified(false);
    setLoadedVersionNumber(null);
    setLoadingVersionId(null);
  };

  // Handle Sub-item amount changes with deterministic MoneyOS recalculation
  const handleSubItemAmountChange = (catId: CategoryId, itemIdx: number, newAmountRaw: string) => {
    const numVal = toSafeNum(newAmountRaw);

    const updated = editableCategories.map((cat) => {
      if (cat.id !== catId) return cat;
      const updatedItems = cat.items.map((item, idx) => {
        if (idx !== itemIdx) return item;
        return {
          ...item,
          amount: numVal,
        };
      });
      return {
        ...cat,
        items: updatedItems,
      };
    });

    const plannedIncome = calcDraft?.totalPlannedIncome || draft?.monthlyIncome || 0;
    const recalculated = recalculateEditedAIProposal(updated, plannedIncome);

    setEditableCategories(recalculated.updatedCategories as AIDetailedCategory[]);
    setWorkingSummary(recalculated.summary);

    if (aiResult?.proposal) {
      setAiResult({
        ...aiResult,
        proposal: {
          ...aiResult.proposal,
          categories: recalculated.updatedCategories as AIDetailedCategory[],
        },
        recalculatedSummary: recalculated.summary,
      });
    }

    setPlanStatus("draft");
    setIsModified(true);
    setSaveSuccessMsg(null);
    setSaveError(null);
  };

  // Explicit approval handler
  const handleApprovePlan = () => {
    setPlanStatus("approved");
    setApprovedAt(new Date().toISOString());
    setSaveSuccessMsg(null);
    setSaveError(null);
  };

  // Explicit save handler
  const handleSavePlan = async () => {
    if (planStatus !== "approved") {
      setSaveError("Please approve your plan before saving.");
      return;
    }

    if (!workingSummary || !aiResult?.proposal) {
      setSaveError("No valid plan proposal available to save.");
      return;
    }

    setIsSavingPlan(true);
    setSaveError(null);
    setSaveSuccessMsg(null);

    try {
      const plannedIncome = calcDraft?.totalPlannedIncome || draft?.monthlyIncome || 0;

      const payload = {
        status: "approved" as const,
        approvedAt: approvedAt || new Date().toISOString(),
        source: isModified ? ("edited" as const) : ("ai_generated" as const),
        plannedMonthlyIncome: plannedIncome,
        proposal: {
          ...aiResult.proposal,
          categories: editableCategories,
        },
        recalculatedSummary: workingSummary,
      };

      const res = await savePlannerPlanAction(selectedMonthId, payload);
      if (res.success && res.plan) {
        setSavedPlan(res.plan);
        setLoadedVersionNumber(res.plan.version);
        setPlanStatus("saved");
        setIsModified(false);
        setSaveSuccessMsg(`Plan successfully saved as Version ${res.plan.version}!`);

        const histRes = await getPlannerPlanHistoryAction(selectedMonthId);
        if (histRes.success && histRes.history) {
          setPlanHistory(histRes.history);
        }
      } else {
        setSaveError(res.error || "Failed to save planner plan. Please try again.");
      }
    } catch (err) {
      console.error("Save plan error:", err);
      setSaveError("An unexpected error occurred while saving the plan.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Reopen plan from history
  const handleOpenHistoryVersion = async (versionItem: PlannerPlanVersion) => {
    if (loadingVersionId) return;

    if (isModified) {
      const confirmSwitch = window.confirm(
        "You have unsaved edits in your working plan. Opening this saved version will replace your working changes. Continue?"
      );
      if (!confirmSwitch) return;
    }

    setLoadingVersionId(versionItem.id);
    setSaveError(null);
    setSaveSuccessMsg(null);

    try {
      // Fetch exact version snapshot securely from server action
      const res = await getPlannerPlanVersionAction(selectedMonthId, versionItem.id);
      
      const targetVersion = res.success && res.version ? res.version : versionItem;

      if (targetVersion.proposal && typeof targetVersion.proposal === "object") {
        const prop = targetVersion.proposal as AIProposedPlan;
        
        // Recalculate deterministically to ensure workingSummary is accurate
        const plannedIncome = calcDraft?.totalPlannedIncome || draft?.monthlyIncome || targetVersion.plannedMonthlyIncome || 0;
        const recalculated = recalculateEditedAIProposal(prop.categories || [], plannedIncome);
        
        const recap = (recalculated.summary || targetVersion.recalculatedSummary) as RecalculatedProposedSummary;

        setAiResult({
          success: true,
          proposal: prop,
          recalculatedSummary: recap,
        });
        setEditableCategories(prop.categories || []);
        setWorkingSummary(recap || null);
        setPlanStatus("saved");
        setIsModified(false);
        setApprovedAt(targetVersion.approvedAt || targetVersion.savedAt);
        setLoadedVersionNumber(targetVersion.version);
        setHasGenerated(true);
        setSaveSuccessMsg(`Loaded Version ${targetVersion.version} from history.`);
      } else {
        setSaveError(`Could not load details for Version ${versionItem.version}.`);
      }
    } catch (err) {
      console.error("Error opening history version:", err);
      setSaveError("Failed to open the selected plan version. Please try again.");
    } finally {
      setLoadingVersionId(null);
    }
  };


  const proposal = aiResult?.proposal;
  const recalculated = workingSummary || aiResult?.recalculatedSummary;

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* 1. Top Navigation & Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Link
            href="/protected/planner"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Monthly Planner</span>
          </Link>
        </div>

        <PageHeader
          title="AI Monthly Money Plan"
          description="A detailed life-budget workspace supporting direct editing, deterministic recalculation, approval, and version history."
          badgeText="AI Life Budget Engine"
          badgeIcon={SparklesIcon}
        />
      </div>

      {/* 2. Context & Info Banner */}
      <section
        aria-label="Planning Month Context"
        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Target Month:
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedMonthObj.label}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
                  {selectedMonthObj.subtitle}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/50">
                  <SparklesIcon className="w-3 h-3" />
                  Editable MoneyOS Plan Workspace
                </span>
                <span className="text-[11px] text-slate-500 italic">
                  Planning data only — does not alter actual Expenses, Bills, Goals, or Safe-to-Spend.
                </span>
              </div>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 overflow-x-auto max-w-full min-w-0 shrink-0">
            {monthOptions.map((option) => {
              const isSelected = option.id === selectedMonthId;
              return (
                <button
                  key={option.id}
                  onClick={() => handleMonthChange(option.id)}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer ${
                    isSelected
                      ? "bg-white text-indigo-900 shadow-2xs font-bold border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                  aria-pressed={isSelected}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Draft Checking Loading State */}
      {isCheckingDraft && (
        <Card className="rounded-2xl p-12 text-center border-slate-200/90 shadow-2xs space-y-3 animate-pulse bg-white">
          <div className="w-10 h-10 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <SparklesIcon className="w-5 h-5 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Checking saved planner data for {selectedMonthObj.label}...
          </p>
        </Card>
      )}

      {/* 4. Empty State — No Planner Draft Found */}
      {!isCheckingDraft && !hasDraftData && (
        <Card className="rounded-2xl border-slate-200/90 shadow-2xs bg-white overflow-hidden p-8 sm:p-12 text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center">
            <PlannerIcon className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">Build your planner first</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Add your monthly income and planned expenses for {selectedMonthObj.label} before generating a complete life-budget proposal.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/protected/planner"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Planner</span>
            </Link>
          </div>
        </Card>
      )}

      {/* 5. Main AI Plan Experience */}
      {!isCheckingDraft && hasDraftData && (
        <div className="space-y-6">
          {/* Top Generator Banner when no generated plan exists */}
          {!hasGenerated && !isLoadingAI && (
            <Card className="rounded-2xl border-slate-200/90 shadow-2xs bg-white p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/60">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Complete Life Budget Engine</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Generate Complete Monthly Life Budget for {selectedMonthObj.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    MoneyOS will intelligently break your broad category targets into practical real-world sub-factors (groceries, office meals, fuel, commute, mobile, utilities, etc.) for a working person.
                  </p>
                </div>

                <div className="shrink-0">
                  <Button
                    type="button"
                    onClick={handleGeneratePlan}
                    disabled={isLoadingAI}
                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500"
                  >
                    <SparklesIcon className="w-4 h-4 shrink-0" />
                    <span>Generate Complete AI Plan</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Polished Loading Experience */}
          {isLoadingAI && (
            <Card className="rounded-2xl border-slate-200/90 shadow-2xs bg-white p-8 sm:p-12 text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <SparklesIcon className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Building your complete monthly budget...
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  MoneyOS is organizing your plan into practical spending areas and breaking down broad category inputs into realistic personal sub-factors.
                </p>
              </div>
            </Card>
          )}

          {/* AI Generation Error State */}
          {!isLoadingAI && aiResult && !aiResult.success && (
            <Card className="rounded-2xl border-amber-200/90 bg-amber-50/70 p-6 shadow-2xs space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                    AI plan could not be generated right now.
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {aiResult.error || "Your saved planner data is safe. Please try again."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleGeneratePlan}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshIcon className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </Button>
                <Link
                  href="/protected/planner"
                  className="text-xs font-semibold text-amber-900 hover:underline"
                >
                  Back to Planner
                </Link>
              </div>
            </Card>
          )}

          {/* Validated Life Budget Proposal Output */}
          {!isLoadingAI && aiResult?.success && proposal && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Phase 2.8 Workflow Control & Status Bar */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {planStatus === "saved" && !isModified ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-300">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                      Saved Plan (Version {savedPlan?.version || 1})
                    </span>
                  ) : planStatus === "approved" ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-extrabold border border-indigo-300">
                      <ShieldCheckIcon className="w-4 h-4 text-indigo-600" />
                      Approved Plan • Ready to Save
                    </span>
                  ) : isModified ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300">
                      <AlertCircleIcon className="w-4 h-4 text-amber-600" />
                      Modified Draft • Explicit Approval Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-extrabold border border-slate-300">
                      <SparklesIcon className="w-4 h-4 text-slate-600" />
                      Draft AI Plan • Unsaved
                    </span>
                  )}

                  {approvedAt && planStatus !== "draft" && (
                    <span className="text-xs text-slate-500 font-medium hidden md:inline-block">
                      Approved on{" "}
                      {new Date(approvedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={handleApprovePlan}
                    disabled={planStatus === "approved" && !isModified}
                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      planStatus === "approved" && !isModified
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>{planStatus === "approved" && !isModified ? "Approved" : "Approve Plan"}</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSavePlan}
                    disabled={planStatus !== "approved" || isSavingPlan}
                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      planStatus === "approved"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    {isSavingPlan ? (
                      <>
                        <RefreshIcon className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>Save Plan</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Feedback Notifications for Save Success / Error */}
              {saveSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {saveError && (
                <div className="p-4 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Top Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 inline-block">
                      AI Monthly Money Plan • {selectedMonthObj.label}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight pt-1">
                      Complete Personal Budget Allocation
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      onClick={handleGeneratePlan}
                      disabled={isLoadingAI}
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs rounded-xl gap-2 cursor-pointer"
                    >
                      <RefreshIcon className="w-3.5 h-3.5" />
                      <span>Regenerate AI Plan</span>
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-indigo-300 font-semibold">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    Verified by MoneyOS deterministic arithmetic
                  </span>
                  <span className="italic text-slate-400">
                    Direct sub-factor edits automatically update category totals and cashflow.
                  </span>
                </div>
              </div>

              {/* Your Month at a Glance */}
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <WalletIcon className="w-4 h-4 text-indigo-600" />
                  <span>Your Month at a Glance</span>
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <Card className="rounded-2xl border-slate-200/80 p-4 bg-white shadow-2xs space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Income
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900 block">
                      ₹{(recalculated?.plannedMonthlyIncome || calcDraft?.totalPlannedIncome || 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Planned Monthly Inflow
                    </span>
                  </Card>

                  <Card className="rounded-2xl border-indigo-200/80 p-4 bg-indigo-50/40 shadow-2xs space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 block">
                      Proposed Spending
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-indigo-900 block">
                      ₹{(recalculated?.totalProposedSpending ?? 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-indigo-700 font-medium block">
                      Category Expenses Total
                    </span>
                  </Card>

                  <Card className="rounded-2xl border-emerald-200/80 p-4 bg-emerald-50/40 shadow-2xs space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Savings
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-emerald-900 block">
                      ₹{(recalculated?.totalProposedSavings ?? proposal.allocations?.savings ?? 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium block">
                      Proposed Target Reserve
                    </span>
                  </Card>

                  <Card className="rounded-2xl border-teal-200/80 p-4 bg-teal-50/40 shadow-2xs space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
                      Safety Buffer
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-teal-900 block">
                      ₹{(recalculated?.totalProposedSafetyBuffer ?? proposal.allocations?.safetyBuffer ?? 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-teal-700 font-medium block">
                      Protected Reserve
                    </span>
                  </Card>

                  <Card
                    className={`rounded-2xl p-4 shadow-2xs space-y-1 col-span-2 lg:col-span-1 ${
                      (recalculated?.recalculatedRemainingMoney ?? 0) >= 0
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-rose-200 bg-rose-50/60"
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                      Remaining
                    </span>
                    <span
                      className={`text-lg sm:text-xl font-extrabold block ${
                        (recalculated?.recalculatedRemainingMoney ?? 0) >= 0
                          ? "text-emerald-900"
                          : "text-rose-900"
                      }`}
                    >
                      ₹{(recalculated?.recalculatedRemainingMoney ?? 0).toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded-full ${
                        (recalculated?.recalculatedRemainingMoney ?? 0) >= 0
                          ? "bg-emerald-200/70 text-emerald-800"
                          : "bg-rose-200/70 text-rose-800"
                      }`}
                    >
                      {(recalculated?.recalculatedRemainingMoney ?? 0) >= 0
                        ? "Surplus Cash"
                        : "Shortfall Deficit"}
                    </span>
                  </Card>
                </div>
              </div>

              {/* Recommended Strategy */}
              <Card className="rounded-2xl border-slate-200/90 shadow-2xs bg-white overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                      <SparklesIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-extrabold text-slate-900">
                        Recommended Strategy
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Personalized allocation overview based on your saved financial inputs.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 space-y-3">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                    {proposal.strategy || proposal.summary}
                  </p>
                  {proposal.summary && proposal.strategy && proposal.summary !== proposal.strategy && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                      {proposal.summary}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Priority Actions / What I'd Change */}
              {proposal.priorityActions && proposal.priorityActions.length > 0 && (
                <Card className="rounded-2xl border-slate-200/90 shadow-2xs bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-extrabold text-slate-900">
                          What I&apos;d Change &amp; Priority Actions
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Actionable recommendations generated from your specific financial context.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {proposal.priorityActions.map((action, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3"
                        >
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                            {action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Editable Life Budget Detailed Categories */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-indigo-600" />
                      <span>Editable Detailed Monthly Budget</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Modify sub-factor amounts directly. MoneyOS immediately recalculates category totals and overall remaining cash.
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/60">
                    Interactive MoneyOS Recalculation Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editableCategories.map((category: AIDetailedCategory) => {
                    const diff = category.suggestedTotal - category.currentAmount;
                    const hasDiff = category.currentAmount > 0 && Math.abs(diff) > 0;

                    return (
                      <Card
                        key={category.id}
                        className="rounded-2xl border-slate-200/90 shadow-2xs bg-white overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-4 sm:p-5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                                  {getCategoryIcon(category.id)}
                                </div>
                                <div>
                                  <CardTitle className="text-base font-extrabold text-slate-900">
                                    {category.title}
                                  </CardTitle>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                                    <span>Current Planner: ₹{category.currentAmount.toLocaleString("en-IN")}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-bold text-indigo-900">
                                      Proposed Total: ₹{category.suggestedTotal.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {hasDiff && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                    diff < 0
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : "bg-amber-100 text-amber-800 border border-amber-200"
                                  }`}
                                >
                                  {diff < 0 ? `-${Math.abs(diff).toLocaleString("en-IN")}` : `+${diff.toLocaleString("en-IN")}`}
                                </span>
                              )}
                            </div>
                          </CardHeader>

                          <CardContent className="p-4 sm:p-5 space-y-2.5">
                            {category.items.length === 0 ? (
                              <p className="text-xs text-slate-400 italic p-2">
                                No specific sub-factors allocated for this category.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {category.items.map((item, itemIdx) => (
                                  <div
                                    key={itemIdx}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors gap-3"
                                  >
                                    <div className="space-y-0.5 min-w-0 pr-2">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-bold text-slate-800 truncate">
                                          {item.name}
                                        </span>
                                        {item.isUserItem && (
                                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 shrink-0">
                                            User Input Item
                                          </span>
                                        )}
                                      </div>
                                      {item.reason && (
                                        <p className="text-[10px] text-slate-500 truncate">
                                          {item.reason}
                                        </p>
                                      )}
                                    </div>

                                    {/* Editable Sub-item amount control */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <span className="text-xs font-semibold text-slate-400">₹</span>
                                      <input
                                        type="number"
                                        min={0}
                                        step={100}
                                        value={item.amount === 0 ? "" : item.amount}
                                        onChange={(e) =>
                                          handleSubItemAmountChange(category.id, itemIdx, e.target.value)
                                        }
                                        className="w-24 sm:w-28 px-2.5 py-1 text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-right cursor-text"
                                        placeholder="0"
                                        aria-label={`Amount for ${item.name}`}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </div>

                        <div className="p-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                            Deterministic Category Total
                          </span>
                          <span className="font-black text-indigo-900 text-sm">
                            ₹{category.suggestedTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* End-of-Month Position Card */}
              {recalculated && (
                <Card className="rounded-2xl border-slate-800 bg-slate-900 text-white p-6 sm:p-8 space-y-5 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <WalletIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-100">
                          End-of-Month Position
                        </h4>
                        <p className="text-xs text-slate-400">
                          Deterministic cash flow statement calculated by MoneyOS engine.
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-black px-3.5 py-1 rounded-full border shrink-0 ${
                        recalculated.recalculatedRemainingMoney > 0
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : recalculated.recalculatedRemainingMoney === 0
                          ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {recalculated.recalculatedRemainingMoney > 0
                        ? "Surplus Position"
                        : recalculated.recalculatedRemainingMoney === 0
                        ? "Balanced Position"
                        : "Shortfall Deficit"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-300 font-semibold">Planned Monthly Income</span>
                      <span className="font-bold text-white">
                        ₹{recalculated.plannedMonthlyIncome.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">− Category Spending</span>
                      <span className="font-semibold text-indigo-300">
                        ₹{recalculated.totalProposedSpending.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">− Proposed Savings Target</span>
                      <span className="font-semibold text-emerald-300">
                        ₹{recalculated.totalProposedSavings.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">− Safety Buffer Reserve</span>
                      <span className="font-semibold text-teal-300">
                        ₹{recalculated.totalProposedSafetyBuffer.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 text-sm sm:text-base">
                      <span className="font-extrabold uppercase tracking-wider text-slate-200">
                        = Net Remaining Cash
                      </span>
                      <span
                        className={`font-black ${
                          recalculated.recalculatedRemainingMoney >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        ₹{recalculated.recalculatedRemainingMoney.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-800/80">
                    * MoneyOS recalculates category item totals, total spending, savings, safety buffer, and remaining money deterministically from sub-factors.
                  </p>
                </Card>
              )}

              {/* Phase 2.7: AI Budget Optimization & Rebalancing Section */}
              <div className="space-y-6 pt-4 border-t border-slate-200/80">
                {/* Optimization Action Card */}
                <Card
                  className={`rounded-2xl border p-6 sm:p-8 space-y-6 shadow-2xs transition-all ${
                    (recalculated?.recalculatedRemainingMoney ?? 0) < 0
                      ? "bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-300/80"
                      : "bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/70 border-indigo-200/80"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            (recalculated?.recalculatedRemainingMoney ?? 0) < 0
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : "bg-indigo-100 text-indigo-900 border-indigo-300"
                          }`}
                        >
                          <SlidersIcon className="w-3.5 h-3.5" />
                          AI Budget Optimization &amp; Rebalancing
                        </span>
                        {(recalculated?.recalculatedRemainingMoney ?? 0) < 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                            Shortfall: -₹{Math.abs(recalculated?.recalculatedRemainingMoney ?? 0).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        {(recalculated?.recalculatedRemainingMoney ?? 0) < 0
                          ? "Fix Shortfall & Rebalance Your Budget"
                          : "Optimize Allocations & Enhance Savings"}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        MoneyOS will evaluate your current working life-budget proposal, protect fixed housing and debt obligations, and propose realistic variable category adjustments.
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
                      <Button
                        type="button"
                        onClick={() => handleOptimizePlan(selectedOptimizationMode)}
                        disabled={isOptimizingAI || isLoadingAI}
                        className={`px-6 py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 ${
                          (recalculated?.recalculatedRemainingMoney ?? 0) < 0
                            ? "bg-amber-700 hover:bg-amber-800 focus-visible:outline-amber-700"
                            : "bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-500"
                        }`}
                      >
                        {isOptimizingAI ? (
                          <>
                            <SparklesIcon className="w-4 h-4 animate-spin shrink-0" />
                            <span>Optimizing Allocation...</span>
                          </>
                        ) : (recalculated?.recalculatedRemainingMoney ?? 0) < 0 ? (
                          <>
                            <AlertCircleIcon className="w-4 h-4 shrink-0" />
                            <span>Fix My Budget</span>
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-4 h-4 shrink-0" />
                            <span>Optimize My Plan</span>
                          </>
                        )}
                      </Button>
                      <span className="text-[10px] text-slate-500 text-center sm:text-right italic">
                        Applies to working plan — review before approving
                      </span>
                    </div>
                  </div>

                  {/* Optimization Intent Modes */}
                  <div className="pt-4 border-t border-slate-200/60 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Select Focus Mode (Optional Optimization Intent):
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { id: "auto", label: "Auto-Detect Best Strategy" },
                        { id: "fix_shortfall", label: "Fix Shortfall" },
                        { id: "increase_savings", label: "Increase Savings" },
                        { id: "protect_safety_buffer", label: "Protect Safety Buffer" },
                        { id: "reduce_discretionary", label: "Reduce Discretionary Spending" },
                      ].map((modeItem) => {
                        const isSelected = selectedOptimizationMode === modeItem.id;
                        return (
                          <button
                            key={modeItem.id}
                            type="button"
                            onClick={() => {
                              setSelectedOptimizationMode(modeItem.id as OptimizationMode);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-slate-900 text-white font-bold shadow-2xs"
                                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                            }`}
                          >
                            {modeItem.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* Loading State */}
                {isOptimizingAI && (
                  <Card className="rounded-2xl border-indigo-200 bg-white p-8 text-center space-y-3 animate-pulse shadow-2xs">
                    <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">Optimizing your monthly plan...</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        MoneyOS is looking for practical ways to improve your allocation.
                      </p>
                    </div>
                  </Card>
                )}

                {/* Error State */}
                {!isOptimizingAI && optimizationResult && !optimizationResult.success && (
                  <Card className="rounded-2xl border-rose-200 bg-rose-50/70 p-6 shadow-2xs space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-rose-900">Optimization Failed</h4>
                        <p className="text-xs text-rose-800 leading-relaxed">
                          {optimizationResult.error || "AI budget optimization is temporarily unavailable. Your saved planner data is safe."}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleOptimizePlan(selectedOptimizationMode)}
                      className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl gap-2 cursor-pointer"
                    >
                      <RefreshIcon className="w-3.5 h-3.5" />
                      <span>Try Optimization Again</span>
                    </Button>
                  </Card>
                )}

                {/* Validated Optimization Proposal Result Output */}
                {!isOptimizingAI && optimizationResult?.success && optimizationResult.optimization && optimizationResult.recalculated && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
                    {/* Strategy & Problem Card */}
                    <Card className="rounded-2xl border-indigo-300/80 bg-white overflow-hidden shadow-2xs">
                      <CardHeader className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                              <SparklesIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-extrabold text-white">
                                AI Optimization Proposal
                              </CardTitle>
                              <CardDescription className="text-xs text-indigo-200">
                                Specific sub-factor adjustments evaluated by MoneyOS engine.
                              </CardDescription>
                            </div>
                          </div>

                          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shrink-0 ${
                            optimizationResult.optimization.problem.type === "shortfall"
                              ? "bg-rose-500/20 text-rose-300 border-rose-400/30"
                              : optimizationResult.optimization.problem.type === "low_savings"
                              ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                          }`}>
                            {optimizationResult.optimization.problem.description}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 sm:p-6 space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Strategy Overview
                          </h4>
                          <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                            {optimizationResult.optimization.summary}
                          </p>
                        </div>

                        {optimizationResult.optimization.expectedOutcome && (
                          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Expected Outcome: </span>
                              <span>{optimizationResult.optimization.expectedOutcome}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* BEFORE vs PROPOSED Summary */}
                    <Card className="rounded-2xl border-slate-200/90 shadow-2xs bg-white overflow-hidden">
                      <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-slate-900 text-white">
                              <PieChartIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-extrabold text-slate-900">
                                Before vs Proposed Rebalancing
                              </CardTitle>
                              <CardDescription className="text-xs text-slate-500">
                                Deterministic MoneyOS calculation comparing working plan vs proposed adjustments.
                              </CardDescription>
                            </div>
                          </div>

                          {optimizationResult.recalculated.improvement.isShortfallResolved && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                              Shortfall Resolved!
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 sm:p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          {/* Income */}
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Monthly Income
                            </span>
                            <span className="text-base font-black text-slate-900 block">
                              ₹{optimizationResult.recalculated.plannedMonthlyIncome.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-500 block">Unchanged</span>
                          </div>

                          {/* Category Spending */}
                          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/70 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
                              Category Spending
                            </span>
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs text-slate-500 line-through">
                                ₹{optimizationResult.recalculated.before.totalSpending.toLocaleString("en-IN")}
                              </span>
                              <span className="text-base font-black text-indigo-950">
                                ₹{optimizationResult.recalculated.proposed.totalSpending.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                              optimizationResult.recalculated.improvement.spendingDifference <= 0 ? "text-emerald-700" : "text-amber-700"
                            }`}>
                              {optimizationResult.recalculated.improvement.spendingDifference <= 0 ? (
                                <>
                                  <TrendingDownIcon className="w-3 h-3 text-emerald-600" />
                                  <span>-₹{Math.abs(optimizationResult.recalculated.improvement.spendingDifference).toLocaleString("en-IN")} Spending</span>
                                </>
                              ) : (
                                <>
                                  <TrendingUpIcon className="w-3 h-3 text-amber-600" />
                                  <span>+₹{optimizationResult.recalculated.improvement.spendingDifference.toLocaleString("en-IN")} Spending</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Savings */}
                          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                              Savings Target
                            </span>
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs text-slate-500">
                                ₹{optimizationResult.recalculated.before.totalSavings.toLocaleString("en-IN")}
                              </span>
                              <span className="text-base font-black text-emerald-950">
                                ₹{optimizationResult.recalculated.proposed.totalSavings.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 inline-flex items-center gap-1">
                              {optimizationResult.recalculated.improvement.savingsDifference >= 0 ? (
                                <>
                                  <TrendingUpIcon className="w-3 h-3 text-emerald-600" />
                                  <span>+₹{optimizationResult.recalculated.improvement.savingsDifference.toLocaleString("en-IN")} Savings</span>
                                </>
                              ) : (
                                <>
                                  <TrendingDownIcon className="w-3 h-3 text-amber-600" />
                                  <span>-₹{Math.abs(optimizationResult.recalculated.improvement.savingsDifference).toLocaleString("en-IN")} Savings</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Safety Buffer */}
                          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/70 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                              Safety Buffer
                            </span>
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs text-slate-500">
                                ₹{optimizationResult.recalculated.before.safetyBuffer.toLocaleString("en-IN")}
                              </span>
                              <span className="text-base font-black text-teal-950">
                                ₹{optimizationResult.recalculated.proposed.safetyBuffer.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-teal-700 block">Protected Reserve</span>
                          </div>

                          {/* Remaining Cash */}
                          <div className={`p-4 rounded-xl border space-y-1 sm:col-span-2 lg:col-span-1 ${
                            optimizationResult.recalculated.proposed.remainingMoney >= 0
                              ? "bg-emerald-100/60 border-emerald-300"
                              : "bg-rose-100/60 border-rose-300"
                          }`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                              Net Remaining Cash
                            </span>
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs text-slate-500 line-through">
                                ₹{optimizationResult.recalculated.before.remainingMoney.toLocaleString("en-IN")}
                              </span>
                              <span className={`text-base font-black ${
                                optimizationResult.recalculated.proposed.remainingMoney >= 0
                                  ? "text-emerald-900"
                                  : "text-rose-900"
                              }`}>
                                ₹{optimizationResult.recalculated.proposed.remainingMoney.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-indigo-900 block">
                              {optimizationResult.recalculated.improvement.remainingMoneyDifference >= 0
                                ? `+₹${optimizationResult.recalculated.improvement.remainingMoneyDifference.toLocaleString("en-IN")} Cashflow`
                                : `-₹${Math.abs(optimizationResult.recalculated.improvement.remainingMoneyDifference).toLocaleString("en-IN")} Cashflow`}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* What Changed Breakdown */}
                    <Card className="rounded-2xl border-slate-200/90 shadow-2xs bg-white overflow-hidden">
                      <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                            <SlidersIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-extrabold text-slate-900">
                              What Changed (Suggested Sub-Factor Rebalancing)
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                              Specific proposed changes with difference recalculations verified by MoneyOS arithmetic.
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 sm:p-6 space-y-3">
                        {optimizationResult.optimization.changes.length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-3 text-center">
                            Your budget allocation is already balanced! No major sub-factor changes required.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {optimizationResult.optimization.changes.map((changeItem: AIOptimizationChange, idx: number) => {
                              const isReduction = changeItem.difference < 0;
                              const isIncrease = changeItem.difference > 0;

                              return (
                                <div
                                  key={idx}
                                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-slate-900">
                                        {changeItem.itemName}
                                      </span>
                                      <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                                        {changeItem.categoryTitle}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                      {changeItem.reason}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                                    <div className="text-right">
                                      <div className="text-xs text-slate-400 line-through">
                                        ₹{changeItem.currentAmount.toLocaleString("en-IN")}
                                      </div>
                                      <div className="text-sm font-extrabold text-slate-900">
                                        ₹{changeItem.suggestedAmount.toLocaleString("en-IN")}
                                      </div>
                                    </div>

                                    <span
                                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                        isReduction
                                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                          : isIncrease
                                          ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                                          : "bg-slate-100 text-slate-800 border-slate-300"
                                      }`}
                                    >
                                      {isReduction
                                        ? `-₹${Math.abs(changeItem.difference).toLocaleString("en-IN")}`
                                        : isIncrease
                                        ? `+₹${changeItem.difference.toLocaleString("en-IN")}`
                                        : "No change"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Priority Actions */}
                    {optimizationResult.optimization.priorityActions && optimizationResult.optimization.priorityActions.length > 0 && (
                      <Card className="rounded-2xl border-slate-200/90 shadow-2xs bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-5 sm:p-6">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                              <CheckCircleIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-extrabold text-slate-900">
                                Optimization Priority Actions
                              </CardTitle>
                              <CardDescription className="text-xs text-slate-500">
                                Recommended next steps to realize your proposed plan balance.
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {optimizationResult.optimization.priorityActions.map((actionText: string, actionIdx: number) => (
                              <div
                                key={actionIdx}
                                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3"
                              >
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                                  {actionIdx + 1}
                                </span>
                                <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                                  {actionText}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Re-optimization bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs text-slate-600 font-medium">
                        Want to test another focus mode or re-optimize?
                      </span>
                      <Button
                        type="button"
                        onClick={() => handleOptimizePlan(selectedOptimizationMode)}
                        disabled={isOptimizingAI}
                        variant="outline"
                        className="bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl gap-2 cursor-pointer"
                      >
                        <RefreshIcon className="w-3.5 h-3.5" />
                        <span>Optimize Again</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Trade-offs & Allocation Considerations */}
              {proposal.tradeoffs && proposal.tradeoffs.length > 0 && (
                <Card className="rounded-2xl border-slate-200/90 shadow-2xs bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                        <ShieldCheckIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-extrabold text-slate-900">
                          Trade-offs &amp; Allocation Considerations
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          What this plan balances and what trade-offs are required.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-6">
                    <ul className="space-y-3">
                      {proposal.tradeoffs.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed p-3 rounded-xl bg-slate-50 border border-slate-200/60"
                        >
                          <ArrowRightIcon className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Phase 2.8: Plan History & Saved Versions Section */}
              <div className="space-y-4 pt-6 border-t border-slate-200/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-indigo-600" />
                      <span>Plan History &amp; Saved Versions</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Saved persistent planning plans for {selectedMonthObj.label}.
                    </p>
                  </div>

                  {savedPlan && (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200/60 shadow-2xs">
                      Current Saved: Version {savedPlan.version}
                    </span>
                  )}
                </div>

                {isLoadingHistory ? (
                  <Card className="p-8 text-center border-slate-200 animate-pulse bg-white/80 space-y-3">
                    <RefreshIcon className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-500">Loading plan history...</p>
                  </Card>
                ) : planHistory.length === 0 ? (
                  <Card className="p-8 text-center border-slate-200/80 bg-white space-y-3 rounded-2xl">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-extrabold text-slate-800">No saved plan versions yet</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Approve and save your edited AI plan above to record a persistent version history for {selectedMonthObj.label}.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {planHistory.map((v) => {
                      const isCurrentSaved = savedPlan?.version === v.version;
                      const isActiveLoaded = loadedVersionNumber === v.version;
                      const isLoadingThis = loadingVersionId === v.id;

                      return (
                        <Card
                          key={v.id}
                          className={`rounded-2xl border bg-white p-5 space-y-4 transition-all duration-200 ${
                            isActiveLoaded
                              ? "border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-md"
                              : isCurrentSaved
                              ? "border-indigo-200 bg-indigo-50/10 shadow-2xs hover:border-indigo-300"
                              : "border-slate-200/80 shadow-2xs hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center flex-wrap gap-1.5">
                              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                                Version {v.version}
                              </span>
                              {isCurrentSaved && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Current Saved
                                </span>
                              )}
                              {isActiveLoaded && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                  Active in Workspace
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] text-slate-500 font-medium shrink-0">
                              {new Date(v.savedAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-0.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Spending</span>
                              <span className="font-black text-slate-900 block truncate">₹{v.totalSpending.toLocaleString("en-IN")}</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-0.5">
                              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Savings</span>
                              <span className="font-black text-emerald-950 block truncate">₹{v.totalSavings.toLocaleString("en-IN")}</span>
                            </div>

                            <div className={`p-2.5 rounded-xl border space-y-0.5 ${
                              v.remainingMoney >= 0 ? "bg-emerald-50/60 border-emerald-200" : "bg-rose-50/60 border-rose-200"
                            }`}>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Net Rem.</span>
                              <span className={`font-black block truncate ${v.remainingMoney >= 0 ? "text-emerald-900" : "text-rose-900"}`}>
                                ₹{v.remainingMoney.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          <div className="pt-1 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-400 font-medium italic">
                              Source: {v.source === "edited" ? "User Edited Plan" : "AI Generated"}
                            </span>

                            <Button
                              type="button"
                              onClick={() => handleOpenHistoryVersion(v)}
                              disabled={loadingVersionId !== null}
                              variant="outline"
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoadingThis ? (
                                <>
                                  <RefreshIcon className="w-3.5 h-3.5 animate-spin" />
                                  <span>Opening...</span>
                                </>
                              ) : (
                                <span>Open Plan</span>
                              )}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>


              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
                <Link
                  href="/protected/planner"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span>Back to Planner</span>
                </Link>

                <Button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={isLoadingAI}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshIcon className="w-4 h-4" />
                  <span>Regenerate AI Plan</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
