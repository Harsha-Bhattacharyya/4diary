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

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";

/**
 * ExitContent component - handles the redirect logic
 */
function ExitContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [url, setUrl] = useState<string>("");
  const [countdown, setCountdown] = useState(10);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const targetUrl = searchParams.get("url");
    if (targetUrl) {
      try {
        // Validate URL
        const parsedUrl = new URL(targetUrl);
        
        // Prevent open redirect vulnerabilities
        // Only allow external URLs (not relative paths or javascript: schemes)
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          console.error("Invalid URL protocol:", parsedUrl.protocol);
          router.push("/");
          return;
        }
        
        // Prevent same-origin redirects (optional security measure)
        if (typeof window !== "undefined" && parsedUrl.origin === window.location.origin) {
          console.error("Cannot redirect to same origin");
          router.push("/");
          return;
        }
        
        setUrl(parsedUrl.toString());
      } catch (err) {
        console.error("Invalid URL:", err);
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!url || cancelled) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = url;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [url, cancelled]);

  const handleStay = () => {
    setCancelled(true);
    router.push("/");
  };

  const handleContinue = () => {
    if (url) {
      window.location.href = url;
    }
  };

  if (!url) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <LeatherBackground />
        <GlassCard className="relative z-10 max-w-md">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4 flex justify-center">
              <Icon icon="flat-color-icons:disclaimer" width={64} height={64} />
            </div>
            <p className="text-leather-300">Loading...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <LeatherBackground />
      
      <GlassCard className="relative z-10 max-w-2xl w-full">
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Icon icon="flat-color-icons:info" width={80} height={80} />
              <div className="absolute -top-2 -right-2">
                <Icon icon="flat-color-icons:globe" width={32} height={32} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-leather-100 mb-4 text-center">
            You&apos;re Leaving 4diary
          </h1>

          {/* Message */}
          <div className="mb-6 space-y-3">
            <p className="text-lg text-leather-200 text-center">
              You&apos;re about to visit an external website:
            </p>
            <div className="p-4 rounded-lg bg-leather-900/30 border border-leather-700/30">
              <p className="text-leather-100 break-all text-center font-mono text-sm">
                {url}
              </p>
            </div>
            <p className="text-sm text-leather-300 text-center">
              4diary is not responsible for the content or privacy practices of external sites.
            </p>
          </div>

          {/* Countdown */}
          {!cancelled && (
            <div className="mb-6 text-center">
              <p className="text-leather-300 mb-2">
                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
              <div className="w-full h-2 bg-leather-900/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-1000"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <LeatherButton 
              variant="leather" 
              onClick={handleStay}
              className="w-full sm:w-auto"
            >
              <Icon icon="flat-color-icons:home" width={20} height={20} className="mr-2" />
              Stay on 4diary
            </LeatherButton>
            <LeatherButton 
              variant="parchment" 
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              Continue to Site
              <Icon icon="flat-color-icons:globe" width={20} height={20} className="ml-2" />
            </LeatherButton>
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-leather-400 hover:text-leather-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

/**
 * Exit page - shows when user is about to leave the site
 */
export default function ExitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative flex items-center justify-center">
        <LeatherBackground />
        <GlassCard className="relative z-10 max-w-md">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4 flex justify-center">
              <Icon icon="flat-color-icons:info" width={64} height={64} />
            </div>
            <p className="text-leather-300">Loading...</p>
          </div>
        </GlassCard>
      </div>
    }>
      <ExitContent />
    </Suspense>
  );
}
