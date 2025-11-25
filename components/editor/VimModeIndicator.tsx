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

import React from 'react';
import { VimMode, VimState } from '@/lib/vim/VimMode';

interface VimModeIndicatorProps {
  vimState: VimState | null;
  isEnabled: boolean;
}

/**
 * Visual indicator for the current vim mode
 */
export default function VimModeIndicator({ vimState, isEnabled }: VimModeIndicatorProps) {
  if (!isEnabled || !vimState) {
    return null;
  }

  const getModeColor = (mode: VimMode): string => {
    switch (mode) {
      case VimMode.NORMAL:
        return 'bg-blue-500';
      case VimMode.INSERT:
        return 'bg-green-500';
      case VimMode.REPLACE:
        return 'bg-red-500';
      case VimMode.COMMAND:
        return 'bg-yellow-500';
      case VimMode.VISUAL:
        return 'bg-purple-500';
      case VimMode.VISUAL_LINE:
        return 'bg-purple-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getModeText = (mode: VimMode): string => {
    switch (mode) {
      case VimMode.NORMAL:
        return 'NORMAL';
      case VimMode.INSERT:
        return 'INSERT';
      case VimMode.REPLACE:
        return 'REPLACE';
      case VimMode.COMMAND:
        return 'COMMAND';
      case VimMode.VISUAL:
        return 'VISUAL';
      case VimMode.VISUAL_LINE:
        return 'VISUAL LINE';
      default:
        return 'VIM';
    }
  };

  return (
    <div className="fixed bottom-20 left-4 z-[60] flex items-center gap-2" data-vim-indicator="true">
      {/* Mode Indicator */}
      <div className={`${getModeColor(vimState.mode)} text-white px-3 py-1 rounded-md font-mono text-sm font-bold shadow-lg`}>
        {getModeText(vimState.mode)}
      </div>

      {/* Command Buffer Display */}
      {vimState.mode === VimMode.COMMAND && (
        <div className="glass-card px-3 py-1 rounded-md font-mono text-sm">
          :{vimState.commandBuffer}
          <span className="animate-pulse">|</span>
        </div>
      )}

      {/* Recording Indicator */}
      {vimState.recording && (
        <div className="bg-red-600 text-white px-3 py-1 rounded-md font-mono text-sm font-bold shadow-lg animate-pulse">
          ◉ Recording @{vimState.recording}
        </div>
      )}

      {/* Count Display */}
      {vimState.count > 0 && vimState.mode === VimMode.NORMAL && (
        <div className="glass-card px-3 py-1 rounded-md font-mono text-sm">
          {vimState.count}
        </div>
      )}
    </div>
  );
}
