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

/**
 * Render a styled button with leather-themed variants and configurable size and behavior.
 *
 * @param children - Content displayed inside the button.
 * @param onClick - Optional click handler invoked when the button is activated.
 * @param className - Additional CSS classes appended to the button.
 * @param variant - Visual style: "gradient", "leather", or "parchment".
 * @param size - Size preset: "sm", "md", or "lg".
 * @param disabled - When true, disables the button and reduces its opacity.
 * @param type - Button type attribute ("button", "submit", or "reset").
 * @returns The configured JSX button element.
 */
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