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
      className={`glass-card p-6 ${
        hover ? "transition-all duration-300 hover:scale-105 hover:shadow-2xl" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
