"use client";

import React from "react";

interface LeatherButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "gradient" | "leather" | "parchment";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function LeatherButton({
  children,
  onClick,
  className = "",
  variant = "gradient",
  size = "md",
  disabled = false,
  type = "button",
}: LeatherButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    gradient: "leather-button",
    leather: "bg-leather-600 text-leather-100 border-2 border-leather-700 shadow-leather hover:bg-leather-500 hover:shadow-deep",
    parchment: "bg-leather-200 text-leather-900 border-2 border-leather-400 shadow-leather hover:bg-leather-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${sizeClasses[size]} font-bold transition-all duration-300 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:-translate-y-1"
      } ${className}`}
    >
      {children}
    </button>
  );
}
