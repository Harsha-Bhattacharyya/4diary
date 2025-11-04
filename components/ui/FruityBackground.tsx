"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// Pre-generated positions to avoid calling Math.random during render
const PARTICLE_POSITIONS = Array.from({ length: 15 }, (_, i) => ({
  left: `${((i * 23) % 100)}%`,
  top: `${((i * 37) % 100)}%`,
}));

export default function FruityBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-aqua-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-aqua-400/30 to-blue-500/30 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: "10%", left: "10%" }}
      />

      <motion.div
        className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-500/30 blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: "50%", right: "10%" }}
      />

      <motion.div
        className="absolute w-72 h-72 rounded-full bg-gradient-to-br from-cyan-400/30 to-teal-500/30 blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ bottom: "10%", left: "30%" }}
      />

      <motion.div
        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-indigo-400/30 to-violet-500/30 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 70, 0],
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ bottom: "30%", right: "20%" }}
      />

      {/* Floating particles */}
      {PARTICLE_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/40"
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
          style={pos}
        />
      ))}
    </div>
  );
}
