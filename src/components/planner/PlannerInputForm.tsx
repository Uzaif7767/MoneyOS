"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  WalletIcon,
  BillsIcon,
  PieChartIcon,
  GoalsIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  SaveIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
  CalendarIcon,
  CopyIcon,
  HeartIcon,
  TagIcon,
  CalendarDaysIcon,
} from "@/components/ui/icons";
import { MoneyInput } from "@/components/ui/money-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RepeatableItemModal } from "@/components/planner/RepeatableItemModal";
import { PlannerSummaryCard } from "@/components/planner/PlannerSummaryCard";
import { PlannerAIInsightsCard } from "@/components/planner/PlannerAIInsightsCard";
import { PlannerAIPlanCTACard } from "@/components/planner/PlannerAIPlanCTACard";
import { calculatePlannerSummary, toSafeNum } from "@/lib/planner/plannerCalculator";
import {
  getPlannerDraftAction,
  savePlannerDraftAction,
  getUserFinancialDefaultsAction,
  type PlannerFormErrors,
} from "@/lib/actions/plannerActions";
import type { PlannerDraft, RepeatablePlannerItem } from "@/types";

interface PlannerInputFormProps {
  selectedMonthId: string;
  selectedMonthLabel: string;
}

type ModalSectionType = "fixed" | "bills" | "subscriptions" | "debt" | "onetime" | null;

