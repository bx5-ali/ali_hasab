import React, { useState, useEffect, useRef } from 'react';
import { ItemTheme, NumeralSystem, RewardModalData, SoundConfig } from '../types';
import { formatNumber, FRIEND_CHARACTERS } from '../utils/mathData';
import { soundManager } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Users,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  Play,
  Share2,
  Gift,
} from 'lucide-react';

interface DivisionModuleProps {
  itemTheme: ItemTheme;
  soundConfig: SoundConfig;
  onRewardStar: (rewardData?: Partial<RewardModalData>) => void;
}

export const DivisionModule: React.FC<DivisionModuleProps> = ({
  itemTheme,
  soundConfig,
  onRewardStar,
}) => {
  const isAr = soundConfig.language === 'ar';

  // Division parameters: Total Dividend (e.g. 12) ÷ Divisor Friends (e.g. 3)
  const [totalItems, setTotalItems] = useState<number>(12);
  const [numFriends, setNumFriends] = useState<number>(3);

  // Distribution State: map of friend index -> count of items given
  const [allocations, setAllocations] = useState<number[]>([0, 0, 0]);
  const [isAutoDistributing, setIsAutoDistributing] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const allocatedCount = allocations.reduce((sum, val) => sum + val, 0);
  const remainingInPool = totalItems - allocatedCount;
  const targetPerFriend = Math.floor(totalItems / numFriends);
  const remainder = totalItems % numFriends;

  // Check if distribution is completely and fairly done
  const isFairlyCompleted =
    remainingInPool === 0 &&
    allocations.length === numFriends &&
    allocations.every((val) => val === targetPerFriend);

  const activeFriends = FRIEND_CHARACTERS.slice(0, numFriends);

  const presets = [
    { total: 6, friends: 2 },
    { total: 8, friends: 2 },
    { total: 9, friends: 3 },
    { total: 12, friends: 3 },
    { total: 12, friends: 4 },
    { total: 15, friends: 3 },
    { total: 16, friends: 4 },
  ];

  // Reset division
  const resetDivision = (newTotal?: number, newFriendsCount?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsAutoDistributing(false);
    const tot = newTotal !== undefined ? newTotal : totalItems;
    const fCount = newFriendsCount !== undefined ? newFriendsCount : numFriends;
    setTotalItems(tot);
    setNumFriends(fCount);
    setAllocations(Array(fCount).fill(0));
    if (soundConfig.soundFxEnabled) soundManager.playPop();
  };

  // Give 1 item to a specific friend
  const handleGiveItemToFriend = (friendIndex: number) => {
    if (remainingInPool <= 0) return;

    const newAllocs = [...allocations];
    newAllocs[friendIndex] = (newAllocs[friendIndex] || 0) + 1;
    setAllocations(newAllocs);

    if (soundConfig.soundFxEnabled) {
      soundManager.playPop();
    }

    const newAllocated = newAllocs.reduce((s, v) => s + v, 0);
    if (newAllocated === totalItems) {
      checkCompletion(newAllocs);
    }
  };

  // Take 1 item back from a friend
  const handleTakeBackItem = (friendIndex: number) => {
    if ((allocations[friendIndex] || 0) <= 0) return;
    const newAllocs = [...allocations];
    newAllocs[friendIndex] -= 1;
    setAllocations(newAllocs);
    if (soundConfig.soundFxEnabled) soundManager.playRemove();
  };

  // Check victory condition
  const checkCompletion = (currentAllocs: number[]) => {
    const isFair = currentAllocs.every((val) => val === targetPerFriend);
    if (isFair) {
      if (soundConfig.soundFxEnabled) {
        setTimeout(() => soundManager.playVictory(), 200);
      }
      if (soundConfig.voiceSpeechEnabled) {
        setTimeout(() => {
          const victoryPhrase = isAr
            ? `أحسنت! ${totalItems} تقسيم ${numFriends} يساوي ${targetPerFriend}`
            : `Awesome! ${totalItems} divided by ${numFriends} equals ${targetPerFriend}`;
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
        titleAr: 'بطل التوزيع العادل!',
        titleEn: 'Fair Share Champion!',
        detailAr: `${formatNumber(totalItems, soundConfig.numeralSystem)} ÷ ${formatNumber(numFriends, soundConfig.numeralSystem)} = ${formatNumber(targetPerFriend, soundConfig.numeralSystem)} (${formatNumber(targetPerFriend, soundConfig.numeralSystem)} ${itemTheme.nameAr} لكل صديق بالتساوي)`,
        detailEn: `${totalItems} ÷ ${numFriends} = ${targetPerFriend} (${targetPerFriend} ${itemTheme.nameEn} per friend equally)`,
        bonusLabelAr: 'قسمة عادلة متساوية 100%',
        bonusLabelEn: '100% Equal Distribution',
        onNext: () => {
          const options = [
            { total: 6, friends: 2 },
            { total: 6, friends: 3 },
            { total: 8, friends: 2 },
            { total: 8, friends: 4 },
            { total: 10, friends: 2 },
            { total: 12, friends: 3 },
            { total: 12, friends: 4 },
          ];
          const randomOpt = options[Math.floor(Math.random() * options.length)];
          resetDivision(randomOpt.total, randomOpt.friends);
        },
        onRetry: () => {
          resetDivision();
        },
      });
    }
  };

  // Automated Step-by-Step Round Robin Distribution (1 to friend A, 1 to friend B, 1 to friend C, repeat)
  const startStepByStepDistribution = () => {
    if (isAutoDistributing || remainingInPool <= 0) return;
    setIsAutoDistributing(true);

    let currentAlloc = [...allocations];
    let nextFriendIdx = 0;

    const step = () => {
      const currentAllocated = currentAlloc.reduce((s, v) => s + v, 0);
      if (currentAllocated < totalItems) {
        currentAlloc[nextFriendIdx] += 1;
        setAllocations([...currentAlloc]);
        if (soundConfig.soundFxEnabled) soundManager.playPop();

        nextFriendIdx = (nextFriendIdx + 1) % numFriends;
        timerRef.current = setTimeout(step, 450);
      } else {
        setIsAutoDistributing(false);
        checkCompletion(currentAlloc);
      }
    };

    step();
  };

  // Instant Equal Distribution
  const handleInstantShare = () => {
    const equalAllocs = Array(numFriends).fill(targetPerFriend);
    setAllocations(equalAllocs);
    checkCompletion(equalAllocs);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <section className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 text-white shadow-2xl border border-white/35 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none text-9xl font-black">
          ÷
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/30 text-white text-xs font-bold backdrop-blur-md mb-2 border border-white/40 shadow-xs">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              {isAr ? 'المرحلة الرابعة: القسمة (التوزيع العادل بالتساوي)' : 'Stage 4: Division (Fair Sharing)'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-xs">
              {isAr ? 'القسمة: مشاركة الأشياء بالتساوي بين الأصدقاء' : 'Division: Fair Sharing Among Friends'}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm max-w-xl mt-1 font-medium leading-relaxed">
              {isAr
                ? 'القسمة تعني توزيع كمية معينة على مجموعة من الأشخاص بالتساوي دون أن يأخذ أحد أكثر من الآخر.'
                : 'Division means sharing a pool of items equally among a group of friends so everyone gets the exact same amount.'}
            </p>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2 bg-white/25 p-1.5 rounded-2xl backdrop-blur-xl border border-white/40 shadow-lg">
            <button
              id="div-step-distribute-btn"
              onClick={startStepByStepDistribution}
              disabled={isAutoDistributing || remainingInPool <= 0}
              className="flex items-center gap-1.5 bg-white/95 text-pink-600 hover:bg-white disabled:opacity-40 px-4 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md border border-white transition-transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-pink-600" />
              <span>{isAr ? 'توزيع دوري متحرك' : 'Auto Step-Share'}</span>
            </button>
            <button
              id="div-instant-share-btn"
              onClick={handleInstantShare}
              className="flex items-center gap-1.5 bg-white/95 text-pink-600 hover:bg-white px-4 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md border border-white transition-transform active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-yellow-500" />
              <span>{isAr ? 'توزيع فوري عادل' : 'Instant Fair'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Adjusters Bar */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] p-4 shadow-xl border border-white/35 space-y-3 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Total items to divide */}
            <div className="flex items-center gap-2 bg-white/25 border border-white/40 px-3.5 py-1.5 rounded-2xl backdrop-blur-xl shadow-md">
              <span className="text-xs font-black text-white">
                {isAr ? 'العدد الكلي المراد توزيعه (المقسوم):' : 'Total Items:'}
              </span>
              <button
                id="div-tot-minus"
                onClick={() => resetDivision(Math.max(4, totalItems - numFriends), numFriends)}
                className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
              >
                -
              </button>
              <span className="font-black text-lg text-yellow-300 w-6 text-center drop-shadow-xs">
                {formatNumber(totalItems, soundConfig.numeralSystem)}
              </span>
              <button
                id="div-tot-plus"
                onClick={() => resetDivision(Math.min(20, totalItems + numFriends), numFriends)}
                className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
              >
                +
              </button>
            </div>

            <span className="text-2xl font-black text-white drop-shadow-xs">÷</span>

            {/* Number of Friends (Divisor) */}
            <div className="flex items-center gap-2 bg-white/25 border border-white/40 px-3.5 py-1.5 rounded-2xl backdrop-blur-xl shadow-md">
              <span className="text-xs font-black text-white">
                {isAr ? 'عدد الأصدقاء (المقسوم عليه):' : 'Number of Friends:'}
              </span>
              <button
                id="div-friends-minus"
                onClick={() => {
                  const nextF = Math.max(2, numFriends - 1);
                  resetDivision(Math.max(nextF * 2, totalItems), nextF);
                }}
                className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
              >
                -
              </button>
              <span className="font-black text-lg text-yellow-300 w-5 text-center drop-shadow-xs">
                {formatNumber(numFriends, soundConfig.numeralSystem)}
              </span>
              <button
                id="div-friends-plus"
                onClick={() => {
                  const nextF = Math.min(5, numFriends + 1);
                  resetDivision(Math.max(nextF * 2, totalItems), nextF);
                }}
                className="w-7 h-7 rounded-xl bg-white/30 border border-white/40 text-white font-black hover:bg-white/50 flex items-center justify-center transition-transform active:scale-90"
              >
                +
              </button>
            </div>
          </div>

          {/* Reset button */}
          <button
            id="div-reset-btn"
            onClick={() => resetDivision()}
            className="flex items-center gap-1.5 bg-white/30 hover:bg-white/50 text-white px-3.5 py-2 rounded-2xl text-xs font-black backdrop-blur-xl border border-white/40 shadow-md transition-all active:scale-90"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة التوزيع' : 'Reset Share'}</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar text-xs">
          <span className="text-white/80 font-bold ml-1">{isAr ? 'أمثلة جاهزة:' : 'Presets:'}</span>
          {presets.map((p, i) => (
            <button
              key={i}
              id={`div-preset-${p.total}-${p.friends}`}
              onClick={() => resetDivision(p.total, p.friends)}
              className={`px-3 py-1 rounded-xl border font-black transition-all backdrop-blur-xl ${
                totalItems === p.total && numFriends === p.friends
                  ? 'bg-white/95 text-pink-600 border-white shadow-md scale-105'
                  : 'bg-white/20 text-white border-white/30 hover:bg-white/35'
              }`}
            >
              {formatNumber(p.total, soundConfig.numeralSystem)} ÷ {formatNumber(p.friends, soundConfig.numeralSystem)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 shadow-2xl border border-white/35 space-y-6 text-white">
        {/* Dynamic Formula Display */}
        <div className="flex flex-col items-center justify-center gap-2 bg-white/30 backdrop-blur-xl border-2 border-white/50 py-4 px-6 rounded-3xl shadow-xl max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/40 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/60 shadow-md">
              <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-xs">
                {formatNumber(totalItems, soundConfig.numeralSystem)}
              </span>
              <span className="text-xs text-yellow-200 font-bold">
                {isAr ? itemTheme.nameAr : itemTheme.nameEn}
              </span>
            </div>

            <span className="text-2xl sm:text-3xl font-black text-yellow-300">÷</span>

            <div className="flex items-center gap-1.5 bg-white/40 backdrop-blur-xl px-3.5 py-1.5 rounded-2xl border border-white/60 shadow-md">
              <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-xs">
                {formatNumber(numFriends, soundConfig.numeralSystem)}
              </span>
              <span className="text-xs text-yellow-200 font-bold">
                {isAr ? 'أصدقاء' : 'friends'}
              </span>
            </div>

            <span className="text-2xl sm:text-3xl font-black text-white/80">=</span>

            <motion.div
              key={`${targetPerFriend}_${isFairlyCompleted}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`px-4 py-1.5 rounded-2xl border-2 flex items-center gap-2 shadow-xl ${
                isFairlyCompleted
                  ? 'bg-white/95 text-pink-600 border-white ring-4 ring-yellow-300/80 scale-105'
                  : 'bg-white/40 text-white border-white/50'
              }`}
            >
              <span className="text-2xl sm:text-3xl font-black">
                {formatNumber(targetPerFriend, soundConfig.numeralSystem)}
              </span>
              <span className="text-xs font-black opacity-90">
                {isAr ? 'لكل طفل' : 'per friend'}
              </span>
            </motion.div>
          </div>

          <p className="text-xs font-black text-white bg-white/25 backdrop-blur-xl px-4 py-1 rounded-full border border-white/40 mt-1 shadow-xs">
            {isAr
              ? `المتبقي في السلة للتوزيع: ${formatNumber(remainingInPool, soundConfig.numeralSystem)} قطعة`
              : `Remaining in basket to share: ${remainingInPool}`}
          </p>
        </div>

        {/* Central Item Basket (Items Waiting to be shared) */}
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-5 border-2 border-dashed border-white/50 flex flex-col items-center justify-center min-h-[140px] shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-yellow-300" />
            <span className="text-xs sm:text-sm font-black text-white drop-shadow-xs">
              {isAr ? 'سلة العناصر الرئيسية (انقر لتوزيعها على الأصدقاء أدناه)' : 'Main Pool (Share items with friends below)'}
            </span>
          </div>

          {/* Items in Pool */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-xl">
            <AnimatePresence>
              {Array.from({ length: remainingInPool }).map((_, idx) => (
                <motion.div
                  key={`pool_item_${idx}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, y: 30 }}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/40 border-2 border-white/60 shadow-lg flex items-center justify-center text-2xl backdrop-blur-xl"
                >
                  {itemTheme.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
            {remainingInPool === 0 && (
              <span className="text-xs font-black text-white bg-white/30 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/50 flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {isAr ? 'تم توزيع جميع العناصر بنجاح!' : 'All items distributed!'}
              </span>
            )}
          </div>
        </div>

        {/* Friends & Their Bowls (Recipient Areas) */}
        <div>
          <h4 className="text-xs font-black text-white mb-3 flex items-center gap-1.5 drop-shadow-xs">
            <Users className="w-4 h-4 text-yellow-300" />
            {isAr ? 'أطباق الأصدقاء (اضغط على زر + لإعطاء قطعة، أو - للاسترجاع):' : 'Friends Plates (Tap + to give, - to return):'}
          </h4>

          <div
            className={`grid gap-4 ${
              numFriends === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : numFriends === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : numFriends === 4
                ? 'grid-cols-2 sm:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-5'
            }`}
          >
            {activeFriends.map((friend, fIdx) => {
              const friendCount = allocations[fIdx] || 0;
              const isTargetReached = friendCount === targetPerFriend && remainingInPool === 0;

              return (
                <div
                  key={friend.id}
                  id={`friend-card-${fIdx}`}
                  className={`rounded-[32px] p-4 border-2 transition-all flex flex-col justify-between min-h-[230px] backdrop-blur-xl ${
                    isTargetReached
                      ? 'bg-white/40 border-white shadow-2xl ring-4 ring-yellow-300/80'
                      : 'bg-white/20 border-white/40 shadow-lg'
                  }`}
                >
                  {/* Friend Header */}
                  <div className="flex items-center justify-between border-b border-white/20 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl animate-bounce-gentle">{friend.avatar}</span>
                      <div>
                        <h5 className="font-black text-xs sm:text-sm text-white drop-shadow-xs">
                          {isAr ? friend.nameAr : friend.nameEn}
                        </h5>
                        <span className="text-[10px] text-yellow-200 font-bold">
                          {isAr ? 'الصحن الخاص' : 'Plate'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full shadow-md ${
                        friendCount === targetPerFriend
                          ? 'bg-white/95 text-pink-600 border border-white'
                          : 'bg-white/30 text-white'
                      }`}
                    >
                      {formatNumber(friendCount, soundConfig.numeralSystem)}
                    </span>
                  </div>

                  {/* Friend's Bowl Items */}
                  <div className="flex-1 flex flex-wrap items-center justify-center gap-2 p-2.5 bg-white/20 rounded-2xl border border-white/30 min-h-[95px] shadow-inner">
                    <AnimatePresence>
                      {Array.from({ length: friendCount }).map((_, itemI) => (
                        <motion.div
                          key={`f_${fIdx}_item_${itemI}`}
                          initial={{ scale: 0, y: -20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0 }}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/50 border border-white/60 flex items-center justify-center text-xl shadow-md backdrop-blur-xl"
                        >
                          {itemTheme.emoji}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {friendCount === 0 && (
                      <span className="text-[11px] font-bold text-white/70 italic">
                        {isAr ? 'في انتظار حصته...' : 'Waiting for share...'}
                      </span>
                    )}
                  </div>

                  {/* Plus / Minus Buttons */}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <button
                      id={`give-friend-btn-${fIdx}`}
                      onClick={() => handleGiveItemToFriend(fIdx)}
                      disabled={remainingInPool <= 0}
                      className="flex-1 py-2 rounded-xl bg-white/95 hover:bg-white disabled:opacity-40 text-pink-600 text-xs font-black shadow-md border border-white transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span>+ {isAr ? 'إعطاء' : 'Give'}</span>
                    </button>
                    <button
                      id={`take-friend-btn-${fIdx}`}
                      onClick={() => handleTakeBackItem(fIdx)}
                      disabled={friendCount <= 0}
                      className="px-3 py-2 rounded-xl bg-white/30 hover:bg-white/50 disabled:opacity-40 text-white text-xs font-black border border-white/40 transition-all active:scale-90"
                      title={isAr ? 'استرجاع قطعة' : 'Return item'}
                    >
                      -
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Victory Card */}
        {isFairlyCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-3xl bg-white/30 backdrop-blur-2xl border-2 border-white/50 text-white flex items-center justify-between flex-wrap gap-3 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <h5 className="font-black text-sm sm:text-base drop-shadow-xs">
                  {isAr ? 'توزيع عادل ومثالي 100%!' : 'Perfect Fair Share!'}
                </h5>
                <p className="text-xs text-white/90 font-medium">
                  {isAr
                    ? `حصل كل صديق من الـ ${numFriends} على ${targetPerFriend} قطع بالضبط. ${totalItems} ÷ ${numFriends} = ${targetPerFriend}!`
                    : `Every friend received exactly ${targetPerFriend} items. ${totalItems} ÷ ${numFriends} = ${targetPerFriend}!`}
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
