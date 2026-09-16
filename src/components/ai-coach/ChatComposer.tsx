"use client";

import React, { useRef, useEffect } from "react";
import { SendIcon } from "@/components/ui/icons";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled = false,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize height up to 140px max
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const isSubmitDisabled = disabled || !value.trim();

  return (
    <div className="w-full max-w-3xl mx-auto p-1.5 sm:p-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
      <div className="flex items-end gap-2 px-1.5 sm:px-2 py-0.5">
        <label htmlFor="ai-coach-input" className="sr-only">
          Ask AI Coach a question
        </label>
        <textarea
          id="ai-coach-input"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your MoneyOS finances..."
          disabled={disabled}
          className="w-full resize-none border-0 bg-transparent p-1.5 sm:p-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 min-h-[38px] max-h-[140px] leading-relaxed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => {
            if (!isSubmitDisabled) {
              onSend();
            }
          }}
          disabled={isSubmitDisabled}
          aria-label="Send message"
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
            isSubmitDisabled
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          }`}
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

