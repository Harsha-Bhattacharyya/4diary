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

"use client";

import React, { useState, useMemo } from "react";
import { TelemetryDeckProvider, createTelemetryDeck, useTelemetryDeck } from "@typedigital/telemetrydeck-react";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics provider that wraps the app with TelemetryDeck
 * Respects user's privacy preferences stored in localStorage
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Get app ID - use a dummy value if not configured to keep the provider happy
  const appID = process.env.NEXT_PUBLIC_TELEMETRYDECK_APP_ID || "dummy-app-id";
  
  // Create TelemetryDeck instance - always create to maintain provider structure
  const telemetryDeck = useMemo(() => {
    return createTelemetryDeck({
      appID,
      clientUser: "anonymous", // Privacy-first: no user identification
    });
  }, [appID]);

  // Always wrap with provider to maintain consistent React tree
  return (
    <TelemetryDeckProvider telemetryDeck={telemetryDeck}>
      {children}
    </TelemetryDeckProvider>
  );
}

/**
 * Hook to access TelemetryDeck signal functionality
 */
export function useAnalytics() {
  const telemetryDeck = useTelemetryDeck();
  
  // Initialize with localStorage value directly to avoid setState in useEffect
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => {
    // Check if we're in the browser (avoid SSR issues)
    if (typeof window === "undefined") return false;
    
    // Check user's analytics preference from localStorage
    const preference = localStorage.getItem("analytics-enabled");
    
    // Also check if app ID is configured
    const hasAppID = process.env.NEXT_PUBLIC_TELEMETRYDECK_APP_ID !== undefined;
    
    // Default to disabled for privacy-first approach
    // Users must explicitly opt-in AND app ID must be configured
    return preference === "true" && hasAppID;
  });

  const signal = (eventName: string, metadata?: Record<string, string>) => {
    if (!analyticsEnabled) return;
    telemetryDeck.signal(eventName, metadata);
  };

  const toggleAnalytics = (enabled: boolean) => {
    if (typeof window === "undefined") return;
    
    localStorage.setItem("analytics-enabled", enabled.toString());
    setAnalyticsEnabled(enabled);
    
    // Show a message to user that they need to reload
    // This is better UX than forcing an immediate reload
    if (window.confirm("Analytics settings updated. Reload the page to apply changes?")) {
      window.location.reload();
    }
  };

  return {
    signal,
    analyticsEnabled,
    toggleAnalytics,
  };
}
