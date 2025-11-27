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
  VISUAL = 'VISUAL',
  VISUAL_LINE = 'VISUAL_LINE',
}

/**
 * Recorded key interface for macro playback
 */
export interface RecordedKey {
  key: string;
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean };
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
  macro: { [key: string]: RecordedKey[] };
  recording: string | null;
  lastMacroRegister: string | null;
  playingMacro: boolean;
  lastSearchPattern: string;
  visualStart: { node: Node | null; offset: number } | null;
  visualEnd: { node: Node | null; offset: number } | null;
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
  lastMacroRegister: null,
  playingMacro: false,
  lastSearchPattern: '',
  visualStart: null,
  visualEnd: null,
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
    // Record key if macro recording is active (unless currently playing a macro)
    // We need to record BEFORE processing to capture the actual key presses
    // But we don't record while playing a macro to avoid infinite loops
    const shouldRecord = this.state.recording && !this.state.playingMacro;
    
    let handled = false;
    switch (this.state.mode) {
      case VimMode.NORMAL:
        handled = this.handleNormalMode(key, modifiers);
        break;
      case VimMode.INSERT:
        handled = this.handleInsertMode(key, modifiers);
        break;
      case VimMode.REPLACE:
        handled = this.handleReplaceMode(key, modifiers);
        break;
      case VimMode.COMMAND:
        handled = this.handleCommandMode(key, modifiers);
        break;
      case VimMode.VISUAL:
      case VimMode.VISUAL_LINE:
        handled = this.handleVisualMode(key, modifiers);
        break;
      default:
        handled = false;
    }
    
    // Record the key after processing (so we know if it was valid)
    // Don't record 'q' that starts/stops recording, or '@' macro play commands
    // These control keys only apply in NORMAL mode - in INSERT mode, 'q' is just a regular character
    if (shouldRecord && this.state.recording) {
      const isRecordingControl = this.state.mode === VimMode.NORMAL && 
        key === 'q' && (this.state.commandBuffer === '' || this.state.commandBuffer === 'q');
      const isMacroPlay = this.state.mode === VimMode.NORMAL && 
        (key === '@' || (this.state.commandBuffer === '@' && /^[a-z@]$/.test(key)));
      
      if (!isRecordingControl && !isMacroPlay) {
        this.state.macro[this.state.recording].push({ key, modifiers: { ...modifiers } });
      }
    }
    
    return handled;
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

    // Handle pending 'q' command for macro recording (must be checked before other key handlers)
    if (this.state.commandBuffer === 'q' && /^[a-z]$/.test(key)) {
      // Start recording to register
      this.state.recording = key;
      this.state.macro[key] = [];
      this.state.commandBuffer = '';
      this.notifyStateChange();
      return true;
    }

    // Handle pending '@' command for macro playback (must be checked before other key handlers)
    if (this.state.commandBuffer === '@') {
      if (/^[a-z]$/.test(key)) {
        // Play macro from register
        const register = key;
        if (this.state.macro[register] && this.state.macro[register].length > 0) {
          this.state.lastMacroRegister = register;
          this.state.playingMacro = true;
        }
        this.state.commandBuffer = '';
        this.notifyStateChange();
        return true;
      } else if (key === '@') {
        // @@ - repeat last macro
        if (this.state.lastMacroRegister && this.state.macro[this.state.lastMacroRegister] && 
            this.state.macro[this.state.lastMacroRegister].length > 0) {
          this.state.playingMacro = true;
        }
        this.state.commandBuffer = '';
        this.notifyStateChange();
        return true;
      }
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

    // Visual mode
    if (key === 'v') {
      this.setMode(VimMode.VISUAL);
      // Save current selection position as visual start
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        this.state.visualStart = {
          node: selection.anchorNode,
          offset: selection.anchorOffset
        };
      }
      return true;
    }
    if (key === 'V') {
      this.setMode(VimMode.VISUAL_LINE);
      // Save current selection position as visual start
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        this.state.visualStart = {
          node: selection.anchorNode,
          offset: selection.anchorOffset
        };
      }
      return true;
    }

    // Macro recording - 'q' key handling
    if (key === 'q') {
      if (this.state.recording) {
        // Stop recording
        this.state.recording = null;
        this.notifyStateChange();
      } else if (this.state.commandBuffer === '') {
        // Start waiting for register key
        this.state.commandBuffer = 'q';
        this.notifyStateChange();
      }
      return true;
    }

    // Start macro playback command
    if (key === '@' && this.state.commandBuffer === '') {
      this.state.commandBuffer = '@';
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

    // Key recording is now handled in handleKeyPress for all modes
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
   * Handle Visual mode keys
   */
  private handleVisualMode(key: string, modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean }): boolean {
    // ESC returns to normal mode
    if (key === 'Escape') {
      this.state.visualStart = null;
      this.state.visualEnd = null;
      this.setMode(VimMode.NORMAL);
      return true;
    }

    // Switch between visual and visual-line mode
    if (key === 'v') {
      if (this.state.mode === VimMode.VISUAL) {
        // Exit visual mode
        this.state.visualStart = null;
        this.state.visualEnd = null;
        this.setMode(VimMode.NORMAL);
      } else {
        this.setMode(VimMode.VISUAL);
      }
      return true;
    }

    if (key === 'V') {
      if (this.state.mode === VimMode.VISUAL_LINE) {
        // Exit visual line mode
        this.state.visualStart = null;
        this.state.visualEnd = null;
        this.setMode(VimMode.NORMAL);
      } else {
        this.setMode(VimMode.VISUAL_LINE);
      }
      return true;
    }

    // Handle deletion in visual mode
    if (key === 'd' || key === 'x') {
      this.state.lastCommand = 'd';
      this.state.visualStart = null;
      this.state.visualEnd = null;
      this.setMode(VimMode.NORMAL);
      return false; // Let navigation handler delete the selection
    }

    // Handle yank in visual mode
    if (key === 'y') {
      this.state.lastCommand = 'y';
      this.state.visualStart = null;
      this.state.visualEnd = null;
      this.setMode(VimMode.NORMAL);
      return false; // Let navigation handler yank the selection
    }

    // Handle change in visual mode
    if (key === 'c') {
      this.state.lastCommand = 'c';
      this.state.visualStart = null;
      this.state.visualEnd = null;
      this.setMode(VimMode.INSERT);
      return false; // Let navigation handler change the selection
    }

    // Navigation in visual mode (extend selection)
    if (['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$', 'G'].includes(key)) {
      this.state.lastCommand = key;
      // Update visual end position
      const selection = window.getSelection();
      if (selection && selection.focusNode) {
        this.state.visualEnd = {
          node: selection.focusNode,
          offset: selection.focusOffset
        };
      }
      return false; // Let navigation handler handle movement and extend selection
    }

    return false;
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
  executeCommand(command: string): { action: string; args?: unknown } | null {
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
   * Get macro to play (if macro playback is pending)
   * Returns the macro keys and clears the playingMacro flag
   */
  getMacroToPlay(): RecordedKey[] | null {
    if (!this.state.playingMacro || !this.state.lastMacroRegister) {
      return null;
    }
    
    const macro = this.state.macro[this.state.lastMacroRegister];
    if (!macro || macro.length === 0) {
      this.state.playingMacro = false;
      this.notifyStateChange();
      return null;
    }
    
    // Return a copy of the macro keys
    // Note: playingMacro will be cleared by finishMacroPlayback()
    return [...macro];
  }

  /**
   * Signal that macro playback has finished
   */
  finishMacroPlayback(): void {
    this.state.playingMacro = false;
    this.notifyStateChange();
  }

  /**
   * Check if currently recording a macro
   */
  isRecording(): boolean {
    return this.state.recording !== null;
  }

  /**
   * Check if a macro is currently being played
   */
  isPlayingMacro(): boolean {
    return this.state.playingMacro;
  }

  /**
   * Get the current recording register (if recording)
   */
  getRecordingRegister(): string | null {
    return this.state.recording;
  }

  /**
   * Get the list of available macro registers
   */
  getMacroRegisters(): string[] {
    return Object.keys(this.state.macro).filter(
      (key) => this.state.macro[key] && this.state.macro[key].length > 0
    );
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
