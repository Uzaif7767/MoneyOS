"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AICoachMascotIcon, XIcon, ChevronDownIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { AICoachEmptyState } from "@/components/ai-coach/AICoachEmptyState";
import { ChatMessage } from "@/components/ai-coach/ChatMessage";
import { ChatComposer } from "@/components/ai-coach/ChatComposer";
import { AICoachLoading } from "@/components/ai-coach/AICoachLoading";
import { AICoachError } from "@/components/ai-coach/AICoachError";
import { useAICoach } from "@/components/ai-coach/useAICoach";

export function FloatingAICoach() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState<boolean>(false);
  const isNearBottomRef = useRef<boolean>(true);

  // Do not display floating launcher on the full AI Coach route
  const isFullAICoachPage =
    pathname === "/protected/ai-coach" ||
    pathname?.startsWith("/protected/ai-coach/");

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

  // Monitor scroll position inside floating panel
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 60;
    isNearBottomRef.current = nearBottom;
    setShowScrollBottomBtn(!nearBottom && scrollHeight > clientHeight);
  };

  // Auto-scroll on message updates
  useEffect(() => {
    if (isOpen && (isNearBottomRef.current || messages.length === 1)) {
      scrollToBottom(true);
    }
  }, [messages, isOpen, isLoading, error, scrollToBottom]);

  // Focus composer input on panel open & handle keyboard shortcuts
  useEffect(() => {
    if (isOpen) {
      // Focus textarea inside panel after paint
      const timer = setTimeout(() => {
        const textarea = panelRef.current?.querySelector("textarea");
        textarea?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close panel on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (prompt?: string) => {
    isNearBottomRef.current = true;
    await sendMessage(prompt);
  };

  if (isFullAICoachPage) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 md:bottom-6 md:right-8 z-40">
      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="MoneyOS AI Coach Assistant"
          className="fixed bottom-[5.5rem] right-3 left-3 sm:left-auto sm:right-6 md:bottom-22 md:right-8 w-auto sm:w-[380px] md:w-[400px] max-w-[calc(100vw-1.5rem)] h-[520px] max-h-[calc(100vh-7.5rem)] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200 motion-reduce:animate-none z-40"
        >
          {/* Header */}
          <header className="p-3.5 px-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <AICoachMascotIcon className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white leading-tight">
                    AI Coach
                  </h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wide bg-slate-800 text-slate-300 rounded border border-slate-700/80 flex items-center gap-1" title="Read-only assistant">
                    <ShieldCheckIcon className="w-2.5 h-2.5 text-emerald-400" />
                    Read-only
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Your MoneyOS financial assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  disabled={isLoading}
                  className="text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                aria-label="Close AI Coach"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Messages / Welcome Content */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3.5 flex flex-col bg-slate-50/50 relative"
          >
            {messages.length === 0 ? (
              <AICoachEmptyState onSelectPrompt={(p) => handleSendMessage(p)} />
            ) : (
              <div className="flex-1 space-y-3 pb-1">
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

          {/* Scroll to bottom button inside panel */}
          {showScrollBottomBtn && messages.length > 0 && (
            <button
              type="button"
              onClick={() => scrollToBottom(true)}
              aria-label="Scroll to bottom"
              className="absolute bottom-16 right-4 z-20 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-[11px] font-medium shadow-md flex items-center gap-1 backdrop-blur-xs transition-all animate-in fade-in zoom-in duration-150 active:scale-95"
            >
              <span>Scroll to latest</span>
              <ChevronDownIcon className="w-3 h-3 text-emerald-400" />
            </button>
          )}

          {/* Footer Composer */}
          <div className="p-2.5 bg-white border-t border-slate-200/80 shrink-0">
            <ChatComposer
              value={inputPrompt}
              onChange={setInputPrompt}
              onSend={() => handleSendMessage()}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Floating Launcher Button Container */}
      <div className="relative group">
        {/* Soft Ambient Glow backdrop */}
        <span className="absolute -inset-0.5 rounded-full bg-emerald-500/30 blur-md group-hover:bg-emerald-500/50 transition-all opacity-80 group-hover:opacity-100" />

        {/* Launcher Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close AI Coach" : "Open AI Coach"}
          aria-expanded={isOpen}
          className={`relative w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-950/25 border border-emerald-300/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/60 ${
            !isOpen ? "animate-launcher-ding" : ""
          }`}
        >
          {isOpen ? (
            <XIcon className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <AICoachMascotIcon className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-white drop-shadow-xs group-hover:scale-110 transition-transform" />
          )}

          {/* Subtle status indicator dot (when closed) */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 ring-1 ring-emerald-300/50" />
          )}
        </button>
      </div>
    </div>
  );
}


