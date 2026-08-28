import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/audio';

export type MascotMood = 'idle' | 'happy' | 'thinking' | 'cheering' | 'celebrating' | 'sad';

interface DuoMascotProps {
  mood?: MascotMood;
  speechText?: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
}

export const DuoMascot: React.FC<DuoMascotProps> = ({
  mood = 'idle',
  speechText,
  size = 'md',
  interactive = true,
  className = '',
}) => {
  const [isWaving, setIsWaving] = useState(false);

  const handleTap = () => {
    if (!interactive) return;
    setIsWaving(true);
    soundManager.playPop();
    setTimeout(() => setIsWaving(false), 1200);
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-32 h-32 sm:w-36 sm:h-36',
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {speechText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-2 relative max-w-xs px-4 py-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-2 border-emerald-400 text-slate-800 text-xs sm:text-sm font-black text-center"
          >
            <span>{speechText}</span>
            {/* Bubble arrow pointing down */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-emerald-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Body (Stylized Duolingo-style Math Owl "فطين") */}
      <motion.div
        onClick={handleTap}
        whileHover={interactive ? { scale: 1.08, rotate: [0, -5, 5, 0] } : {}}
        whileTap={interactive ? { scale: 0.92 } : {}}
        animate={
          mood === 'cheering' || isWaving
            ? { y: [0, -12, 0, -8, 0], rotate: [0, -6, 6, -3, 0] }
            : mood === 'happy'
            ? { y: [0, -5, 0] }
            : mood === 'thinking'
            ? { rotate: [0, -6, 0] }
            : mood === 'sad'
            ? { y: [0, 4, 0] }
            : { y: [0, -4, 0] }
        }
        transition={{
          repeat: mood === 'idle' ? Infinity : 0,
          duration: mood === 'idle' ? 3 : 0.8,
          ease: 'easeInOut',
        }}
        className={`relative ${sizeClasses[size]} cursor-pointer`}
      >
        {/* Glow behind mascot */}
        <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-xl -z-10 animate-pulse" />

        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Owl Body Outer */}
          <rect
            x="20"
            y="22"
            width="80"
            height="82"
            rx="40"
            className="fill-[#58CC02] stroke-[#46A302] stroke-[4]"
          />

          {/* Belly Patch (Lighter Green) */}
          <path
            d="M36 62C36 50 46 44 60 44C74 44 84 50 84 62C84 82 72 96 60 96C48 96 36 82 36 62Z"
            fill="#8ee000"
          />

          {/* Feathers / Math Symbol on belly */}
          <path
            d="M54 70L60 62L66 70M54 78L60 70L66 78"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Left Ear Tuft */}
          <path
            d="M26 30L16 14C22 14 32 18 36 24L26 30Z"
            fill="#46A302"
            stroke="#3b8802"
            strokeWidth="2"
          />
          {/* Right Ear Tuft */}
          <path
            d="M94 30L104 14C98 14 88 18 84 24L94 30Z"
            fill="#46A302"
            stroke="#3b8802"
            strokeWidth="2"
          />

          {/* Left Eye White */}
          <circle cx="44" cy="45" r="16" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="2.5" />
          {/* Right Eye White */}
          <circle cx="76" cy="45" r="16" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="2.5" />

          {/* Eye Pupils based on Mood */}
          {mood === 'happy' || mood === 'cheering' || mood === 'celebrating' ? (
            // Joyful curved squinting eyes
            <>
              <path
                d="M36 46C38 40 50 40 52 46"
                stroke="#1B4D03"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M68 46C70 40 82 40 84 46"
                stroke="#1B4D03"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Rosy Cheeks */}
              <circle cx="30" cy="56" r="6" fill="#FF86D0" opacity="0.8" />
              <circle cx="90" cy="56" r="6" fill="#FF86D0" opacity="0.8" />
            </>
          ) : mood === 'sad' ? (
            // Sad / Sympathetic eyes
            <>
              <circle cx="44" cy="47" r="6" fill="#1B4D03" />
              <circle cx="76" cy="47" r="6" fill="#1B4D03" />
              <circle cx="42" cy="44" r="2" fill="#FFFFFF" />
              <circle cx="74" cy="44" r="2" fill="#FFFFFF" />
            </>
          ) : (
            // Bright curious big eyes
            <>
              <circle cx="44" cy="44" r="8" fill="#1B4D03" />
              <circle cx="76" cy="44" r="8" fill="#1B4D03" />
              {/* Eye Catchlights */}
              <circle cx="42" cy="41" r="3" fill="#FFFFFF" />
              <circle cx="74" cy="41" r="3" fill="#FFFFFF" />
              <circle cx="46" cy="47" r="1.5" fill="#FFFFFF" />
              <circle cx="78" cy="47" r="1.5" fill="#FFFFFF" />
              {/* Rosy Cheeks */}
              <circle cx="30" cy="54" r="5" fill="#FF9FC0" opacity="0.6" />
              <circle cx="90" cy="54" r="5" fill="#FF9FC0" opacity="0.6" />
            </>
          )}

          {/* Orange Beak */}
          <path
            d="M52 48C52 48 55 60 60 60C65 60 68 48 68 48L60 46L52 48Z"
            fill="#FF9600"
            stroke="#E07C00"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Cute Orange Feet */}
          <ellipse cx="44" cy="104" rx="9" ry="5" fill="#FF9600" stroke="#E07C00" strokeWidth="2" />
          <ellipse cx="76" cy="104" rx="9" ry="5" fill="#FF9600" stroke="#E07C00" strokeWidth="2" />

          {/* Glasses or Math Wizard Star Hat (optional fun decoration) */}
          <circle cx="60" cy="20" r="4" fill="#FFD700" className="animate-pulse" />
        </svg>

        {/* Mascot Name Badge (فطين / Duo Math) */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#46A302] text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border border-white shadow-xs whitespace-nowrap">
          فطين 🦉
        </div>
      </motion.div>
    </div>
  );
};
