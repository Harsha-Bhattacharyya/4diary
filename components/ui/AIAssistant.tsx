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
import { X, Send, Sparkles, Loader2, Settings2 } from "lucide-react";
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

interface ProviderInfo {
  id: string;
  name: string;
  models: string[];
  defaultModel: string;
  requiresKey: boolean;
  keyConfigured: boolean;
}

interface ChatSession {
  provider: string;
  vqd?: string;
  model: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * AI Assistant component supporting multiple AI providers (OpenAI, Claude, Gemini, DuckDuckGo).
 * Provides context-aware suggestions and help within the note-taking interface.
 * Uses server-side API routes to handle provider-specific API calls.
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
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("duckduckgo");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load available providers
  useEffect(() => {
    if (isOpen && providers.length === 0) {
      fetch("/api/ai?action=providers")
        .then((res) => res.json())
        .then((data) => {
          if (data.providers) {
            setProviders(data.providers);
            // Set default model based on selected provider
            const defaultProvider = data.providers.find((p: ProviderInfo) => p.id === selectedProvider);
            if (defaultProvider) {
              setSelectedModel(defaultProvider.defaultModel);
            }
          }
        })
        .catch((error) => {
          console.error("Failed to load providers:", error);
        });
    }
  }, [isOpen, providers.length, selectedProvider]);

  // Initialize chat session via API route when component opens or provider changes
  useEffect(() => {
    if (isOpen && !chatSession && !isInitializing && providers.length > 0) {
      setIsInitializing(true);
      setInitError(null);
      
      const provider = providers.find(p => p.id === selectedProvider);
      const model = selectedModel || provider?.defaultModel || "";

      fetch(`/api/ai?action=init&provider=${selectedProvider}&model=${model}`)
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error || "Failed to initialize chat");
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          }
          setChatSession({
            provider: data.provider,
            vqd: data.vqd,
            model: data.model,
            messages: [],
          });
        })
        .catch((error) => {
          console.error("Failed to initialize AI chat:", error);
          setInitError(error.message || "AI service temporarily unavailable.");
        })
        .finally(() => {
          setIsInitializing(false);
        });
    }
  }, [isOpen, chatSession, isInitializing, selectedProvider, selectedModel, providers]);

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

      // Send message via API route with provider info
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: chatSession.provider,
          vqd: chatSession.vqd,
          model: chatSession.model,
          messages: chatSession.messages,
          content: prompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update chat session with new VQD (for DuckDuckGo) and messages
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
        content: error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.",
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

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    // Reset chat session when provider changes
    setChatSession(null);
    setInitError(null);
    // Set default model for new provider
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setSelectedModel(provider.defaultModel);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    // Reset chat session when model changes
    setChatSession(null);
    setInitError(null);
  };

  // Get current provider info
  const currentProvider = providers.find(p => p.id === selectedProvider);
  const providerLabel = currentProvider?.name || "AI";

  // Compute placeholder text based on current state
  const getPlaceholderText = (): string => {
    if (isInitializing) return `Connecting to ${providerLabel}...`;
    if (chatSession) return "Ask me anything about your notes...";
    return "Type your message (AI service may be unavailable)...";
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
              {providerLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-leather-300/20 rounded-lg transition-colors"
              aria-label="AI Settings"
              title="Change AI Provider"
            >
              <Settings2 className="w-4 h-4 text-leather-300" />
            </button>
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

        {/* Provider Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b border-leather-300/20 bg-leather-900/50">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-leather-400 mb-1">AI Provider</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-leather-300/30 rounded-lg text-leather-100 text-sm focus:outline-none focus:ring-2 focus:ring-leather-300/50"
                >
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id} disabled={provider.requiresKey && !provider.keyConfigured}>
                      {provider.name} {provider.requiresKey && !provider.keyConfigured ? "(API key required)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-leather-400 mb-1">Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-leather-300/30 rounded-lg text-leather-100 text-sm focus:outline-none focus:ring-2 focus:ring-leather-300/50"
                >
                  {currentProvider?.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {currentProvider && !currentProvider.keyConfigured && currentProvider.requiresKey && (
              <p className="mt-2 text-xs text-amber-400">
                ⚠️ Add {currentProvider.name} API key in environment variables to use this provider.
              </p>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="w-12 h-12 text-leather-400 mb-4" />
              <h3 className="text-lg font-medium text-leather-200 mb-2">
                Multi-Provider AI Assistant
              </h3>
              <p className="text-sm text-leather-400 max-w-md mb-4">
                Ask questions, get writing suggestions, or request help with your notes.
                Choose from multiple AI providers: OpenAI, Claude, Gemini, or DuckDuckGo.
              </p>
              <p className="text-xs text-leather-500">
                Click the ⚙️ icon to change AI provider
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
              placeholder={getPlaceholderText()}
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
            {selectedProvider === "duckduckgo" 
              ? "🔒 DuckDuckGo: Privacy-focused, no data stored or used for training."
              : "⚠️ Third-party AI: Check provider's privacy policy. DuckDuckGo is the most private option."}
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
