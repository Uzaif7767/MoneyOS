"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { RepeatablePlannerItem } from "@/types";

interface RepeatableItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionTitle: string;
  itemToEdit?: RepeatablePlannerItem | null;
  showDueDateField?: boolean;
  onSaveItem: (item: RepeatablePlannerItem) => void;
}

interface RepeatableItemFormProps {
  sectionTitle: string;
  itemToEdit?: RepeatablePlannerItem | null;
  showDueDateField?: boolean;
  onSaveItem: (item: RepeatablePlannerItem) => void;
  onClose: () => void;
}

function RepeatableItemForm({
  sectionTitle,
  itemToEdit,
  showDueDateField,
  onSaveItem,
  onClose,
}: RepeatableItemFormProps) {
  const [name, setName] = useState<string>(itemToEdit?.name || "");
  const [amount, setAmount] = useState<string>(
    itemToEdit?.amount !== undefined ? String(itemToEdit.amount) : ""
  );
  const [dueDate, setDueDate] = useState<string>(itemToEdit?.dueDate || "");
  const [nameError, setNameError] = useState<string>("");
  const [amountError, setAmountError] = useState<string>("");

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    let valid = true;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount < 0) {
      setAmountError("Please enter a valid non-negative amount.");
      valid = false;
    } else {
      setAmountError("");
    }

    if (!valid) return;

    onSaveItem({
      id: itemToEdit?.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      amount: parsedAmount,
      ...(showDueDateField && dueDate.trim() ? { dueDate: dueDate.trim() } : {}),
    });

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div onKeyDown={handleKeyDown} className="space-y-4 my-2">
      {/* Name Field */}
      <div className="space-y-1.5">
        <Label htmlFor="item-name" className="text-xs font-bold text-slate-700">
          Item Name <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="item-name"
          placeholder={`e.g. ${sectionTitle === "Bill" ? "Electricity Bill" : sectionTitle === "Subscription" ? "Streaming Service" : "Office Rent"}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={nameError ? "border-rose-500 focus-visible:ring-rose-500/20" : ""}
        />
        {nameError && <p className="text-xs text-rose-500 font-medium">{nameError}</p>}
      </div>

      {/* Amount Field */}
      <div className="space-y-1.5">
        <Label htmlFor="item-amount" className="text-xs font-bold text-slate-700">
          Expected Amount <span className="text-rose-500">*</span>
        </Label>
        <MoneyInput
          id="item-amount"
          placeholder="e.g. 1500.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={!!amountError}
        />
        {amountError && <p className="text-xs text-rose-500 font-medium">{amountError}</p>}
      </div>

      {/* Optional Due Date Field for Bills */}
      {showDueDateField && (
        <div className="space-y-1.5">
          <Label htmlFor="item-due-date" className="text-xs font-bold text-slate-700">
            Optional Due Date
          </Label>
          <Input
            id="item-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="block w-full"
          />
          <p className="text-[11px] text-slate-400">
            Expected due date for this planned bill item in the selected month.
          </p>
        </div>
      )}

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
        >
          {itemToEdit ? "Save Item" : "Add Item"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function RepeatableItemModal({
  open,
  onOpenChange,
  sectionTitle,
  itemToEdit,
  showDueDateField = false,
  onSaveItem,
}: RepeatableItemModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {itemToEdit ? `Edit ${sectionTitle}` : `Add ${sectionTitle}`}
          </DialogTitle>
          <DialogDescription>
            Enter the details for this planned item. Inputs will be saved strictly as planner draft data.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <RepeatableItemForm
            key={itemToEdit ? itemToEdit.id : "new_item"}
            sectionTitle={sectionTitle}
            itemToEdit={itemToEdit}
            showDueDateField={showDueDateField}
            onSaveItem={onSaveItem}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
