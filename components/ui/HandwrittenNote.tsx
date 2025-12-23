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

import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { 
  Eraser, 
  Pen, 
  Download, 
  Trash2, 
  Undo, 
  Save,
  Palette
} from "lucide-react";
import GlassCard from "./GlassCard";
import LeatherButton from "./LeatherButton";

interface HandwrittenNoteProps {
  initialData?: string;
  onSave?: (data: string) => void;
  editable?: boolean;
  className?: string;
}

/**
 * Handwritten Note component for drawing and saving handwritten notes.
 * Supports both mouse and touch input with various pen colors and tools.
 * 
 * @param initialData - Base64 encoded image data to load
 * @param onSave - Callback when note is saved with base64 data
 * @param editable - Whether the note can be edited (default: true)
 * @param className - Additional CSS classes
 */
export default function HandwrittenNote({
  initialData,
  onSave,
  editable = true,
  className = "",
}: HandwrittenNoteProps) {
  const canvasRef = useRef<SignatureCanvas>(null);
  const [penColor, setPenColor] = useState("#4A3728"); // Default leather color
  const [penWidth, setPenWidth] = useState(2);
  const [isEraser, setIsEraser] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const colors = [
    { name: "Leather", value: "#4A3728" },
    { name: "Black", value: "#000000" },
    { name: "Blue", value: "#1E40AF" },
    { name: "Red", value: "#DC2626" },
    { name: "Green", value: "#16A34A" },
    { name: "Purple", value: "#9333EA" },
    { name: "Orange", value: "#EA580C" },
  ];

  const penWidths = [
    { name: "Thin", value: 1 },
    { name: "Medium", value: 2 },
    { name: "Thick", value: 4 },
    { name: "Bold", value: 6 },
  ];

  // Load initial data
  useEffect(() => {
    if (initialData && canvasRef.current) {
      canvasRef.current.fromDataURL(initialData);
    }
  }, [initialData]);

  const handleClear = () => {
    if (!canvasRef.current) return;

    // If canvas is already empty, no need to confirm
    if (canvasRef.current.isEmpty()) {
      return;
    }

    // Confirm before clearing
    const confirmed = window.confirm(
      "Are you sure you want to clear this handwritten note? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    canvasRef.current.clear();
    setHasChanges(true);
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      const data = canvasRef.current.toData();
      if (data.length > 0) {
        data.pop();
        canvasRef.current.fromData(data);
        setHasChanges(true);
      }
    }
  };

  const handleSave = async () => {
    if (!canvasRef.current || !onSave) return;

    setIsSaving(true);
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      await onSave(dataUrl);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving handwritten note:", error);
      // Display error to user
      alert("Failed to save your handwritten note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `handwritten-note-${Date.now()}.png`;
    link.click();
  };

  const toggleEraser = () => {
    setIsEraser(!isEraser);
  };

  const selectColor = (color: string) => {
    setPenColor(color);
    setShowColorPicker(false);
  };

  const selectPenWidth = (width: number) => {
    setPenWidth(width);
  };

  const handleBegin = () => {
    setHasChanges(true);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Toolbar */}
      {editable && (
        <GlassCard className="mb-4 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Pen Tool */}
            <button
              onClick={() => setIsEraser(false)}
              className={`p-2 rounded-lg transition-colors ${
                !isEraser
                  ? "bg-leather-600 text-leather-50"
                  : "bg-black/30 text-leather-300 hover:bg-leather-600/50"
              }`}
              title="Pen"
            >
              <Pen className="w-5 h-5" />
            </button>

            {/* Eraser Tool */}
            <button
              onClick={toggleEraser}
              className={`p-2 rounded-lg transition-colors ${
                isEraser
                  ? "bg-leather-600 text-leather-50"
                  : "bg-black/30 text-leather-300 hover:bg-leather-600/50"
              }`}
              title="Eraser"
            >
              <Eraser className="w-5 h-5" />
            </button>

            <div className="w-px h-8 bg-leather-300/30 mx-1" />

            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 rounded-lg bg-black/30 text-leather-300 hover:bg-leather-600/50 transition-colors"
                title="Choose color"
              >
                <Palette className="w-5 h-5" />
              </button>
              {showColorPicker && (
                <div className="absolute top-full mt-2 left-0 z-10 p-2 bg-black/90 border border-leather-300/30 rounded-lg shadow-lg">
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => selectColor(color.value)}
                        className="w-8 h-8 rounded-lg border-2 border-leather-300/30 hover:border-leather-300 transition-colors"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pen Width */}
            <div className="flex gap-1">
              {penWidths.map((width) => (
                <button
                  key={width.value}
                  onClick={() => selectPenWidth(width.value)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    penWidth === width.value
                      ? "bg-leather-600 text-leather-50"
                      : "bg-black/30 text-leather-300 hover:bg-leather-600/50"
                  }`}
                  title={width.name}
                >
                  {width.name}
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-leather-300/30 mx-1" />

            {/* Undo */}
            <button
              onClick={handleUndo}
              className="p-2 rounded-lg bg-black/30 text-leather-300 hover:bg-leather-600/50 transition-colors"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>

            {/* Clear */}
            <button
              onClick={handleClear}
              className="p-2 rounded-lg bg-black/30 text-red-400 hover:bg-red-600/50 transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-black/30 text-leather-300 hover:bg-leather-600/50 transition-colors"
              title="Download as image"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Save */}
            {onSave && (
              <LeatherButton
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                variant="leather"
                className="px-4 py-2 text-sm"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </>
                )}
              </LeatherButton>
            )}
          </div>
        </GlassCard>
      )}

      {/* Canvas */}
      <GlassCard className="flex-1 p-0 overflow-hidden">
        <div className="w-full h-full min-h-[400px] bg-white/95 rounded-lg">
          <SignatureCanvas
            ref={canvasRef}
            penColor={isEraser ? "#FFFFFF" : penColor}
            minWidth={penWidth}
            maxWidth={penWidth + 1}
            canvasProps={{
              className: "w-full h-full cursor-crosshair touch-manipulation",
              style: { touchAction: "none" },
            }}
            onBegin={handleBegin}
          />
        </div>
      </GlassCard>

      {/* Info */}
      {editable && (
        <p className="mt-2 text-xs text-leather-400 text-center">
          Use mouse or touch to draw. Changes are encrypted before saving.
        </p>
      )}
    </div>
  );
}
