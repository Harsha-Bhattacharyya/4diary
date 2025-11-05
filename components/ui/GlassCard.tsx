"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  hover = false,
}: GlassCardProps) {
  return (
    <div
      className={`leather-card p-6 ${
        hover ? "transition-all duration-300 hover:-translate-y-2 hover:shadow-deep" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
