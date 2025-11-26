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

import React, { useEffect, useRef, useState, useCallback } from "react";

interface Obstacle {
  x: number;
  type: "cactus-small" | "cactus-large" | "bird";
  width: number;
  height: number;
  yOffset: number;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
}

interface GameState {
  isRunning: boolean;
  isGameOver: boolean;
  score: number;
  highScore: number;
}

/**
 * Privacy Saur - A dinosaur runner game easter egg.
 * 
 * A simple endless runner game similar to the Chrome dinosaur game,
 * but themed as "Privacy Saur" with leather-themed styling.
 * 
 * @returns The Privacy Saur game component
 */
export default function PrivacySaur() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    animationId: number | null;
    lastTime: number;
    dinoY: number;
    dinoVelocity: number;
    isJumping: boolean;
    isDucking: boolean;
    obstacles: Obstacle[];
    clouds: Cloud[];
    groundOffset: number;
    runFrame: number;
    frameCount: number;
    speed: number;
    images: { [key: string]: HTMLImageElement };
    imagesLoaded: boolean;
  }>({
    animationId: null,
    lastTime: 0,
    dinoY: 0,
    dinoVelocity: 0,
    isJumping: false,
    isDucking: false,
    obstacles: [],
    clouds: [],
    groundOffset: 0,
    runFrame: 0,
    frameCount: 0,
    speed: 6,
    images: {},
    imagesLoaded: false,
  });

  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    isGameOver: false,
    score: 0,
    highScore: 0,
  });

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 150;
  const GROUND_Y = 120;
  const DINO_WIDTH = 44;
  const DINO_HEIGHT = 47;
  const DINO_DUCK_WIDTH = 59;
  const DINO_DUCK_HEIGHT = 30;
  const GRAVITY = 0.6;
  const JUMP_VELOCITY = -12;

  // Load game images
  const loadImages = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const imageNames = [
        "dino",
        "dino-run1",
        "dino-run2",
        "dino-duck",
        "cactus-small",
        "cactus-large",
        "bird",
        "cloud",
        "ground",
      ];
      
      let loadedCount = 0;
      const totalImages = imageNames.length;

      imageNames.forEach((name) => {
        const img = new Image();
        img.onload = () => {
          gameRef.current.images[name] = img;
          loadedCount++;
          if (loadedCount === totalImages) {
            gameRef.current.imagesLoaded = true;
            resolve();
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            gameRef.current.imagesLoaded = true;
            resolve();
          }
        };
        img.src = `/games/privacy-saur/${name}.svg`;
      });
    });
  }, []);

  // Reset game state
  const resetGame = useCallback(() => {
    const game = gameRef.current;
    game.dinoY = GROUND_Y - DINO_HEIGHT;
    game.dinoVelocity = 0;
    game.isJumping = false;
    game.isDucking = false;
    game.obstacles = [];
    game.clouds = [
      { x: 100, y: 20, speed: 1 },
      { x: 300, y: 35, speed: 0.8 },
      { x: 500, y: 15, speed: 1.2 },
    ];
    game.groundOffset = 0;
    game.runFrame = 0;
    game.frameCount = 0;
    game.speed = 6;
  }, [GROUND_Y, DINO_HEIGHT]);

  // Start the game
  const startGame = useCallback(() => {
    resetGame();
    setGameState((prev) => ({
      ...prev,
      isRunning: true,
      isGameOver: false,
      score: 0,
    }));
  }, [resetGame]);

  // Jump action
  const jump = useCallback(() => {
    const game = gameRef.current;
    if (!game.isJumping && !game.isDucking) {
      game.isJumping = true;
      game.dinoVelocity = JUMP_VELOCITY;
    }
  }, [JUMP_VELOCITY]);

  // Duck action
  const duck = useCallback((isDucking: boolean) => {
    const game = gameRef.current;
    if (!game.isJumping) {
      game.isDucking = isDucking;
    }
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!gameState.isRunning || gameState.isGameOver) {
          startGame();
        } else {
          jump();
        }
      }
      if (e.code === "ArrowDown" && gameState.isRunning && !gameState.isGameOver) {
        e.preventDefault();
        duck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown") {
        duck(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState.isRunning, gameState.isGameOver, startGame, jump, duck]);

  // Handle touch input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (!gameState.isRunning || gameState.isGameOver) {
        startGame();
      } else {
        jump();
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
    };
  }, [gameState.isRunning, gameState.isGameOver, startGame, jump]);

  // Collision detection
  const checkCollision = useCallback(
    (obstacle: Obstacle): boolean => {
      const game = gameRef.current;
      const dinoWidth = game.isDucking ? DINO_DUCK_WIDTH : DINO_WIDTH;
      const dinoHeight = game.isDucking ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
      const dinoX = 50;
      const dinoY = game.isDucking ? GROUND_Y - DINO_DUCK_HEIGHT : game.dinoY;

      // Add some padding for more forgiving collision
      const padding = 8;

      const obstacleY = GROUND_Y - obstacle.height - obstacle.yOffset;

      return (
        dinoX + padding < obstacle.x + obstacle.width - padding &&
        dinoX + dinoWidth - padding > obstacle.x + padding &&
        dinoY + padding < obstacleY + obstacle.height - padding &&
        dinoY + dinoHeight - padding > obstacleY + padding
      );
    },
    [GROUND_Y, DINO_HEIGHT, DINO_WIDTH, DINO_DUCK_HEIGHT, DINO_DUCK_WIDTH]
  );

  // Game loop
  useEffect(() => {
    if (!gameState.isRunning || gameState.isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = gameRef.current;

    const gameLoop = (timestamp: number) => {
      // Track timing for smooth animation
      game.lastTime = timestamp;

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw background color
      ctx.fillStyle = "#f5f0e8";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Update and draw clouds
      game.clouds.forEach((cloud) => {
        cloud.x -= cloud.speed;
        if (cloud.x < -50) {
          cloud.x = CANVAS_WIDTH + Math.random() * 100;
          cloud.y = 15 + Math.random() * 30;
        }
        if (game.images.cloud) {
          ctx.drawImage(game.images.cloud, cloud.x, cloud.y, 46, 14);
        }
      });

      // Update ground offset
      game.groundOffset = (game.groundOffset + game.speed) % 600;

      // Draw ground
      if (game.images.ground) {
        ctx.drawImage(
          game.images.ground,
          -game.groundOffset,
          GROUND_Y,
          600,
          12
        );
        ctx.drawImage(
          game.images.ground,
          600 - game.groundOffset,
          GROUND_Y,
          600,
          12
        );
      } else {
        ctx.fillStyle = "#535353";
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 2);
      }

      // Update dino position
      if (game.isJumping) {
        game.dinoVelocity += GRAVITY;
        game.dinoY += game.dinoVelocity;

        if (game.dinoY >= GROUND_Y - DINO_HEIGHT) {
          game.dinoY = GROUND_Y - DINO_HEIGHT;
          game.isJumping = false;
          game.dinoVelocity = 0;
        }
      }

      // Update run animation
      game.frameCount++;
      if (game.frameCount % 6 === 0) {
        game.runFrame = game.runFrame === 0 ? 1 : 0;
      }

      // Draw dino
      let dinoImage: HTMLImageElement | undefined;
      if (game.isDucking) {
        dinoImage = game.images["dino-duck"];
        if (dinoImage) {
          ctx.drawImage(
            dinoImage,
            50,
            GROUND_Y - DINO_DUCK_HEIGHT,
            DINO_DUCK_WIDTH,
            DINO_DUCK_HEIGHT
          );
        }
      } else if (game.isJumping) {
        dinoImage = game.images.dino;
        if (dinoImage) {
          ctx.drawImage(dinoImage, 50, game.dinoY, DINO_WIDTH, DINO_HEIGHT);
        }
      } else {
        dinoImage =
          game.images[game.runFrame === 0 ? "dino-run1" : "dino-run2"];
        if (dinoImage) {
          ctx.drawImage(dinoImage, 50, game.dinoY, DINO_WIDTH, DINO_HEIGHT);
        }
      }

      // Fallback dino drawing if images not loaded
      if (!dinoImage) {
        ctx.fillStyle = "#535353";
        const dinoY = game.isDucking ? GROUND_Y - DINO_DUCK_HEIGHT : game.dinoY;
        const width = game.isDucking ? DINO_DUCK_WIDTH : DINO_WIDTH;
        const height = game.isDucking ? DINO_DUCK_HEIGHT : DINO_HEIGHT;
        ctx.fillRect(50, dinoY, width, height);
      }

      // Spawn obstacles
      if (
        game.obstacles.length === 0 ||
        game.obstacles[game.obstacles.length - 1].x < CANVAS_WIDTH - 200
      ) {
        if (Math.random() < 0.02) {
          const obstacleTypes: Array<"cactus-small" | "cactus-large" | "bird"> =
            ["cactus-small", "cactus-large", "bird"];
          const type =
            obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          
          let width: number;
          let height: number;
          let yOffset: number;
          
          switch (type) {
            case "cactus-small":
              width = 17;
              height = 35;
              yOffset = 0;
              break;
            case "cactus-large":
              width = 25;
              height = 50;
              yOffset = 0;
              break;
            case "bird":
              width = 46;
              height = 36;
              yOffset = Math.random() > 0.5 ? 20 : 40;
              break;
          }

          game.obstacles.push({
            x: CANVAS_WIDTH,
            type,
            width,
            height,
            yOffset,
          });
        }
      }

      // Update and draw obstacles
      game.obstacles = game.obstacles.filter((obstacle) => {
        obstacle.x -= game.speed;

        const obstacleImage = game.images[obstacle.type];
        const obstacleY = GROUND_Y - obstacle.height - obstacle.yOffset;

        if (obstacleImage) {
          ctx.drawImage(
            obstacleImage,
            obstacle.x,
            obstacleY,
            obstacle.width,
            obstacle.height
          );
        } else {
          ctx.fillStyle = "#535353";
          ctx.fillRect(
            obstacle.x,
            obstacleY,
            obstacle.width,
            obstacle.height
          );
        }

        // Check collision
        if (checkCollision(obstacle)) {
          setGameState((prev) => ({
            ...prev,
            isRunning: false,
            isGameOver: true,
            highScore: Math.max(prev.highScore, prev.score),
          }));
        }

        return obstacle.x > -obstacle.width;
      });

      // Update score and speed
      setGameState((prev) => {
        const newScore = prev.score + 1;
        // Increase speed every 500 points
        if (newScore % 500 === 0) {
          game.speed = Math.min(game.speed + 0.5, 15);
        }
        return { ...prev, score: newScore };
      });

      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.lastTime = performance.now();
    game.animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (game.animationId) {
        cancelAnimationFrame(game.animationId);
      }
    };
  }, [gameState.isRunning, gameState.isGameOver, checkCollision]);

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Draw initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const game = gameRef.current;

    // Draw initial background
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = "#535353";
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 2);

    // Draw initial dino position
    game.dinoY = GROUND_Y - DINO_HEIGHT;
    if (game.images.dino) {
      ctx.drawImage(game.images.dino, 50, game.dinoY, DINO_WIDTH, DINO_HEIGHT);
    } else {
      ctx.fillRect(50, game.dinoY, DINO_WIDTH, DINO_HEIGHT);
    }
  }, [GROUND_Y, DINO_HEIGHT, DINO_WIDTH]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-leather-600 rounded-lg cursor-pointer touch-manipulation"
          onClick={() => {
            if (!gameState.isRunning || gameState.isGameOver) {
              startGame();
            } else {
              jump();
            }
          }}
        />

        {/* Score display */}
        <div className="absolute top-2 right-4 font-mono text-leather-800 text-sm">
          <span className="mr-4">HI {String(gameState.highScore).padStart(5, "0")}</span>
          <span>{String(gameState.score).padStart(5, "0")}</span>
        </div>

        {/* Start/Game Over overlay */}
        {(!gameState.isRunning || gameState.isGameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-leather-100/80 rounded-lg">
            <h3 className="text-xl font-bold text-leather-800 mb-2">
              {gameState.isGameOver ? "GAME OVER" : "PRIVACY SAUR"}
            </h3>
            <p className="text-leather-600 text-sm mb-1">
              {gameState.isGameOver
                ? `Score: ${gameState.score}`
                : "Press SPACE or tap to start"}
            </p>
            <p className="text-leather-500 text-xs">
              {gameState.isGameOver
                ? "Press SPACE or tap to play again"
                : "SPACE/UP to jump, DOWN to duck"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
