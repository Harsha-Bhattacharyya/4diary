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
 * Icon Picker Component
 * Allows users to select flat-colored icons for documents
 */

"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { allPickerIcons } from "@/lib/iconMapping";

interface IconPickerComponentProps {
  selectedIcon?: string;
  onIconSelect: (icon: string) => void;
}

/**
 * Render an icon selection button that opens a dark-themed icon picker dropdown.
 *
 * @param selectedIcon - Optional icon name to display on the button; shows a default document icon when omitted
 * @param onIconSelect - Callback invoked with the selected icon name when the user picks an icon
 * @returns A UI element containing the icon button and, when open, a fullscreen backdrop and a positioned dark-themed icon picker dropdown
 */
export function IconPickerComponent({
  selectedIcon,
  onIconSelect,
}: IconPickerComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleIconClick = (iconName: string) => {
    onIconSelect(iconName);
    setIsOpen(false);
  };

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(allPickerIcons.map(icon => icon.category)))];

  // Filter icons by category
  const filteredIcons = selectedCategory === "all" 
    ? allPickerIcons 
    : allPickerIcons.filter(icon => icon.category === selectedCategory);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-md border border-[#8B7355] bg-[#2D2416] hover:bg-[#3D3426] transition-colors"
        aria-label="Select icon"
      >
        <Icon 
          icon={`flat-color-icons:${selectedIcon || "document"}`} 
          width={28} 
          height={28}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Picker */}
          <div className="absolute z-50 mt-2 left-0 w-[380px] max-h-[500px] bg-[#222] rounded-lg shadow-2xl border border-[#444] overflow-hidden">
            {/* Category tabs */}
            <div className="flex gap-2 p-3 bg-[#1a1a1a] border-b border-[#333] overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? "bg-[#8B7355] text-white"
                      : "bg-[#2D2416] text-leather-200 hover:bg-[#3D3426]"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Icons grid */}
            <div className="p-4 overflow-y-auto max-h-[400px] custom-scrollbar">
              <div className="grid grid-cols-6 gap-3">
                {filteredIcons.map((iconDef) => (
                  <button
                    key={iconDef.name}
                    type="button"
                    onClick={() => handleIconClick(iconDef.name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg hover:bg-[#333] transition-colors ${
                      selectedIcon === iconDef.name ? "bg-[#3D3426] ring-2 ring-[#8B7355]" : ""
                    }`}
                    title={iconDef.label}
                  >
                    <Icon 
                      icon={`flat-color-icons:${iconDef.name}`} 
                      width={32} 
                      height={32}
                    />
                    <span className="text-[9px] text-leather-300 mt-1 text-center line-clamp-1">
                      {iconDef.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
