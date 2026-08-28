import React, { useState } from 'react';
import { ItemTheme, NumeralSystem, RewardModalData, SoundConfig } from '../types';
import { formatNumber } from '../utils/mathData';
import { soundManager } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShoppingBag,
  Grid,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface MultiplicationModuleProps {
  itemTheme: ItemTheme;
  soundConfig: SoundConfig;
  onRewardStar: (rewardData?: Partial<RewardModalData>) => void;
}

export const MultiplicationModule: React.FC<MultiplicationModuleProps> = ({
  itemTheme,
  soundConfig,
  onRewardStar,
}) => {
  const isAr = soundConfig.language === 'ar';

  // Multiplier (Number of Bags/Groups) & Multiplicand (Items per Bag)
  const [numBags, setNumBags] = useState<number>(3); // e.g. 3 bags
  const [itemsPerBag, setItemsPerBag] = useState<number>(4); // e.g. 4 candies each
  const [viewMode, setViewMode] = useState<'bags' | 'grid'>('bags');
  const [countedBags, setCountedBags] = useState<number[]>([]); // which bags have been counted

  const totalProduct = numBags * itemsPerBag;
  const isAllBagsCounted = countedBags.length === numBags;

  const presets = [
    { a: 2, b: 3 },
    { a: 3, b: 4 },
    { a: 4, b: 3 },
    { a: 5, b: 2 },
    { a: 3, b: 5 },
    { a: 4, b: 4 },
  ];

  // Adjust parameters
  const updateFactors = (bags: number, items: number) => {
    setNumBags(bags);
    setItemsPerBag(items);
    setCountedBags([]);
    if (soundConfig.soundFxEnabled) soundManager.playPop();
  };

  // Click a bag to count it
  const handleBagClick = (bagIndex: number) => {
    if (countedBags.includes(bagIndex)) return;

    const nextList = [...countedBags, bagIndex];
    setCountedBags(nextList);

    const currentTotal = nextList.length * itemsPerBag;

    if (soundConfig.soundFxEnabled) {
      soundManager.playCountChime(nextList.length * 2);
    }
    if (soundConfig.voiceSpeechEnabled) {
      const phrase = isAr ? `${currentTotal}` : `${currentTotal}`;
      soundManager.speak(phrase, isAr ? 'ar' : 'en');
    }

    if (nextList.length === numBags) {
      // Completed all bags
      if (soundConfig.soundFxEnabled) {
        setTimeout(() => soundManager.playVictory(), 250);
      }
      if (soundConfig.voiceSpeechEnabled) {
        setTimeout(() => {
          const victoryPhrase = isAr
            ? `${numBags} ضرب ${itemsPerBag} يساوي ${totalProduct}`
            : `${numBags} times ${itemsPerBag} equals ${totalProduct}`;
          soundManager.speak(victoryPhrase, isAr ? 'ar' : 'en');
        }, 300);
      }
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      } catch {
        // silent
      }
      onRewardStar({
        starsEarned: 3,
        titleAr: 'ملك الضرب والمجموعات!',
        titleEn: 'Multiplication Master!',
        detailAr: `${formatNumber(numBags, soundConfig.numeralSystem)} × ${formatNumber(itemsPerBag, soundConfig.numeralSystem)} = ${formatNumber(totalProduct, soundConfig.numeralSystem)} (${formatNumber(itemsPerBag, soundConfig.numeralSystem)} مكررة ${formatNumber(numBags, soundConfig.numeralSystem)} مرات)`,
        detailEn: `${numBags} × ${itemsPerBag} = ${totalProduct} (${itemsPerBag} grouped ${numBags} times)`,
        bonusLabelAr: 'فهم مفهوم الضرب التكراري 100%',
        bonusLabelEn: '100% Grouping Mastery',
        onNext: () => {
          const newBags = Math.floor(Math.random() * 4) + 2;
          const newItems = Math.floor(Math.random() * 4) + 2;
          updateFactors(newBags, newItems);
        },
        onRetry: () => {
          setCountedBags([]);
        },
      });
    }
  };

  // Count all bags sequentially
  const handleCountAllBags = () => {
    const all = Array.from({ length: numBags }, (_, i) => i);
    setCountedBags(all);
    if (soundConfig.soundFxEnabled) soundManager.playVictory();
    if (soundConfig.voiceSpeechEnabled) {
      const victoryPhrase = isAr
        ? `${numBags} ضرب ${itemsPerBag} يساوي ${totalProduct}`
        : `${numBags} times ${itemsPerBag} equals ${totalProduct}`;
      soundManager.speak(victoryPhrase, isAr ? 'ar' : 'en');
    }
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // silent
    }
    onRewardStar({
      starsEarned: 3,
      titleAr: 'ملك الضرب والمجموعات!',
      titleEn: 'Multiplication Master!',
      detailAr: `${formatNumber(numBags, soundConfig.numeralSystem)} × ${formatNumber(itemsPerBag, soundConfig.numeralSystem)} = ${formatNumber(totalProduct, soundConfig.numeralSystem)}`,
      detailEn: `${numBags} × ${itemsPerBag} = ${totalProduct}`,
      bonusLabelAr: 'فهم مفهوم الضرب التكراري 100%',
      bonusLabelEn: '100% Grouping Mastery',
      onNext: () => {
        const newBags = Math.floor(Math.random() * 4) + 2;
        const newItems = Math.floor(Math.random() * 4) + 2;
        updateFactors(newBags, newItems);
      },
      onRetry: () => {
        setCountedBags([]);
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <section className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 text-white shadow-2xl border border-white/35 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none text-9xl font-black">
          ×
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/30 text-white text-xs font-bold backdrop-blur-md mb-2 border border-white/40 shadow-xs">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              {isAr ? 'المرحلة الثالثة: الضرب (الجمع المتكرر والمجموعات)' : 'Stage 3: Multiplication (Repeated Addition)'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-xs">
              {isAr ? 'الضرب: مجموعات متكررة وليس حفظاً جافاً!' : 'Multiplication: Equal Groups Made Visual!'}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm max-w-xl mt-1 font-medium leading-relaxed">
              {isAr
                ? 'الضرب هو تكرار جمع نفس العدد عدة مرات. مثلاً: 3 × 4 تعني 3 أكياس، في كل كيس 4 قطع حلوى (4 + 4 + 4 = 12).'
                : 'Multiplication is repeating the same group multiple times. 3 × 4 means 3 bags with 4 candies in each bag.'}
            </p>
          </div>

          {/* View Mode Switcher (Bags vs Grid) */}
          <div className="flex items-center gap-1.5 bg-white/25 p-1.5 rounded-2xl backdrop-blur-xl border border-white/40 shadow-lg">
            <button
              id="mult-view-bags"
              onClick={() => setViewMode('bags')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                viewMode === 'bags'
                  ? 'bg-white/95 text-pink-600 shadow-xl border border-white scale-102'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAr ? 'عرض الأكياس' : 'Bags View'}</span>
            </button>
            <button
              id="mult-view-grid"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                viewMode === 'grid'
                  ? 'bg-white/95 text-pink-600 shadow-xl border border-white scale-102'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>{isAr ? 'المصفوفة الشبكية' : 'Array Grid'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Adjusters and Presets Bar */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] p-4 shadow-xl border border-white/35 space-y-3 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Number of Bags (Groups) */}
            <div className="flex items-center gap-2 bg-white/25 border border-white/40 px-3.5 py-1.5 rounded-2xl backdrop-blur-xl shadow-md">
              <span className="text-xs font-black text-white">
                {isAr ? 'عدد الأكياس (المجموعات):' : 'Number of Bags:'}
              </span>
              <button
                id="mult-bags-minus"
                onClick={() => updateFactors(Math.max(1, numBags - 1), itemsPerBag)}
                className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
              >
                -
              </button>
              <span className="font-black text-lg text-yellow-300 w-5 text-center drop-shadow-xs">
                {formatNumber(numBags, soundConfig.numeralSystem)}
              </span>
              <button
                id="mult-bags-plus"
                onClick={() => updateFactors(Math.min(6, numBags + 1), itemsPerBag)}
                className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
              >
                +
              </button>
            </div>

            <span className="text-2xl font-black text-white drop-shadow-xs">×</span>

            {/* Items inside each bag */}
            <div className="flex items-center gap-2 bg-white/25 border border-white/40 px-3.5 py-1.5 rounded-2xl backdrop-blur-xl shadow-md">
              <span className="text-xs font-black text-white">
                {isAr ? 'عناصر كل كيس:' : 'Items in each bag:'}
              </span>
              <button
                id="mult-items-minus"
                onClick={() => updateFactors(numBags, Math.max(1, itemsPerBag - 1))}
                className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
              >
                -
              </button>
              <span className="font-black text-lg text-yellow-300 w-5 text-center drop-shadow-xs">
                {formatNumber(itemsPerBag, soundConfig.numeralSystem)}
              </span>
              <button
                id="mult-items-plus"
                onClick={() => updateFactors(numBags, Math.min(6, itemsPerBag + 1))}
                className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              id="mult-count-all-btn"
              onClick={handleCountAllBags}
              className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-pink-600 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black shadow-lg border border-white transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>{isAr ? 'عدّ كل الأكياس' : 'Count All'}</span>
            </button>
            <button
              id="mult-reset-btn"
              onClick={() => setCountedBags([])}
              className="p-2 rounded-2xl bg-white/30 text-white hover:bg-white/50 backdrop-blur-xl border border-white/40 shadow-md transition-all active:scale-90"
              title={isAr ? 'إعادة البدء' : 'Reset'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Example Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar text-xs">
          <span className="text-white/80 font-bold ml-1">{isAr ? 'أمثلة سريعة:' : 'Presets:'}</span>
          {presets.map((p, i) => (
            <button
              key={i}
              id={`preset-${p.a}x${p.b}`}
              onClick={() => updateFactors(p.a, p.b)}
              className={`px-3 py-1 rounded-xl border font-black transition-all backdrop-blur-xl ${
                numBags === p.a && itemsPerBag === p.b
                  ? 'bg-white/95 text-pink-600 border-white shadow-md scale-105'
                  : 'bg-white/20 text-white border-white/30 hover:bg-white/35'
              }`}
            >
              {formatNumber(p.a, soundConfig.numeralSystem)} × {formatNumber(p.b, soundConfig.numeralSystem)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 shadow-2xl border border-white/35 text-white">
        {/* Dynamic Formula Display */}
        <div className="flex flex-col items-center justify-center gap-3 bg-white/30 backdrop-blur-xl border-2 border-white/50 py-4 px-6 rounded-3xl mb-6 shadow-xl max-w-2xl mx-auto">
          {/* Main Multiplication Equation */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/40 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/60 shadow-md">
              <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-xs">
                {formatNumber(numBags, soundConfig.numeralSystem)}
              </span>
              <span className="text-xs text-yellow-200 font-bold">
                {isAr ? 'أكياس' : 'bags'}
              </span>
            </div>

            <span className="text-2xl sm:text-3xl font-black text-yellow-300">×</span>

            <div className="flex items-center gap-1.5 bg-white/40 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/60 shadow-md">
              <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-xs">
                {formatNumber(itemsPerBag, soundConfig.numeralSystem)}
              </span>
              <span className="text-xs text-yellow-200 font-bold">
                {isAr ? 'قطع' : 'items'}
              </span>
            </div>

            <span className="text-2xl sm:text-3xl font-black text-white/80">=</span>

            <motion.div
              key={totalProduct}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="bg-white/95 text-pink-600 border-2 border-white px-4 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 ring-4 ring-yellow-300/80 scale-105"
            >
              <span className="text-2xl sm:text-3xl font-black">
                {formatNumber(totalProduct, soundConfig.numeralSystem)}
              </span>
              <span className="text-xs font-black text-pink-500">
                {isAr ? itemTheme.nameAr : itemTheme.nameEn}
              </span>
            </motion.div>
          </div>

          {/* Repeated Addition Explanation (e.g. 4 + 4 + 4 = 12) */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-white bg-white/25 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/40 mt-1 shadow-sm">
            <span className="text-yellow-200">{isAr ? 'الجمع المتكرر:' : 'Repeated Sum:'}</span>
            <span>
              {Array.from({ length: numBags })
                .map(() => formatNumber(itemsPerBag, soundConfig.numeralSystem))
                .join(' + ')}{' '}
              ={' '}
              <span className="text-yellow-300 font-black underline underline-offset-2">
                {formatNumber(totalProduct, soundConfig.numeralSystem)}
              </span>
            </span>
          </div>
        </div>

        {/* View 1: Bags and Candies (الأكياس والقطع) */}
        {viewMode === 'bags' && (
          <div className="space-y-4">
            <p className="text-center text-xs sm:text-sm font-black text-white drop-shadow-xs">
              {isAr
                ? 'اضغط على كل كيس لعدّ محتوياته وتجميع الكتل وصولاً للمجموع النهائي!'
                : 'Click each bag to count its group and build up to the total!'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: numBags }).map((_, bagIdx) => {
                const isCounted = countedBags.includes(bagIdx);
                const runningTotalForThis = (countedBags.indexOf(bagIdx) + 1) * itemsPerBag;

                return (
                  <motion.div
                    key={`bag_${bagIdx}`}
                    id={`mult-bag-${bagIdx}`}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleBagClick(bagIdx)}
                    className={`rounded-[32px] p-4 sm:p-5 border-2 transition-all cursor-pointer select-none flex flex-col justify-between min-h-[200px] backdrop-blur-xl ${
                      isCounted
                        ? 'bg-white/40 border-white shadow-2xl ring-4 ring-yellow-300/80'
                        : 'bg-white/20 hover:bg-white/30 border-dashed border-white/40 shadow-lg'
                    }`}
                  >
                    {/* Bag Title & Count Badge */}
                    <div className="flex items-center justify-between border-b border-white/20 pb-2.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🛍️</span>
                        <span className="font-black text-xs sm:text-sm text-white drop-shadow-xs">
                          {isAr ? `الكيس رقم ${formatNumber(bagIdx + 1, soundConfig.numeralSystem)}` : `Bag #${bagIdx + 1}`}
                        </span>
                      </div>
                      {isCounted && (
                        <span className="text-xs font-black bg-white/95 text-pink-600 px-2.5 py-0.5 rounded-full shadow-md border border-white">
                          {isAr ? `المجموع: ${formatNumber(runningTotalForThis, soundConfig.numeralSystem)}` : `Total: ${runningTotalForThis}`}
                        </span>
                      )}
                    </div>

                    {/* Items inside this Bag */}
                    <div className="flex-1 flex flex-wrap items-center justify-center gap-2.5 p-3 bg-white/20 rounded-2xl border border-white/30 shadow-inner">
                      {Array.from({ length: itemsPerBag }).map((_, itemIdx) => (
                        <motion.div
                          key={`bag_${bagIdx}_item_${itemIdx}`}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: isCounted ? 1.12 : 1 }}
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl border-2 backdrop-blur-xl ${
                            isCounted
                              ? 'bg-white/60 border-white shadow-md'
                              : 'bg-white/25 border-white/30 opacity-70'
                          }`}
                        >
                          {itemTheme.emoji}
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom Status */}
                    <div className="mt-2.5 text-center text-xs font-black">
                      {isCounted ? (
                        <span className="text-white flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {isAr ? `يحتوي على ${formatNumber(itemsPerBag, soundConfig.numeralSystem)} عناصر` : `${itemsPerBag} items counted`}
                        </span>
                      ) : (
                        <span className="text-white/70">
                          {isAr ? 'اضغط لعدّ هذا الكيس' : 'Click to count this bag'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 2: Array / Grid View (المصفوفة الشبكية) */}
        {viewMode === 'grid' && (
          <div className="flex flex-col items-center justify-center space-y-4 p-5 sm:p-6 bg-white/20 rounded-3xl border border-white/35 shadow-inner">
            <p className="text-xs sm:text-sm font-black text-white text-center drop-shadow-xs">
              {isAr
                ? `المصفوفة: ${formatNumber(numBags, soundConfig.numeralSystem)} صفوف × ${formatNumber(itemsPerBag, soundConfig.numeralSystem)} أعمدة`
                : `Array: ${numBags} rows × ${itemsPerBag} columns`}
            </p>

            {/* Grid Container */}
            <div
              className="grid gap-3 p-5 bg-white/25 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40"
              style={{
                gridTemplateColumns: `repeat(${itemsPerBag}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: numBags }).map((_, r) =>
                Array.from({ length: itemsPerBag }).map((_, c) => {
                  const cellNumber = r * itemsPerBag + c + 1;
                  return (
                    <motion.div
                      key={`grid_${r}_${c}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: (r * itemsPerBag + c) * 0.03 }}
                      className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-white/40 border-2 border-white/60 flex flex-col items-center justify-center shadow-lg relative backdrop-blur-xl"
                    >
                      <span className="text-2xl sm:text-3xl">{itemTheme.emoji}</span>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white font-black text-[10px] flex items-center justify-center shadow-md border border-white">
                        {formatNumber(cellNumber, soundConfig.numeralSystem)}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>

            <p className="text-xs font-black text-white bg-white/30 backdrop-blur-xl px-5 py-2 rounded-full border border-white/40 shadow-md">
              {isAr
                ? `مساحة المصفوفة = ${formatNumber(numBags, soundConfig.numeralSystem)} × ${formatNumber(itemsPerBag, soundConfig.numeralSystem)} = ${formatNumber(totalProduct, soundConfig.numeralSystem)}`
                : `Area = ${numBags} × ${itemsPerBag} = ${totalProduct}`}
            </p>
          </div>
        )}

        {/* Victory Notification */}
        {isAllBagsCounted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 sm:p-5 rounded-3xl bg-white/30 backdrop-blur-2xl border-2 border-white/50 text-white flex items-center justify-between flex-wrap gap-3 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h5 className="font-black text-sm sm:text-base drop-shadow-xs">
                  {isAr ? 'ممتاز يا بطل الضرب!' : 'Awesome Multiplication Master!'}
                </h5>
                <p className="text-xs text-white/90 font-medium">
                  {isAr
                    ? `اكتشفت أن ${numBags} أكياس في كل منها ${itemsPerBag} تساوي دائماً ${totalProduct}!`
                    : `You discovered that ${numBags} bags of ${itemsPerBag} always equal ${totalProduct}!`}
                </p>
              </div>
            </div>
            <div className="text-xs font-black bg-white/95 text-pink-600 px-4 py-2 rounded-2xl shadow-xl border border-white">
              +1 ⭐ {isAr ? 'نجمة ذهبية' : 'Star Earned'}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
