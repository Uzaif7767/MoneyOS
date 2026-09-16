"use client";

import Link from "next/link";
import React, { useState, useTransition } from "react";
import type { Goal } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  createGoalAction,
  updateGoalAction,
  deleteGoalAction,
  addContributionAction,
  removeContributionAction,
  type GoalFormErrors,
} from "@/lib/actions/goalActions";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  GoalsIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  CalendarIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "@/components/ui/icons";

interface GoalsManagerProps {
  initialGoals: Goal[];
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getDaysRemaining(targetDateStr?: string): string | null {
  if (!targetDateStr) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);

    if (isNaN(target.getTime())) return null;

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Target date passed (${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago)`;
    } else if (diffDays === 0) {
      return "Target date is today!";
    } else {
      return `${diffDays} day${diffDays === 1 ? "" : "s"} remaining`;
    }
  } catch {
    return null;
  }
}

export function GoalsManager({ initialGoals }: GoalsManagerProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isPending, startTransition] = useTransition();

  // Search Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [contributionGoal, setContributionGoal] = useState<{
    goal: Goal;
    type: "add" | "remove";
  } | null>(null);

  // Goal Form Fields
  const [formName, setFormName] = useState("");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formCurrentAmount, setFormCurrentAmount] = useState("0");
  const [formTargetDate, setFormTargetDate] = useState("");

  // Contribution Form Field
  const [contributionAmountInput, setContributionAmountInput] = useState("");

  const [formErrors, setFormErrors] = useState<GoalFormErrors>({});
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const resetForm = () => {
    setFormName("");
    setFormTargetAmount("");
    setFormCurrentAmount("0");
    setFormTargetDate("");
    setFormErrors({});
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (goal: Goal) => {
    setFormName(goal.name || goal.title || "");
    setFormTargetAmount(String(goal.targetAmount));
    setFormCurrentAmount(String(goal.currentAmount));
    setFormTargetDate(goal.targetDate ? goal.targetDate.split("T")[0] : "");
    setFormErrors({});
    setEditingGoal(goal);
  };

  // Open Contribution Dialog
  const handleOpenContribution = (goal: Goal, type: "add" | "remove") => {
    setContributionAmountInput("");
    setFormErrors({});
    setContributionGoal({ goal, type });
  };

  // Client Validation for Goal Form
  const validateGoalForm = (): boolean => {
    const errors: GoalFormErrors = {};
    const target = Number(formTargetAmount);
    const current = Number(formCurrentAmount);

    if (!formName.trim()) {
      errors.name = "Goal name is required.";
    }

    if (!formTargetAmount || isNaN(target)) {
      errors.targetAmount = "Please enter a valid target amount.";
    } else if (target <= 0) {
      errors.targetAmount = "Target amount must be a positive number greater than ₹0.";
    }

    if (formCurrentAmount && isNaN(current)) {
      errors.currentAmount = "Current saved amount must be a valid number.";
    } else if (current < 0) {
      errors.currentAmount = "Current saved amount cannot be negative.";
    }

    if (formTargetDate) {
      const parsedDate = new Date(formTargetDate);
      if (isNaN(parsedDate.getTime())) {
        errors.targetDate = "Please enter a valid date.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Goal Form (Create / Edit)
  const handleSubmitGoalForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateGoalForm()) return;

    const payload = {
      name: formName,
      targetAmount: Number(formTargetAmount),
      currentAmount: Number(formCurrentAmount) || 0,
      targetDate: formTargetDate || undefined,
    };

    startTransition(async () => {
      setFeedbackMessage(null);

      if (editingGoal) {
        // Edit flow
        const res = await updateGoalAction(editingGoal.id, payload);
        if (res.success && res.goal) {
          setGoals((prev) =>
            prev.map((item) => (item.id === res.goal!.id ? res.goal! : item))
          );
          setEditingGoal(null);
          resetForm();
          setFeedbackMessage({ type: "success", text: "Goal updated successfully!" });
        } else {
          setFormErrors(res.errors || { form: res.message || "Failed to update goal." });
        }
      } else {
        // Create flow
        const res = await createGoalAction(payload);
        if (res.success && res.goal) {
          setGoals((prev) => [res.goal!, ...prev]);
          setIsAddOpen(false);
          resetForm();
          setFeedbackMessage({ type: "success", text: "Goal created successfully!" });
        } else {
          setFormErrors(res.errors || { form: res.message || "Failed to create goal." });
        }
      }
    });
  };

  // Submit Contribution Form
  const handleSubmitContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributionGoal) return;

    const amt = Number(contributionAmountInput);
    if (!contributionAmountInput || isNaN(amt) || amt <= 0) {
      setFormErrors({
        contributionAmount: "Please enter a valid positive contribution amount greater than ₹0.",
      });
      return;
    }

    const { goal, type } = contributionGoal;

    if (type === "remove" && amt > goal.currentAmount) {
      setFormErrors({
        contributionAmount: `Cannot withdraw ₹${amt.toLocaleString(
          "en-IN"
        )}. Current saved balance is ₹${goal.currentAmount.toLocaleString("en-IN")}.`,
      });
      return;
    }

    startTransition(async () => {
      setFeedbackMessage(null);

      const res =
        type === "add"
          ? await addContributionAction(goal.id, amt)
          : await removeContributionAction(goal.id, amt);

      if (res.success && res.goal) {
        setGoals((prev) =>
          prev.map((item) => (item.id === res.goal!.id ? res.goal! : item))
        );
        setContributionGoal(null);
        setContributionAmountInput("");
        setFormErrors({});
        setFeedbackMessage({
          type: "success",
          text: res.message || "Contribution updated successfully!",
        });
      } else {
        setFormErrors(res.errors || { form: res.message || "Failed to process contribution." });
      }
    });
  };

  // Confirm Delete Goal
  const handleConfirmDelete = () => {
    if (!deletingGoal) return;

    startTransition(async () => {
      setFeedbackMessage(null);
      const res = await deleteGoalAction(deletingGoal.id);
      if (res.success) {
        setGoals((prev) => prev.filter((item) => item.id !== deletingGoal.id));
        setDeletingGoal(null);
        setFeedbackMessage({ type: "success", text: "Goal deleted successfully." });
      } else {
        setFeedbackMessage({
          type: "error",
          text: res.errors?.form || "Failed to delete goal record.",
        });
      }
    });
  };

  // Filtered Goals
  const filteredGoals = goals.filter((g) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const nameStr = (g.name || g.title || "").toLowerCase();
    return nameStr.includes(q) || String(g.targetAmount).includes(q) || String(g.currentAmount).includes(q);
  });

  // KPI Calculations
  const totalGoalsCount = goals.length;
  const totalTargetAmount = goals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
  const totalSavedAmount = goals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);
  const totalRemainingAmount = Math.max(totalTargetAmount - totalSavedAmount, 0);
  const overallProgressPercent =
    totalTargetAmount > 0
      ? Math.min(Math.round((totalSavedAmount / totalTargetAmount) * 100), 100)
      : 0;
  const completedGoalsCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Savings Goals"
        description="Set, fund, and track milestone goals in Indian Rupees (₹)."
        badgeText="Goals & Milestones"
        badgeIcon={GoalsIcon}
        action={
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/protected/help#goals"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 underline transition-colors shrink-0"
            >
              Help & Guide →
            </Link>
            <Button onClick={handleOpenAdd} className="w-full sm:w-auto shadow-2xs font-bold gap-2">
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              <span>Add Goal</span>
            </Button>
          </div>
        }
      />

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          className={cn(
            "p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-all border shadow-2xs",
            feedbackMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
              : "bg-rose-50 text-rose-800 border-rose-200/80"
          )}
        >
          <div className="flex items-center gap-2.5 font-medium">
            {feedbackMessage.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Target (₹)</p>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalTargetAmount)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Across {totalGoalsCount} goal{totalGoalsCount === 1 ? "" : "s"}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Saved Pool (₹)</p>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {formatCurrency(totalSavedAmount)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Goal allocation funds
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Shortfall to Target (₹)</p>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {formatCurrency(totalRemainingAmount)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Remaining to save
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Overall Progress</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900">
              {overallProgressPercent}%
            </span>
            <Badge variant="emerald" className="text-xs font-bold">
              {completedGoalsCount}/{totalGoalsCount} Met
            </Badge>
          </div>
          <Progress value={overallProgressPercent} className="h-2 mt-2 bg-slate-200/80" />
        </Card>
      </div>

      {/* 3. Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search goals by title or target amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 text-xs sm:text-sm bg-slate-50/50"
          />
        </div>
      </Card>

      {/* 4. Goal Cards Grid */}
      <div>
        {filteredGoals.length === 0 ? (
          <Card className="p-8 sm:p-12">
            <CardContent className="p-0 flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-2xl bg-slate-100 text-slate-400 mb-4 border border-slate-200">
                <GoalsIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {goals.length === 0 ? "No Goals Created Yet" : "No Matching Goals Found"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
                {goals.length === 0
                  ? "Set your first savings goal to track your financial targets and protect allocation funds."
                  : "Try clearing your search query to see all goals."}
              </p>
              {goals.length === 0 && (
                <Button onClick={handleOpenAdd} className="gap-2 font-bold">
                  <PlusIcon className="w-4 h-4 stroke-[3]" />
                  <span>Create First Goal</span>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGoals.map((goal) => {
              const target = Number(goal.targetAmount) || 1;
              const current = Number(goal.currentAmount) || 0;
              const remaining = Math.max(target - current, 0);
              const progressPct = Math.min(Math.round((current / target) * 100), 100);
              const isCompleted = current >= target;
              const goalName = goal.name || goal.title || "Savings Goal";
              const daysRemainingText = getDaysRemaining(goal.targetDate);

              return (
                <Card
                  key={goal.id}
                  className={cn(
                    "p-6 flex flex-col justify-between space-y-4 transition-all border-slate-200/90",
                    isCompleted && "border-emerald-300 bg-emerald-50/20"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 break-words">
                            {goalName}
                          </h3>
                          {isCompleted && (
                            <Badge variant="emerald" className="text-[10px] font-bold py-0">
                              Completed 🎉
                            </Badge>
                          )}
                        </div>
                        {goal.targetDate ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                              Target: {formatDate(goal.targetDate)}
                            </span>
                            {daysRemainingText && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({daysRemainingText})
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 font-medium mt-1">No target date set</p>
                        )}
                      </div>

                      <Badge
                        variant={isCompleted ? "emerald" : "outline"}
                        className="text-xs font-extrabold"
                      >
                        {progressPct}%
                      </Badge>
                    </div>

                    {/* Progress Visual */}
                    <div className="space-y-1.5">
                      <Progress value={progressPct} className="h-2.5 bg-slate-200/80" />
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-emerald-700">
                          Saved: {formatCurrency(current)}
                        </span>
                        <span className="text-slate-600">
                          Target: {formatCurrency(target)}
                        </span>
                      </div>
                    </div>

                    {/* Remaining Box */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-500">Shortfall to goal:</span>
                      <span className="font-bold text-slate-900">
                        {isCompleted ? "₹0 (Target Met)" : formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleOpenContribution(goal, "add")}
                        className="h-8 text-xs font-bold text-emerald-700 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 gap-1"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span>Deposit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending || current <= 0}
                        onClick={() => handleOpenContribution(goal, "remove")}
                        className="h-8 text-xs font-semibold text-slate-700"
                      >
                        <span>Withdraw</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={() => handleOpenEdit(goal)}
                        title="Edit Goal"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={() => setDeletingGoal(goal)}
                        title="Delete Goal"
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Add / Edit Goal Modal */}
      <Dialog
        open={isAddOpen || editingGoal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingGoal(null);
            resetForm();
          }
        }}
      >
        <DialogContent
          onClose={() => {
            setIsAddOpen(false);
            setEditingGoal(null);
            resetForm();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? "Edit Savings Goal" : "Create Savings Goal"}
            </DialogTitle>
            <DialogDescription>
              Define your financial milestone target in Indian Rupees (₹).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitGoalForm} className="space-y-4">
            {formErrors.form && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formErrors.form}</span>
              </div>
            )}

            {/* Goal Name */}
            <div className="space-y-1.5">
              <Label htmlFor="goal-name" className="text-xs font-bold text-slate-700">
                Goal Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="goal-name"
                placeholder="e.g. Emergency Fund, New Laptop, Vacation"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                error={Boolean(formErrors.name)}
                required
              />
              {formErrors.name && (
                <p className="text-xs text-rose-600 font-medium">{formErrors.name}</p>
              )}
            </div>

            {/* Target Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="goal-target" className="text-xs font-bold text-slate-700">
                Target Amount (₹ INR) <span className="text-rose-500">*</span>
              </Label>
              <MoneyInput
                id="goal-target"
                placeholder="50000"
                value={formTargetAmount}
                onChange={(e) => setFormTargetAmount(e.target.value)}
                error={Boolean(formErrors.targetAmount)}
                required
              />
              {formErrors.targetAmount && (
                <p className="text-xs text-rose-600 font-medium">{formErrors.targetAmount}</p>
              )}
            </div>

            {/* Current Saved Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="goal-current" className="text-xs font-bold text-slate-700">
                Starting Saved Balance (₹ INR)
              </Label>
              <MoneyInput
                id="goal-current"
                placeholder="0"
                value={formCurrentAmount}
                onChange={(e) => setFormCurrentAmount(e.target.value)}
                error={Boolean(formErrors.currentAmount)}
              />
              {formErrors.currentAmount && (
                <p className="text-xs text-rose-600 font-medium">{formErrors.currentAmount}</p>
              )}
            </div>

            {/* Target Date */}
            <div className="space-y-1.5">
              <Label htmlFor="goal-date" className="text-xs font-bold text-slate-700">
                Target Date <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                id="goal-date"
                type="date"
                value={formTargetDate}
                onChange={(e) => setFormTargetDate(e.target.value)}
                error={Boolean(formErrors.targetDate)}
              />
              {formErrors.targetDate && (
                <p className="text-xs text-rose-600 font-medium">{formErrors.targetDate}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingGoal(null);
                  resetForm();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="font-bold">
                {isPending ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Contribution Modal (Add / Remove Funds) */}
      <Dialog
        open={contributionGoal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setContributionGoal(null);
            setContributionAmountInput("");
            setFormErrors({});
          }
        }}
      >
        <DialogContent
          onClose={() => {
            setContributionGoal(null);
            setContributionAmountInput("");
            setFormErrors({});
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {contributionGoal?.type === "add" ? "Deposit Funds to Goal" : "Withdraw Funds from Goal"}
            </DialogTitle>
            <DialogDescription>
              {contributionGoal?.type === "add"
                ? `Allocate funds to "${contributionGoal?.goal.name || contributionGoal?.goal.title}".`
                : `Withdraw funds from "${contributionGoal?.goal.name || contributionGoal?.goal.title}".`}
            </DialogDescription>
          </DialogHeader>

          {contributionGoal && (
            <form onSubmit={handleSubmitContribution} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Saved Balance:</span>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(contributionGoal.goal.currentAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Target Amount:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(contributionGoal.goal.targetAmount)}
                  </span>
                </div>
              </div>

              {formErrors.form && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formErrors.form}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="contrib-amount" className="text-xs font-bold text-slate-700">
                  {contributionGoal.type === "add" ? "Deposit Amount (₹ INR)" : "Withdrawal Amount (₹ INR)"}{" "}
                  <span className="text-rose-500">*</span>
                </Label>
                <MoneyInput
                  id="contrib-amount"
                  placeholder="1000"
                  value={contributionAmountInput}
                  onChange={(e) => setContributionAmountInput(e.target.value)}
                  error={Boolean(formErrors.contributionAmount)}
                  required
                />
                {formErrors.contributionAmount && (
                  <p className="text-xs text-rose-600 font-medium">
                    {formErrors.contributionAmount}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setContributionGoal(null);
                    setContributionAmountInput("");
                    setFormErrors({});
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="font-bold"
                >
                  {isPending
                    ? "Processing..."
                    : contributionGoal.type === "add"
                    ? "Confirm Deposit"
                    : "Confirm Withdrawal"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 7. Delete Goal AlertDialog */}
      <AlertDialog
        open={deletingGoal !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingGoal(null);
        }}
        title="Delete Savings Goal"
        description={`Are you sure you want to delete "${
          deletingGoal?.name || deletingGoal?.title || ""
        }"? This action will remove the goal record from your account.`}
        confirmLabel="Delete Goal"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
