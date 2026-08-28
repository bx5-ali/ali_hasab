import React, { useState } from 'react';
import { ItemTheme, NumeralSystem, RewardModalData, SoundConfig } from '../types';
import { formatNumber } from '../utils/mathData';
import { soundManager } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Zap,
  Lightbulb,
  Award,
} from 'lucide-react';

interface OperationsModuleProps {
  itemTheme: ItemTheme;
  soundConfig: SoundConfig;
  onRewardStar: (rewardData?: Partial<RewardModalData>) => void;
}

export const OperationsModule: React.FC<OperationsModuleProps> = ({
  itemTheme,
  soundConfig,
  onRewardStar,
}) => {
  const isAr = soundConfig.language === 'ar';
  const [subMode, setSubMode] = useState<'addition' | 'subtraction'>('addition');

  // Addition State: Plate 1 (A) + Plate 2 (B) -> Combine in Center Plate
  const [addA, setAddA] = useState<number>(3);
  const [addB, setAddB] = useState<number>(2);
  const [movedFromA, setMovedFromA] = useState<number>(0);
  const [movedFromB, setMovedFromB] = useState<number>(0);
  const totalCombined = movedFromA + movedFromB;
  const isAdditionComplete = movedFromA === addA && movedFromB === addB;

  // Subtraction State: Total (N) - Subtrahend (S) -> Remaining
  const [subTotal, setSubTotal] = useState<number>(5);
  const [subRemoveCount, setSubRemoveCount] = useState<number>(2);
  const [removedItems, setRemovedItems] = useState<number[]>([]);
  const isSubtractionComplete = removedItems.length === subRemoveCount;

  // Reset Addition interaction
  const resetAddition = (newA?: number, newB?: number) => {
    if (newA !== undefined) setAddA(newA);
    if (newB !== undefined) setAddB(newB);
    setMovedFromA(0);
    setMovedFromB(0);
  };

  // Reset Subtraction interaction
  const resetSubtraction = (newTot?: number, newSub?: number) => {
    if (newTot !== undefined) setSubTotal(newTot);
    if (newSub !== undefined) setSubRemoveCount(newSub);
    setRemovedItems([]);
  };

  // Switch Sub-mode
  const handleSwitchMode = (mode: 'addition' | 'subtraction') => {
    setSubMode(mode);
    if (soundConfig.soundFxEnabled) soundManager.playPop();
  };

  // Addition: Move an item from Plate A to Central Bowl
  const handleMoveFromA = () => {
    if (movedFromA < addA) {
      const next = movedFromA + 1;
      setMovedFromA(next);
      if (soundConfig.soundFxEnabled) soundManager.playPop();
      if (next === addA && movedFromB === addB) {
        handleAdditionVictory();
      }
    }
  };

  // Addition: Move an item from Plate B to Central Bowl
  const handleMoveFromB = () => {
    if (movedFromB < addB) {
      const next = movedFromB + 1;
      setMovedFromB(next);
      if (soundConfig.soundFxEnabled) soundManager.playPop();
      if (movedFromA === addA && next === addB) {
        handleAdditionVictory();
      }
    }
  };

  // Combine all at once
  const handleCombineAll = () => {
    setMovedFromA(addA);
    setMovedFromB(addB);
    handleAdditionVictory();
  };

  const handleAdditionVictory = () => {
    if (soundConfig.soundFxEnabled) soundManager.playVictory();
    if (soundConfig.voiceSpeechEnabled) {
      const phrase = isAr
        ? `${addA} زائد ${addB} يساوي ${addA + addB}`
        : `${addA} plus ${addB} equals ${addA + addB}`;
      soundManager.speak(phrase, isAr ? 'ar' : 'en');
    }
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {
      // silent
    }
    onRewardStar({
      starsEarned: 3,
      titleAr: 'عبقري عملية الجمع!',
      titleEn: 'Addition Master!',
      detailAr: `${formatNumber(addA, soundConfig.numeralSystem)} + ${formatNumber(addB, soundConfig.numeralSystem)} = ${formatNumber(addA + addB, soundConfig.numeralSystem)} ${itemTheme.nameAr}`,
      detailEn: `${addA} + ${addB} = ${addA + addB} ${itemTheme.nameEn}`,
      bonusLabelAr: 'تجميع ذكي ومتقن',
      bonusLabelEn: 'Smart Visual Addition',
      onNext: () => {
        setAddA(Math.floor(Math.random() * 6) + 2);
        setAddB(Math.floor(Math.random() * 5) + 2);
        resetAddition();
      },
      onRetry: () => {
        resetAddition();
      },
    });
  };

  // Subtraction: Tap an item on the board to "take away / remove"
  const handleRemoveItem = (index: number) => {
    if (removedItems.includes(index)) {
      // Undo removal
      setRemovedItems(removedItems.filter((i) => i !== index));
      if (soundConfig.soundFxEnabled) soundManager.playPop();
      return;
    }

    if (removedItems.length < subRemoveCount) {
      const nextList = [...removedItems, index];
      setRemovedItems(nextList);
      if (soundConfig.soundFxEnabled) soundManager.playRemove();

      if (nextList.length === subRemoveCount) {
        // Completed required subtraction
        if (soundConfig.soundFxEnabled) soundManager.playVictory();
        if (soundConfig.voiceSpeechEnabled) {
          const phrase = isAr
            ? `${subTotal} ناقص ${subRemoveCount} يساوي ${subTotal - subRemoveCount}`
            : `${subTotal} minus ${subRemoveCount} equals ${subTotal - subRemoveCount}`;
          soundManager.speak(phrase, isAr ? 'ar' : 'en');
        }
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        } catch {
          // silent
        }
        onRewardStar({
          starsEarned: 3,
          titleAr: 'ساحر الطرح والإبعاد!',
          titleEn: 'Subtraction Star!',
          detailAr: `${formatNumber(subTotal, soundConfig.numeralSystem)} - ${formatNumber(subRemoveCount, soundConfig.numeralSystem)} = ${formatNumber(subTotal - subRemoveCount, soundConfig.numeralSystem)} (تبقى ${formatNumber(subTotal - subRemoveCount, soundConfig.numeralSystem)} ${itemTheme.nameAr})`,
          detailEn: `${subTotal} - ${subRemoveCount} = ${subTotal - subRemoveCount} ${itemTheme.nameEn} remaining`,
          bonusLabelAr: 'فهم مفهوم الباقي 100%',
          bonusLabelEn: '100% Concept Mastery',
          onNext: () => {
            const newTotal = Math.floor(Math.random() * 8) + 4;
            const newRemove = Math.floor(Math.random() * (newTotal - 2)) + 1;
            setSubTotal(newTotal);
            setSubRemoveCount(newRemove);
            resetSubtraction();
          },
          onRetry: () => {
            resetSubtraction();
          },
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <section className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 text-white shadow-2xl border border-white/35 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none text-9xl font-black">
          + -
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/30 text-white text-xs font-bold backdrop-blur-md mb-2 border border-white/40 shadow-xs">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              {isAr ? 'المرحلة الثانية: العمليات الأساسية (الجمع والطرح)' : 'Stage 2: Basic Operations (Add & Subtract)'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-xs">
              {subMode === 'addition'
                ? isAr
                  ? 'الجمع: سحب وتجميع في مكان واحد'
                  : 'Addition: Drag & Combine Together'
                : isAr
                ? 'الطرح: إخفاء وإبعاد العناصر'
                : 'Subtraction: Pop & Take Away Objects'}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm max-w-xl mt-1 font-medium leading-relaxed">
              {subMode === 'addition'
                ? isAr
                  ? 'الجمع يعني تجميع كميتين معاً في طبق واحد لحساب المجموع الإجمالي.'
                  : 'Addition means bringing two groups of items together into one big bowl to find the total.'
                : isAr
                ? 'الطرح يعني إنقاص أو إبعاد عدد معين من العناصر لحساب ما تبقى.'
                : 'Subtraction means taking away or removing items to see how many remain.'}
            </p>
          </div>

          {/* Sub-mode selector (Add / Subtract) */}
          <div className="flex items-center gap-1.5 bg-white/25 p-1.5 rounded-2xl backdrop-blur-xl border border-white/40 shadow-lg">
            <button
              id="submode-addition-btn"
              onClick={() => handleSwitchMode('addition')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                subMode === 'addition'
                  ? 'bg-white/95 text-pink-600 shadow-xl border border-white scale-102'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'الجمع (تجميع)' : 'Addition (+)'}</span>
            </button>
            <button
              id="submode-subtraction-btn"
              onClick={() => handleSwitchMode('subtraction')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                subMode === 'subtraction'
                  ? 'bg-white/95 text-pink-600 shadow-xl border border-white scale-102'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Minus className="w-4 h-4" />
              <span>{isAr ? 'الطرح (إبعاد)' : 'Subtraction (-)'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ADDITION SUB-MODULE (سحب وتجميع) */}
      {/* ========================================================================= */}
      {subMode === 'addition' && (
        <div className="space-y-4">
          {/* Controls Bar for Numbers A and B */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] p-4 shadow-xl border border-white/35 flex flex-wrap items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {/* Group A adjuster */}
              <div className="flex items-center gap-2 bg-white/25 border border-white/40 px-3.5 py-1.5 rounded-2xl backdrop-blur-xl shadow-md">
                <span className="text-xs font-black text-white">{isAr ? 'المجموعة الأولى (أ):' : 'Group (A):'}</span>
                <button
                  id="add-a-minus"
                  onClick={() => resetAddition(Math.max(1, addA - 1), addB)}
                  className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
                >
                  -
                </button>
                <span className="font-black text-lg text-yellow-300 w-5 text-center drop-shadow-xs">
                  {formatNumber(addA, soundConfig.numeralSystem)}
                </span>
                <button
                  id="add-a-plus"
                  onClick={() => resetAddition(Math.min(7, addA + 1), addB)}
                  className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
                >
                  +
                </button>
              </div>

              <span className="text-2xl font-black text-white drop-shadow-xs">+</span>

              {/* Group B adjuster */}
              <div className="flex items-center gap-2 bg-white/25 border border-white/40 px-3.5 py-1.5 rounded-2xl backdrop-blur-xl shadow-md">
                <span className="text-xs font-black text-white">{isAr ? 'المجموعة الثانية (ب):' : 'Group (B):'}</span>
                <button
                  id="add-b-minus"
                  onClick={() => resetAddition(addA, Math.max(1, addB - 1))}
                  className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
                >
                  -
                </button>
                <span className="font-black text-lg text-yellow-300 w-5 text-center drop-shadow-xs">
                  {formatNumber(addB, soundConfig.numeralSystem)}
                </span>
                <button
                  id="add-b-plus"
                  onClick={() => resetAddition(addA, Math.min(7, addB + 1))}
                  className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                id="combine-all-btn"
                onClick={handleCombineAll}
                className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-pink-600 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black shadow-lg border border-white transition-transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                <span>{isAr ? 'تجميع الكل معاً' : 'Combine All'}</span>
              </button>
              <button
                id="reset-addition-btn"
                onClick={() => resetAddition()}
                className="p-2 rounded-2xl bg-white/30 text-white hover:bg-white/50 backdrop-blur-xl border border-white/40 shadow-md transition-all active:scale-90"
                title={isAr ? 'إعادة البدء' : 'Reset'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Addition Stage: 3 Plates layout */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 shadow-2xl border border-white/35 text-white">
            {/* Dynamic Math Equation Banner */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 bg-white/30 backdrop-blur-xl border-2 border-white/50 py-3.5 px-6 rounded-3xl mb-6 shadow-xl max-w-lg mx-auto">
              <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-xs">
                {formatNumber(addA, soundConfig.numeralSystem)}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-yellow-300">+</span>
              <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-xs">
                {formatNumber(addB, soundConfig.numeralSystem)}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white/80">=</span>
              <motion.span
                key={totalCombined}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className={`text-3xl sm:text-4xl font-black px-4 py-1 rounded-2xl border-2 shadow-xl ${
                  isAdditionComplete
                    ? 'bg-white/95 text-pink-600 border-white ring-4 ring-yellow-300/80 scale-105'
                    : 'bg-white/40 text-white border-white/60'
                }`}
              >
                {formatNumber(totalCombined, soundConfig.numeralSystem)}
              </motion.span>
            </div>

            {/* Visual Plates (Left Plate A, Center Big Plate, Right Plate B) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              {/* Plate A */}
              <div className="bg-white/25 backdrop-blur-xl rounded-[32px] p-4 sm:p-5 border-2 border-dashed border-white/50 flex flex-col items-center justify-between min-h-[240px] shadow-xl">
                <div className="text-center mb-2">
                  <h4 className="font-black text-white text-base drop-shadow-xs">
                    {isAr ? 'الطبق الأول (أ)' : 'First Plate (A)'}
                  </h4>
                  <span className="text-xs text-yellow-200 font-black">
                    {formatNumber(addA - movedFromA, soundConfig.numeralSystem)} / {formatNumber(addA, soundConfig.numeralSystem)}
                  </span>
                </div>

                {/* Items in Plate A */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 flex-1 p-2">
                  <AnimatePresence>
                    {Array.from({ length: addA - movedFromA }).map((_, idx) => (
                      <motion.button
                        key={`plateA_${idx}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={handleMoveFromA}
                        className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white/40 backdrop-blur-xl shadow-lg border-2 border-white/60 flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        title={isAr ? 'انقر لنقله إلى الطبق الكبير' : 'Click to move to big plate'}
                      >
                        {itemTheme.emoji}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                  {addA - movedFromA === 0 && (
                    <span className="text-xs font-black text-white/60 italic">
                      {isAr ? 'فارغ (تم التجميع)' : 'Empty (Combined)'}
                    </span>
                  )}
                </div>

                <button
                  id="move-from-a-btn"
                  onClick={handleMoveFromA}
                  disabled={movedFromA >= addA}
                  className="w-full mt-2 py-2 px-3 rounded-2xl bg-white/35 hover:bg-white/50 disabled:opacity-30 text-white text-xs font-black backdrop-blur-xl border border-white/40 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <span>{isAr ? 'انقل للطبق الكبير' : 'Move to Bowl'}</span>
                  {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Center Big Plate (The Combined Plate) */}
              <div className="bg-white/35 backdrop-blur-2xl rounded-[36px] p-5 border-2 border-white/70 flex flex-col items-center justify-between min-h-[270px] shadow-2xl order-first md:order-none relative overflow-hidden">
                <div className="text-center mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-pink-600 bg-white/95 px-3.5 py-1 rounded-full mb-1 shadow-md border border-white">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
                    {isAr ? 'الطبق الكبير (المجموع الإجمالي)' : 'The Big Combine Bowl'}
                  </span>
                  <p className="text-xs text-white/95 font-black drop-shadow-xs">
                    {isAr
                      ? `يحتوي الآن على ${formatNumber(totalCombined, soundConfig.numeralSystem)} ${itemTheme.nameAr}`
                      : `Currently has ${totalCombined} ${itemTheme.nameEn}`}
                  </p>
                </div>

                {/* Big Plate Content */}
                <div className="w-full flex-1 rounded-3xl bg-white/20 backdrop-blur-xl border-2 border-white/40 p-3 flex flex-wrap items-center justify-center gap-2.5 shadow-inner min-h-[130px]">
                  <AnimatePresence>
                    {Array.from({ length: totalCombined }).map((_, idx) => (
                      <motion.div
                        key={`combined_${idx}`}
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white/50 backdrop-blur-xl border-2 border-white/70 flex items-center justify-center text-2xl shadow-lg"
                      >
                        {itemTheme.emoji}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {totalCombined === 0 && (
                    <span className="text-xs font-bold text-white/80 text-center p-2 leading-relaxed">
                      {isAr
                        ? 'اسحب أو اضغط على العناصر في الطبقين لنقلها إلى هنا!'
                        : 'Tap items in both plates to combine them here!'}
                    </span>
                  )}
                </div>

                {/* Victory badge */}
                {isAdditionComplete && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-3 text-xs font-black text-pink-600 bg-white/95 px-4 py-1.5 rounded-2xl border border-white shadow-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? 'رائع! جمعت كل العناصر ⭐' : 'Awesome! All items combined ⭐'}</span>
                  </motion.div>
                )}
              </div>

              {/* Plate B */}
              <div className="bg-white/25 backdrop-blur-xl rounded-[32px] p-4 sm:p-5 border-2 border-dashed border-white/50 flex flex-col items-center justify-between min-h-[240px] shadow-xl">
                <div className="text-center mb-2">
                  <h4 className="font-black text-white text-base drop-shadow-xs">
                    {isAr ? 'الطبق الثاني (ب)' : 'Second Plate (B)'}
                  </h4>
                  <span className="text-xs text-yellow-200 font-black">
                    {formatNumber(addB - movedFromB, soundConfig.numeralSystem)} / {formatNumber(addB, soundConfig.numeralSystem)}
                  </span>
                </div>

                {/* Items in Plate B */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 flex-1 p-2">
                  <AnimatePresence>
                    {Array.from({ length: addB - movedFromB }).map((_, idx) => (
                      <motion.button
                        key={`plateB_${idx}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={handleMoveFromB}
                        className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white/40 backdrop-blur-xl shadow-lg border-2 border-white/60 flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        title={isAr ? 'انقر لنقله إلى الطبق الكبير' : 'Click to move to big plate'}
                      >
                        {itemTheme.emoji}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                  {addB - movedFromB === 0 && (
                    <span className="text-xs font-black text-white/60 italic">
                      {isAr ? 'فارغ (تم التجميع)' : 'Empty (Combined)'}
                    </span>
                  )}
                </div>

                <button
                  id="move-from-b-btn"
                  onClick={handleMoveFromB}
                  disabled={movedFromB >= addB}
                  className="w-full mt-2 py-2 px-3 rounded-2xl bg-white/35 hover:bg-white/50 disabled:opacity-30 text-white text-xs font-black backdrop-blur-xl border border-white/40 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                  <span>{isAr ? 'انقل للطبق الكبير' : 'Move to Bowl'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTRACTION SUB-MODULE (إخفاء وإبعاد) */}
      {/* ========================================================================= */}
      {subMode === 'subtraction' && (
        <div className="space-y-4">
          {/* Controls Bar for Subtraction */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] p-4 shadow-xl border border-white/35 flex flex-wrap items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {/* Total Items adjuster */}
              <div className="flex items-center gap-2 bg-white/25 border border-white/40 px-3.5 py-1.5 rounded-2xl backdrop-blur-xl shadow-md">
                <span className="text-xs font-black text-white">{isAr ? 'العدد الأصلي الكلي:' : 'Starting Total:'}</span>
                <button
                  id="sub-tot-minus"
                  onClick={() => resetSubtraction(Math.max(2, subTotal - 1), Math.min(subRemoveCount, subTotal - 2))}
                  className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
                >
                  -
                </button>
                <span className="font-black text-lg text-yellow-300 w-5 text-center drop-shadow-xs">
                  {formatNumber(subTotal, soundConfig.numeralSystem)}
                </span>
                <button
                  id="sub-tot-plus"
                  onClick={() => resetSubtraction(Math.min(12, subTotal + 1), subRemoveCount)}
                  className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
                >
                  +
                </button>
              </div>

              <span className="text-2xl font-black text-rose-300 drop-shadow-xs">-</span>

              {/* Subtrahend (To Remove) adjuster */}
              <div className="flex items-center gap-2 bg-white/25 border border-white/40 px-3.5 py-1.5 rounded-2xl backdrop-blur-xl shadow-md">
                <span className="text-xs font-black text-white">{isAr ? 'المطلوب إبعاده (ناقص):' : 'To Take Away:'}</span>
                <button
                  id="sub-rem-minus"
                  onClick={() => resetSubtraction(subTotal, Math.max(1, subRemoveCount - 1))}
                  className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
                >
                  -
                </button>
                <span className="font-black text-lg text-rose-300 w-5 text-center drop-shadow-xs">
                  {formatNumber(subRemoveCount, soundConfig.numeralSystem)}
                </span>
                <button
                  id="sub-rem-plus"
                  onClick={() => resetSubtraction(subTotal, Math.min(subTotal - 1, subRemoveCount + 1))}
                  className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
                >
                  +
                </button>
              </div>
            </div>

            <button
              id="reset-subtraction-btn"
              onClick={() => resetSubtraction()}
              className="flex items-center gap-1.5 bg-white/30 hover:bg-white/45 text-white px-4 py-2 rounded-2xl text-xs font-black backdrop-blur-xl border border-white/40 transition-all shadow-md active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة المحاولة' : 'Reset'}</span>
            </button>
          </div>

          {/* Interactive Subtraction Stage */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 shadow-2xl border border-white/35 text-white">
            {/* Mathematical Formula Banner */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 bg-white/30 backdrop-blur-xl border-2 border-white/50 py-3.5 px-6 rounded-3xl mb-6 shadow-xl max-w-lg mx-auto">
              <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-xs">
                {formatNumber(subTotal, soundConfig.numeralSystem)}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-rose-300">-</span>
              <span className="text-3xl sm:text-4xl font-black text-rose-300">
                {formatNumber(subRemoveCount, soundConfig.numeralSystem)}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white/80">=</span>
              <motion.span
                key={subTotal - removedItems.length}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className={`text-3xl sm:text-4xl font-black px-4 py-1 rounded-2xl border-2 shadow-xl ${
                  isSubtractionComplete
                    ? 'bg-white/95 text-pink-600 border-white ring-4 ring-yellow-300/80 scale-105'
                    : 'bg-white/40 text-white border-white/60'
                }`}
              >
                {formatNumber(subTotal - removedItems.length, soundConfig.numeralSystem)}
              </motion.span>
            </div>

            {/* Instruction Callout */}
            <div className="text-center mb-4">
              <p className="text-xs sm:text-sm font-black text-white drop-shadow-xs">
                {isAr ? (
                  <>
                    اضغط على{' '}
                    <span className="text-yellow-300 font-black underline underline-offset-4">
                      {formatNumber(subRemoveCount, soundConfig.numeralSystem)}
                    </span>{' '}
                    عناصر لإبعادها (أكلها/إخفائها) ومعرفة كم يتبقى!
                  </>
                ) : (
                  <>Tap {subRemoveCount} items to take them away and see what remains!</>
                )}
              </p>
            </div>

            {/* Main Subtraction Plate */}
            <div className="bg-white/25 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border-2 border-dashed border-white/50 min-h-[260px] flex flex-col items-center justify-center shadow-xl">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-xl">
                {Array.from({ length: subTotal }).map((_, idx) => {
                  const isRemoved = removedItems.includes(idx);
                  return (
                    <motion.button
                      key={`sub_item_${idx}`}
                      id={`sub-item-btn-${idx}`}
                      onClick={() => handleRemoveItem(idx)}
                      animate={{
                        scale: isRemoved ? 0.85 : 1,
                        opacity: isRemoved ? 0.3 : 1,
                      }}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl transition-all cursor-pointer select-none border-2 backdrop-blur-xl ${
                        isRemoved
                          ? 'bg-white/10 border-dashed border-white/25 grayscale'
                          : 'bg-white/40 shadow-lg hover:shadow-xl border-white/60 hover:scale-105 active:scale-95'
                      }`}
                      title={isAr ? 'اضغط للإبعاد' : 'Tap to take away'}
                    >
                      <span>{itemTheme.emoji}</span>
                      {isRemoved && (
                        <span className="absolute inset-0 flex items-center justify-center text-rose-400 font-black text-2xl drop-shadow-md">
                          ✕
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Status summary */}
              <div className="mt-6 flex items-center gap-3 sm:gap-4 flex-wrap justify-center text-xs sm:text-sm font-black">
                <span className="text-white bg-white/30 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/40 shadow-md">
                  {isAr ? 'الأصل:' : 'Total:'} {formatNumber(subTotal, soundConfig.numeralSystem)}
                </span>
                <span className="text-rose-200 bg-rose-500/40 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-rose-300/50 shadow-md">
                  {isAr ? 'تم إبعاد:' : 'Removed:'} {formatNumber(removedItems.length, soundConfig.numeralSystem)} / {formatNumber(subRemoveCount, soundConfig.numeralSystem)}
                </span>
                <span className="text-yellow-200 bg-white/30 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/40 shadow-md">
                  {isAr ? 'الباقي:' : 'Remaining:'} {formatNumber(subTotal - removedItems.length, soundConfig.numeralSystem)}
                </span>
              </div>

              {/* Success Badge */}
              {isSubtractionComplete && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-4 text-xs font-black text-pink-600 bg-white/95 px-5 py-2 rounded-2xl border border-white shadow-2xl flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>
                    {isAr
                      ? `رائع جداً! ${subTotal} - ${subRemoveCount} = ${subTotal - subRemoveCount} ⭐`
                      : `Great job! ${subTotal} - ${subRemoveCount} = ${subTotal - subRemoveCount} ⭐`}
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
