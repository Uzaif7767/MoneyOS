"use client";

import { useState, useCallback } from "react";
import { MessageItem } from "@/components/ai-coach/ChatMessage";
import { sendAICoachMessageAction } from "@/lib/actions/aiCoachActions";

export function useAICoach() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (promptText?: string) => {
      const textToSend = (promptText !== undefined ? promptText : inputPrompt).trim();
      if (!textToSend || isLoading) return;

      setError(null);
      setLastFailedPrompt(null);
      setIsLoading(true);

      const userMessage: MessageItem = {
        id: `msg-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        role: "user",
        content: textToSend,
        timestamp: new Date().toISOString(),
      };

      const historyForServer = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMessage]);
      setInputPrompt("");

      try {
        const res = await sendAICoachMessageAction(textToSend, historyForServer);

        if (res.success && res.reply) {
          const assistantMessage: MessageItem = {
            id: `msg-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            role: "assistant",
            content: res.reply,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          const errText = res.error || "Failed to receive response from AI Coach.";
          setError(errText);
          setLastFailedPrompt(textToSend);
        }
      } catch (err: unknown) {
        const errText =
          err instanceof Error
            ? err.message
            : "An unexpected connection error occurred.";
        setError(errText);
        setLastFailedPrompt(textToSend);
      } finally {
        setIsLoading(false);
      }
    },
    [inputPrompt, isLoading, messages]
  );

  const retryLastMessage = useCallback(async () => {
    if (!lastFailedPrompt || isLoading) return;
    const promptToRetry = lastFailedPrompt;
    setError(null);
    setLastFailedPrompt(null);
    setIsLoading(true);

    const historyForServer = messages
      .filter((m) => m.content !== promptToRetry)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const res = await sendAICoachMessageAction(promptToRetry, historyForServer);

      if (res.success && res.reply) {
        const assistantMessage: MessageItem = {
          id: `msg-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          role: "assistant",
          content: res.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errText = res.error || "Failed to receive response from AI Coach.";
        setError(errText);
        setLastFailedPrompt(promptToRetry);
      }
    } catch (err: unknown) {
      const errText =
        err instanceof Error
          ? err.message
          : "An unexpected connection error occurred.";
      setError(errText);
      setLastFailedPrompt(promptToRetry);
    } finally {
      setIsLoading(false);
    }
  }, [lastFailedPrompt, isLoading, messages]);

  const selectStarterPrompt = useCallback(
    (promptText: string) => {
      sendMessage(promptText);
    },
    [sendMessage]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastFailedPrompt(null);
    setInputPrompt("");
  }, []);

  return {
    messages,
    inputPrompt,
    setInputPrompt,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    selectStarterPrompt,
    clearChat,
  };
}
