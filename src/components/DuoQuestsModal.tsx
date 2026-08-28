import React from 'react';
import { DailyQuest, SoundConfig, UserStats } from '../types';
import { formatNumber } from '../utils/mathData';
import { soundManager } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Target, CheckCircle2, Gift, Zap, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DuoQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundConfig: SoundConfig;
  stats: UserStats;
  onClaimQuest: (questId: string, xpReward: number, gemReward: number) => void;
}

export const DuoQuestsModal: React.FC<DuoQuestsModalProps> = ({
  isOpen,
  onClose,
  soundConfig,
  stats,
  onClaimQuest,
}) => {
  const isAr = soundConfig.language === 'ar';

  if (!isOpen) return null;

  const handleClaim = (quest: DailyQuest) => {
    soundManager.playGem();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#58CC02', '#FFD700', '#1CB0F6'],
      });
    } catch {
      // silent
    }
    onClaimQuest(quest.id, quest.xpReward, quest.gemReward);
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
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-400 z-10 select-none text-slate-800"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl border border-amber-300">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              {isAr ? 'المهام اليومية 🎯' : 'Daily Quests 🎯'}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              {isAr ? 'أكمل المهام اليومية لتكسب نقاط خبرة وجواهر إضافية!' : 'Complete daily quests for bonus XP & Gems!'}
            </p>
          </div>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-3 mb-6">
          {stats.dailyQuests.map((quest) => {
            const isFinished = quest.progress >= quest.target;
            const progressRatio = Math.min(100, Math.round((quest.progress / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{quest.icon}</span>
                    <span className="text-sm font-black text-slate-800">
                      {isAr ? quest.titleAr : quest.titleEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-lg">
                      +{formatNumber(quest.xpReward, soundConfig.numeralSystem)} XP
                    </span>
                    <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-lg">
                      +{formatNumber(quest.gemReward, soundConfig.numeralSystem)} 💎
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                      style={{ width: `${progressRatio}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-500">
                    {formatNumber(quest.progress, soundConfig.numeralSystem)} /{' '}
                    {formatNumber(quest.target, soundConfig.numeralSystem)}
                  </span>
                </div>

                {/* Claim Button */}
                {isFinished && !quest.completed && (
                  <button
                    onClick={() => handleClaim(quest)}
                    className="mt-2 w-full py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#46A302] text-white font-black text-xs shadow-[0_3px_0_#388302] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Gift className="w-4 h-4" />
                    <span>{isAr ? 'استلام المكافأة 🎉' : 'Claim Reward 🎉'}</span>
                  </button>
                )}

                {quest.completed && (
                  <div className="mt-1 flex items-center justify-center gap-1 text-emerald-600 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isAr ? 'تم استلام المكافأة بنجاح' : 'Reward Claimed'}</span>
                  </div>
                )}
              </div>
            );
          })}
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
