import React, { useState, useEffect, useRef } from 'react';
import { ItemTheme, NumeralSystem, RewardModalData, SoundConfig } from '../types';
import { formatNumber } from '../utils/mathData';
import { soundManager, ARABIC_NUMBER_WORDS } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Volume2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Plus,
  Minus,
  Grid,
  Gamepad2,
  Lightbulb,
} from 'lucide-react';

interface CountingModuleProps {
  itemTheme: ItemTheme;
  soundConfig: SoundConfig;
  onRewardStar: (rewardData?: Partial<RewardModalData>) => void;
}

export const CountingModule: React.FC<CountingModuleProps> = ({
  itemTheme,
  soundConfig,
  onRewardStar,
}) => {
  const isAr = soundConfig.language === 'ar';
  const [selectedNumber, setSelectedNumber] = useState<number>(5);
  const [countingStep, setCountingStep] = useState<number>(0);
  const [isAutoCounting, setIsAutoCounting] = useState<boolean>(false);
  const [interactiveMode, setInteractiveMode] = useState<'visual' | 'quiz'>('visual');
  const [userCountedItems, setUserCountedItems] = useState<number[]>([]);
  const [quizSuccess, setQuizSuccess] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Numbers row 1 to 20
  const numbersList = Array.from({ length: 20 }, (_, i) => i + 1);

  // Handle number select
  const handleSelectNumber = (num: number) => {
    if (isAutoCounting && timerRef.current) {
      clearTimeout(timerRef.current);
      setIsAutoCounting(false);
    }
    setSelectedNumber(num);
    setCountingStep(0);
    setUserCountedItems([]);
    setQuizSuccess(false);

    if (soundConfig.soundFxEnabled) {
      soundManager.playPop();
    }
    if (soundConfig.voiceSpeechEnabled) {
      const word = isAr ? ARABIC_NUMBER_WORDS[num] || String(num) : String(num);
      soundManager.speak(word, isAr ? 'ar' : 'en');
    }
  };

  // Automated step-by-step counting sequence
  const startSequentialCount = () => {
    if (isAutoCounting) return;
    setIsAutoCounting(true);
    setCountingStep(0);

    let current = 0;
    const runStep = () => {
      if (current < selectedNumber) {
        current += 1;
        setCountingStep(current);
        if (soundConfig.soundFxEnabled) {
          soundManager.playCountChime(current);
        }
        if (soundConfig.voiceSpeechEnabled) {
          const word = isAr ? ARABIC_NUMBER_WORDS[current] || String(current) : String(current);
          soundManager.speak(word, isAr ? 'ar' : 'en');
        }
        timerRef.current = setTimeout(runStep, 650);
      } else {
        setIsAutoCounting(false);
        // Completed counting
        if (soundConfig.soundFxEnabled) {
          setTimeout(() => soundManager.playVictory(), 200);
        }
        if (soundConfig.voiceSpeechEnabled) {
          setTimeout(() => {
            const finalPhrase = isAr
              ? `${selectedNumber} ${itemTheme.nameAr}!`
              : `${selectedNumber} ${itemTheme.nameEn}!`;
            soundManager.speak(finalPhrase, isAr ? 'ar' : 'en');
          }, 300);
        }
      }
    };

    runStep();
  };

  // User interactive count click on specific item
  const handleItemClick = (index: number) => {
    if (interactiveMode !== 'quiz') {
      if (soundConfig.soundFxEnabled) soundManager.playPop();
      return;
    }

    if (userCountedItems.includes(index)) return;

    const nextCount = userCountedItems.length + 1;
    const nextList = [...userCountedItems, index];
    setUserCountedItems(nextList);

    if (soundConfig.soundFxEnabled) {
      soundManager.playCountChime(nextCount);
    }
    if (soundConfig.voiceSpeechEnabled) {
      const word = isAr ? ARABIC_NUMBER_WORDS[nextCount] || String(nextCount) : String(nextCount);
      soundManager.speak(word, isAr ? 'ar' : 'en');
    }

    // Checked all items in quiz mode
    if (nextList.length === selectedNumber) {
      setQuizSuccess(true);
      if (soundConfig.soundFxEnabled) soundManager.playVictory();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // silent
      }
      onRewardStar({
        starsEarned: 3,
        titleAr: 'أحسنت يا بطل العدّ!',
        titleEn: 'Super Counting Champion!',
        detailAr: `قمت بعدّ ${formatNumber(selectedNumber, soundConfig.numeralSystem)} ${itemTheme.nameAr} بنجاح ودقة عالية!`,
        detailEn: `You counted all ${selectedNumber} ${itemTheme.nameEn} accurately!`,
        bonusLabelAr: 'عدّ تفاعلي متقن 100%',
        bonusLabelEn: '100% Accurate Counting',
        onNext: () => {
          const nextNum = Math.min(20, selectedNumber + 1);
          handleSelectNumber(nextNum);
        },
        onRetry: () => {
          resetInteractiveQuiz();
        },
      });
    }
  };

  const resetInteractiveQuiz = () => {
    setUserCountedItems([]);
    setQuizSuccess(false);
  };

  // Clean up timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Banner / Concept Card */}
      <section className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 text-white shadow-2xl border border-white/35 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none text-9xl font-black">
          123
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/30 text-white text-xs font-bold backdrop-blur-md mb-2 border border-white/40 shadow-xs">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              {isAr ? 'المرحلة الأولى: التمهيد والعد المرئي' : 'Stage 1: Visual Counting & Quantities'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-xs">
              {isAr ? 'العد الملموس: ربط الرقم بالواقع' : 'Concrete Counting: Linking Numbers to Objects'}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm max-w-xl mt-1 font-medium leading-relaxed">
              {isAr
                ? 'الأرقام ليست رموزاً جافة! كل رقم يمثل مجموعة حقيقية من العناصر التي يمكننا لمسها وعدّها خطوة بخطوة.'
                : 'Numbers represent real objects! Tap numbers to see, hear, and count items one by one.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-white/25 p-1.5 rounded-2xl backdrop-blur-xl border border-white/40 shadow-lg">
            <button
              id="counting-mode-explore"
              onClick={() => {
                setInteractiveMode('visual');
                resetInteractiveQuiz();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                interactiveMode === 'visual'
                  ? 'bg-white/95 text-pink-600 shadow-lg border border-white'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{isAr ? 'استكشاف حر' : 'Free Explore'}</span>
            </button>
            <button
              id="counting-mode-quiz"
              onClick={() => {
                setInteractiveMode('quiz');
                resetInteractiveQuiz();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                interactiveMode === 'quiz'
                  ? 'bg-white/95 text-pink-600 shadow-lg border border-white'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحدّي: عُدّ بنفسك!' : 'Count-Along Quest'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Number Selector Bar (1 - 20) */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] p-4 shadow-xl border border-white/35">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-white flex items-center gap-1.5 drop-shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            {isAr ? 'اختر رقماً لاستكشافه:' : 'Pick a number to explore:'}
          </span>
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md p-1 rounded-xl border border-white/30">
            <button
              id="count-num-decrement"
              onClick={() => handleSelectNumber(Math.max(1, selectedNumber - 1))}
              disabled={selectedNumber <= 1}
              className="p-1 rounded-lg bg-white/30 text-white hover:bg-white/50 disabled:opacity-30 transition-all active:scale-90"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-black text-white px-2">
              {formatNumber(selectedNumber, soundConfig.numeralSystem)}
            </span>
            <button
              id="count-num-increment"
              onClick={() => handleSelectNumber(Math.min(20, selectedNumber + 1))}
              disabled={selectedNumber >= 20}
              className="p-1 rounded-lg bg-white/30 text-white hover:bg-white/50 disabled:opacity-30 transition-all active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {numbersList.map((num) => {
            const isSelected = selectedNumber === num;
            return (
              <button
                key={num}
                id={`count-number-btn-${num}`}
                onClick={() => handleSelectNumber(num)}
                className={`w-11 h-12 shrink-0 rounded-2xl font-black text-base sm:text-lg flex flex-col items-center justify-center transition-all transform active:scale-95 border backdrop-blur-xl ${
                  isSelected
                    ? 'bg-white/95 text-pink-600 shadow-xl border-white scale-105 ring-2 ring-white/60'
                    : 'bg-white/30 text-white hover:bg-white/45 border-white/30 shadow-xs'
                }`}
              >
                <span>{formatNumber(num, soundConfig.numeralSystem)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Visual Canvas of Objects */}
        <section className="lg:col-span-2 bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 shadow-2xl border border-white/35 flex flex-col justify-between min-h-[380px]">
          {/* Header of the Stage */}
          <div className="flex items-center justify-between border-b border-white/25 pb-3 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/60 text-white flex items-center justify-center font-black text-2xl shadow-lg backdrop-blur-xl">
                <span className="drop-shadow-xs">{formatNumber(selectedNumber, soundConfig.numeralSystem)}</span>
              </div>
              <div>
                <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-1.5 drop-shadow-xs">
                  <span>{isAr ? ARABIC_NUMBER_WORDS[selectedNumber] : `Number ${selectedNumber}`}</span>
                  <span className="text-white/80 font-bold text-sm">
                    ({isAr ? itemTheme.nameAr : itemTheme.nameEn})
                  </span>
                </h3>
                <p className="text-xs text-white/85 font-medium">
                  {interactiveMode === 'quiz'
                    ? isAr
                      ? 'اضغط على كل عنصر لعدّه واحداً تلو الآخر!'
                      : 'Tap each item to count it!'
                    : isAr
                    ? 'انقر على "ابدأ العد الصوتي" لمشاهدة وسماع العد التدريجي'
                    : 'Click "Start Auto Count" to watch and hear step-by-step counting'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {interactiveMode === 'visual' ? (
                <button
                  id="start-count-audio-btn"
                  onClick={startSequentialCount}
                  disabled={isAutoCounting}
                  className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-pink-600 disabled:opacity-50 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-lg border border-white transition-all transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-pink-600" />
                  <span>{isAutoCounting ? (isAr ? 'جاري العد...' : 'Counting...') : isAr ? 'ابدأ العد الصوتي' : 'Start Count'}</span>
                </button>
              ) : (
                <button
                  id="reset-quiz-count-btn"
                  onClick={resetInteractiveQuiz}
                  className="flex items-center gap-1 bg-white/30 hover:bg-white/45 text-white px-3.5 py-2 rounded-xl text-xs font-black backdrop-blur-xl border border-white/40 transition-all shadow-md active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إعادة المحاولة' : 'Reset'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Objects Board */}
          <div className="flex-1 flex items-center justify-center p-4 bg-white/15 backdrop-blur-xl rounded-3xl border-2 border-dashed border-white/40 min-h-[220px] shadow-inner">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-xl">
              <AnimatePresence>
                {Array.from({ length: selectedNumber }).map((_, idx) => {
                  const itemIndex = idx + 1;
                  const isCountedInAuto = countingStep >= itemIndex;
                  const isCountedByUser = userCountedItems.includes(idx);
                  const isHighlighted = isCountedInAuto || isCountedByUser;

                  return (
                    <motion.button
                      key={`${selectedNumber}_${idx}`}
                      id={`count-item-${idx}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: isHighlighted ? 1.15 : 1,
                        opacity: 1,
                        y: isHighlighted ? -4 : 0,
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      onClick={() => handleItemClick(idx)}
                      className={`relative w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all cursor-pointer select-none border-2 backdrop-blur-xl ${
                        isHighlighted
                          ? 'bg-white/95 shadow-2xl border-white ring-4 ring-yellow-300/80 scale-110'
                          : 'bg-white/35 hover:bg-white/50 hover:shadow-lg border-white/50 hover:scale-105'
                      }`}
                    >
                      {/* Item Emoji */}
                      <span>{itemTheme.emoji}</span>

                      {/* Number badge on count */}
                      {isHighlighted && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-pink-500 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white"
                        >
                          {formatNumber(
                            interactiveMode === 'quiz'
                              ? userCountedItems.indexOf(idx) + 1
                              : itemIndex,
                            soundConfig.numeralSystem
                          )}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Feedback Banner */}
          <div className="mt-4 pt-3 border-t border-white/25 flex items-center justify-between text-xs sm:text-sm text-white font-bold flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-pulse shadow-[0_0_8px_#fde047]"></span>
              <span className="font-extrabold text-white drop-shadow-xs">
                {interactiveMode === 'quiz'
                  ? isAr
                    ? `تم عدّ ${formatNumber(userCountedItems.length, soundConfig.numeralSystem)} من ${formatNumber(selectedNumber, soundConfig.numeralSystem)}`
                    : `Counted ${userCountedItems.length} of ${selectedNumber}`
                  : isAr
                  ? `العدد الإجمالي: ${formatNumber(selectedNumber, soundConfig.numeralSystem)} ${itemTheme.nameAr}`
                  : `Total: ${selectedNumber} ${itemTheme.nameEn}`}
              </span>
            </div>

            {quizSuccess && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 text-pink-600 bg-white/95 px-4 py-1.5 rounded-2xl font-black border border-white shadow-xl"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'أحسنت! أتممت العد بنجاح ⭐' : 'Awesome! Full count ⭐'}</span>
              </motion.div>
            )}
          </div>
        </section>

        {/* Right Col: Ten-Frame & Structural Math Visualizer */}
        <aside className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 shadow-2xl border border-white/35 flex flex-col justify-between space-y-4 text-white">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-2xl bg-white/30 border border-white/40 text-white backdrop-blur-xl shadow-md">
                <Grid className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm sm:text-base drop-shadow-xs">
                  {isAr ? 'إطار العشرات (Ten-Frame)' : 'Ten-Frame Grid'}
                </h4>
                <p className="text-xs text-white/80 font-medium">
                  {isAr ? 'طريقة بصرية لفهم تركيب الرقم' : 'Visual number composition'}
                </p>
              </div>
            </div>

            {/* Frame 1 (First 10) */}
            <div className="bg-white/25 backdrop-blur-xl p-3.5 rounded-3xl border border-white/40 mb-3 shadow-md">
              <div className="flex justify-between items-center mb-1.5 text-[11px] font-black text-white/90">
                <span>{isAr ? 'العشرة الأولى (1 - 10)' : 'First Ten (1 - 10)'}</span>
                <span className="bg-white/30 px-2 py-0.5 rounded-full border border-white/30">
                  {formatNumber(Math.min(10, selectedNumber), soundConfig.numeralSystem)}/10
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => {
                  const isFilled = i < selectedNumber;
                  return (
                    <div
                      key={`frame1_${i}`}
                      className={`h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                        isFilled
                          ? 'bg-white/95 border-white text-pink-600 shadow-md scale-98 font-bold'
                          : 'bg-white/15 border-dashed border-white/30 text-white/30'
                      }`}
                    >
                      {isFilled ? itemTheme.emoji : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Frame 2 (Second 10 if number > 10) */}
            {selectedNumber > 10 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white/25 backdrop-blur-xl p-3.5 rounded-3xl border border-white/40 shadow-md"
              >
                <div className="flex justify-between items-center mb-1.5 text-[11px] font-black text-white/90">
                  <span>{isAr ? 'العشرة الثانية (11 - 20)' : 'Second Ten (11 - 20)'}</span>
                  <span className="bg-white/30 px-2 py-0.5 rounded-full border border-white/30">
                    {formatNumber(selectedNumber - 10, soundConfig.numeralSystem)}/10
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const isFilled = i < selectedNumber - 10;
                    return (
                      <div
                        key={`frame2_${i}`}
                        className={`h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                          isFilled
                            ? 'bg-white/95 border-white text-pink-600 shadow-md scale-98 font-bold'
                            : 'bg-white/15 border-dashed border-white/30 text-white/30'
                        }`}
                      >
                        {isFilled ? itemTheme.emoji : ''}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Number Breakdown Box */}
          <div className="bg-white/30 backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-lg">
            <h5 className="font-black text-xs text-white mb-1.5 flex items-center gap-1.5 drop-shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              {isAr ? 'التحليل العددي البصري:' : 'Visual Breakdown:'}
            </h5>
            <p className="text-xs text-white/95 font-bold leading-relaxed">
              {selectedNumber <= 5 ? (
                isAr ? (
                  <>
                    الرقم {formatNumber(selectedNumber, soundConfig.numeralSystem)} يتكون من{' '}
                    {formatNumber(selectedNumber, soundConfig.numeralSystem)} وحدات متطابقة.
                  </>
                ) : (
                  <>Number {selectedNumber} consists of {selectedNumber} equal units.</>
                )
              ) : selectedNumber <= 10 ? (
                isAr ? (
                  <>
                    الرقم {formatNumber(selectedNumber, soundConfig.numeralSystem)} = ٥ +{' '}
                    {formatNumber(selectedNumber - 5, soundConfig.numeralSystem)} (مجموعة من 5 ومجموعة من{' '}
                    {formatNumber(selectedNumber - 5, soundConfig.numeralSystem)}).
                  </>
                ) : (
                  <>
                    Number {selectedNumber} = 5 + {selectedNumber - 5} (A group of 5 plus{' '}
                    {selectedNumber - 5}).
                  </>
                )
              ) : (
                isAr ? (
                  <>
                    الرقم {formatNumber(selectedNumber, soundConfig.numeralSystem)} = ١٠ (عشرة كاملة) +{' '}
                    {formatNumber(selectedNumber - 10, soundConfig.numeralSystem)} (آحاد).
                  </>
                ) : (
                  <>
                    Number {selectedNumber} = 10 (One full ten) + {selectedNumber - 10} ones.
                  </>
                )
              )}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
