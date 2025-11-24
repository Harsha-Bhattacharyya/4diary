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

import { BlockNoteEditor } from "@blocknote/core";

/**
 * Vim Navigation Handler
 * Handles vim navigation and editing commands for BlockNote editor
 * 
 * NOTE: This implementation uses document.execCommand() for text manipulation
 * which is deprecated but still widely supported. Future versions should migrate
 * to modern alternatives like:
 * - Clipboard API for copy/paste operations
 * - Direct BlockNote/ProseMirror API for text manipulation
 * - Selection API with Range objects for better control
 */
export class VimNavigationHandler {
  private editor: BlockNoteEditor;

  constructor(editor: BlockNoteEditor) {
    this.editor = editor;
  }

  /**
   * Handle vim navigation command
   */
  handleNavigation(key: string, count: number = 1): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    switch (key) {
      case 'h': // Move left
        this.moveCharacter(-1, count);
        return true;
      
      case 'l': // Move right
        this.moveCharacter(1, count);
        return true;
      
      case 'j': // Move down
        this.moveLine(1, count);
        return true;
      
      case 'k': // Move up
        this.moveLine(-1, count);
        return true;
      
      case 'w': // Move forward word
        this.moveWord(1, count);
        return true;
      
      case 'b': // Move backward word
        this.moveWord(-1, count);
        return true;
      
      case 'e': // Move to end of word
        this.moveToWordEnd(count);
        return true;
      
      case '0': // Move to start of line
        this.moveToLineStart();
        return true;
      
      case '^': // Move to first non-whitespace character
        this.moveToFirstNonWhitespace();
        return true;
      
      case '$': // Move to end of line
        this.moveToLineEnd();
        return true;
      
      case 'G': // Move to end of document
        this.moveToDocumentEnd();
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Handle vim editing command
   */
  handleEdit(key: string, count: number = 1): boolean {
    switch (key) {
      case 'x': // Delete character under cursor
        this.deleteCharacter(count);
        return true;
      
      case 'X': // Delete character before cursor
        this.deleteCharacterBackward(count);
        return true;
      
      case 'p': // Paste after cursor
        this.paste();
        return true;
      
      case 'P': // Paste before cursor
        this.pasteBefore();
        return true;
      
      case 'u': // Undo
        this.undo();
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Handle compound commands like dd, dw, yy, etc.
   */
  handleCompoundCommand(command: string, count: number = 1): boolean {
    const selection = window.getSelection();
    if (!selection) return false;

    switch (command) {
      case 'dd': // Delete line
        this.deleteLine(count);
        return true;
      
      case 'dw': // Delete word
        this.deleteWord(count);
        return true;
      
      case 'd$': // Delete to end of line
        this.deleteToLineEnd();
        return true;
      
      case 'd0': // Delete to start of line
        this.deleteToLineStart();
        return true;
      
      case 'yy': // Yank (copy) line
        this.yankLine(count);
        return true;
      
      case 'yw': // Yank word
        this.yankWord(count);
        return true;
      
      case 'cc': // Change line
        this.deleteLine(count);
        return true;
      
      case 'cw': // Change word
        this.deleteWord(count);
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Move cursor by character
   */
  private moveCharacter(direction: number, count: number = 1): void {
    const selection = window.getSelection();
    if (!selection) return;

    for (let i = 0; i < count; i++) {
      if (direction > 0) {
        selection.modify('move', 'forward', 'character');
      } else {
        selection.modify('move', 'backward', 'character');
      }
    }
  }

  /**
   * Move cursor by line
   */
  private moveLine(direction: number, count: number = 1): void {
    const selection = window.getSelection();
    if (!selection) return;

    for (let i = 0; i < count; i++) {
      if (direction > 0) {
        selection.modify('move', 'forward', 'line');
      } else {
        selection.modify('move', 'backward', 'line');
      }
    }
  }

  /**
   * Move cursor by word
   */
  private moveWord(direction: number, count: number = 1): void {
    const selection = window.getSelection();
    if (!selection) return;

    for (let i = 0; i < count; i++) {
      if (direction > 0) {
        selection.modify('move', 'forward', 'word');
      } else {
        selection.modify('move', 'backward', 'word');
      }
    }
  }

  /**
   * Move to end of word
   */
  private moveToWordEnd(count: number = 1): void {
    const selection = window.getSelection();
    if (!selection) return;

    for (let i = 0; i < count; i++) {
      selection.modify('move', 'forward', 'word');
    }
  }

  /**
   * Move to start of line
   */
  private moveToLineStart(): void {
    const selection = window.getSelection();
    if (!selection) return;

    selection.modify('move', 'backward', 'lineboundary');
  }

  /**
   * Move to first non-whitespace character
   */
  private moveToFirstNonWhitespace(): void {
    this.moveToLineStart();
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return;

    const text = selection.anchorNode.textContent || '';
    const match = text.match(/^\s*/);
    if (match && match[0].length > 0) {
      this.moveCharacter(1, match[0].length);
    }
  }

  /**
   * Move to end of line
   */
  private moveToLineEnd(): void {
    const selection = window.getSelection();
    if (!selection) return;

    selection.modify('move', 'forward', 'lineboundary');
  }

  /**
   * Move to end of document
   */
  private moveToDocumentEnd(): void {
    const selection = window.getSelection();
    if (!selection) return;

    selection.modify('move', 'forward', 'documentboundary');
  }

  /**
   * Move to start of document
   */
  moveToDocumentStart(): void {
    const selection = window.getSelection();
    if (!selection) return;

    selection.modify('move', 'backward', 'documentboundary');
  }

  /**
   * Delete character under cursor
   */
  private deleteCharacter(count: number = 1): void {
    const selection = window.getSelection();
    if (!selection) return;

    for (let i = 0; i < count; i++) {
      selection.modify('extend', 'forward', 'character');
    }
    document.execCommand('delete');
  }

  /**
   * Delete character before cursor
   */
  private deleteCharacterBackward(count: number = 1): void {
    const selection = window.getSelection();
    if (!selection) return;

    for (let i = 0; i < count; i++) {
      selection.modify('extend', 'backward', 'character');
    }
    document.execCommand('delete');
  }

  /**
   * Delete line
   */
  private deleteLine(count: number = 1): void {
    const selection = window.getSelection();
    if (!selection) return;

    for (let i = 0; i < count; i++) {
      this.moveToLineStart();
      selection.modify('extend', 'forward', 'line');
      document.execCommand('delete');
    }
  }

  /**
   * Delete word
   */
  private deleteWord(count: number = 1): void {
    const selection = window.getSelection();
    if (!selection) return;

    for (let i = 0; i < count; i++) {
      selection.modify('extend', 'forward', 'word');
    }
    document.execCommand('delete');
  }

  /**
   * Delete to end of line
   */
  private deleteToLineEnd(): void {
    const selection = window.getSelection();
    if (!selection) return;

    selection.modify('extend', 'forward', 'lineboundary');
    document.execCommand('delete');
  }

  /**
   * Delete to start of line
   */
  private deleteToLineStart(): void {
    const selection = window.getSelection();
    if (!selection) return;

    selection.modify('extend', 'backward', 'lineboundary');
    document.execCommand('delete');
  }

  /**
   * Yank (copy) line
   */
  private yankLine(count: number = 1): void {
    const selection = window.getSelection();
    if (!selection) return;

    const startPos = selection.anchorOffset;
    this.moveToLineStart();
    
    for (let i = 0; i < count; i++) {
      selection.modify('extend', 'forward', 'line');
    }
    
    document.execCommand('copy');
    selection.collapse(selection.anchorNode, startPos);
  }

  /**
   * Yank (copy) word
   */
  private yankWord(count: number = 1): void {
    const selection = window.getSelection();
    if (!selection) return;

    const startPos = selection.anchorOffset;
    
    for (let i = 0; i < count; i++) {
      selection.modify('extend', 'forward', 'word');
    }
    
    document.execCommand('copy');
    selection.collapse(selection.anchorNode, startPos);
  }

  /**
   * Paste after cursor
   */
  private paste(): void {
    navigator.clipboard.readText().then((text) => {
      document.execCommand('insertText', false, text);
    }).catch((error) => {
      console.error('Failed to paste:', error);
    });
  }

  /**
   * Paste before cursor
   */
  private pasteBefore(): void {
    this.moveCharacter(-1);
    this.paste();
  }

  /**
   * Undo last action
   */
  private undo(): void {
    document.execCommand('undo');
  }

  /**
   * Handle insert mode commands
   */
  handleInsertModeCommand(position: 'i' | 'I' | 'a' | 'A' | 'o' | 'O'): boolean {
    const selection = window.getSelection();
    if (!selection) return false;

    switch (position) {
      case 'I': // Insert at beginning of line
        this.moveToLineStart();
        return true;
      
      case 'a': // Append after cursor
        this.moveCharacter(1);
        return true;
      
      case 'A': // Append at end of line
        this.moveToLineEnd();
        return true;
      
      case 'o': // Open line below
        this.moveToLineEnd();
        document.execCommand('insertParagraph');
        return true;
      
      case 'O': // Open line above
        this.moveToLineStart();
        document.execCommand('insertParagraph');
        this.moveLine(-1);
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Replace character under cursor
   */
  replaceCharacter(char: string): void {
    const selection = window.getSelection();
    if (!selection) return;

    // Delete current character
    selection.modify('extend', 'forward', 'character');
    document.execCommand('delete');
    
    // Insert new character
    document.execCommand('insertText', false, char);
  }
}
