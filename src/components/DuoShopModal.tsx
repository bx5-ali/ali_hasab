import React from 'react';
import { SoundConfig, UserStats } from '../types';
import { formatNumber } from '../utils/mathData';
import { soundManager } from '../utils/audio';
import { motion } from 'motion/react';
import { ShoppingBag, Heart, Flame, Sparkles, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DuoShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundConfig: SoundConfig;
  stats: UserStats;
  onRefillHearts: () => void;
  onBuyStreakFreeze: () => void;
}

export const DuoShopModal: React.FC<DuoShopModalProps> = ({
  isOpen,
  onClose,
  soundConfig,
  stats,
  onRefillHearts,
  onBuyStreakFreeze,
}) => {
  const isAr = soundConfig.language === 'ar';

  if (!isOpen) return null;

  const handleRefill = () => {
    if (stats.gems < 20 || stats.hearts >= stats.maxHearts) {
      soundManager.playTryAgain();
      return;
    }
    soundManager.playGem();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        colors: ['#FF4B4B', '#FFD700'],
      });
    } catch {
      // silent
    }
    onRefillHearts();
  };

  const handleFreeze = () => {
    if (stats.gems < 50) {
      soundManager.playTryAgain();
      return;
    }
    soundManager.playGem();
    onBuyStreakFreeze();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-sky-400 z-10 select-none text-slate-800"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-2xl border border-sky-300">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {isAr ? 'متجر الجواهر 💎' : 'Gem Shop 💎'}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                {isAr ? 'استبدل جواهرك بميزات سحرية ومساعدات!' : 'Use gems for powerups & heart refills!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-sky-50 text-sky-700 font-black text-base border-2 border-sky-200 shadow-xs">
            <span>💎</span>
            <span>{formatNumber(stats.gems, soundConfig.numeralSystem)}</span>
          </div>
        </div>

        {/* Shop Items List */}
        <div className="flex flex-col gap-3.5 mb-6">
          {/* Heart Refill Item */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border-2 border-rose-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center text-2xl border border-rose-300">
                <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h4 className="text-base font-black text-rose-950">
                  {isAr ? 'تعبئة القلوب كاملة' : 'Full Hearts Refill'}
                </h4>
                <p className="text-xs font-medium text-rose-700">
                  {isAr ? 'استعد كامل طاقتك (5 قلوب)' : 'Restore all 5 hearts instantly'}
                </p>
              </div>
            </div>

            <button
              disabled={stats.hearts >= stats.maxHearts || stats.gems < 20}
              onClick={handleRefill}
              className={`py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                stats.hearts >= stats.maxHearts
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : stats.gems < 20
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_3px_0_#be123c] active:translate-y-0.5'
              }`}
            >
              <span>💎 {formatNumber(20, soundConfig.numeralSystem)}</span>
              <span>{stats.hearts >= stats.maxHearts ? (isAr ? 'مكتمل' : 'Full') : (isAr ? 'تعبئة' : 'Refill')}</span>
            </button>
          </div>

          {/* Streak Freeze Item */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-500 flex items-center justify-center text-2xl border border-sky-300">
                <Flame className="w-7 h-7 fill-orange-500 text-orange-500" />
              </div>
              <div>
                <h4 className="text-base font-black text-sky-950">
                  {isAr ? 'تجميد الحماس (Streak Freeze)' : 'Streak Freeze'}
                </h4>
                <p className="text-xs font-medium text-sky-700">
                  {isAr ? 'يحمي أيام حماسك المتتالية عند التغيب يوماً' : 'Protects your streak for 1 missed day'}
                </p>
              </div>
            </div>

            <button
              disabled={stats.gems < 50}
              onClick={handleFreeze}
              className={`py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                stats.gems < 50
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-600 text-white shadow-[0_3px_0_#0284c7] active:translate-y-0.5'
              }`}
            >
              <span>💎 {formatNumber(50, soundConfig.numeralSystem)}</span>
              <span>{isAr ? 'شراء' : 'Buy'}</span>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm"
        >
          {isAr ? 'إغلاق' : 'Close'}
        </button>
      </motion.div>
    </div>
  );
};
