import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  Info,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from "lucide-react";
import { Link, useLoaderData, useSearchParams } from "react-router";

import { apiGet, apiPost } from "../lib/api";
import type {
  AdvisorBootstrapResponse,
  AdvisorChatResponse,
} from "../types/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  liked?: boolean;
  disliked?: boolean;
  source?: string;
  confidenceScore?: number;
  suggestedPrompts?: string[];
}

export async function loader() {
  return apiGet<AdvisorBootstrapResponse>("/api/advisor/bootstrap");
}

function nowLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AIAdvisor() {
  const data = useLoaderData() as AdvisorBootstrapResponse;
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(
    data.history.map((item, index) => ({
      id: `${item.id}-${index}`,
      role: item.role,
      content: item.content,
      time: item.time,
    })),
  );
  const [quickPrompts, setQuickPrompts] = useState(data.quickPrompts);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const autoSentQueryRef = useRef<string | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialQuery && autoSentQueryRef.current !== initialQuery) {
      autoSentQueryRef.current = initialQuery;
      void sendMessage(initialQuery);
    }
  }, [initialQuery]);

  async function sendMessage(rawMessage?: string) {
    const nextMessage = (rawMessage ?? input).trim();

    if (!nextMessage || isSending) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: nextMessage,
      time: nowLabel(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    setIsTyping(true);
    setIsSending(true);

    try {
      const response = await apiPost<AdvisorChatResponse>("/api/advisor/chat", {
        message: nextMessage,
        history: currentMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      });

      setQuickPrompts(response.suggestedPrompts);
      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.response,
          time: nowLabel(),
          source: response.source,
          confidenceScore: response.confidenceScore,
          suggestedPrompts: response.suggestedPrompts,
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  }

  function handleQuickPrompt(prompt: string) {
    setInput(prompt);
  }

  function handleReaction(id: string, type: "like" | "dislike") {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? {
              ...message,
              liked: type === "like" ? !message.liked : false,
              disliked: type === "dislike" ? !message.disliked : false,
            }
          : message,
      ),
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-lg font-semibold">AI Advisor</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Your AI partner for smarter decisions and better opportunities.
                </span>
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  Memory active
                </span>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-auto p-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}
            >
              {message.role === "assistant" ? (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              ) : null}
              <div
                className={`${message.role === "user" ? "max-w-2xl" : "flex-1"} space-y-2`}
              >
                <div
                  className={`rounded-xl p-5 ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-200 bg-white"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                </div>
                {message.role === "assistant" ? (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReaction(message.id, "like")}
                        className={`rounded p-1.5 transition-colors ${
                          message.liked ? "bg-green-100" : "hover:bg-gray-100"
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp
                          className={`h-4 w-4 ${
                            message.liked ? "text-green-600" : "text-gray-400"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleReaction(message.id, "dislike")}
                        className={`rounded p-1.5 transition-colors ${
                          message.disliked ? "bg-red-100" : "hover:bg-gray-100"
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown
                          className={`h-4 w-4 ${
                            message.disliked ? "text-red-500" : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                    {message.source || message.confidenceScore ? (
                      <div className="text-xs text-gray-500">
                        Source: {message.source || "fallback"}
                        {typeof message.confidenceScore === "number"
                          ? ` • Confidence ${message.confidenceScore}%`
                          : ""}
                      </div>
                    ) : null}
                    {message.suggestedPrompts?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {message.suggestedPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => handleQuickPrompt(prompt)}
                            className="rounded-full border border-gray-200 px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : null}
                <div
                  className={`text-xs text-gray-500 ${
                    message.role === "user" ? "text-right" : ""
                  }`}
                >
                  {message.time}
                </div>
              </div>
              {message.role === "user" ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
                  You
                </div>
              ) : null}
            </div>
          ))}

          {isTyping ? (
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex gap-1">
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <div ref={chatEndRef} />
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void sendMessage();
                }
              }}
              placeholder="Ask anything about opportunities, applications, or your goals..."
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isSending}
              className="rounded-lg bg-indigo-600 p-2.5 text-white transition-opacity hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">
            AI can make mistakes. Verify important info.
          </div>
        </div>
      </div>

      <div className="w-80 flex-shrink-0 overflow-auto border-l border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 font-semibold">Quick prompts</h3>
        <div className="space-y-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleQuickPrompt(prompt)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="mb-4 font-semibold">Active goals</h3>
          <div className="space-y-3">
            {data.goals.map((goal) => (
              <div key={goal.label} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-2 text-sm font-medium">{goal.label}</div>
                <div className="mb-1 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">{goal.progress}% progress</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 font-semibold">Urgent items</h3>
          <div className="space-y-3">
            {data.urgent.map((item) => (
              <Link
                key={item.title}
                to={`/search?q=${encodeURIComponent(item.title)}`}
                className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-indigo-300"
              >
                <div className="mb-1 text-sm font-medium">{item.title}</div>
                <div className="mb-2 text-xs text-gray-600">{item.note}</div>
                <div className="flex items-center gap-1 text-xs text-indigo-600">
                  Open related results <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
