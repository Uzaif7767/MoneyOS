"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { SparklesIcon, ChevronDownIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { AICoachEmptyState } from "@/components/ai-coach/AICoachEmptyState";
import { ChatMessage } from "@/components/ai-coach/ChatMessage";
import { ChatComposer } from "@/components/ai-coach/ChatComposer";
import { AICoachLoading } from "@/components/ai-coach/AICoachLoading";
import { AICoachError } from "@/components/ai-coach/AICoachError";
import { useAICoach } from "@/components/ai-coach/useAICoach";

export function AICoachPageClient() {
  const {
    messages,
    inputPrompt,
    setInputPrompt,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    selectStarterPrompt,
    clearChat,
  } = useAICoach();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState<boolean>(false);
  const isNearBottomRef = useRef<boolean>(true);

  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  }, []);

  // Monitor scroll position to toggle floating scroll button & preserve position
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 80;
    isNearBottomRef.current = nearBottom;
    setShowScrollBottomBtn(!nearBottom && scrollHeight > clientHeight);
  };

  // Auto-scroll on new messages only if user was near bottom
  useEffect(() => {
    if (isNearBottomRef.current || messages.length === 1) {
      scrollToBottom(true);
    }
  }, [messages, isLoading, error, scrollToBottom]);

  const handleSendMessage = async (prompt?: string) => {
    isNearBottomRef.current = true;
    await sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] md:h-[calc(100vh-5rem)] max-w-4xl mx-auto">
      {/* Page Header */}
      <header className="py-2.5 px-1 border-b border-slate-200/80 mb-3 sm:mb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            <SparklesIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                AI Coach
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                MoneyOS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide bg-slate-100 text-slate-700 rounded-full border border-slate-200/90 flex items-center gap-1" title="AI Coach is read-only and cannot modify your financial records.">
                <ShieldCheckIcon className="w-3 h-3 text-slate-500" />
                Read-only
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Your personal smart financial coach • Read-only assistant
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            disabled={isLoading}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100/80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            Clear chat
          </button>
        )}
      </header>

      {/* Main Workspace Surface */}
      <div className="relative flex-1 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col min-h-0">
        {/* Messages / Welcome View Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col relative"
        >
          {messages.length === 0 ? (
            <AICoachEmptyState onSelectPrompt={(p) => handleSendMessage(p)} />
          ) : (
            <div className="flex-1 space-y-3 pb-2">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isLoading && <AICoachLoading />}

              {error && (
                <AICoachError message={error} onRetry={retryLastMessage} />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll to bottom floating control */}
        {showScrollBottomBtn && messages.length > 0 && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            aria-label="Scroll to bottom"
            className="absolute bottom-20 right-6 z-20 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-medium shadow-md flex items-center gap-1.5 backdrop-blur-xs transition-all animate-in fade-in zoom-in duration-150 active:scale-95"
          >
            <span>Scroll to latest</span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        )}

        {/* Input Composer Section */}
        <div className="p-2.5 sm:p-3 bg-slate-50/90 border-t border-slate-200/80 shrink-0">
          <ChatComposer
            value={inputPrompt}
            onChange={setInputPrompt}
            onSend={() => handleSendMessage()}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}


