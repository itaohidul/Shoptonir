/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

export default function Logo({ size = "md", showText = true }: { size?: "sm" | "md" | "lg" | "xl"; showText?: boolean }) {
  const dimensions = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-28 h-28",
    xl: "w-44 h-44"
  }[size];

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative ${dimensions}`}>
        {/* Customized Logo with Woman Profile intertwined with a Green Leaf */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(46,111,94,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Soft Glow and Circle */}
          <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.04)" stroke="#2E6F5E" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="43" fill="rgba(46,111,94,0.03)" />

          {/* Leaf & Face Contour Group */}
          <g transform="translate(1, -1)">
            {/* The main green leaf flowing back as hair/head cover */}
            <motion.path
              d="M 50,22 C 32,15 28,34 32,48 C 36,62 50,78 68,74 C 82,70 85,50 78,38 C 72,28 62,25 50,22 Z"
              fill="url(#leafGradient)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.95 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Inner highlights / leaf veins to add modern luxury and depth */}
            <path
              d="M 50,22 C 55,35 62,45 68,55 M 58,34 C 64,40 68,46 72,50 M 44,40 C 48,46 54,52 60,56"
              stroke="#A3E2C9"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* Detailed elegant profile of a woman's face in gold/ivory, looking left */}
            <motion.path
              d="M 44,30 C 40,32 38,36 38,40 C 38,44 42,46 42,48 C 42,50 35,52 35,56 C 35,60 40,62 44,64 C 42,66 41,70 43,72 C 45,74 50,72 52,68"
              stroke="#E1B168"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
            />

            {/* Graceful eyelashes / eye closed detail */}
            <path d="M 39.5,42 Q 40.5,42.5 41.5,42" stroke="#E1B168" strokeWidth="1" strokeLinecap="round" />
            
            {/* Elegant lips accent */}
            <path d="M 37.5,53 Q 39,53.5 38.5,54.5" stroke="#E97D9B" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Gradients Definitions */}
          <defs>
            <linearGradient id="leafGradient" x1="30" y1="20" x2="80" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E5244" />
              <stop offset="50%" stopColor="#2E6F5E" />
              <stop offset="100%" stopColor="#4A9F88" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Calligraphy in Bengali: "স্বপ্ননীড়" centered over larger size */}
        {size === "xl" && (
          <div className="absolute -bottom-2 inset-x-0 flex items-center justify-center">
            <span className="font-serif text-[#E1B168] text-lg tracking-wider select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              স্বপ্ননীড়
            </span>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <h1 className="font-serif text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5ECE1] to-[#2E6F5E]">
              SHOPTONIR
            </h1>
            <span className="font-serif text-sm text-[#E1B168] tracking-widest font-light">
              স্বপ্ননীড়
            </span>
          </div>
          <p className="text-[9px] font-mono tracking-[0.3em] text-[#2E6F5E] uppercase leading-none font-bold">
            Muslim Women's Wear
          </p>
        </div>
      )}
    </div>
  );
}
