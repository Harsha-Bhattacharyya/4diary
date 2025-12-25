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

import { NextRequest, NextResponse } from "next/server";

/**
 * AI Provider Types
 */
export type AIProvider = "openai" | "anthropic" | "gemini" | "duckduckgo";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  model: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Provider-specific API endpoints and configurations
 */
const PROVIDER_CONFIGS = {
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o-mini",
  },
  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    defaultModel: "claude-3-5-haiku-20241022",
  },
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/models",
    models: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"],
    defaultModel: "gemini-1.5-flash",
  },
  duckduckgo: {
    url: "https://duckduckgo.com/duckchat/v1/chat",
    statusUrl: "https://duckduckgo.com/duckchat/v1/status",
    models: ["gpt-4o-mini", "claude-3-haiku", "llama", "mixtral", "o3-mini"],
    defaultModel: "gpt-4o-mini",
    modelMap: {
      "gpt-4o-mini": "gpt-4o-mini",
      "claude-3-haiku": "claude-3-haiku-20240307",
      "llama": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      "mixtral": "mistralai/Mistral-Small-24B-Instruct-2501",
      "o3-mini": "o3-mini",
    },
  },
};

// Headers for DuckDuckGo (browser-like to bypass anti-bot)
const DDG_BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/event-stream",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Referer": "https://duckduckgo.com/",
  "Origin": "https://duckduckgo.com",
  "DNT": "1",
  "Connection": "keep-alive",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};

/**
 * Get list of available providers and their models
 */
function getAvailableProviders() {
  const providers = [];
  
  // Check which providers have API keys configured
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      id: "openai",
      name: "OpenAI",
      models: PROVIDER_CONFIGS.openai.models,
      defaultModel: PROVIDER_CONFIGS.openai.defaultModel,
      requiresKey: true,
      keyConfigured: true,
    });
  } else {
    providers.push({
      id: "openai",
      name: "OpenAI",
      models: PROVIDER_CONFIGS.openai.models,
      defaultModel: PROVIDER_CONFIGS.openai.defaultModel,
      requiresKey: true,
      keyConfigured: false,
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      id: "anthropic",
      name: "Claude (Anthropic)",
      models: PROVIDER_CONFIGS.anthropic.models,
      defaultModel: PROVIDER_CONFIGS.anthropic.defaultModel,
      requiresKey: true,
      keyConfigured: true,
    });
  } else {
    providers.push({
      id: "anthropic",
      name: "Claude (Anthropic)",
      models: PROVIDER_CONFIGS.anthropic.models,
      defaultModel: PROVIDER_CONFIGS.anthropic.defaultModel,
      requiresKey: true,
      keyConfigured: false,
    });
  }

  if (process.env.GEMINI_API_KEY) {
    providers.push({
      id: "gemini",
      name: "Gemini (Google)",
      models: PROVIDER_CONFIGS.gemini.models,
      defaultModel: PROVIDER_CONFIGS.gemini.defaultModel,
      requiresKey: true,
      keyConfigured: true,
    });
  } else {
    providers.push({
      id: "gemini",
      name: "Gemini (Google)",
      models: PROVIDER_CONFIGS.gemini.models,
      defaultModel: PROVIDER_CONFIGS.gemini.defaultModel,
      requiresKey: true,
      keyConfigured: false,
    });
  }

  // DuckDuckGo is always available (no API key required)
  providers.push({
    id: "duckduckgo",
    name: "DuckDuckGo AI (Free)",
    models: PROVIDER_CONFIGS.duckduckgo.models,
    defaultModel: PROVIDER_CONFIGS.duckduckgo.defaultModel,
    requiresKey: false,
    keyConfigured: true,
  });

  return providers;
}

/**
 * Initialize AI chat session
 */
async function handleInit(provider: AIProvider, model: string): Promise<NextResponse> {
  const providers = getAvailableProviders();
  
  // For DuckDuckGo, we need to get a VQD token
  if (provider === "duckduckgo") {
    try {
      const response = await fetch(PROVIDER_CONFIGS.duckduckgo.statusUrl, {
        headers: {
          ...DDG_BROWSER_HEADERS,
          "x-vqd-accept": "1",
        },
      });

      const vqd = response.headers.get("x-vqd-4");
      
      if (!vqd) {
        console.error("AI init: x-vqd-4 header not found. Response status:", response.status);
        return NextResponse.json(
          { 
            error: "DuckDuckGo AI service temporarily unavailable. Please try another provider or retry later.",
            providers,
          },
          { status: 503 }
        );
      }

      const modelMap = PROVIDER_CONFIGS.duckduckgo.modelMap;
      return NextResponse.json({
        provider: "duckduckgo",
        vqd,
        model: modelMap[model as keyof typeof modelMap] || modelMap["gpt-4o-mini"],
        providers,
      });
    } catch (error) {
      console.error("DuckDuckGo init error:", error);
      return NextResponse.json(
        { 
          error: "Failed to connect to DuckDuckGo AI. Please try another provider.",
          providers,
        },
        { status: 500 }
      );
    }
  }

  // For other providers, check if API key is configured
  const providerConfig = providers.find(p => p.id === provider);
  if (!providerConfig) {
    return NextResponse.json(
      { error: `Unknown provider: ${provider}`, providers },
      { status: 400 }
    );
  }

  if (providerConfig.requiresKey && !providerConfig.keyConfigured) {
    return NextResponse.json(
      { 
        error: `${providerConfig.name} API key not configured. Please add the API key in environment variables or use DuckDuckGo (free).`,
        providers,
      },
      { status: 400 }
    );
  }

  // For OpenAI, Anthropic, Gemini - no initialization needed, just return config
  return NextResponse.json({
    provider,
    model: model || providerConfig.defaultModel,
    providers,
  });
}

