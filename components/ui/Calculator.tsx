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

import React, { useState, useRef, useEffect } from "react";
import { evaluate } from "mathjs";
import MathRenderer from "./MathRenderer";
import GlassCard from "./GlassCard";
import LeatherButton from "./LeatherButton";
import { X } from "lucide-react";

interface CalculatorProps {
  onClose: () => void;
  onInsert?: (result: string) => void;
}

/**
 * A calculator component with LaTeX-style math expression support.
 * Supports basic arithmetic, functions, and mathematical expressions.
 * 
 * @param onClose - Callback when closing the calculator
 * @param onInsert - Optional callback to insert result into editor
 */
export default function Calculator({ onClose, onInsert }: CalculatorProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ expr: string; result: string }>>([]);
  const [showLatex, setShowLatex] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  // Common shorthand replacements
  const expandShorthand = (expr: string): string => {
    let expanded = expr;
    
    // Replace common shorthands
    expanded = expanded.replace(/\bsqrt\(/g, "sqrt(");
    expanded = expanded.replace(/\bsin\(/g, "sin(");
    expanded = expanded.replace(/\bcos\(/g, "cos(");
    expanded = expanded.replace(/\btan\(/g, "tan(");
    expanded = expanded.replace(/\blog\(/g, "log(");
    expanded = expanded.replace(/\bln\(/g, "log("); // ln is log in mathjs
    expanded = expanded.replace(/\babs\(/g, "abs(");
    expanded = expanded.replace(/\bpow\(/g, "pow(");
    expanded = expanded.replace(/\bexp\(/g, "exp(");
    
    // Replace pi and e
    expanded = expanded.replace(/\bpi\b/g, "pi");
    expanded = expanded.replace(/\be\b/g, "e");
    
    // Replace ^ with ** for exponentiation (if not already **)
    expanded = expanded.replace(/\^/g, "**");
    
    return expanded;
  };

  const handleCalculate = () => {
    try {
      setError(null);
      const expandedInput = expandShorthand(input);
      const calculatedResult = evaluate(expandedInput);
      const resultStr = String(calculatedResult);
      setResult(resultStr);
      
      // Add to history
      setHistory(prev => [...prev, { expr: input, result: resultStr }].slice(-10)); // Keep last 10
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid expression");
      setResult(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCalculate();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleInsert = () => {
    if (result && onInsert) {
      onInsert(showLatex ? `$${input} = ${result}$` : result);
      onClose();
    }
  };

  const insertFromHistory = (item: { expr: string; result: string }) => {
    setInput(item.expr);
    setResult(item.result);
  };

  const quickButtons = [
    { label: "π", value: "pi" },
    { label: "e", value: "e" },
    { label: "√", value: "sqrt(" },
    { label: "^", value: "^" },
    { label: "sin", value: "sin(" },
    { label: "cos", value: "cos(" },
    { label: "tan", value: "tan(" },
    { label: "log", value: "log(" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-leather-900">Calculator</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-leather-200 transition-colors"
              aria-label="Close calculator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info */}
          <p className="text-sm text-gray-600 mb-4">
            Enter mathematical expressions. Supports: +, -, *, /, ^, sqrt(), sin(), cos(), tan(), log(), pi, e, and more.
          </p>

          {/* Input */}
          <div className="mb-4">
            <label htmlFor="calculator-input" className="block text-sm font-medium text-gray-700 mb-2">
              Expression
            </label>
            <input
              id="calculator-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="e.g., 2 + 2, sqrt(16), sin(pi/2)"
              className="w-full px-4 py-3 border-2 border-leather-300 rounded-lg focus:outline-none focus:border-leather-600 font-mono text-lg"
            />
          </div>

          {/* Quick buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => setInput(prev => prev + btn.value)}
                className="px-3 py-1 bg-leather-100 hover:bg-leather-200 rounded-md text-sm font-medium transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Calculate button */}
          <div className="flex gap-2 mb-4">
            <LeatherButton
              onClick={handleCalculate}
              variant="gradient"
              className="flex-1"
            >
              Calculate
            </LeatherButton>
            {result && onInsert && (
              <LeatherButton
                onClick={handleInsert}
                variant="leather"
              >
                Insert to Editor
              </LeatherButton>
            )}
          </div>

          {/* LaTeX toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLatex}
                onChange={(e) => setShowLatex(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Show as LaTeX</span>
            </label>
          </div>

          {/* Result */}
          {result && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-1">Result:</div>
              {showLatex ? (
                <div className="text-xl">
                  <MathRenderer math={`${input} = ${result}`} displayMode />
                </div>
              ) : (
                <div className="text-2xl font-bold text-green-800 font-mono">
                  {result}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-1">Error:</div>
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">History</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.slice().reverse().map((item) => (
                  <button
                    key={`${item.expr}-${item.result}`}
                    onClick={() => insertFromHistory(item)}
                    className="w-full text-left p-2 bg-leather-50 hover:bg-leather-100 rounded text-sm font-mono transition-colors"
                  >
                    {item.expr} = {item.result}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard shortcuts */}
          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
            <strong>Shortcuts:</strong> Enter to calculate, Esc to close
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
