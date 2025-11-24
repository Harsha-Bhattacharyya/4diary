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
 * Vim Mode Types
 */
export enum VimMode {
  NORMAL = 'NORMAL',
  INSERT = 'INSERT',
  REPLACE = 'REPLACE',
  COMMAND = 'COMMAND',
}

/**
 * Vim State Interface
 */
export interface VimState {
  mode: VimMode;
  commandBuffer: string;
  register: string;
  lastCommand: string;
  count: number;
  macro: { [key: string]: string[] };
  recording: string | null;
  lastSearchPattern: string;
}

/**
 * Initial Vim State
 */
export const initialVimState: VimState = {
  mode: VimMode.NORMAL,
  commandBuffer: '',
  register: '',
  lastCommand: '',
  count: 0,
  macro: {},
  recording: null,
  lastSearchPattern: '',
};

/**
 * Vim Mode Manager
 * Manages vim modes, commands, and keybindings
 */
export class VimModeManager {
  private state: VimState;
  private onStateChange: (state: VimState) => void;

  constructor(onStateChange: (state: VimState) => void) {
    this.state = { ...initialVimState };
    this.onStateChange = onStateChange;
  }

  /**
   * Get current vim state
   */
  getState(): VimState {
    return { ...this.state };
  }

  /**
   * Set vim mode
   */
  setMode(mode: VimMode): void {
    this.state.mode = mode;
    this.state.commandBuffer = '';
    this.notifyStateChange();
  }

  /**
   * Get current mode
   */
  getMode(): VimMode {
    return this.state.mode;
  }

