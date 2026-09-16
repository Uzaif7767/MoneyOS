"use server";

import { auth } from "@clerk/nextjs/server";
import { askAICoachService } from "@/lib/services/aiCoachService";

export interface AICoachHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface AICoachRequest {
  message: string;
  history?: AICoachHistoryItem[];
}

export interface AICoachResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

/**
 * Server action to process an AI Coach message.
 * - Authenticates Clerk user server-side.
 * - Validates and sanitizes the incoming chat message and conversation history.
 * - Forwards to server-side AI Coach service (Groq provider).
 * - Returns AI response or user-friendly error.
 */
export async function sendAICoachMessageAction(
  message: string,
  history: AICoachHistoryItem[] = []
): Promise<AICoachResponse> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: "Authentication required. Please sign in to ask AI Coach.",
      };
    }

    if (typeof message !== "string") {
      return {
        success: false,
        error: "Invalid request payload. Message must be text.",
      };
    }

    const sanitizedMessage = message.trim();

    if (!sanitizedMessage) {
      return {
        success: false,
        error: "Please enter a valid message.",
      };
    }

    if (sanitizedMessage.length > 1000) {
      return {
        success: false,
        error: "Message is too long. Please limit your message to 1,000 characters.",
      };
    }

    // Validate and sanitize transient history payload (strictly role user/assistant)
    const sanitizedHistory: AICoachHistoryItem[] = [];
    if (Array.isArray(history)) {
      // Keep only recent window (last 15 messages)
      const recentHistory = history.slice(-15);
      for (const item of recentHistory) {
        if (
          item &&
          typeof item === "object" &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
        ) {
          const trimmedContent = item.content.trim();
          if (trimmedContent && trimmedContent.length <= 1000) {
            sanitizedHistory.push({
              role: item.role,
              content: trimmedContent,
            });
          }
        }
      }
    }

    const reply = await askAICoachService(clerkUserId, sanitizedMessage, sanitizedHistory);

    return {
      success: true,
      reply,
    };
  } catch (error: unknown) {
    console.error("Error in sendAICoachMessageAction:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected server error occurred while processing your message.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
