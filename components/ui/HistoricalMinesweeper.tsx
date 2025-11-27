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

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

interface GameState {
  board: Cell[][];
  gameOver: boolean;
  won: boolean;
  minesRemaining: number;
  timer: number;
  gameStarted: boolean;
}

const DIFFICULTIES = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 30 },
  hard: { rows: 16, cols: 16, mines: 60 },
};

type Difficulty = keyof typeof DIFFICULTIES;

/**
 * Historical Minesweeper - A medieval-themed minesweeper game easter egg.
 * 
 * A classic minesweeper game with historical/medieval theming and leather-styled UI.
 * 
 * @returns The Historical Minesweeper game component
 */

// Maximum display value for timer (shown as 999 when exceeded)
const MAX_DISPLAY_TIME = 999;

// Initialize game board - defined outside component to avoid creating new function reference on each render
function createInitialGameState(diff: Difficulty): GameState {
  const { rows, cols, mines } = DIFFICULTIES[diff];
  const board: Cell[][] = Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => ({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        }))
    );

  // Place mines randomly
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate adjacent mines
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!board[row][col].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
              count++;
            }
          }
        }
        board[row][col].adjacentMines = count;
      }
    }
  }

  return {
    board,
    gameOver: false,
    won: false,
    minesRemaining: mines,
    timer: 0,
    gameStarted: false,
  };
}

