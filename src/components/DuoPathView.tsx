import React, { useState } from 'react';
import { PathLesson, PathUnit, SoundConfig, UserStats } from '../types';
import { DUO_UNITS, MASCOT_QUOTES_AR, MASCOT_QUOTES_EN } from '../utils/duoData';
import { formatNumber } from '../utils/mathData';
import { soundManager } from '../utils/audio';
import { DuoMascot } from './DuoMascot';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Lock,
  Check,
  Star,
  BookOpen,
  Gift,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  Heart,
  Crown,
  Play,
  X,
} from 'lucide-react';

interface DuoPathViewProps {
  soundConfig: SoundConfig;
  stats: UserStats;
  onStartLesson: (lesson: PathLesson) => void;
  onOpenChest: (chestId: string, gems: number, stars: number) => void;
}

export const DuoPathView: React.FC<DuoPathViewProps> = ({
  soundConfig,
  stats,
  onStartLesson,
  onOpenChest,
}) => {
  const isAr = soundConfig.language === 'ar';
  const [guideModalUnit, setGuideModalUnit] = useState<PathUnit | null>(null);
  const [chestModalData, setChestModalData] = useState<{
    unit: PathUnit;
    gems: number;
    stars: number;
  } | null>(null);

  // Mascot random quote
  const mascotQuote = isAr
    ? MASCOT_QUOTES_AR[Math.floor(Math.random() * MASCOT_QUOTES_AR.length)]
    : MASCOT_QUOTES_EN[Math.floor(Math.random() * MASCOT_QUOTES_EN.length)];

  const handleLessonNodeClick = (lesson: PathLesson, isLocked: boolean) => {
    if (isLocked) {
      soundManager.playTryAgain();
      return;
    }
    soundManager.playPop();
    onStartLesson(lesson);
  };

  const handleChestClick = (unit: PathUnit) => {
    if (!unit.chestReward) return;
    const isAlreadyOpened = stats.openedChests?.includes(unit.chestReward.id);

    if (isAlreadyOpened) {
      soundManager.playPop();
      return;
    }

    soundManager.playGem();
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#58CC02'],
      });
    } catch {
      // silent
    }

    setChestModalData({
      unit,
      gems: unit.chestReward.gems,
      stars: unit.chestReward.stars,
    });
    onOpenChest(unit.chestReward.id, unit.chestReward.gems, unit.chestReward.stars);
  };

  return (
    <div className="relative max-w-2xl mx-auto pb-20 select-none">
      {/* Top Floating Mascot Guide */}
      <div className="flex items-center justify-between gap-3 bg-white/70 backdrop-blur-xl p-4 rounded-3xl border-2 border-emerald-200/80 shadow-md mb-8">
        <div className="flex items-center gap-3">
          <DuoMascot mood="happy" size="sm" interactive={true} />
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'مرشد الرياضيات' : 'Math Guide'}</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 max-w-sm leading-relaxed">
              {mascotQuote}
            </p>
          </div>
        </div>
      </div>

      {/* RENDER DUOLINGO UNITS */}
      <div className="flex flex-col gap-12">
        {DUO_UNITS.map((unit) => {
          return (
            <div key={unit.id} className="relative flex flex-col items-center">
              {/* Unit Header Card */}
              <div
                className={`w-full bg-gradient-to-r ${unit.gradientBg} text-white rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-white/80 mb-8 relative overflow-hidden`}
              >
                {/* Decorative background circle */}
                <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl font-black text-xs uppercase tracking-wider mb-1">
                      {isAr ? `الوحدة ${formatNumber(unit.unitNumber, soundConfig.numeralSystem)}` : `Unit ${unit.unitNumber}`}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black drop-shadow-xs">
                      {isAr ? unit.titleAr : unit.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-white/90 mt-0.5">
                      {isAr ? unit.subtitleAr : unit.subtitleEn}
                    </p>
                  </div>

                  {/* Guidebook Button */}
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      setGuideModalUnit(unit);
                    }}
                    className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-white font-black text-xs flex flex-col items-center gap-1 border border-white/30 transition-transform active:scale-95 cursor-pointer shrink-0"
                    title={isAr ? 'دليل الوحدة' : 'Guidebook'}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>{isAr ? 'الدليل' : 'Guide'}</span>
                  </button>
                </div>
              </div>

              {/* SNAKE LESSON NODES PATH */}
              <div className="flex flex-col items-center gap-8 w-full relative">
                {unit.lessons.map((lesson, index) => {
                  const isCompleted = stats.completedLessonIds?.includes(lesson.id);
                  const isUnlocked =
                    index === 0 ||
                    stats.unlockedLessonIds?.includes(lesson.id) ||
                    stats.completedLessonIds?.includes(unit.lessons[index - 1]?.id);

                  const lessonStars = stats.lessonStars?.[lesson.id] || (isCompleted ? 3 : 0);
                  const isCrownLesson = lesson.icon === '👑';

                  // Snake alignment offsets: 0 -> center, 1 -> right, 2 -> center, 3 -> left
                  const offsetClasses = [
                    'translate-x-0',
                    'translate-x-12 sm:translate-x-16',
                    'translate-x-0',
                    '-translate-x-12 sm:-translate-x-16',
                  ];
                  const offsetClass = offsetClasses[index % offsetClasses.length];

                  return (
                    <div
                      key={lesson.id}
                      className={`relative flex flex-col items-center ${offsetClass}`}
                    >
                      {/* Active lesson tooltip indicator */}
                      {isUnlocked && !isCompleted && (
                        <motion.div
                          initial={{ y: -5 }}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute -top-10 bg-white text-emerald-700 font-black text-xs px-3 py-1 rounded-xl shadow-lg border-2 border-emerald-400 whitespace-nowrap z-20"
                        >
                          <span>{isAr ? 'ابدأ هنا 🚀' : 'START 🚀'}</span>
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-emerald-400" />
                        </motion.div>
                      )}

                      {/* 3D Duolingo-style Lesson Node Button */}
                      <motion.button
                        whileHover={isUnlocked ? { scale: 1.1 } : {}}
                        whileTap={isUnlocked ? { scale: 0.92 } : {}}
                        onClick={() => handleLessonNodeClick(lesson, !isUnlocked)}
                        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-black text-2xl sm:text-3xl transition-all cursor-pointer select-none border-4 ${
                          !isUnlocked
                            ? 'bg-slate-200 border-slate-300 text-slate-400 shadow-[0_6px_0_#94a3b8] cursor-not-allowed'
                            : isCompleted
                            ? 'bg-amber-400 border-yellow-200 text-yellow-950 shadow-[0_6px_0_#d97706]'
                            : isCrownLesson
                            ? 'bg-gradient-to-tr from-yellow-400 to-amber-300 border-white text-amber-950 shadow-[0_6px_0_#b45309] ring-4 ring-amber-300/60'
                            : 'bg-[#58CC02] border-[#79E600] text-white shadow-[0_6px_0_#388302] ring-4 ring-emerald-300/50'
                        }`}
                      >
                        {/* Node Icon */}
                        <span className="drop-shadow-xs">
                          {!isUnlocked ? <Lock className="w-8 h-8 text-slate-400" /> : lesson.icon}
                        </span>

                        {/* Completed Checkmark Badge */}
                        {isCompleted && (
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white text-white flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </motion.button>

                      {/* Stars Rating below Node */}
                      {isCompleted && (
                        <div className="flex items-center gap-0.5 mt-2 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-amber-200 shadow-xs">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < lessonStars ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Lesson Short Title */}
                      <span className="text-xs sm:text-sm font-black text-slate-700 mt-1 max-w-[130px] text-center leading-tight">
                        {isAr ? lesson.titleAr : lesson.titleEn}
                      </span>
                    </div>
                  );
                })}

                {/* MYSTERY TREASURE CHEST AT THE END OF UNIT */}
                {unit.chestReward && (
                  <div className="relative mt-4 flex flex-col items-center">
                    {(() => {
                      const isOpened = stats.openedChests?.includes(unit.chestReward.id);
                      return (
                        <motion.button
                          whileHover={{ scale: 1.12, rotate: [0, -5, 5, 0] }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleChestClick(unit)}
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex flex-col items-center justify-center text-3xl sm:text-4xl border-4 transition-all cursor-pointer ${
                            isOpened
                              ? 'bg-amber-100 border-amber-300 opacity-60 shadow-xs'
                              : 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-400 border-white text-amber-950 shadow-[0_6px_0_#b45309] ring-4 ring-yellow-300/50'
                          }`}
                        >
                          <span className={isOpened ? 'grayscale' : 'animate-bounce'}>
                            {isOpened ? '📭' : '🎁'}
                          </span>
                        </motion.button>
                      );
                    })()}
                    <span className="text-xs font-black text-amber-900 mt-1.5 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {isAr ? unit.chestReward.titleAr : unit.chestReward.titleEn}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* UNIT GUIDEBOOK MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {guideModalUnit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGuideModalUnit(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-emerald-400 z-10 text-slate-800"
            >
              <button
                onClick={() => setGuideModalUnit(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl border border-emerald-300">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-600 uppercase">
                    {isAr ? `دليل الوحدة ${guideModalUnit.unitNumber}` : `Unit ${guideModalUnit.unitNumber} Guide`}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {isAr ? guideModalUnit.titleAr : guideModalUnit.titleEn}
                  </h3>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mb-5">
                <h4 className="text-sm font-black text-emerald-950 mb-1">
                  {isAr ? '💡 أسرار وتلميحات فطين:' : '💡 Smarty’s Key Tips:'}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed">
                  {isAr
                    ? guideModalUnit.subtitleAr +
                      ' — تدرب على تمثيل الأرقام بالعين والأصابع لتكتسب سرعة حسابية مذهلة!'
                    : guideModalUnit.subtitleEn +
                      ' — Visualize numbers and objects to calculate with super speed!'}
                </p>
              </div>

              <button
                onClick={() => setGuideModalUnit(null)}
                className="w-full py-3.5 rounded-2xl bg-[#58CC02] hover:bg-[#46A302] text-white font-black text-base shadow-[0_4px_0_#388302] active:translate-y-1 active:shadow-none"
              >
                {isAr ? 'فهمت ذلك، هيا نتعلم! 🚀' : 'Got it, let’s learn! 🚀'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* CHEST REWARD CLAIM MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {chestModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChestModalData(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-white via-amber-50 to-yellow-50 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 z-10 text-center"
            >
              <div className="text-6xl mb-3 animate-bounce">🎁</div>
              <h3 className="text-2xl font-black text-amber-950 mb-1">
                {isAr ? 'فتحت صندوق الكنز!' : 'Treasure Chest Unlocked!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-bold mb-6">
                {isAr ? chestModalData.unit.chestReward?.titleAr : chestModalData.unit.chestReward?.titleEn}
              </p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 px-4 py-2 rounded-2xl font-black text-sm border border-amber-300 shadow-xs">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  <span>+{formatNumber(chestModalData.stars, soundConfig.numeralSystem)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-sky-100 text-sky-900 px-4 py-2 rounded-2xl font-black text-sm border border-sky-300 shadow-xs">
                  <span className="text-base">💎</span>
                  <span>+{formatNumber(chestModalData.gems, soundConfig.numeralSystem)}</span>
                </div>
              </div>

              <button
                onClick={() => setChestModalData(null)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-base shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none"
              >
                {isAr ? 'جمع المكافأة 🎉' : 'Collect Reward 🎉'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