export function PlannerInputForm({
  selectedMonthId,

  selectedMonthLabel,
}: PlannerInputFormProps) {
  // Loading & submission state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<PlannerFormErrors>({});

  // Single values
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [currentBalance, setCurrentBalance] = useState<string>("");
  const [expectedIncomeDate, setExpectedIncomeDate] = useState<string>("");
  const [foodAndDailyLiving, setFoodAndDailyLiving] = useState<string>("");
  const [transport, setTransport] = useState<string>("");
  const [housing, setHousing] = useState<string>("");
  const [familyPersonal, setFamilyPersonal] = useState<string>("");
  const [lifestyleDiscretionary, setLifestyleDiscretionary] = useState<string>("");
  const [savingsGoalAmount, setSavingsGoalAmount] = useState<string>("");
  const [safetyBuffer, setSafetyBuffer] = useState<string>("");

  // Repeatable lists
  const [fixedExpenses, setFixedExpenses] = useState<RepeatablePlannerItem[]>([]);
  const [plannedBills, setPlannedBills] = useState<RepeatablePlannerItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<RepeatablePlannerItem[]>([]);
  const [debtEmi, setDebtEmi] = useState<RepeatablePlannerItem[]>([]);
  const [oneTimeExpenses, setOneTimeExpenses] = useState<RepeatablePlannerItem[]>([]);

  // Profile defaults for optional copy action
  const [profileDefaults, setProfileDefaults] = useState<{ monthlyIncome?: number; currentBalance?: number }>({});
  const [isCopyingIncome, setIsCopyingIncome] = useState<boolean>(false);
  const [isCopyingBalance, setIsCopyingBalance] = useState<boolean>(false);

  // Repeatable modal state
  const [modalType, setModalType] = useState<ModalSectionType>(null);
  const [itemToEdit, setItemToEdit] = useState<RepeatablePlannerItem | null>(null);

  // Live calculation derived from input state
  const liveDraft: Partial<PlannerDraft> = useMemo(
    () => ({
      planningMonth: selectedMonthId,
      monthlyIncome: toSafeNum(monthlyIncome),
      currentBalance: toSafeNum(currentBalance),
      expectedIncomeDate,
      fixedExpenses,
      plannedBills,
      subscriptions,
      foodAndDailyLiving: toSafeNum(foodAndDailyLiving),
      transport: toSafeNum(transport),
      housing: toSafeNum(housing),
      familyPersonal: toSafeNum(familyPersonal),
      debtEmi,
      lifestyleDiscretionary: toSafeNum(lifestyleDiscretionary),
      oneTimeExpenses,
      savingsGoalAmount: toSafeNum(savingsGoalAmount),
      safetyBuffer: toSafeNum(safetyBuffer),
    }),
    [
      selectedMonthId,
      monthlyIncome,
      currentBalance,
      expectedIncomeDate,
      fixedExpenses,
      plannedBills,
      subscriptions,
      foodAndDailyLiving,
      transport,
      housing,
      familyPersonal,
      debtEmi,
      lifestyleDiscretionary,
      oneTimeExpenses,
      savingsGoalAmount,
      safetyBuffer,
    ]
  );

  const calcResult = useMemo(
    () => calculatePlannerSummary(liveDraft, selectedMonthId),
    [liveDraft, selectedMonthId]
  );


  // Load profile defaults once
  useEffect(() => {
    let active = true;
    getUserFinancialDefaultsAction().then((res) => {
      if (active && res.success) {
        setProfileDefaults({
          monthlyIncome: res.monthlyIncome,
          currentBalance: res.currentBalance,
        });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Fetch draft when month changes
  useEffect(() => {
    let active = true;

    getPlannerDraftAction(selectedMonthId)
      .then((res) => {

        if (!active) return;
        if (res.success && res.draft) {
          const d = res.draft;
          setMonthlyIncome(d.monthlyIncome !== undefined ? String(d.monthlyIncome) : "");
          setCurrentBalance(d.currentBalance !== undefined ? String(d.currentBalance) : "");
          setExpectedIncomeDate(d.expectedIncomeDate || "");
          setFixedExpenses(d.fixedExpenses || []);
          setPlannedBills(d.plannedBills || []);
          setSubscriptions(d.subscriptions || []);
          setFoodAndDailyLiving(d.foodAndDailyLiving !== undefined ? String(d.foodAndDailyLiving) : "");
          setTransport(d.transport !== undefined ? String(d.transport) : "");
          setHousing(d.housing !== undefined ? String(d.housing) : "");
          setFamilyPersonal(d.familyPersonal !== undefined ? String(d.familyPersonal) : "");
          setDebtEmi(d.debtEmi || []);
          setLifestyleDiscretionary(d.lifestyleDiscretionary !== undefined ? String(d.lifestyleDiscretionary) : "");
          setOneTimeExpenses(d.oneTimeExpenses || []);
          setSavingsGoalAmount(d.savingsGoalAmount !== undefined ? String(d.savingsGoalAmount) : "");
          setSafetyBuffer(d.safetyBuffer !== undefined ? String(d.safetyBuffer) : "");
        } else {
          setMonthlyIncome("");
          setCurrentBalance("");
          setExpectedIncomeDate("");
          setFixedExpenses([]);
          setPlannedBills([]);
          setSubscriptions([]);
          setFoodAndDailyLiving("");
          setTransport("");
          setHousing("");
          setFamilyPersonal("");
          setDebtEmi([]);
          setLifestyleDiscretionary("");
          setOneTimeExpenses([]);
          setSavingsGoalAmount("");
          setSafetyBuffer("");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load planner draft:", err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedMonthId]);

  // Optional copy actions
  const handleCopyIncome = () => {
    if (profileDefaults.monthlyIncome !== undefined) {
      setMonthlyIncome(String(profileDefaults.monthlyIncome));
      setIsCopyingIncome(true);
      setTimeout(() => setIsCopyingIncome(false), 2000);
    }
  };

  const handleCopyBalance = () => {
    if (profileDefaults.currentBalance !== undefined) {
      setCurrentBalance(String(profileDefaults.currentBalance));
      setIsCopyingBalance(true);
      setTimeout(() => setIsCopyingBalance(false), 2000);
    }
  };

  // Repeatable item handlers
  const handleOpenAddModal = (type: ModalSectionType) => {
    setItemToEdit(null);
    setModalType(type);
  };

  const handleOpenEditModal = (type: ModalSectionType, item: RepeatablePlannerItem) => {
    setItemToEdit(item);
    setModalType(type);
  };

  const handleDeleteItem = (type: ModalSectionType, itemId: string) => {
    if (type === "fixed") setFixedExpenses((prev) => prev.filter((i) => i.id !== itemId));
    if (type === "bills") setPlannedBills((prev) => prev.filter((i) => i.id !== itemId));
    if (type === "subscriptions") setSubscriptions((prev) => prev.filter((i) => i.id !== itemId));
    if (type === "debt") setDebtEmi((prev) => prev.filter((i) => i.id !== itemId));
    if (type === "onetime") setOneTimeExpenses((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleSaveModalItem = (item: RepeatablePlannerItem) => {
    if (modalType === "fixed") {
      setFixedExpenses((prev) => {
        const index = prev.findIndex((i) => i.id === item.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = item;
          return next;
        }
        return [...prev, item];
      });
    } else if (modalType === "bills") {
      setPlannedBills((prev) => {
        const index = prev.findIndex((i) => i.id === item.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = item;
          return next;
        }
        return [...prev, item];
      });
    } else if (modalType === "subscriptions") {
      setSubscriptions((prev) => {
        const index = prev.findIndex((i) => i.id === item.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = item;
          return next;
        }
        return [...prev, item];
      });
    } else if (modalType === "debt") {
      setDebtEmi((prev) => {
        const index = prev.findIndex((i) => i.id === item.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = item;
          return next;
        }
        return [...prev, item];
      });
    } else if (modalType === "onetime") {
      setOneTimeExpenses((prev) => {
        const index = prev.findIndex((i) => i.id === item.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = item;
          return next;
        }
        return [...prev, item];
      });
    }
  };

  // Form Submission
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    setErrors({});

    const payload = {
      planningMonth: selectedMonthId,
      monthlyIncome: monthlyIncome === "" ? 0 : Number(monthlyIncome),
      currentBalance: currentBalance === "" ? 0 : Number(currentBalance),
      expectedIncomeDate,
      fixedExpenses,
      plannedBills,
      subscriptions,
      foodAndDailyLiving: foodAndDailyLiving === "" ? 0 : Number(foodAndDailyLiving),
      transport: transport === "" ? 0 : Number(transport),
      housing: housing === "" ? 0 : Number(housing),
      familyPersonal: familyPersonal === "" ? 0 : Number(familyPersonal),
      debtEmi,
      lifestyleDiscretionary: lifestyleDiscretionary === "" ? 0 : Number(lifestyleDiscretionary),
      oneTimeExpenses,
      savingsGoalAmount: savingsGoalAmount === "" ? 0 : Number(savingsGoalAmount),
      safetyBuffer: safetyBuffer === "" ? 0 : Number(safetyBuffer),
    };

    try {
      const result = await savePlannerDraftAction(selectedMonthId, payload);
      if (result.success) {
        setSaveMessage({
          type: "success",
          text: `Plan inputs for ${selectedMonthLabel} saved successfully!`,
        });
      } else {
        setErrors(result.errors || {});
        setSaveMessage({
          type: "error",
          text: result.message || "Failed to save plan inputs. Please review errors above.",
        });
      }
    } catch (err) {
      console.error("Save draft error:", err);
      setSaveMessage({
        type: "error",
        text: "An unexpected server error occurred while saving your plan inputs.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200/90 shadow-2xs text-center space-y-3 animate-pulse">
        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <CalendarIcon className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Loading saved planner inputs for {selectedMonthLabel}...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveDraft} className="space-y-8">
      {/* Top Banner / Notification */}
      {saveMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 ${
            saveMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
          role="alert"
        >
          {saveMessage.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5 text-xs sm:text-sm">
            <p className="font-bold">{saveMessage.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setSaveMessage(null)}
            className="ml-auto text-xs font-bold opacity-75 hover:opacity-100 p-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {errors.form && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Calculated Summary Card (Live) */}
      <PlannerSummaryCard calc={calcResult} monthLabel={selectedMonthLabel} />

      {/* AI Planning Insights Section */}
      <PlannerAIInsightsCard
        planningMonthId={selectedMonthId}
        monthLabel={selectedMonthLabel}
      />

      {/* AI Proposed Monthly Plan Section CTA (Phase 2.5) */}
      <PlannerAIPlanCTACard
        planningMonthId={selectedMonthId}
        monthLabel={selectedMonthLabel}
      />

      {/* ====================================================== */}
      {/* SECTION 1: INCOME & CASH POSITION                      */}
      {/* ====================================================== */}

      <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                1. Income &amp; Cash Position
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Specify expected earnings and current available cash for {selectedMonthLabel}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Salary / Income */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="monthly-income" className="text-xs font-bold text-slate-800">
                  Monthly Income / Salary
                </Label>
                {profileDefaults.monthlyIncome !== undefined && (
                  <button
                    type="button"
                    onClick={handleCopyIncome}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    title="Copy current salary from profile into planner draft"
                  >
                    <CopyIcon className="w-3 h-3" />
                    <span>{isCopyingIncome ? "Copied!" : "Use profile income"}</span>
                  </button>
                )}
              </div>
              <MoneyInput
                id="monthly-income"
                placeholder="e.g. 75000.00"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                error={!!errors.monthlyIncome}
              />
              {errors.monthlyIncome && (
                <p className="text-xs text-rose-500 font-medium">{errors.monthlyIncome}</p>
              )}
            </div>

            {/* Current Balance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="current-balance" className="text-xs font-bold text-slate-800">
                  Starting Balance
                </Label>
                {profileDefaults.currentBalance !== undefined && (
                  <button
                    type="button"
                    onClick={handleCopyBalance}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    title="Copy current balance from profile into planner draft"
                  >
                    <CopyIcon className="w-3 h-3" />
                    <span>{isCopyingBalance ? "Copied!" : "Use profile balance"}</span>
                  </button>
                )}
              </div>
              <MoneyInput
                id="current-balance"
                placeholder="e.g. 25000.00"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                error={!!errors.currentBalance}
              />
              {errors.currentBalance && (
                <p className="text-xs text-rose-500 font-medium">{errors.currentBalance}</p>
              )}
            </div>

            {/* Expected Income Date */}
            <div className="space-y-2">
              <Label htmlFor="expected-income-date" className="text-xs font-bold text-slate-800">
                Expected Income Date
              </Label>
              <Input
                id="expected-income-date"
                type="date"
                value={expectedIncomeDate}
                onChange={(e) => setExpectedIncomeDate(e.target.value)}
                className={`w-full ${errors.expectedIncomeDate ? "border-rose-500" : ""}`}
              />
              {errors.expectedIncomeDate && (
                <p className="text-xs text-rose-500 font-medium">{errors.expectedIncomeDate}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* SECTION 2: FIXED COMMITMENTS (Fixed, Bills, Subs)       */}
      {/* ====================================================== */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
              <BillsIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                2. Fixed Commitments
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Plan expected fixed expenses, upcoming bills, and recurring subscriptions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Sub-section: Fixed Expenses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Fixed Expenses</h4>
                <p className="text-xs text-slate-400">Rent, house maintenance, essential overhead</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenAddModal("fixed")}
                className="gap-1 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Add Fixed Expense</span>
              </Button>
            </div>

            {fixedExpenses.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No planned fixed expenses added yet. Click &quot;Add Fixed Expense&quot; above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fixedExpenses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      <p className="text-sm font-extrabold text-emerald-700">₹{item.amount.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal("fixed", item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                        title="Edit item"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem("fixed", item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                        title="Delete item"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Sub-section: Planned Bills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Planned Bills</h4>
                <p className="text-xs text-slate-400">Electricity, internet, water, insurance premiums</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenAddModal("bills")}
                className="gap-1 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Add Planned Bill</span>
              </Button>
            </div>

            {plannedBills.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No planned bills added yet. Click &quot;Add Planned Bill&quot; above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plannedBills.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      <p className="text-sm font-extrabold text-emerald-700">₹{item.amount.toLocaleString("en-IN")}</p>
                      {item.dueDate && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <CalendarDaysIcon className="w-3 h-3" />
                          <span>Due: {item.dueDate}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal("bills", item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                        title="Edit bill"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem("bills", item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                        title="Delete bill"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Sub-section: Subscriptions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Subscriptions</h4>
                <p className="text-xs text-slate-400">Software, streaming, gym, membership plans</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenAddModal("subscriptions")}
                className="gap-1 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Add Subscription</span>
              </Button>
            </div>

            {subscriptions.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No subscriptions added yet. Click &quot;Add Subscription&quot; above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subscriptions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.name}</p>
                      <p className="text-sm font-extrabold text-emerald-700">₹{item.amount.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal("subscriptions", item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                        title="Edit subscription"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem("subscriptions", item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                        title="Delete subscription"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* SECTION 3: EVERYDAY LIVING                             */}
      {/* ====================================================== */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                3. Everyday Living
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Estimate routine day-to-day spending allowances for {selectedMonthLabel}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Food & Daily Living */}
            <div className="space-y-2">
              <Label htmlFor="food-daily" className="text-xs font-bold text-slate-800">
                Food / Daily Living
              </Label>
              <MoneyInput
                id="food-daily"
                placeholder="e.g. 15000.00"
                value={foodAndDailyLiving}
                onChange={(e) => setFoodAndDailyLiving(e.target.value)}
                error={!!errors.foodAndDailyLiving}
              />
              {errors.foodAndDailyLiving && (
                <p className="text-xs text-rose-500 font-medium">{errors.foodAndDailyLiving}</p>
              )}
            </div>

            {/* Transport */}
            <div className="space-y-2">
              <Label htmlFor="transport" className="text-xs font-bold text-slate-800">
                Transport / Fuel
              </Label>
              <MoneyInput
                id="transport"
                placeholder="e.g. 4000.00"
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                error={!!errors.transport}
              />
              {errors.transport && (
                <p className="text-xs text-rose-500 font-medium">{errors.transport}</p>
              )}
            </div>

            {/* Housing */}
            <div className="space-y-2">
              <Label htmlFor="housing" className="text-xs font-bold text-slate-800">
                Housing / Utilities
              </Label>
              <MoneyInput
                id="housing"
                placeholder="e.g. 8000.00"
                value={housing}
                onChange={(e) => setHousing(e.target.value)}
                error={!!errors.housing}
              />
              {errors.housing && (
                <p className="text-xs text-rose-500 font-medium">{errors.housing}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* SECTION 4: FAMILY & PERSONAL RESPONSIBILITIES          */}
      {/* ====================================================== */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <HeartIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                4. Family &amp; Personal Responsibilities
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Account for family support, remittance, child care, or personal support funds.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-md space-y-2">
            <Label htmlFor="family-personal" className="text-xs font-bold text-slate-800">
              Family &amp; Personal Support Amount
            </Label>
            <MoneyInput
              id="family-personal"
              placeholder="e.g. 5000.00"
              value={familyPersonal}
              onChange={(e) => setFamilyPersonal(e.target.value)}
              error={!!errors.familyPersonal}
            />
            {errors.familyPersonal && (
              <p className="text-xs text-rose-500 font-medium">{errors.familyPersonal}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* SECTION 5: DEBT / EMI                                  */}
      {/* ====================================================== */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                <TagIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                  5. Debt / EMI Obligations
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Track planned loan installments, credit card EMIs, or debt repayments.
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenAddModal("debt")}
              className="gap-1 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Add Debt / EMI</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {debtEmi.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              No debt or EMI items added. Click &quot;Add Debt / EMI&quot; to include debt commitments.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {debtEmi.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                    <p className="text-sm font-extrabold text-rose-700">₹{item.amount.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal("debt", item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                      title="Edit debt"
                    >
                      <EditIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem("debt", item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                      title="Delete debt"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* SECTION 6: LIFESTYLE / DISCRETIONARY                   */}
      {/* ====================================================== */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                6. Lifestyle &amp; Discretionary
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Set a planned limit for leisure, dining out, hobbies, and shopping.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-md space-y-2">
            <Label htmlFor="lifestyle" className="text-xs font-bold text-slate-800">
              Lifestyle &amp; Discretionary Budget
            </Label>
            <MoneyInput
              id="lifestyle"
              placeholder="e.g. 6000.00"
              value={lifestyleDiscretionary}
              onChange={(e) => setLifestyleDiscretionary(e.target.value)}
              error={!!errors.lifestyleDiscretionary}
            />
            {errors.lifestyleDiscretionary && (
              <p className="text-xs text-rose-500 font-medium">{errors.lifestyleDiscretionary}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* SECTION 7: ONE-TIME PLANNED EXPENSES                   */}
      {/* ====================================================== */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-700 shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                  7. One-Time Planned Expenses
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Account for single events, upcoming travel, vehicle repairs, or annual fees.
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenAddModal("onetime")}
              className="gap-1 text-xs font-semibold hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Add One-Time Expense</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {oneTimeExpenses.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              No one-time expenses planned yet. Click &quot;Add One-Time Expense&quot; above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {oneTimeExpenses.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                    <p className="text-sm font-extrabold text-orange-700">₹{item.amount.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal("onetime", item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                      title="Edit item"
                    >
                      <EditIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem("onetime", item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                      title="Delete item"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* SECTION 8: SAVINGS & SAFETY BUFFER                     */}
      {/* ====================================================== */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <GoalsIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                8. Savings Target &amp; Safety Buffer
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Define intended monthly wealth accumulation and your protective cash reserve.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Savings Goal Amount */}
            <div className="space-y-2">
              <Label htmlFor="savings-goal" className="text-xs font-bold text-slate-800">
                Savings Target Amount
              </Label>
              <MoneyInput
                id="savings-goal"
                placeholder="e.g. 15000.00"
                value={savingsGoalAmount}
                onChange={(e) => setSavingsGoalAmount(e.target.value)}
                error={!!errors.savingsGoalAmount}
              />
              {errors.savingsGoalAmount && (
                <p className="text-xs text-rose-500 font-medium">{errors.savingsGoalAmount}</p>
              )}
              <p className="text-[11px] text-slate-400">
                Target savings allocation for {selectedMonthLabel}.
              </p>
            </div>

            {/* Safety Buffer Amount */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="safety-buffer" className="text-xs font-bold text-slate-800">
                  Safety Buffer Reserve
                </Label>
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <MoneyInput
                id="safety-buffer"
                placeholder="e.g. 5000.00"
                value={safetyBuffer}
                onChange={(e) => setSafetyBuffer(e.target.value)}
                error={!!errors.safetyBuffer}
              />
              {errors.safetyBuffer && (
                <p className="text-xs text-rose-500 font-medium">{errors.safetyBuffer}</p>
              )}
              <p className="text-[11px] text-emerald-700/80 font-medium">
                This is the amount you want to keep reserved and untouched for unexpected situations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Sticky / Floating Save Action Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 text-center sm:text-left">
          <span className="font-bold text-slate-800 block sm:inline">
            Target Month: {selectedMonthLabel}
          </span>{" "}
          Inputs will be saved strictly as planner draft data.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Draft...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SaveIcon className="w-4 h-4" />
                <span>Save Plan Inputs</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Repeatable Item Modal */}
      <RepeatableItemModal
        open={modalType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setModalType(null);
            setItemToEdit(null);
          }
        }}
        sectionTitle={
          modalType === "fixed"
            ? "Fixed Expense"
            : modalType === "bills"
            ? "Planned Bill"
            : modalType === "subscriptions"
            ? "Subscription"
            : modalType === "debt"
            ? "Debt / EMI"
            : modalType === "onetime"
            ? "One-Time Expense"
            : "Item"
        }
        itemToEdit={itemToEdit}
        showDueDateField={modalType === "bills"}
        onSaveItem={handleSaveModalItem}
      />
    </form>
  );
}
