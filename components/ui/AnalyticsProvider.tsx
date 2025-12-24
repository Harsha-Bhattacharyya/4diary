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

import React, { useState, useMemo, useEffect } from "react";
import { TelemetryDeckProvider, createTelemetryDeck, useTelemetryDeck } from "@typedigital/telemetrydeck-react";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const SETTINGS_DB_NAME = "4diary-settings";
const SETTINGS_STORE_NAME = "settings";
const ANALYTICS_KEY = "analytics-enabled";

/**
 * Open or create the IndexedDB database for settings
 */
function openSettingsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(SETTINGS_DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
        db.createObjectStore(SETTINGS_STORE_NAME);
      }
    };
  });
}

/**
 * Store a setting in IndexedDB
 */
async function storeSetting(key: string, value: unknown): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await openSettingsDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SETTINGS_STORE_NAME], "readwrite");
      const store = transaction.objectStore(SETTINGS_STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      try {
        store.put(value, key);
      } catch (error) {
        transaction.abort();
        reject(error);
      }
    });
  } catch (error) {
    console.error("Error storing setting in IndexedDB:", error);
    throw error;
  }
}

/**
 * Retrieve a setting from IndexedDB
 */
async function retrieveSetting<T>(key: string): Promise<T | null> {
  if (typeof window === "undefined") return null;

  try {
    const db = await openSettingsDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SETTINGS_STORE_NAME], "readonly");
      const store = transaction.objectStore(SETTINGS_STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error retrieving setting from IndexedDB:", error);
    return null;
  }
}

/**
 * Analytics provider that wraps the app with TelemetryDeck
 * Respects user's privacy preferences stored in IndexedDB
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
  
  // Start with false and load from IndexedDB on mount
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preference from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;

    async function loadPreference() {
      try {
        const preference = await retrieveSetting<boolean>(ANALYTICS_KEY);
        
        if (isMounted) {
          // Default to false (privacy-first approach)
          // User must explicitly opt-in
          setAnalyticsEnabled(preference === true);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load analytics preference:", error);
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const signal = (eventName: string, metadata?: Record<string, string>) => {
    if (!analyticsEnabled || !isLoaded) return;
    telemetryDeck.signal(eventName, metadata);
  };

  const toggleAnalytics = async (enabled: boolean) => {
    if (typeof window === "undefined") return;
    
    try {
      await storeSetting(ANALYTICS_KEY, enabled);
      setAnalyticsEnabled(enabled);
      
      // Show a message to user that they need to reload
      // This is better UX than forcing an immediate reload
      if (window.confirm("Analytics settings updated. Reload the page to apply changes?")) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to save analytics preference:", error);
      alert("Failed to save analytics preference. Please try again.");
    }
  };

  return {
    signal,
    analyticsEnabled,
    toggleAnalytics,
  };
}
