"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Button } from "./button";
import { AlertCircleIcon } from "./icons";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
}: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-2xl shrink-0 border",
              isDestructive ? "bg-rose-50 text-rose-600 border-rose-200/80" : "bg-amber-50 text-amber-600 border-amber-200/80"
            )}
          >
            <AlertCircleIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <DialogHeader className="mb-1">
              <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm leading-relaxed">{description}</DialogDescription>
            </DialogHeader>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
