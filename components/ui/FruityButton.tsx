"use client";

import React from "react";

interface FruityButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "gradient" | "aqua" | "glass";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function FruityButton({
  children,
  onClick,
  className = "",
  variant = "gradient",
  size = "md",
  disabled = false,
  type = "button",
}: FruityButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    gradient: "fruity-button",
    aqua: "gradient-aqua text-white border-none shadow-lg hover:shadow-xl",
    glass: "glass-button hover:bg-white/20",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-full font-semibold transition-all duration-300 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      {children}
    </button>
  );
}
