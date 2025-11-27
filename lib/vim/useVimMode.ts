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

import { useState, useEffect, useCallback, useRef } from 'react';
import { VimModeManager, VimMode, VimState, RecordedKey } from './VimMode';

export interface UseVimModeOptions {
  enabled: boolean;
  onCommand?: (command: { action: string; args?: unknown }) => void;
  onExit?: () => void;
  onMacroPlayback?: (keys: RecordedKey[]) => void;
}

/**
 * React hook for managing vim mode
 */
export function useVimMode({ enabled, onCommand, onExit, onMacroPlayback }: UseVimModeOptions) {
  const [vimState, setVimState] = useState<VimState | null>(null);
  const vimManagerRef = useRef<VimModeManager | null>(null);

  // Initialize vim manager
  useEffect(() => {
    if (enabled && !vimManagerRef.current) {
      vimManagerRef.current = new VimModeManager((state) => {
        setVimState(state);
      });
      setVimState(vimManagerRef.current.getState());
    } else if (!enabled && vimManagerRef.current) {
      vimManagerRef.current.reset();
      vimManagerRef.current = null;
      setVimState(null);
    }
    return () => {
      if (vimManagerRef.current) {
        vimManagerRef.current.reset();
        vimManagerRef.current = null;
        setVimState(null);
      }
    };
  }, [enabled]);

  // Check for pending macro playback
  useEffect(() => {
    if (vimState?.playingMacro && vimManagerRef.current && onMacroPlayback) {
      const macro = vimManagerRef.current.getMacroToPlay();
      if (macro && macro.length > 0) {
        // Trigger macro playback callback
        onMacroPlayback(macro);
      }
      // Finish macro playback
      vimManagerRef.current.finishMacroPlayback();
    }
  }, [vimState?.playingMacro, onMacroPlayback]);

  // Handle key down events
  const handleKeyDown = useCallback((event: KeyboardEvent): boolean => {
    if (!enabled || !vimManagerRef.current) {
      return false;
    }

    const manager = vimManagerRef.current;
    const key = event.key;
    const modifiers = {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
    };

    // Check for exit in command mode
    if (manager.getMode() === VimMode.COMMAND && key === 'Enter') {
      const command = manager.executeCommand(manager.getState().commandBuffer);
      if (command) {
        if (command.action === 'exit' || command.action === 'save-and-exit' || command.action === 'force-exit') {
          if (onExit) {
            onExit();
          }
        }
        if (onCommand) {
          onCommand(command);
        }
      }
    }

    // Let vim manager handle the key
    const handled = manager.handleKeyPress(key, modifiers);

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }

    return false;
  }, [enabled, onCommand, onExit]);

  // Switch to specific mode
  const setMode = useCallback((mode: VimMode) => {
    if (vimManagerRef.current) {
      vimManagerRef.current.setMode(mode);
    }
  }, []);

  // Get current mode
  const getMode = useCallback((): VimMode | null => {
    return vimManagerRef.current ? vimManagerRef.current.getMode() : null;
  }, []);

  // Get the vim manager for direct access
  const getManager = useCallback((): VimModeManager | null => {
    return vimManagerRef.current;
  }, []);

  return {
    vimState,
    handleKeyDown,
    setMode,
    getMode,
    getManager,
    isVimEnabled: enabled,
  };
}
