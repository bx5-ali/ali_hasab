import React, { useEffect, useState } from 'react';
import { ItemTheme, RewardModalData, SoundConfig, UserStats } from '../types';
import { formatNumber } from '../utils/mathData';
import { soundManager, PRAISE_PHRASES_AR, PRAISE_PHRASES_EN } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Star,
  Sparkles,
  Trophy,
  Flame,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  X,
  Volume2,
} from 'lucide-react';

interface StarRewardModalProps {
  data: RewardModalData | null;
  onClose: () => void;
  soundConfig: SoundConfig;
  stats: UserStats;
  itemTheme: ItemTheme;
}

export const StarRewardModal: React.FC<StarRewardModalProps> = ({
  data,
  onClose,
  soundConfig,
  stats,
  itemTheme,
}) => {
  const isAr = soundConfig.language === 'ar';
  const [animatedStars, setAnimatedStars] = useState<number>(0);
  const [hasCollected, setHasCollected] = useState<boolean>(false);

  const starsCount = data ? Math.max(1, Math.min(3, data.starsEarned || 3)) : 3;
  const maxStars = data?.maxStars || 3;

  useEffect(() => {
    if (!data?.isOpen) {
      setAnimatedStars(0);
      setHasCollected(false);
      return;
    }

    // Trigger applause & cheer sound on modal opening
    if (soundConfig.soundFxEnabled) {
      soundManager.playApplause();
    }

    // Voice cheer praise in selected language
    if (soundConfig.voiceSpeechEnabled) {
      const phraseList = isAr ? PRAISE_PHRASES_AR : PRAISE_PHRASES_EN;
      const randomPraise = phraseList[Math.floor(Math.random() * phraseList.length)];
      setTimeout(() => {
        soundManager.speak(randomPraise, isAr ? 'ar' : 'en');
      }, 350);
    }

    // Fire vibrant confetti bursts
    try {
      // First burst from left
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { x: 0.2, y: 0.6 },
        colors: ['#FFD700', '#FF6B8B', '#4ECDC4', '#FFE66D', '#FF9F43'],
      });
      // Second burst from right
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { x: 0.8, y: 0.6 },
          colors: ['#FFD700', '#FF6B8B', '#4ECDC4', '#FFE66D', '#FF9F43'],
        });
      }, 200);
      // Center star burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          shapes: ['star', 'circle'],
          colors: ['#FFD700', '#FFA500', '#FF4757', '#2ED573'],
        });
      }, 450);
    } catch {
      // silent
    }

    // Animate stars sequentially with crisp audio chimes
    setAnimatedStars(0);
    const timers: NodeJS.Timeout[] = [];

    for (let i = 1; i <= starsCount; i++) {
      const t = setTimeout(() => {
        setAnimatedStars(i);
        if (soundConfig.soundFxEnabled) {
          soundManager.playStarPop(i);
        }
      }, 350 + i * 380);
      timers.push(t);
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [data?.isOpen, starsCount, soundConfig.soundFxEnabled, soundConfig.voiceSpeechEnabled, isAr]);

  if (!data?.isOpen) return null;

  const handleStarTap = (starIdx: number) => {
    if (soundConfig.soundFxEnabled) {
      soundManager.playStarPop(starIdx);
    }
  };

  const handlePrimaryAction = () => {
    setHasCollected(true);
    if (soundConfig.soundFxEnabled) {
      soundManager.playPop();
    }
    if (data.onNext) {
      data.onNext();
    }
    onClose();
  };

  const handleRetryAction = () => {
    if (soundConfig.soundFxEnabled) {
      soundManager.playPop();
    }
    if (data.onRetry) {
      data.onRetry();
    }
    onClose();
  };

  // Dynamic feedback message based on star rating
  const getRatingFeedback = () => {
    if (starsCount === 3) {
      return {
        titleAr: '🌟 عبقري ومثالي 100%! 🌟',
        titleEn: '🌟 Super Math Genius! 🌟',
        badgeAr: 'أعلى تقييم (3 نجوم)',
        badgeEn: 'Top Rating (3 Stars)',
      };
    }
    if (starsCount === 2) {
      return {
        titleAr: '⭐ إنجاز رائع ومميز! ⭐',
        titleEn: '⭐ Great Achievement! ⭐',
        badgeAr: 'تقييم ممتاز (نجمتان)',
        badgeEn: 'Excellent (2 Stars)',
      };
    }
    return {
      titleAr: '👍 بداية موفقة يا بطل! 👍',
      titleEn: '👍 Good Job, Champion! 👍',
      badgeAr: 'تقييم جيد (نجمة واحدة)',
      badgeEn: 'Good (1 Star)',
    };
  };

  const ratingFeedback = getRatingFeedback();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Frosted Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-white/95 via-amber-50/95 to-pink-50/95 backdrop-blur-2xl rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.35)] border-4 border-white text-slate-800 z-10 overflow-hidden text-center"
        >
          {/* Decorative Glowing Radial Aura */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b from-yellow-300/40 via-amber-400/25 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Close X Button */}
          <button
            id="reward-modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-transform active:scale-90 shadow-xs border border-white"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Floating Badge */}
          <motion.div
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs sm:text-sm shadow-md border-2 border-white mb-2"
          >
            <Trophy className="w-4 h-4 text-amber-950 animate-bounce" />
            <span>{isAr ? ratingFeedback.badgeAr : ratingFeedback.badgeEn}</span>
          </motion.div>

          {/* Dynamic Main Praise Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-amber-600 drop-shadow-xs mb-1"
          >
            {isAr ? (data.titleAr || ratingFeedback.titleAr) : (data.titleEn || ratingFeedback.titleEn)}
          </motion.h2>

          {/* Subtitle / Problem Detail */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs sm:text-sm text-slate-600 font-bold max-w-sm mx-auto mb-5 leading-relaxed"
          >
            {isAr ? data.detailAr : data.detailEn}
          </motion.p>

          {/* ========================================================================= */}
          {/* DYNAMIC 3-STAR RATING DISPLAY */}
          {/* ========================================================================= */}
          <div className="relative my-4 py-4 px-2 bg-white/70 backdrop-blur-md rounded-3xl border-2 border-amber-200/60 shadow-inner flex items-center justify-center gap-3 sm:gap-5">
            {Array.from({ length: maxStars }).map((_, index) => {
              const starNum = index + 1;
              const isEarned = animatedStars >= starNum;
              const isCenterStar = starNum === 2;

              return (
                <motion.div
                  key={`reward_star_${index}`}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{
                    scale: isEarned ? (isCenterStar ? 1.25 : 1.1) : 0.9,
                    rotate: isEarned ? (isCenterStar ? 0 : index === 0 ? -12 : 12) : 0,
                    y: isEarned && isCenterStar ? -8 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 15,
                  }}
                  whileHover={{ scale: 1.35, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleStarTap(starNum)}
                  className="cursor-pointer select-none relative group"
                  title={isAr ? `نجمة ${starNum}` : `Star ${starNum}`}
                >
                  {/* Star Outer Glow */}
                  {isEarned && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.4, 1.1], opacity: [0.6, 0.9, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-yellow-400/40 rounded-full blur-lg pointer-events-none"
                    />
                  )}

                  {/* The Star Visual */}
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center transition-all ${
                      isEarned
                        ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 text-yellow-900 shadow-xl border-3 border-white ring-4 ring-amber-300/60'
                        : 'bg-slate-100 text-slate-300 border-2 border-dashed border-slate-300'
                    }`}
                  >
                    <Star
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${
                        isEarned
                          ? 'fill-amber-400 text-amber-500 drop-shadow-md animate-pulse'
                          : 'fill-slate-200 text-slate-300'
                      }`}
                    />
                  </div>

                  {/* Sparkle Icon on Pop */}
                  {isEarned && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-2 -right-2 bg-yellow-200 text-amber-700 p-1 rounded-full border border-white shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Reward Badges & Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {/* Stars Added Pill */}
            <div className="flex items-center gap-1.5 bg-amber-100/90 text-amber-900 px-3.5 py-1.5 rounded-2xl font-black text-xs border border-amber-300/70 shadow-xs">
              <span className="text-base">⭐</span>
              <span>
                {isAr
                  ? `+${formatNumber(data.starsEarned, soundConfig.numeralSystem)} نجوم ذهبية`
                  : `+${data.starsEarned} Golden Stars`}
              </span>
            </div>

            {/* Total Balance Pill */}
            <div className="flex items-center gap-1.5 bg-pink-100/90 text-pink-900 px-3.5 py-1.5 rounded-2xl font-black text-xs border border-pink-300/70 shadow-xs">
              <span>{itemTheme.emoji}</span>
              <span>
                {isAr
                  ? `الرصيد الكلي: ${formatNumber(stats.stars, soundConfig.numeralSystem)}`
                  : `Total: ${stats.stars} Stars`}
              </span>
            </div>

            {/* Streak Bonus Pill (if active) */}
            {stats.streak > 0 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-2xl font-black text-xs shadow-xs border border-orange-300">
                <Flame className="w-3.5 h-3.5 fill-white animate-bounce" />
                <span>
                  {isAr
                    ? `توالي ذكي: ${formatNumber(stats.streak, soundConfig.numeralSystem)}!`
                    : `Streak: ${stats.streak}!`}
                </span>
              </div>
            )}

            {/* Custom Bonus Label if provided */}
            {(data.bonusLabelAr || data.bonusLabelEn) && (
              <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-2xl font-black text-xs border border-emerald-300 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isAr ? data.bonusLabelAr : data.bonusLabelEn}</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Next Quest, Retry, or Continue */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {data.onNext ? (
              <button
                id="reward-modal-next-btn"
                onClick={handlePrimaryAction}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-black text-sm sm:text-base shadow-xl border-2 border-white flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <span>{isAr ? 'المسألة التالية' : 'Next Quest'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            ) : (
              <button
                id="reward-modal-collect-btn"
                onClick={handlePrimaryAction}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-sm sm:text-base shadow-xl border-2 border-white flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-950" />
                <span>{isAr ? 'جمع النجوم والمتابعة 🎉' : 'Collect Stars & Continue 🎉'}</span>
              </button>
            )}

            {data.onRetry && (
              <button
                id="reward-modal-retry-btn"
                onClick={handleRetryAction}
                className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs sm:text-sm border border-slate-300 shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isAr ? 'إعادة التجربة' : 'Try Again'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
