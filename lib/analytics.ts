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

/**
 * Privacy-respecting analytics system
 * Tracks events without personally identifiable information (PII)
 */

import { getDatabase, collections, AnalyticsEvent } from "./mongodb";

/**
 * Analytics event types
 */
export enum EventType {
  // Document events
  DOCUMENT_CREATED = "document_created",
  DOCUMENT_VIEWED = "document_viewed",
  DOCUMENT_EDITED = "document_edited",
  DOCUMENT_DELETED = "document_deleted",
  DOCUMENT_EXPORTED = "document_export",

  // Template events
  TEMPLATE_USED = "template_used",
  TEMPLATE_CREATED = "template_created",

  // Workspace events
  WORKSPACE_CREATED = "workspace_created",
  WORKSPACE_EXPORTED = "workspace_export",

  // Feature usage
  ENCRYPTION_ENABLED = "encryption_enabled",
  MARKDOWN_IMPORTED = "markdown_imported",
  SEARCH_PERFORMED = "search_performed",
}

/**
 * Track an analytics event
 * Only non-PII metadata is stored
 */
export async function trackEvent(
  event: EventType,
  metadata?: Record<string, unknown>,
  sessionId?: string
): Promise<void> {
  try {
    // Don't track in development
    if (process.env.NODE_ENV === "development") {
      console.log("Analytics event:", event, metadata);
      return;
    }

    const db = await getDatabase();
    const analyticsEvent: AnalyticsEvent = {
      event,
      metadata: sanitizeMetadata(metadata),
      timestamp: new Date(),
      sessionId,
    };

    await db.collection(collections.analyticsEvents).insertOne(analyticsEvent);
  } catch (error) {
    // Fail silently - analytics should never break the app
    console.error("Failed to track event:", error);
  }
}

/**
 * Remove any PII from metadata
 */
function sanitizeMetadata(
  metadata?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!metadata) return undefined;

  const sanitized: Record<string, unknown> = {};

  // Only allow specific whitelisted fields
  const allowedFields = [
    "category",
    "templateId",
    "count",
    "feature",
    "success",
    "errorType",
  ];

  Object.keys(metadata).forEach((key) => {
    if (allowedFields.includes(key)) {
      sanitized[key] = metadata[key];
    }
  });

  return sanitized;
}

/**
 * Get analytics summary (for admin/stats view)
 */
export async function getAnalyticsSummary(
  startDate: Date,
  endDate: Date
): Promise<{
  totalEvents: number;
  eventsByType: Record<string, number>;
  topTemplates: Array<{ templateId: string; count: number }>;
}> {
  const db = await getDatabase();

  const events = await db
    .collection(collections.analyticsEvents)
    .find({
      timestamp: { $gte: startDate, $lte: endDate },
    })
    .toArray();

  const eventsByType: Record<string, number> = {};
  const templateUsage: Record<string, number> = {};

  events.forEach((event) => {
    // Count by event type
    eventsByType[event.event] = (eventsByType[event.event] || 0) + 1;

    // Count template usage
    if (
      event.event === EventType.TEMPLATE_USED &&
      event.metadata?.templateId
    ) {
      const templateId = event.metadata.templateId;
      templateUsage[templateId] = (templateUsage[templateId] || 0) + 1;
    }
  });

  const topTemplates = Object.entries(templateUsage)
    .map(([templateId, count]) => ({ templateId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEvents: events.length,
    eventsByType,
    topTemplates,
  };
}

/**
 * Client-side analytics hook
 */
export function useAnalytics() {
  const track = async (
    event: EventType,
    metadata?: Record<string, unknown>
  ): Promise<void> => {
    try {
      // Get or create session ID
      let sessionId = sessionStorage.getItem("analytics_session_id");
      if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem("analytics_session_id", sessionId);
      }

      // Send to API
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event,
          metadata,
          sessionId,
        }),
      });
    } catch (error) {
      // Fail silently
      console.error("Failed to track event:", error);
    }
  };

  return { track };
}

/**
 * Generate a random session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
