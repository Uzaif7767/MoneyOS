"use client";

import Link from "next/link";
import React, { useState, useTransition } from "react";
import type { Bill, RecurrenceFrequency } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  createBillAction,
  updateBillAction,
  deleteBillAction,
  toggleBillPaidAction,
  type BillFormErrors,
} from "@/lib/actions/billActions";

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
  BillsIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  CalendarIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "@/components/ui/icons";

interface BillsManagerProps {
  initialBills: Bill[];
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

/**
 * Derives dynamic status from due date and paid flag.
 */
function getBillStatus(bill: Bill): {
  label: "Paid" | "Overdue" | "Due Soon" | "Pending";
  variant: "emerald" | "destructive" | "amber" | "outline";
} {
  if (bill.isPaid) {
    return { label: "Paid", variant: "emerald" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(bill.dueDate);
  due.setHours(0, 0, 0, 0);

  if (isNaN(due.getTime())) {
    return { label: "Pending", variant: "outline" };
  }

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: "Overdue", variant: "destructive" };
  } else if (diffDays <= 3) {
    return { label: "Due Soon", variant: "amber" };
  }

  return { label: "Pending", variant: "outline" };
}

export function BillsManager({ initialBills }: BillsManagerProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [isPending, startTransition] = useTransition();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PAID" | "OVERDUE">("ALL");

  // Modal Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);

  // Form Field State
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [formIsRecurring, setFormIsRecurring] = useState<"yes" | "no">("no");
  const [formFrequency, setFormFrequency] = useState<RecurrenceFrequency>("monthly");
  const [formNote, setFormNote] = useState("");
  const [formIsPaid, setFormIsPaid] = useState(false);

  const [formErrors, setFormErrors] = useState<BillFormErrors>({});
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Reset Form fields
  const resetForm = () => {
    setFormTitle("");
    setFormAmount("");
    setFormDueDate(new Date().toISOString().split("T")[0]);
    setFormIsRecurring("no");
    setFormFrequency("monthly");
    setFormNote("");
    setFormIsPaid(false);
    setFormErrors({});
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (bill: Bill) => {
    setFormTitle(bill.title);
    setFormAmount(String(bill.amount));
    setFormDueDate(bill.dueDate ? bill.dueDate.split("T")[0] : new Date().toISOString().split("T")[0]);
    setFormIsRecurring(bill.isRecurring ? "yes" : "no");
    setFormFrequency(bill.frequency || "monthly");
    setFormNote(bill.note || "");
    setFormIsPaid(bill.isPaid);
    setFormErrors({});
    setEditingBill(bill);
  };

  // Client-Side Input Validation
  const validateForm = (): boolean => {
    const errors: BillFormErrors = {};
    const amt = Number(formAmount);

    if (!formTitle.trim()) {
      errors.title = "Bill name / title is required.";
    }

    if (!formAmount || isNaN(amt)) {
      errors.amount = "Please enter a valid monetary amount.";
    } else if (amt <= 0) {
      errors.amount = "Amount must be greater than ₹0.";
    }

    if (!formDueDate) {
      errors.dueDate = "Please select a valid due date.";
    } else if (isNaN(new Date(formDueDate).getTime())) {
      errors.dueDate = "Please provide a valid date string.";
    }

    if (formIsRecurring !== "yes" && formIsRecurring !== "no") {
      errors.isRecurring = "Please specify if this bill is recurring (Yes or No).";
    }

    if (formIsRecurring === "yes" && !formFrequency) {
      errors.frequency = "Please select a recurrence frequency.";
    }

    if (formNote.length > 500) {
      errors.note = "Note cannot exceed 500 characters.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission (Create / Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: formTitle,
      amount: Number(formAmount),
      dueDate: formDueDate,
      isRecurring: formIsRecurring === "yes",
      frequency: formIsRecurring === "yes" ? formFrequency : undefined,
      note: formNote,
      isPaid: formIsPaid,
    };

    startTransition(async () => {
      setFeedbackMessage(null);

      if (editingBill) {
        // Edit flow
        const res = await updateBillAction(editingBill.id, payload);
        if (res.success && res.bill) {
          setBills((prev) =>
            prev.map((item) => (item.id === res.bill!.id ? res.bill! : item))
          );
          setEditingBill(null);
          resetForm();
          setFeedbackMessage({ type: "success", text: "Bill updated successfully!" });
        } else {
          setFormErrors(res.errors || { form: res.message || "Failed to update bill." });
        }
      } else {
        // Create flow
        const res = await createBillAction(payload);
        if (res.success && res.bill) {
          setBills((prev) => [res.bill!, ...prev]);
          setIsAddOpen(false);
          resetForm();
          setFeedbackMessage({ type: "success", text: "Bill created successfully!" });
        } else {
          setFormErrors(res.errors || { form: res.message || "Failed to create bill." });
        }
      }
    });
  };

  // Handle Toggle Paid Status directly from list
  const handleTogglePaid = (bill: Bill) => {
    const nextStatus = !bill.isPaid;
    startTransition(async () => {
      setFeedbackMessage(null);
      const res = await toggleBillPaidAction(bill.id, nextStatus);
      if (res.success && res.bill) {
        setBills((prev) =>
          prev.map((item) => (item.id === res.bill!.id ? res.bill! : item))
        );
        setFeedbackMessage({
          type: "success",
          text: nextStatus ? `"${bill.title}" marked as Paid.` : `"${bill.title}" marked as Pending.`,
        });
      } else {
        setFeedbackMessage({
          type: "error",
          text: res.errors?.form || "Failed to update bill status.",
        });
      }
    });
  };

  // Handle Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingBill) return;

    startTransition(async () => {
      setFeedbackMessage(null);
      const res = await deleteBillAction(deletingBill.id);
      if (res.success) {
        setBills((prev) => prev.filter((item) => item.id !== deletingBill.id));
        setDeletingBill(null);
        setFeedbackMessage({ type: "success", text: "Bill deleted successfully." });
      } else {
        setFeedbackMessage({
          type: "error",
          text: res.errors?.form || "Failed to delete bill record.",
        });
      }
    });
  };

  // Filtered Bills List
  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.note && bill.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(bill.amount).includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    const statusInfo = getBillStatus(bill);
    if (statusFilter === "PAID") return statusInfo.label === "Paid";
    if (statusFilter === "PENDING") return statusInfo.label === "Pending" || statusInfo.label === "Due Soon";
    if (statusFilter === "OVERDUE") return statusInfo.label === "Overdue";

    return true;
  });

  // KPI Calculations (Real user data only)
  const pendingBills = bills.filter((b) => !b.isPaid);
  const pendingCount = pendingBills.length;
  const totalUpcomingUnpaid = pendingBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const monthlyRecurringTotal = bills
    .filter((b) => b.isRecurring)
    .reduce((sum, b) => {
      const amt = Number(b.amount) || 0;
      if (b.frequency === "yearly") {
        return sum + amt / 12;
      }
      return sum + amt;
    }, 0);

  const paidCount = bills.filter((b) => b.isPaid).length;

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Bills & Subscriptions"
        description="Manage recurring bills, subscriptions, and payment schedules in Indian Rupees (₹)."
        badgeText="Bills Management"
        badgeIcon={BillsIcon}
        action={
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/protected/help#bills"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 underline transition-colors shrink-0"
            >
              Help & Guide →
            </Link>
            <Button onClick={handleOpenAdd} className="w-full sm:w-auto shadow-2xs font-bold gap-2">
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              <span>Add Bill</span>
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
        {/* Card 1: Upcoming Unpaid Bills Count */}
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unpaid Bills</p>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Bills awaiting payment
          </p>
        </Card>

        {/* Card 2: Upcoming Unpaid Bills Total Amount */}
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unpaid Amount (₹)</p>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalUpcomingUnpaid)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Total pending due amount
          </p>
        </Card>

        {/* Card 3: Monthly Recurring Total */}
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Monthly Commitment</p>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(monthlyRecurringTotal)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Normalized monthly total
          </p>
        </Card>

        {/* Card 4: Paid Bills Count */}
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid Bills</p>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{paidCount}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Bills settled & marked paid
          </p>
        </Card>
      </div>

      {/* 3. Search & Filter Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search bills by title or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-xs sm:text-sm bg-slate-50/50"
            />
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | "PENDING" | "PAID" | "OVERDUE")
              }
              className="h-11 text-xs sm:text-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending / Due Soon</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PAID">Paid</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* 4. Bills Table / Cards Container */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Recorded Bills ({filteredBills.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Scheduled obligations and recurring subscriptions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredBills.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
              <div className="p-4 rounded-2xl bg-slate-100 text-slate-400 mb-4 border border-slate-200">
                <CalendarIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {bills.length === 0 ? "No Bills Recorded Yet" : "No Matching Bills Found"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">
                {bills.length === 0
                  ? "Record your recurring obligations or upcoming bills to protect your Safe-to-Spend pool."
                  : "Try clearing your search query or changing status filters."}
              </p>
              {bills.length === 0 && (
                <Button onClick={handleOpenAdd} className="gap-2 font-bold">
                  <PlusIcon className="w-4 h-4 stroke-[3]" />
                  <span>Add First Bill</span>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table Presentation */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Bill Title</TableHead>
                      <TableHead>Amount (₹)</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Recurrence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBills.map((bill) => {
                      const statusInfo = getBillStatus(bill);

                      return (
                        <TableRow key={bill.id}>
                          <TableCell className="font-bold text-slate-900">
                            <div className="space-y-0.5">
                              <span className="text-sm font-bold text-slate-900 block">
                                {bill.title}
                              </span>
                              {bill.note && (
                                <span className="text-xs text-slate-500 font-normal block truncate max-w-xs">
                                  {bill.note}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm font-extrabold text-slate-900">
                              {formatCurrency(bill.amount)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs font-semibold text-slate-600">
                              {formatDate(bill.dueDate)}
                            </span>
                          </TableCell>

                          <TableCell>
                            {bill.isRecurring ? (
                              <Badge variant="secondary" className="text-xs capitalize font-semibold">
                                {bill.frequency || "Monthly"}
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">One-time</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <Badge variant={statusInfo.variant} className="text-xs font-bold">
                              {statusInfo.label}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isPending}
                                onClick={() => handleTogglePaid(bill)}
                                title={bill.isPaid ? "Mark as Pending" : "Mark as Paid"}
                                className={cn(
                                  "h-8 px-2.5 text-xs font-bold rounded-lg transition-colors",
                                  bill.isPaid
                                    ? "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                    : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                                )}
                              >
                                {bill.isPaid ? "Mark Unpaid" : "Mark Paid"}
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isPending}
                                onClick={() => handleOpenEdit(bill)}
                                title="Edit Bill"
                                className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              >
                                <EditIcon className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isPending}
                                onClick={() => setDeletingBill(bill)}
                                title="Delete Bill"
                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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

              {/* Mobile Card Stack Presentation */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredBills.map((bill) => {
                  const statusInfo = getBillStatus(bill);

                  return (
                    <div key={bill.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1 pr-2">
                          <h4 className="text-sm font-bold text-slate-900 break-words">{bill.title}</h4>
                          {bill.note && (
                            <p className="text-xs text-slate-500 mt-0.5 font-medium break-words">{bill.note}</p>
                          )}
                        </div>
                        <span className="text-base font-extrabold text-slate-900">
                          {formatCurrency(bill.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-500">
                          Due: <strong className="text-slate-700">{formatDate(bill.dueDate)}</strong>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {bill.isRecurring ? (
                            <Badge variant="secondary" className="text-[10px] capitalize py-0 font-semibold">
                              {bill.frequency || "Monthly"}
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-slate-400">One-time</span>
                          )}
                          <Badge variant={statusInfo.variant} className="text-[10px] py-0 font-bold">
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleTogglePaid(bill)}
                          className={cn(
                            "h-8 text-xs font-semibold px-2.5",
                            bill.isPaid
                              ? "text-slate-500 hover:bg-slate-100"
                              : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          )}
                        >
                          {bill.isPaid ? "Mark Unpaid" : "Mark Paid"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleOpenEdit(bill)}
                          className="h-8 text-xs text-slate-700"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => setDeletingBill(bill)}
                          className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          Delete
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

      {/* 5. Add / Edit Bill Modal (shadcn Dialog) */}
      <Dialog
        open={isAddOpen || editingBill !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingBill(null);
            resetForm();
          }
        }}
      >
        <DialogContent
          onClose={() => {
            setIsAddOpen(false);
            setEditingBill(null);
            resetForm();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {editingBill ? "Edit Bill Details" : "Record New Bill"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for your bill or subscription in Indian Rupees (₹).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            {formErrors.form && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formErrors.form}</span>
              </div>
            )}

            {/* Bill Name / Title */}
            <div className="space-y-1.5">
              <Label htmlFor="bill-title" className="text-xs font-bold text-slate-700">
                Bill Name / Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="bill-title"
                placeholder="e.g. Electricity Bill, Netflix, House Rent"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                error={Boolean(formErrors.title)}
                required
              />
              {formErrors.title && (
                <p className="text-xs text-rose-600 font-medium">{formErrors.title}</p>
              )}
            </div>

            {/* Amount (Using MoneyInput) */}
            <div className="space-y-1.5">
              <Label htmlFor="bill-amount" className="text-xs font-bold text-slate-700">
                Amount (₹ INR) <span className="text-rose-500">*</span>
              </Label>
              <MoneyInput
                id="bill-amount"
                placeholder="e.g. 1499"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                error={Boolean(formErrors.amount)}
                required
              />
              {formErrors.amount && (
                <p className="text-xs text-rose-600 font-medium">{formErrors.amount}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="bill-duedate" className="text-xs font-bold text-slate-700">
                Due Date <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="bill-duedate"
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                error={Boolean(formErrors.dueDate)}
                required
              />
              {formErrors.dueDate && (
                <p className="text-xs text-rose-600 font-medium">{formErrors.dueDate}</p>
              )}
            </div>

            {/* Is Recurring Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="bill-recurring" className="text-xs font-bold text-slate-700">
                Recurring Bill? <span className="text-rose-500">*</span>
              </Label>
              <Select
                id="bill-recurring"
                value={formIsRecurring}
                onChange={(e) => setFormIsRecurring(e.target.value as "yes" | "no")}
                error={Boolean(formErrors.isRecurring)}
              >
                <option value="no">No — One-time payment</option>
                <option value="yes">Yes — Recurring subscription/bill</option>
              </Select>
              {formErrors.isRecurring && (
                <p className="text-xs text-rose-600 font-medium">{formErrors.isRecurring}</p>
              )}
            </div>

            {/* Recurrence Frequency (Only visible when Recurring = Yes) */}
            {formIsRecurring === "yes" && (
              <div className="space-y-1.5 pl-3 border-l-2 border-emerald-400">
                <Label htmlFor="bill-frequency" className="text-xs font-bold text-slate-700">
                  Recurrence Frequency <span className="text-rose-500">*</span>
                </Label>
                <Select
                  id="bill-frequency"
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value as RecurrenceFrequency)}
                  error={Boolean(formErrors.frequency)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Select>
                {formErrors.frequency && (
                  <p className="text-xs text-rose-600 font-medium">{formErrors.frequency}</p>
                )}
              </div>
            )}

            {/* Optional Note */}
            <div className="space-y-1.5">
              <Label htmlFor="bill-note" className="text-xs font-bold text-slate-700">
                Optional Note / Description
              </Label>
              <Input
                id="bill-note"
                placeholder="e.g. Auto-debit on 5th of every month"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                error={Boolean(formErrors.note)}
              />
              {formErrors.note && (
                <p className="text-xs text-rose-600 font-medium">{formErrors.note}</p>
              )}
            </div>

            {/* Payment Status Switch */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <Label htmlFor="bill-paid-status" className="text-xs font-bold text-slate-700 cursor-pointer">
                Mark as Already Paid
              </Label>
              <input
                id="bill-paid-status"
                type="checkbox"
                checked={formIsPaid}
                onChange={(e) => setFormIsPaid(e.target.checked)}
                className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingBill(null);
                  resetForm();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="font-bold">
                {isPending ? "Saving..." : editingBill ? "Update Bill" : "Save Bill"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Delete Confirmation AlertDialog */}
      <AlertDialog
        open={deletingBill !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingBill(null);
        }}
        title="Confirm Bill Deletion"
        description={`Are you sure you want to delete the bill record for "${
          deletingBill?.title || ""
        }" (${deletingBill ? formatCurrency(deletingBill.amount) : "₹0"})? This action cannot be undone.`}
        confirmLabel="Delete Bill"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
