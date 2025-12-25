"use client";

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

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./editor.css";
import FormattingToolbar from "./FormattingToolbar";
import VimModeIndicator from "./VimModeIndicator";
import { useVimMode } from "@/lib/vim/useVimMode";
import { VimMode, RecordedKey } from "@/lib/vim/VimMode";
import { VimNavigationHandler } from "@/lib/vim/VimNavigationHandler";
import AIAssistant from "@/components/ui/AIAssistant";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";

import type { EditorFontType } from "@/components/ui/NoteSettings";

interface BlockEditorProps {
  initialContent?: unknown[];
  onChange?: (content: unknown[]) => void;
  onSave?: (content: unknown[]) => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
  editable?: boolean;
  showToolbar?: boolean;
  showLineNumbers?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  editorFont?: EditorFontType;
}

/**
 * Renders a BlockNote-based rich text editor with an optional formatting toolbar and auto-save.
 *
 * When `autoSave` is enabled and an `onSave` handler is provided, the editor will periodically invoke
 * `onSave` with the current document content. Changes to the document invoke `onChange` when provided.
 *
 * @param initialContent - Initial document blocks to populate the editor.
 * @param onChange - Callback invoked with the current document content after edits.
 * @param onSave - Callback invoked with the current document content for persistent saving.
 * @param autoSave - Whether the editor should automatically save changes (default: `true`).
 * @param autoSaveInterval - Time in milliseconds between automatic saves (default: `2000`).
 * @param editable - Whether the editor content is editable (default: `true`).
 * @param showToolbar - Whether to display the formatting toolbar (default: `true`).
 * @param showLineNumbers - Whether to display line numbers (default: `false`).
 * @param toolbarPosition - Position of the toolbar: 'top' (default) or 'bottom'.
 * @param editorFont - The font style for the editor content (default: `normal`).
 * @returns The editor's JSX element.
 */
