"use client";

import React, { useMemo } from "react";
import { SparklesIcon, UserIcon } from "@/components/ui/icons";

export interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string | Date;
}

interface ChatMessageProps {
  message: MessageItem;
}

/**
 * Safely parse bold (**text**) and inline code (`code`) within a text string.
 */
function parseInlineFormatting(text: string): React.ReactNode[] {
  // Enforce MoneyOS currency rule: replace stray dollar signs with Rupee symbol
  const sanitizedText = text.replace(/\$/g, "₹");

  // Regex split by bold (**...**) or inline code (`...`)
  const parts = sanitizedText.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-emerald-800 text-xs font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Render structured response text into lists, paragraphs, and formatted lines safely.
 */
function FormattedAIResponse({ content }: { content: string }) {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    const lines = content.split("\n");
    const blocks: React.ReactNode[] = [];
    let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

    const flushList = (key: string) => {
      if (!currentList) return;
      if (currentList.type === "ul") {
        blocks.push(
          <ul key={key} className="my-2 space-y-1 pl-4 list-disc marker:text-emerald-500">
            {currentList.items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        blocks.push(
          <ol key={key} className="my-2 space-y-1 pl-4 list-decimal marker:font-semibold marker:text-emerald-700">
            {currentList.items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const isUnordered = /^[*-]\s+/.test(trimmed);
      const isOrdered = /^\d+\.\s+/.test(trimmed);

      if (isUnordered) {
        const itemContent = trimmed.replace(/^[*-]\s+/, "");
        if (currentList && currentList.type === "ul") {
          currentList.items.push(itemContent);
        } else {
          flushList(`block-${index}`);
          currentList = { type: "ul", items: [itemContent] };
        }
      } else if (isOrdered) {
        const itemContent = trimmed.replace(/^\d+\.\s+/, "");
        if (currentList && currentList.type === "ol") {
          currentList.items.push(itemContent);
        } else {
          flushList(`block-${index}`);
          currentList = { type: "ol", items: [itemContent] };
        }
      } else {
        flushList(`block-${index}`);
        if (trimmed.length > 0) {
          blocks.push(
            <p key={`p-${index}`} className="my-1.5 text-sm leading-relaxed text-slate-800">
              {parseInlineFormatting(trimmed)}
            </p>
          );
        }
      }
    });

    flushList("block-final");

    return blocks;
  }, [content]);

  return <div className="space-y-1">{renderedContent}</div>;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-2.5 sm:gap-3 w-full max-w-3xl mx-auto my-2.5 sm:my-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
          isUser
            ? "bg-slate-900 text-white border-slate-800 shadow-2xs"
            : "bg-emerald-50 text-emerald-600 border-emerald-200/80 shadow-2xs"
        }`}
      >
        {isUser ? (
          <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        ) : (
          <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
        )}
      </div>

      {/* Bubble Container */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-sm leading-relaxed break-words shadow-2xs ${
            isUser
              ? "bg-emerald-600 text-white rounded-tr-xs font-medium"
              : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content.replace(/\$/g, "₹")}</p>
          ) : (
            <FormattedAIResponse content={message.content} />
          )}
        </div>
      </div>
    </div>
  );
}

