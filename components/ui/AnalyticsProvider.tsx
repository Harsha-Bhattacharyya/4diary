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

import React, { useEffect, useState } from "react";
import { TelemetryDeckProvider, TelemetryDeckContext } from "@typedigital/telemetrydeck-react";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Analytics provider that wraps the app with TelemetryDeck
 * Respects user's privacy preferences stored in localStorage
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    // Check user's analytics preference from localStorage
    const preference = localStorage.getItem("analytics-enabled");
    
    // Default to disabled for privacy-first approach
    // Users must explicitly opt-in
    setAnalyticsEnabled(preference === "true");
  }, []);

  // Don't render TelemetryDeck if analytics is disabled or still loading
  if (analyticsEnabled === null || !analyticsEnabled) {
    return <>{children}</>;
  }

  // Only render with TelemetryDeck if user has opted in
  const appID = process.env.NEXT_PUBLIC_TELEMETRYDECK_APP_ID;
  
  if (!appID) {
    console.warn("TelemetryDeck App ID not configured");
    return <>{children}</>;
  }

  return (
    <TelemetryDeckProvider
      appID={appID}
      clientUser="anonymous" // Privacy-first: no user identification
    >
      {children}
    </TelemetryDeckProvider>
  );
}

/**
 * Hook to access TelemetryDeck signal functionality
 */
export function useAnalytics() {
  const context = React.useContext(TelemetryDeckContext);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const preference = localStorage.getItem("analytics-enabled");
    setAnalyticsEnabled(preference === "true");
  }, []);

  const signal = (eventName: string, metadata?: Record<string, string>) => {
    if (!analyticsEnabled || !context) return;
    context.signal(eventName, metadata);
  };

  const toggleAnalytics = (enabled: boolean) => {
    localStorage.setItem("analytics-enabled", enabled.toString());
    setAnalyticsEnabled(enabled);
    // Reload page to apply changes
    window.location.reload();
  };

  return {
    signal,
    analyticsEnabled,
    toggleAnalytics,
  };
}