export default function BlockEditor({
  initialContent,
  onChange,
  onSave,
  autoSave = true,
  autoSaveInterval = 2000,
  editable = true,
  showToolbar = true,
  showLineNumbers = false,
  toolbarPosition = 'top',
  editorFont = 'normal',
}: BlockEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastContentHash, setLastContentHash] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [vimEnabled, setVimEnabled] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const vimNavigationHandlerRef = useRef<VimNavigationHandler | null>(null);
  const { theme } = useTheme();

  // Create editor instance
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
  });

  // Initialize vim navigation handler
  useEffect(() => {
    if (editor && !vimNavigationHandlerRef.current) {
      vimNavigationHandlerRef.current = new VimNavigationHandler(editor);
    }
  }, [editor]);

  // Macro playback handler
  const handleMacroPlayback = useCallback((keys: RecordedKey[]) => {
    if (!editorContainerRef.current) return;
    
    // Play macro keys sequentially with a small delay between each key
    // to allow the editor to process each key properly
    const playKeysSequentially = async () => {
      for (const recordedKey of keys) {
        // Create and dispatch a keyboard event for each recorded key
        const event = new KeyboardEvent('keydown', {
          key: recordedKey.key,
          code: recordedKey.key.length === 1 ? `Key${recordedKey.key.toUpperCase()}` : recordedKey.key,
          ctrlKey: recordedKey.modifiers.ctrl || false,
          shiftKey: recordedKey.modifiers.shift || false,
          altKey: recordedKey.modifiers.alt || false,
          bubbles: true,
          cancelable: true,
        });
        
        // Find the focused element within the editor or use the editor container
        const targetElement = document.activeElement || editorContainerRef.current;
        if (targetElement) {
          targetElement.dispatchEvent(event);
        }
        
        // Small delay to allow the event to be processed
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    };
    
    playKeysSequentially().catch((error) => {
      console.error('Macro playback failed:', error);
    });
  }, []);

  // Vim mode integration
  const { vimState, handleKeyDown, isVimEnabled } = useVimMode({
    enabled: vimEnabled,
    onCommand: (command) => {
      if (command.action === 'save' || command.action === 'save-and-exit') {
        if (onSave) {
          const content = editor.document;
          onSave(content);
        }
      }
      if (command.action === 'exit' || command.action === 'save-and-exit' || command.action === 'force-exit') {
        setVimEnabled(false);
      }
    },
    onExit: () => {
      setVimEnabled(false);
    },
    onMacroPlayback: handleMacroPlayback,
  });

  // Simple fast hash function for content comparison
  const hashContent = (content: unknown[]): number => {
    const str = JSON.stringify(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  };

  // Initialize lastContentHash when editor is ready with initialContent
  useEffect(() => {
    // Wait a short time to ensure editor is initialized with initialContent
    const timer = setTimeout(() => {
      const hash = hashContent(editor.document);
      setLastContentHash(hash);
      setIsInitialized(true);
    }, 100);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for Ctrl+Shift+V to toggle vim mode and Ctrl+Shift+A for AI assistant
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        setVimEnabled((prev) => !prev);
        return;
      }
      
      // Ctrl+Shift+A to toggle AI assistant
      if (event.ctrlKey && event.shiftKey && event.key === 'A' && editable) {
        event.preventDefault();
        setShowAI((prev) => !prev);
        return;
      }

      // If vim mode is enabled, handle vim keybindings
      if (vimEnabled && editorContainerRef.current) {
        const targetNode = event.target as Node | null;
        if (!targetNode || !editorContainerRef.current.contains(targetNode)) {
          return;
        }

        const handled = handleKeyDown(event);
        
        // In non-INSERT/REPLACE modes, block all text input to prevent typing
        // This ensures vim NORMAL mode truly blocks text input
        // Note: COMMAND mode is handled by the vim manager which returns handled=true for typing
        if (vimState && vimState.mode !== VimMode.INSERT && vimState.mode !== VimMode.REPLACE) {
          // Allow navigation keys (Arrow keys, Tab, etc.) but block printable characters
          const isModifier = event.ctrlKey || event.altKey || event.metaKey;
          const isNavKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'PageUp', 'PageDown', 'Escape', 'Backspace', 'Delete', 'Enter'].includes(event.key);
          const isFunctionKey = /^F\d+$/.test(event.key);
          
          // If it's a printable character (single character key) and not a navigation/modifier/function key
          // and not already handled by vim manager, prevent default to block text input
          // This includes space ' ' which should not type in NORMAL mode
          if (!handled && !isModifier && !isNavKey && !isFunctionKey && event.key.length === 1) {
            event.preventDefault();
          }
        }
        
        // If not handled by vim mode manager, try navigation handler
        if (!handled && vimState && vimNavigationHandlerRef.current) {
          const selection = window.getSelection();
          if (
            !selection ||
            !selection.anchorNode ||
            !editorContainerRef.current.contains(selection.anchorNode)
          ) {
            return;
          }

          const navHandler = vimNavigationHandlerRef.current;
          const key = event.key;
          const count = vimState.count || 1;
          const lastCmd = vimState.lastCommand;
          
          // Handle navigation in visual modes
          if (vimState.mode === VimMode.VISUAL || vimState.mode === VimMode.VISUAL_LINE) {
            const isLinewise = vimState.mode === VimMode.VISUAL_LINE;
            
            // Handle visual mode operations
            if (lastCmd === 'd' || lastCmd === 'x') {
              navHandler.deleteVisualSelection();
              event.preventDefault();
              return;
            }
            
            if (lastCmd === 'y') {
              navHandler.yankVisualSelection();
              event.preventDefault();
              return;
            }
            
            if (lastCmd === 'c') {
              navHandler.changeVisualSelection();
              event.preventDefault();
              return;
            }
            
            // Handle visual navigation (extends selection)
            if (navHandler.handleVisualNavigation(key, count, isLinewise)) {
              event.preventDefault();
              return;
            }
          }
          
          // Handle navigation in normal mode
          if (vimState.mode === VimMode.NORMAL) {
            // Handle special commands
            if (lastCmd === 'gg') {
              navHandler.moveToDocumentStart();
              event.preventDefault();
              return;
            }

            // Handle compound commands (dd, dw, yy, etc.)
            if (lastCmd && ['dd', 'dw', 'd$', 'd0', 'yy', 'yw', 'cc', 'cw'].includes(lastCmd)) {
              if (navHandler.handleCompoundCommand(lastCmd, count)) {
                event.preventDefault();
                return;
              }
            }

            // Handle insert mode positioning
            if (['I', 'a', 'A', 'o', 'O'].includes(lastCmd)) {
              navHandler.handleInsertModeCommand(lastCmd as 'i' | 'I' | 'a' | 'A' | 'o' | 'O');
              event.preventDefault();
              return;
            }

            // Handle replace character (r followed by one character)
            if (lastCmd.startsWith('r') && lastCmd.length === 2) {
              const char = lastCmd.charAt(1);
              navHandler.replaceCharacter(char);
              event.preventDefault();
              return;
            }

            // Handle navigation commands
            if (navHandler.handleNavigation(key, count)) {
              event.preventDefault();
              return;
            }

            // Handle editing commands
            if (navHandler.handleEdit(key, count)) {
              event.preventDefault();
              return;
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [vimEnabled, handleKeyDown, vimState, editable]);
  // Note: Read-only behavior for vim NORMAL/COMMAND/VISUAL modes is enforced via keyboard event interception

  // Auto-save functionality - only save when there are changes
  useEffect(() => {
    if (!autoSave || !onSave || !hasChanges || !isInitialized) return;

    const timeoutId = setTimeout(async () => {
      const content = editor.document;
      
      // Double-check with full comparison before saving
      const currentHash = hashContent(content);
      
      // Only save if content has actually changed
      if (content && content.length > 0 && currentHash !== lastContentHash) {
        setIsSaving(true);
        try {
          await onSave(content);
          setLastSaved(new Date());
          setLastContentHash(currentHash);
          setHasChanges(false);
        } catch (error) {
          console.error("Failed to save:", error);
        } finally {
          setIsSaving(false);
        }
      } else {
        // Content hasn't actually changed, just reset the flag
        setHasChanges(false);
      }
    }, autoSaveInterval);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- editor.document is intentionally accessed inside timeout for latest value
  }, [hasChanges, autoSave, onSave, autoSaveInterval, lastContentHash, isInitialized]);

  // Handle changes - lightweight change detection
  const handleChange = () => {
    const content = editor.document;
    
    // Just mark that there are changes without heavy serialization
    // The actual comparison will happen before save
    if (isInitialized) {
      setHasChanges(true);
    }
    
    if (onChange) {
      onChange(content);
    }
  };

  // Get document context for AI
  const getDocumentContext = useCallback(() => {
    if (!editor) return "";
    const blocks = editor.document;
    return JSON.stringify(blocks).slice(0, 1000); // First 1000 chars as context
  }, [editor]);

  return (
    <div className="relative w-full h-full touch-auto" ref={editorContainerRef}>
      {/* Vim Mode Indicator */}
      {vimEnabled && <VimModeIndicator vimState={vimState} isEnabled={isVimEnabled} />}

      {/* Formatting Toolbar - Top position */}
      {showToolbar && !vimEnabled && toolbarPosition === 'top' && <FormattingToolbar editor={editor} position="top" />}

      {/* AI Assistant Button */}
      {editable && (
        <button
          onClick={() => setShowAI(true)}
          className="fixed bottom-8 right-8 z-50 p-4 bg-leather-600 text-leather-50 rounded-full shadow-deep hover:bg-leather-700 transition-all hover:scale-110"
          title="AI Assistant (Ctrl+Shift+A)"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        documentContext={getDocumentContext()}
      />

      {/* Save status */}
      {autoSave && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full glass-card text-xs">
          {isSaving ? (
            <span className="text-aqua-600">💾 Saving...</span>
          ) : lastSaved ? (
            <span className="text-gray-600">
              ✓ Saved {lastSaved.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      )}

      {/* Editor */}
      <div 
        className={`touch-manipulation ${showLineNumbers ? 'editor-with-line-numbers' : ''} ${toolbarPosition === 'bottom' ? 'pb-16' : ''} editor-font-${editorFont}`} 
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <BlockNoteView
          editor={editor}
          onChange={handleChange}
          editable={editable}
          theme={theme}
          sideMenu={false}
          slashMenu={true}
        />
      </div>

      {/* Formatting Toolbar - Bottom position */}
      {showToolbar && !vimEnabled && toolbarPosition === 'bottom' && <FormattingToolbar editor={editor} position="bottom" />}
    </div>
  );
}
