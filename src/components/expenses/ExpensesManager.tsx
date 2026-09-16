"use client";

import Link from "next/link";
import React, { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Expense, ExpenseCategory } from "@/types";
import { EXPENSE_CATEGORIES } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
  type ExpenseFormErrors,
} from "@/lib/actions/expenseActions";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
  ExpensesIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  RupeeSignIcon,
  CalendarIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "@/components/ui/icons";

interface ExpensesManagerProps {
  initialExpenses: Expense[];
}

export function ExpensesManager({ initialExpenses }: ExpensesManagerProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  // Modal Dialog State
  const isAddActionParam = searchParams.get("action") === "add";
  const [isAddOpen, setIsAddOpen] = useState(isAddActionParam);
  const [prevIsAddActionParam, setPrevIsAddActionParam] = useState(isAddActionParam);

  if (isAddActionParam !== prevIsAddActionParam) {
    setPrevIsAddActionParam(isAddActionParam);
    if (isAddActionParam) {
      setIsAddOpen(true);
    }
  }

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // Form Field State
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState<ExpenseCategory>("Food");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formNote, setFormNote] = useState("");
  const [formErrors, setFormErrors] = useState<ExpenseFormErrors>({});
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reset Form
  const resetForm = () => {
    setFormAmount("");
    setFormCategory("Food");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormNote("");
    setFormErrors({});
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (exp: Expense) => {
    setFormAmount(String(exp.amount));
    setFormCategory((exp.category as ExpenseCategory) || "Other");
    setFormDate(exp.date ? exp.date.split("T")[0] : new Date().toISOString().split("T")[0]);
    setFormNote(exp.note || exp.notes || exp.title || "");
    setFormErrors({});
    setEditingExpense(exp);
  };

  // Validate Client Inputs
  const validateForm = (): boolean => {
    const errors: ExpenseFormErrors = {};
    const amt = Number(formAmount);

    if (!formAmount || isNaN(amt)) {
      errors.amount = "Please enter a valid monetary amount.";
    } else if (amt <= 0) {
      errors.amount = "Amount must be greater than ₹0.";
    }

    if (!formCategory) {
      errors.category = "Please select a category.";
    }

    if (!formDate) {
      errors.date = "Please select a valid date.";
    } else if (isNaN(new Date(formDate).getTime())) {
      errors.date = "Please provide a valid date string.";
    }

    if (formNote.length > 500) {
      errors.note = "Note cannot exceed 500 characters.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Submit (Create / Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      amount: Number(formAmount),
      category: formCategory,
      date: formDate,
      note: formNote,
    };

    startTransition(async () => {
      setFeedbackMessage(null);
      if (editingExpense) {
        // Edit flow
        const res = await updateExpenseAction(editingExpense.id, payload);
        if (res.success && res.expense) {
          setExpenses((prev) =>
            prev.map((item) => (item.id === res.expense!.id ? res.expense! : item))
          );
          setEditingExpense(null);
          resetForm();
          setFeedbackMessage({ type: "success", text: "Expense updated successfully!" });
        } else {
          setFormErrors(res.errors || { form: res.message || "Failed to update expense." });
        }
      } else {
        // Create flow
        const res = await createExpenseAction(payload);
        if (res.success && res.expense) {
          setExpenses((prev) => [res.expense!, ...prev]);
          setIsAddOpen(false);
          resetForm();
          setFeedbackMessage({ type: "success", text: "Expense added successfully!" });
        } else {
          setFormErrors(res.errors || { form: res.message || "Failed to add expense." });
        }
      }
    });
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deletingExpense) return;

    startTransition(async () => {
      const res = await deleteExpenseAction(deletingExpense.id);
      if (res.success) {
        setExpenses((prev) => prev.filter((item) => item.id !== deletingExpense.id));
        setDeletingExpense(null);
        setFeedbackMessage({ type: "success", text: "Expense deleted successfully." });
      } else {
        setFeedbackMessage({
          type: "error",
          text: res.errors?.form || "Failed to delete expense record.",
        });
      }
    });
  };

  // Filtered Expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      (exp.note && exp.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exp.title && exp.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exp.category && exp.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(exp.amount).includes(searchQuery);

    const matchesCategory =
      selectedCategoryFilter === "ALL" ||
      exp.category?.toLowerCase() === selectedCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Calculate Real Total Spending
  const totalSpending = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Category Badge Colors
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Food":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "Travel":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "Shopping":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "Rent":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "Bills":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "Recharge":
        return "bg-cyan-50 text-cyan-700 border-cyan-200/80";
      case "Entertainment":
        return "bg-pink-50 text-pink-700 border-pink-200/80";
      case "Health":
        return "bg-teal-50 text-teal-700 border-teal-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatDateString = (dateStr: string) => {
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
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Standardized Page Header */}
      <PageHeader
        title="Expenses Tracker"
        description="Track and understand where your money goes in Indian Rupees (₹)."
        badgeText="Expenses Management"
        badgeIcon={ExpensesIcon}
        action={
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/protected/help#expenses"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 underline transition-colors shrink-0"
            >
              Help & Guide →
            </Link>
            <Button onClick={handleOpenAdd} className="w-full sm:w-auto shadow-2xs font-bold gap-2">
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              <span>Add Expense</span>
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Spent</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(totalSpending)}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <RupeeSignIcon className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Transactions</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {expenses.length}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <ExpensesIcon className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filtered Records</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {filteredExpenses.length}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
            <CalendarIcon className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Search & Category Filter Controls */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by note, title, category or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-xs sm:text-sm bg-slate-50/50"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="w-full sm:w-48 shrink-0">
            <Select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="h-11 text-xs sm:text-sm"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Expense List Table (Desktop) / Cards (Mobile) */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Logged Expenses ({filteredExpenses.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time expense transactions from your account.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredExpenses.length === 0 ? (
            /* Genuine Empty State */
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
              <div className="p-4 rounded-2xl bg-slate-100 text-slate-400 mb-4 border border-slate-200">
                <ExpensesIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {expenses.length === 0 ? "No Expenses Logged Yet" : "No Matching Expenses Found"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
                {expenses.length === 0
                  ? "Add your first expense to start understanding your spending."
                  : "Try clearing your search query or changing category filters."}
              </p>
              {expenses.length === 0 && (
                <Button onClick={handleOpenAdd} className="gap-2 font-bold">
                  <PlusIcon className="w-4 h-4 stroke-[3]" />
                  <span>Add First Expense</span>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Date</TableHead>
                      <TableHead className="w-36">Category</TableHead>
                      <TableHead>Note / Description</TableHead>
                      <TableHead className="text-right w-36">Amount (₹)</TableHead>
                      <TableHead className="text-right w-28">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((exp) => {
                      const noteText = exp.note || exp.notes || exp.title || "—";
                      return (
                        <TableRow key={exp.id}>
                          <TableCell className="font-semibold text-xs text-slate-600">
                            {formatDateString(exp.date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-semibold px-2.5 py-0.5 border",
                                getCategoryBadgeClass(exp.category)
                              )}
                            >
                              {exp.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 text-sm">
                            {noteText}
                          </TableCell>
                          <TableCell className="text-right font-extrabold text-slate-900 text-sm">
                            {formatCurrency(exp.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(exp)}
                                className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                                title="Edit Expense"
                              >
                                <EditIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingExpense(exp)}
                                className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete Expense"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredExpenses.map((exp) => {
                  const noteText = exp.note || exp.notes || exp.title || "Expense";
                  return (
                    <div key={exp.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 min-w-0 flex-1 pr-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-semibold px-2 py-0.5 border mb-1 inline-block",
                              getCategoryBadgeClass(exp.category)
                            )}
                          >
                            {exp.category}
                          </Badge>
                          <h4 className="text-sm font-bold text-slate-900 break-words">{noteText}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {formatDateString(exp.date)}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-base font-extrabold text-slate-900">
                            {formatCurrency(exp.amount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(exp)}
                          className="h-8 text-xs gap-1 text-slate-700"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingExpense(exp)}
                          className="h-8 text-xs gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Expense Modal Dialog */}
      <Dialog
        open={isAddOpen || Boolean(editingExpense)}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingExpense(null);
            resetForm();
          }
        }}
      >
        <DialogContent
          onClose={() => {
            setIsAddOpen(false);
            setEditingExpense(null);
            resetForm();
          }}
        >
          <form onSubmit={handleSubmitForm}>
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? "Edit Expense Record" : "Add New Expense"}
              </DialogTitle>
              <DialogDescription>
                Enter transaction details to record your expense in Indian Rupees (₹).
              </DialogDescription>
            </DialogHeader>

            {/* General form error alert */}
            {formErrors.form && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formErrors.form}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Amount Field (Using Reusable MoneyInput) */}
              <div className="space-y-1.5">
                <Label htmlFor="expense-amount" className="text-xs font-bold text-slate-700">
                  Amount (₹ INR) <span className="text-rose-500">*</span>
                </Label>
                <MoneyInput
                  id="expense-amount"
                  placeholder="e.g. 450"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  error={Boolean(formErrors.amount)}
                  required
                />
                {formErrors.amount && (
                  <p className="text-xs text-rose-600 font-medium">{formErrors.amount}</p>
                )}
              </div>

              {/* Category Field */}
              <div className="space-y-1.5">
                <Label htmlFor="expense-category" className="text-xs font-bold text-slate-700">
                  Category <span className="text-rose-500">*</span>
                </Label>
                <Select
                  id="expense-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                  error={Boolean(formErrors.category)}
                  required
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
                {formErrors.category && (
                  <p className="text-xs text-rose-600 font-medium">{formErrors.category}</p>
                )}
              </div>

              {/* Date Field */}
              <div className="space-y-1.5">
                <Label htmlFor="expense-date" className="text-xs font-bold text-slate-700">
                  Transaction Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  error={Boolean(formErrors.date)}
                  required
                />
                {formErrors.date && (
                  <p className="text-xs text-rose-600 font-medium">{formErrors.date}</p>
                )}
              </div>

              {/* Description / Note Field */}
              <div className="space-y-1.5">
                <Label htmlFor="expense-note" className="text-xs font-bold text-slate-700">
                  Description / Note <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="expense-note"
                  type="text"
                  placeholder="e.g. Grocery shopping at DMart"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  error={Boolean(formErrors.note)}
                  maxLength={500}
                />
                {formErrors.note && (
                  <p className="text-xs text-rose-600 font-medium">{formErrors.note}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingExpense(null);
                  resetForm();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="font-bold">
                {isPending ? "Saving..." : editingExpense ? "Update Expense" : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={Boolean(deletingExpense)}
        onOpenChange={(open) => {
          if (!open) setDeletingExpense(null);
        }}
        title="Delete Expense Record"
        description={`Are you sure you want to permanently delete this expense of ${
          deletingExpense ? formatCurrency(deletingExpense.amount) : "₹0"
        }? This action cannot be undone.`}
        confirmLabel="Delete Expense"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