export default function HistoricalMinesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState("easy"));
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  });

  // Timer effect
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !gameState.won) {
      const interval = setInterval(() => {
        setGameState((prev) => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.won]);

  // Reveal cell
  const revealCell = useCallback(
    (row: number, col: number) => {
      if (gameState.gameOver || gameState.won) return;

      setGameState((prev) => {
        const newBoard = prev.board.map((r) => r.map((c) => ({ ...c })));
        const cell = newBoard[row][col];

        if (cell.isRevealed || cell.isFlagged) return prev;

        cell.isRevealed = true;

        if (cell.isMine) {
          // Game over - reveal all mines
          newBoard.forEach((r) =>
            r.forEach((c) => {
              if (c.isMine) c.isRevealed = true;
            })
          );
          return { ...prev, board: newBoard, gameOver: true, gameStarted: true };
        }

        // Flood fill for empty cells
        if (cell.adjacentMines === 0) {
          const stack: [number, number][] = [[row, col]];
          while (stack.length > 0) {
            const [r, c] = stack.pop()!;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (
                  nr >= 0 &&
                  nr < newBoard.length &&
                  nc >= 0 &&
                  nc < newBoard[0].length &&
                  !newBoard[nr][nc].isRevealed &&
                  !newBoard[nr][nc].isFlagged
                ) {
                  newBoard[nr][nc].isRevealed = true;
                  if (newBoard[nr][nc].adjacentMines === 0) {
                    stack.push([nr, nc]);
                  }
                }
              }
            }
          }
        }

        // Check win condition
        const allNonMinesRevealed = newBoard.every((r) =>
          r.every((c) => c.isMine || c.isRevealed)
        );

        if (allNonMinesRevealed) {
          // Update best time
          const currentBest = bestTimes[difficulty];
          if (currentBest === null || prev.timer < currentBest) {
            setBestTimes((bt) => ({ ...bt, [difficulty]: prev.timer }));
          }
          return { ...prev, board: newBoard, won: true, gameStarted: true };
        }

        return { ...prev, board: newBoard, gameStarted: true };
      });
    },
    [gameState.gameOver, gameState.won, difficulty, bestTimes]
  );

  // Toggle flag - works with both mouse and keyboard
  const toggleFlagForCell = useCallback(
    (row: number, col: number) => {
      if (gameState.gameOver || gameState.won) return;

      setGameState((prev) => {
        const newBoard = prev.board.map((r) => r.map((c) => ({ ...c })));
        const cell = newBoard[row][col];

        if (cell.isRevealed) return prev;

        cell.isFlagged = !cell.isFlagged;
        const minesRemaining = prev.minesRemaining + (cell.isFlagged ? -1 : 1);

        return { ...prev, board: newBoard, minesRemaining, gameStarted: true };
      });
    },
    [gameState.gameOver, gameState.won]
  );

  // Toggle flag on right-click
  const toggleFlag = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      e.preventDefault();
      toggleFlagForCell(row, col);
    },
    [toggleFlagForCell]
  );

  // Handle keyboard flag (F key or Shift+Click)
  const handleCellKeyDown = useCallback(
    (row: number, col: number, e: React.KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFlagForCell(row, col);
      }
    },
    [toggleFlagForCell]
  );

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(createInitialGameState(difficulty));
  }, [difficulty]);

  // Change difficulty
  const changeDifficulty = useCallback((newDiff: Difficulty) => {
    setDifficulty(newDiff);
    setGameState(createInitialGameState(newDiff));
  }, []);

  // Get number color based on count
  const getNumberColor = (count: number): string => {
    const colors: Record<number, string> = {
      1: "#1a5f7a",
      2: "#2d5016",
      3: "#8b0000",
      4: "#00008b",
      5: "#800000",
      6: "#008b8b",
      7: "#000000",
      8: "#808080",
    };
    return colors[count] || "#000000";
  };

  const { rows, cols } = DIFFICULTIES[difficulty];
  const cellSize = difficulty === "easy" ? 36 : difficulty === "medium" ? 28 : 22;

  return (
    <div className="flex flex-col items-center p-4 bg-leather-100 rounded-lg border-2 border-leather-600 shadow-leather">
      {/* Header */}
      <div className="w-full mb-4">
        <h2 id="game-title" className="text-2xl font-bold text-leather-800 text-center mb-2">
          Historical Minesweeper
        </h2>
        <p className="text-leather-600 text-sm text-center italic">
          Clear the ancient minefield without triggering the explosives!
        </p>
      </div>

      {/* Difficulty selector */}
      <div className="flex gap-2 mb-4">
        {(Object.keys(DIFFICULTIES) as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => changeDifficulty(diff)}
            className={`px-3 py-1 text-sm rounded border-2 transition-all ${
              difficulty === diff
                ? "bg-leather-600 text-leather-100 border-leather-700"
                : "bg-leather-200 text-leather-700 border-leather-400 hover:bg-leather-300"
            }`}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex justify-between w-full max-w-md mb-4 px-4">
        <div className="flex items-center gap-2">
          <Image
            src="/games/minesweeper/mine.svg"
            alt="Mines"
            width={20}
            height={20}
            className="opacity-80"
          />
          <span className="font-mono text-leather-800 text-lg">
            {String(gameState.minesRemaining).padStart(3, "0")}
          </span>
        </div>
        <button
          onClick={resetGame}
          className="px-4 py-1 bg-leather-500 text-leather-100 rounded border-2 border-leather-600 hover:bg-leather-400 transition-colors text-sm"
        >
          New Game
        </button>
        <div className="flex items-center gap-2">
          <span className="text-leather-600 text-sm">Time:</span>
          <span className="font-mono text-leather-800 text-lg">
            {String(Math.min(gameState.timer, MAX_DISPLAY_TIME)).padStart(3, "0")}
          </span>
        </div>
      </div>

      {/* Game board */}
      <div
        className="grid gap-0.5 p-2 bg-leather-700 rounded border-2 border-leather-800"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
        role="grid"
        aria-label="Minesweeper game board"
      >
        {gameState.board.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <button
              key={`${rowIdx}-${colIdx}`}
              onClick={() => revealCell(rowIdx, colIdx)}
              onContextMenu={(e) => toggleFlag(rowIdx, colIdx, e)}
              onKeyDown={(e) => handleCellKeyDown(rowIdx, colIdx, e)}
              disabled={cell.isRevealed}
              aria-label={
                cell.isRevealed
                  ? cell.isMine
                    ? "Mine"
                    : cell.adjacentMines > 0
                    ? `${cell.adjacentMines} adjacent mines`
                    : "Empty"
                  : cell.isFlagged
                  ? "Flagged cell, press F to unflag"
                  : "Hidden cell, press F to flag"
              }
              className={`flex items-center justify-center transition-all ${
                cell.isRevealed
                  ? "bg-leather-200 cursor-default"
                  : "bg-leather-400 hover:bg-leather-300 active:bg-leather-500 cursor-pointer"
              } border border-leather-600 rounded-sm`}
              style={{ width: cellSize, height: cellSize }}
            >
              {cell.isRevealed ? (
                cell.isMine ? (
                  <Image
                    src="/games/minesweeper/mine.svg"
                    alt="Mine"
                    width={cellSize - 6}
                    height={cellSize - 6}
                  />
                ) : cell.adjacentMines > 0 ? (
                  <span
                    className="font-bold text-sm"
                    style={{ color: getNumberColor(cell.adjacentMines) }}
                  >
                    {cell.adjacentMines}
                  </span>
                ) : null
              ) : cell.isFlagged ? (
                <Image
                  src="/games/minesweeper/flag.svg"
                  alt="Flag"
                  width={cellSize - 6}
                  height={cellSize - 6}
                />
              ) : null}
            </button>
          ))
        )}
      </div>

      {/* Game over / Win message */}
      {(gameState.gameOver || gameState.won) && (
        <div className="mt-4 p-4 rounded bg-leather-700/90 text-center">
          <h3 className="text-xl font-bold text-leather-100 mb-2">
            {gameState.won ? "Victory!" : "Game Over!"}
          </h3>
          <p className="text-leather-200 text-sm mb-2">
            {gameState.won
              ? `You cleared the minefield in ${gameState.timer} seconds!`
              : "You triggered a mine! The ancient explosives got you."}
          </p>
          {gameState.won && bestTimes[difficulty] !== null && (
            <p className="text-leather-300 text-xs">
              Best time ({difficulty}): {bestTimes[difficulty]}s
            </p>
          )}
          <button
            onClick={resetGame}
            className="mt-3 px-4 py-2 bg-leather-500 text-leather-100 rounded border-2 border-leather-400 hover:bg-leather-400 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-center text-leather-600 text-xs">
        <p>Left click to reveal • Right click or F key to flag</p>
      </div>
    </div>
  );
}
