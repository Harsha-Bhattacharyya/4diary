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
import { trackEvent, EventType } from "@/lib/analytics";

/**
 * POST /api/analytics
 * Track analytics events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, metadata, sessionId } = body;

    if (!event) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      );
    }

    await trackEvent(event as EventType, metadata, sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track event:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
