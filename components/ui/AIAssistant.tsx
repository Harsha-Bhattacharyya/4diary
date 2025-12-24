"use client";

/**
 * Copyright © 2025 Harsha Bhattacharyya
 * 
 * This file is part of 4diary.
 * 
 * SPDX-License-Identifier: BSD-3-Clause
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the conditions in the LICENSE file are met.
 */

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import GlassCard from "./GlassCard";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText?: string;
  documentContext?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  vqd: string;
  model: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * AI Assistant component using DuckDuckGo AI Chat for privacy-friendly assistance.
 * Provides context-aware suggestions and help within the note-taking interface.
 * Uses server-side API route to avoid CORS issues with DuckDuckGo's API.
 * 
 * @param isOpen - Whether the assistant is visible
 * @param onClose - Callback to close the assistant
 * @param selectedText - Optional selected text from the editor
 * @param documentContext - Optional document context for better suggestions
 */
export default function AIAssistant({
  isOpen,
  onClose,
  selectedText,
  documentContext,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat session via API route when component opens
  useEffect(() => {
    if (isOpen && !chatSession && !isInitializing) {
      setIsInitializing(true);
      setInitError(null);
      fetch("/api/ai?action=init&model=gpt-4o-mini")
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error || "Failed to initialize chat");
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.vqd) {
            setChatSession({
              vqd: data.vqd,
              model: data.model,
              messages: [],
            });
          } else {
            throw new Error(data.error || "Failed to get authentication token");
          }
        })
        .catch((error) => {
          console.error("Failed to initialize AI chat:", error);
          setInitError(error.message || "AI service temporarily unavailable. The textbox is enabled for typing, but messages cannot be sent until the service is restored.");
        })
        .finally(() => {
          setIsInitializing(false);
        });
    }
  }, [isOpen, chatSession, isInitializing]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add initial message if selected text is provided
  useEffect(() => {
    if (isOpen && selectedText && messages.length === 0) {
      setInput(`Help me with this text: "${selectedText}"`);
    }
  }, [isOpen, selectedText, messages.length]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // If chat session is not available, show an error
    if (!chatSession) {
      const errorMessage: Message = {
        role: "assistant",
        content: "AI service is currently unavailable. Please try again later or click 'Clear' to retry initialization.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Build context-aware prompt only for first message
      let prompt = currentInput;
      if (documentContext && messages.length === 0) {
        prompt = `Context: ${documentContext.slice(0, 500)}...\n\nQuestion: ${currentInput}`;
      }

      // Send message via API route
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vqd: chatSession.vqd,
          model: chatSession.model,
          messages: chatSession.messages,
          content: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update chat session with new VQD and messages
      setChatSession((prev) => prev ? {
        ...prev,
        vqd: data.newVqd || prev.vqd,
        messages: [
          ...prev.messages,
          { role: "user", content: prompt },
          { role: "assistant", content: data.message },
        ],
      } : null);
    } catch (error) {
      console.error("AI Assistant error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    // Reset chat session for new conversation
    setChatSession(null);
    setInitError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-leather-300/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-leather-300" />
            <h2 className="text-xl font-semibold text-leather-100">
              AI Assistant
            </h2>
            <span className="text-xs text-leather-400 ml-2">
              Powered by DuckDuckGo
            </span>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="px-3 py-1 text-xs text-leather-300 hover:text-leather-100 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-leather-300/20 rounded-lg transition-colors"
              aria-label="Close AI Assistant"
            >
              <X className="w-5 h-5 text-leather-300" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="w-12 h-12 text-leather-400 mb-4" />
              <h3 className="text-lg font-medium text-leather-200 mb-2">
                Privacy-First AI Assistant
              </h3>
              <p className="text-sm text-leather-400 max-w-md">
                Ask questions, get writing suggestions, or request help with your notes.
                All queries are processed through DuckDuckGo&apos;s privacy-focused AI.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-leather-600 text-leather-50"
                      : "bg-black/30 text-leather-100 border border-leather-300/20"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-black/30 border border-leather-300/20">
                <Loader2 className="w-4 h-4 animate-spin text-leather-300" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-leather-300/20">
          {initError && (
            <div className="mb-2 p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-sm">
              ⚠️ {initError}
              <button
                onClick={clearChat}
                className="ml-2 underline hover:text-amber-100"
              >
                Retry
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isInitializing ? "Connecting to AI service..." : (chatSession ? "Ask me anything about your notes..." : "Type your message (AI service may be unavailable)...")}
              disabled={isLoading || isInitializing}
              className="flex-1 px-4 py-2 bg-black/30 border border-leather-300/30 rounded-lg text-leather-100 placeholder-leather-400 focus:outline-none focus:ring-2 focus:ring-leather-300/50 resize-none disabled:opacity-50"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || isInitializing}
              className="px-4 py-2 bg-leather-600 text-leather-50 rounded-lg hover:bg-leather-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              {isLoading || isInitializing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-leather-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="px-4 pb-4 text-center">
          <p className="text-xs text-leather-500">
            🔒 Privacy-first: All queries are sent through DuckDuckGo&apos;s AI. No data is stored or used for training.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