/**
 * Handle chat with OpenAI API
 */
async function chatWithOpenAI(model: string, messages: Message[], content: string): Promise<{ message: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const allMessages = [...messages, { role: "user" as const, content }];
  
  const response = await fetch(PROVIDER_CONFIGS.openai.url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return { message: data.choices?.[0]?.message?.content || "" };
}

/**
 * Handle chat with Anthropic Claude API
 */
async function chatWithAnthropic(model: string, messages: Message[], content: string): Promise<{ message: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key not configured");
  }

  // Convert messages to Anthropic format
  const anthropicMessages = messages.map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));
  anthropicMessages.push({ role: "user", content });

  const response = await fetch(PROVIDER_CONFIGS.anthropic.url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: anthropicMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return { message: data.content?.[0]?.text || "" };
}

/**
 * Handle chat with Google Gemini API
 */
async function chatWithGemini(model: string, messages: Message[], content: string): Promise<{ message: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  // Convert messages to Gemini format
  const geminiHistory = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `${PROVIDER_CONFIGS.gemini.url}/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [...geminiHistory, { role: "user", parts: [{ text: content }] }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return { message: data.candidates?.[0]?.content?.parts?.[0]?.text || "" };
}

/**
 * Handle chat with DuckDuckGo AI
 */
async function chatWithDuckDuckGo(vqd: string, model: string, messages: Message[], content: string): Promise<{ message: string; newVqd: string | null }> {
  const allMessages: Message[] = [...(messages || []), { role: "user", content }];

  const response = await fetch(PROVIDER_CONFIGS.duckduckgo.url, {
    headers: {
      ...DDG_BROWSER_HEADERS,
      "x-vqd-4": vqd,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      model,
      messages: allMessages,
    }),
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo API error: ${response.status} ${response.statusText}`);
  }

  const newVqd = response.headers.get("x-vqd-4");

  // Read the streamed response
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to read response stream");
  }

  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data && data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            if (parsed.message) {
              fullText += parsed.message;
            }
          } catch {
            // Skip invalid JSON chunks
          }
        }
      }
    }
  }

  // Process remaining buffer
  if (buffer.startsWith("data: ")) {
    const data = buffer.slice(6);
    if (data && data !== "[DONE]") {
      try {
        const parsed = JSON.parse(data);
        if (parsed.message) {
          fullText += parsed.message;
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  return { message: fullText, newVqd };
}

/**
 * Send a message to AI provider
 * 
 * POST /api/ai
 * Body: { provider: string, vqd?: string, model: string, messages: Message[], content: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { provider, vqd, model, messages, content } = body;

    if (!provider || !model || !content) {
      return NextResponse.json(
        { error: "Missing required fields: provider, model, content" },
        { status: 400 }
      );
    }

    let result: { message: string; newVqd?: string | null };

    switch (provider as AIProvider) {
      case "openai":
        result = await chatWithOpenAI(model, messages || [], content);
        break;
      case "anthropic":
        result = await chatWithAnthropic(model, messages || [], content);
        break;
      case "gemini":
        result = await chatWithGemini(model, messages || [], content);
        break;
      case "duckduckgo":
        if (!vqd) {
          return NextResponse.json(
            { error: "VQD token required for DuckDuckGo provider" },
            { status: 400 }
          );
        }
        result = await chatWithDuckDuckGo(vqd, model, messages || [], content);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown provider: ${provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process AI chat request";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests for initializing chat session and listing providers
 * 
 * GET /api/ai?action=init&provider=openai&model=gpt-4o-mini
 * GET /api/ai?action=providers (list available providers)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  if (action === "providers") {
    return NextResponse.json({ providers: getAvailableProviders() });
  }

  if (action === "init") {
    const provider = (searchParams.get("provider") || "duckduckgo") as AIProvider;
    const model = searchParams.get("model") || "";
    return handleInit(provider, model);
  }

  return NextResponse.json(
    { error: "Invalid action. Use action=init or action=providers." },
    { status: 400 }
  );
}
