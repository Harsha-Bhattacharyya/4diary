"use client";

import React from "react";
import { motion } from "framer-motion";

// Pre-generated positions for texture marks
const TEXTURE_MARKS = Array.from({ length: 20 }, (_, i) => ({
  left: `${((i * 23) % 100)}%`,
  top: `${((i * 37) % 100)}%`,
}));

export default function FruityBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base leather background with texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-leather-800 via-leather-700 to-leather-900" />
      
      {/* Leather texture overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.1) 2px,
              rgba(0, 0, 0, 0.1) 4px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.05) 2px,
              rgba(0, 0, 0, 0.05) 4px
            )
          `,
        }}
      />

      {/* Aged paper/parchment effect */}
      <motion.div
        className="absolute w-96 h-96 rounded-none bg-gradient-to-br from-leather-600/20 to-leather-500/10"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: "10%", left: "10%" }}
      />

      <motion.div
        className="absolute w-80 h-80 rounded-none bg-gradient-to-br from-leather-500/20 to-leather-700/10"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: "50%", right: "10%" }}
      />

      {/* Subtle aging spots/marks */}
      {TEXTURE_MARKS.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-leather-900/40"
          style={{
            ...pos,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
    </div>
  );
}