  /**
   * Handle key press in vim mode
   */
  handleKeyPress(key: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean }): boolean {
    switch (this.state.mode) {
      case VimMode.NORMAL:
        return this.handleNormalMode(key, modifiers);
      case VimMode.INSERT:
        return this.handleInsertMode(key, modifiers);
      case VimMode.REPLACE:
        return this.handleReplaceMode(key, modifiers);
      case VimMode.COMMAND:
        return this.handleCommandMode(key, modifiers);
      default:
        return false;
    }
  }

  /**
   * Handle Normal mode keys
   */
  private handleNormalMode(key: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean }): boolean {
    // ESC always returns to normal mode
    if (key === 'Escape') {
      this.state.commandBuffer = '';
      this.state.count = 0;
      this.notifyStateChange();
      return true;
    }

    // Handle count prefix (1-9)
    if (/^[1-9]$/.test(key) && this.state.commandBuffer === '') {
      this.state.count = this.state.count * 10 + parseInt(key);
      this.notifyStateChange();
      return true;
    }

    // Mode switching
    if (key === 'i') {
      this.setMode(VimMode.INSERT);
      return true;
    }
    if (key === 'I') {
      // Insert at beginning of line
      this.setMode(VimMode.INSERT);
      return false; // Let the editor handle the cursor movement
    }
    if (key === 'a') {
      // Append after cursor
      this.setMode(VimMode.INSERT);
      return false;
    }
    if (key === 'A') {
      // Append at end of line
      this.setMode(VimMode.INSERT);
      return false;
    }
    if (key === 'o') {
      // Open line below
      this.setMode(VimMode.INSERT);
      return false;
    }
    if (key === 'O') {
      // Open line above
      this.setMode(VimMode.INSERT);
      return false;
    }
    if (key === 'R') {
      this.setMode(VimMode.REPLACE);
      return true;
    }
    if (key === ':') {
      this.setMode(VimMode.COMMAND);
      return true;
    }

    // Visual mode indicator (v, V)
    if (key === 'v' || key === 'V') {
      // For now, just indicate visual mode - actual selection handled by editor
      return false;
    }

    // Macro recording
    if (key === 'q') {
      if (this.state.recording) {
        // Stop recording
        this.state.recording = null;
        this.notifyStateChange();
      } else if (this.state.commandBuffer.startsWith('q')) {
        // Start recording to register
        const register = this.state.commandBuffer.slice(1);
        if (register.length === 1) {
          this.state.recording = register;
          this.state.macro[register] = [];
          this.state.commandBuffer = '';
          this.notifyStateChange();
        }
      } else {
        this.state.commandBuffer = 'q';
        this.notifyStateChange();
      }
      return true;
    }

    // Play macro
    if (key === '@' && this.state.commandBuffer === '') {
      this.state.commandBuffer = '@';
      this.notifyStateChange();
      return true;
    }
    if (this.state.commandBuffer === '@' && /^[a-z]$/.test(key)) {
      // Play macro from register
      const register = key;
      if (this.state.macro[register]) {
        // TODO: Implement macro playback
        console.log(`Playing macro from register ${register}`);
      }
      this.state.commandBuffer = '';
      this.notifyStateChange();
      return true;
    }

    // Navigation keys (these will be handled by the editor component)
    if (['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$', 'G', 'gg'].includes(key)) {
      return false; // Let editor handle movement
    }

    // Deletion/change commands
    if (['x', 'X', 'd', 'c', 'y', 'p', 'P', 'u', 'r'].includes(key)) {
      this.state.lastCommand = key;
      return false; // Let editor handle these
    }

    // Clear command buffer on unknown key
    this.state.commandBuffer = '';
    this.state.count = 0;
    this.notifyStateChange();
    return false;
  }

  /**
   * Handle Insert mode keys
   */
  private handleInsertMode(key: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean }): boolean {
    if (key === 'Escape') {
      this.setMode(VimMode.NORMAL);
      return true;
    }

    // Record keys if macro recording
    if (this.state.recording) {
      this.state.macro[this.state.recording].push(key);
    }

    return false; // Let editor handle regular typing
  }

  /**
   * Handle Replace mode keys
   */
  private handleReplaceMode(key: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean }): boolean {
    if (key === 'Escape') {
      this.setMode(VimMode.NORMAL);
      return true;
    }

    return false; // Let editor handle replace mode typing
  }

  /**
   * Handle Command mode keys
   */
  private handleCommandMode(key: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean }): boolean {
    if (key === 'Escape') {
      this.setMode(VimMode.NORMAL);
      return true;
    }

    if (key === 'Enter') {
      this.executeCommand(this.state.commandBuffer);
      this.setMode(VimMode.NORMAL);
      return true;
    }

    if (key === 'Backspace') {
      this.state.commandBuffer = this.state.commandBuffer.slice(0, -1);
      this.notifyStateChange();
      return true;
    }

    // Add character to command buffer
    if (key.length === 1) {
      this.state.commandBuffer += key;
      this.notifyStateChange();
      return true;
    }

    return false;
  }

  /**
   * Execute vim command
   */
  executeCommand(command: string): { action: string; args?: any } | null {
    // Exit commands
    if (command === 'q' || command === 'quit') {
      return { action: 'exit' };
    }
    if (command === 'w' || command === 'write') {
      return { action: 'save' };
    }
    if (command === 'wq' || command === 'x') {
      return { action: 'save-and-exit' };
    }
    if (command === 'q!') {
      return { action: 'force-exit' };
    }

    // Search command
    if (command.startsWith('/')) {
      this.state.lastSearchPattern = command.slice(1);
      return { action: 'search', args: { pattern: this.state.lastSearchPattern } };
    }

    // Substitute command
    if (command.startsWith('s/')) {
      const parts = command.slice(2).split('/');
      if (parts.length >= 2) {
        return { action: 'substitute', args: { find: parts[0], replace: parts[1] } };
      }
    }

    return null;
  }

  /**
   * Add character to command buffer
   */
  addToCommandBuffer(char: string): void {
    this.state.commandBuffer += char;
    this.notifyStateChange();
  }

  /**
   * Clear command buffer
   */
  clearCommandBuffer(): void {
    this.state.commandBuffer = '';
    this.notifyStateChange();
  }

  /**
   * Notify state change
   */
  private notifyStateChange(): void {
    this.onStateChange(this.getState());
  }

  /**
   * Reset vim state
   */
  reset(): void {
    this.state = { ...initialVimState };
    this.notifyStateChange();
  }
}
