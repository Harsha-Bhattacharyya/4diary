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

const STATUS_URL = "https://duckduckgo.com/duckchat/v1/status";
const CHAT_URL = "https://duckduckgo.com/duckchat/v1/chat";

// Headers that mimic a real browser to get past anti-bot checks
const BROWSER_HEADERS = {
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
  "Sec-CH-UA": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  "Sec-CH-UA-Mobile": "?0",
  "Sec-CH-UA-Platform": '"Windows"',
};

const MODEL_MAP: Record<string, string> = {
  "gpt-4o-mini": "gpt-4o-mini",
  "claude-3-haiku": "claude-3-haiku-20240307",
  "llama": "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  "mixtral": "mistralai/Mistral-Small-24B-Instruct-2501",
  "o3-mini": "o3-mini",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * Initialize AI chat session by getting VQD token from DuckDuckGo.
 * 
 * GET /api/ai?action=init&model=gpt-4o-mini
 */
async function handleInit(model: string): Promise<NextResponse> {
  try {
    const response = await fetch(STATUS_URL, {
      headers: {
        ...BROWSER_HEADERS,
        "x-vqd-accept": "1",
      },
    });

    // Try to get the VQD token from the response headers
    const vqd = response.headers.get("x-vqd-4");
    
    if (!vqd) {
      // DuckDuckGo API may have changed, provide a fallback error
      console.error("AI init: x-vqd-4 header not found. Response status:", response.status);
      return NextResponse.json(
        { 
          error: "AI service temporarily unavailable. DuckDuckGo API may have changed.",
          details: "The x-vqd-4 authentication token was not provided by the server."
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      vqd,
      model: MODEL_MAP[model] || MODEL_MAP["gpt-4o-mini"],
    });
  } catch (error) {
    console.error("AI init error:", error);
    return NextResponse.json(
      { error: "Failed to connect to AI service. Please try again later." },
      { status: 500 }
    );
  }
}

/**
 * Send a message to DuckDuckGo AI and stream the response.
 * 
 * POST /api/ai
 * Body: { vqd: string, model: string, messages: Message[], content: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { vqd, model, messages, content } = body;

    if (!vqd || !model || !content) {
      return NextResponse.json(
        { error: "Missing required fields: vqd, model, content" },
        { status: 400 }
      );
    }

    // Build messages array for the API
    const allMessages: Message[] = [...(messages || []), { role: "user", content }];

    const payload = {
      model,
      messages: allMessages,
    };

    const response = await fetch(CHAT_URL, {
      headers: {
        ...BROWSER_HEADERS,
        "x-vqd-4": vqd,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to send message: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the new VQD token from response headers
    const newVqd = response.headers.get("x-vqd-4");

    // Read the streamed response and combine into full text
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "Failed to read response" },
        { status: 500 }
      );
    }

    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines from the buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

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
              // Skip invalid JSON chunks - DuckDuckGo's streaming API may send
              // partial or malformed data chunks that don't parse as valid JSON.
              // This is expected behavior for server-sent events.
            }
          }
        }
      }
    }

    // Process any remaining data in the buffer
    if (buffer.startsWith("data: ")) {
      const data = buffer.slice(6);
      if (data && data !== "[DONE]") {
        try {
          const parsed = JSON.parse(data);
          if (parsed.message) {
            fullText += parsed.message;
          }
        } catch {
          // Skip invalid JSON - same as above, partial data is expected
        }
      }
    }

    return NextResponse.json({
      message: fullText,
      newVqd,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to process AI chat request" },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests for initializing chat session.
 * 
 * GET /api/ai?action=init&model=gpt-4o-mini
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");
  const model = searchParams.get("model") || "gpt-4o-mini";

  if (action === "init") {
    return handleInit(model);
  }

  return NextResponse.json(
    { error: "Invalid action. Use action=init to initialize chat." },
    { status: 400 }
  );
}
