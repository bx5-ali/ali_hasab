import React, { useState, useEffect } from 'react';
import {
  ItemTheme,
  LessonQuestion,
  PathLesson,
  RewardModalData,
  SoundConfig,
  UserStats,
} from '../types';
import { ITEM_THEMES, formatNumber } from '../utils/mathData';
import { soundManager, PRAISE_PHRASES_AR, PRAISE_PHRASES_EN } from '../utils/audio';
import { DuoMascot, MascotMood } from './DuoMascot';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Heart,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Zap,
  Flame,
  RotateCcw,
  Star,
} from 'lucide-react';

interface DuoLessonSessionProps {
  lesson: PathLesson;
  soundConfig: SoundConfig;
  stats: UserStats;
  onCompleteLesson: (lessonId: string, earnedStars: number, earnedXp: number) => void;
  onExit: () => void;
  onRewardStar: (rewardData?: Partial<RewardModalData>) => void;
  onIncrementStreak: () => void;
  onDeductHeart: () => void;
  itemTheme: ItemTheme;
}

export const DuoLessonSession: React.FC<DuoLessonSessionProps> = ({
  lesson,
  soundConfig,
  stats,
  onCompleteLesson,
  onExit,
  onRewardStar,
  onIncrementStreak,
  onDeductHeart,
  itemTheme,
}) => {
  const isAr = soundConfig.language === 'ar';
  const questions = lesson.questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [equationTokens, setEquationTokens] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedLeftPair, setSelectedLeftPair] = useState<string | null>(null);
  const [selectedRightPair, setSelectedRightPair] = useState<string | null>(null);

  // Status: 'answering' | 'correct' | 'incorrect' | 'completed' | 'game_over'
  const [status, setStatus] = useState<'answering' | 'correct' | 'incorrect' | 'completed' | 'game_over'>('answering');
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotSpeech, setMascotSpeech] = useState<string>('');
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [shakeHearts, setShakeHearts] = useState(false);

  const currentQ: LessonQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  // Speak question on load if voice enabled
  useEffect(() => {
    if (status === 'answering' && currentQ) {
      setMascotMood('thinking');
      const textToSpeak = isAr ? currentQ.questionAr : currentQ.questionEn;
      setMascotSpeech(textToSpeak);

      if (soundConfig.voiceSpeechEnabled) {
        soundManager.speak(textToSpeak, isAr ? 'ar' : 'en');
      }
    }
  }, [currentIndex, isAr, soundConfig.voiceSpeechEnabled, status]);

  // Reset state per question
  useEffect(() => {
    setSelectedOption(null);
    setEquationTokens([]);
    setMatchedPairs([]);
    setSelectedLeftPair(null);
    setSelectedRightPair(null);
    setStatus('answering');
  }, [currentIndex]);

  const handleSpeakQuestion = () => {
    if (!currentQ) return;
    const textToSpeak = isAr ? currentQ.questionAr : currentQ.questionEn;
    soundManager.speak(textToSpeak, isAr ? 'ar' : 'en');
  };

  // Multiple Choice / True-False selection
  const handleSelectOption = (opt: any) => {
    if (status !== 'answering') return;
    soundManager.playClick();
    setSelectedOption(opt);
  };

  // Equation block builder click
  const handleAddEquationPiece = (piece: string) => {
    if (status !== 'answering') return;
    soundManager.playPop();
    setEquationTokens((prev) => [...prev, piece]);
  };

  const handleRemoveEquationPiece = (indexToRemove: number) => {
    if (status !== 'answering') return;
    soundManager.playRemove();
    setEquationTokens((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Pair Matching Logic
  const handlePairClick = (side: 'left' | 'right', id: string) => {
    if (status !== 'answering') return;
    soundManager.playClick();

    if (side === 'left') {
      setSelectedLeftPair(id);
      if (selectedRightPair) {
        checkPairMatch(id, selectedRightPair);
      }
    } else {
      setSelectedRightPair(id);
      if (selectedLeftPair) {
        checkPairMatch(selectedLeftPair, id);
      }
    }
  };

  const checkPairMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      soundManager.playPop();
      const updated = [...matchedPairs, leftId];
      setMatchedPairs(updated);
      setSelectedLeftPair(null);
      setSelectedRightPair(null);

      if (currentQ.matchingPairs && updated.length === currentQ.matchingPairs.length) {
        setSelectedOption('matched_all');
      }
    } else {
      soundManager.playTryAgain();
      setTimeout(() => {
        setSelectedLeftPair(null);
        setSelectedRightPair(null);
      }, 400);
    }
  };

  // Check Answer Handler (Duolingo style)
  const handleCheckAnswer = () => {
    if (status !== 'answering') return;

    let isCorrect = false;

    if (currentQ.type === 'multiple_choice' || currentQ.type === 'visual_count' || currentQ.type === 'fill_blank') {
      isCorrect = String(selectedOption) === String(currentQ.correctAnswer);
    } else if (currentQ.type === 'true_false') {
      isCorrect = selectedOption === currentQ.correctAnswer;
    } else if (currentQ.type === 'equation_build') {
      const builtEquation = equationTokens.join('');
      const target = currentQ.targetEquation ? currentQ.targetEquation.join('') : String(currentQ.correctAnswer);
      isCorrect = builtEquation === target;
    } else if (currentQ.type === 'match_pairs') {
      isCorrect = selectedOption === 'matched_all';
    }

    if (isCorrect) {
      // Correct!
      setStatus('correct');
      setMascotMood('cheering');
      setCorrectAnswersCount((prev) => prev + 1);

      if (soundConfig.soundFxEnabled) {
        soundManager.playDuoCorrect();
      }

      if (soundConfig.voiceSpeechEnabled) {
        const phrases = isAr ? PRAISE_PHRASES_AR : PRAISE_PHRASES_EN;
        const randomPraise = phrases[Math.floor(Math.random() * phrases.length)];
        setMascotSpeech(randomPraise);
      }
    } else {
      // Wrong!
      setStatus('incorrect');
      setMascotMood('sad');
      setMascotSpeech(isAr ? 'لا بأس! سنتعلم منها 💪' : 'No worries! Keep trying 💪');

      if (soundConfig.soundFxEnabled) {
        soundManager.playDuoWrong();
        soundManager.playHeartLost();
      }

      setShakeHearts(true);
      setTimeout(() => setShakeHearts(false), 800);
      onDeductHeart();

      if (stats.hearts <= 1) {
        setTimeout(() => {
          setStatus('game_over');
        }, 1200);
      }
    }
  };

  // Continue to next question or complete lesson
  const handleContinue = () => {
    soundManager.playClick();

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Lesson Completed!
      setStatus('completed');
      setMascotMood('celebrating');

      // Calculate Stars (3 stars for 100%, 2 stars for >= 70%, 1 star otherwise)
      const ratio = correctAnswersCount / questions.length;
      const earnedStars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;

      if (soundConfig.soundFxEnabled) {
        soundManager.playVictory();
        soundManager.playApplause();
      }

      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#58CC02', '#FFD700', '#FF4B4B', '#1CB0F6', '#FF9600'],
        });
      } catch {
        // silent
      }

      onCompleteLesson(lesson.id, earnedStars, lesson.xpReward);
      onIncrementStreak();
    }
  };

  // Check button disabled state
  const isCheckDisabled = () => {
    if (status !== 'answering') return true;
    if (currentQ.type === 'multiple_choice' || currentQ.type === 'visual_count' || currentQ.type === 'true_false' || currentQ.type === 'fill_blank') {
      return selectedOption === null;
    }
    if (currentQ.type === 'equation_build') {
      return equationTokens.length === 0;
    }
    if (currentQ.type === 'match_pairs') {
      return selectedOption !== 'matched_all';
    }
    return false;
  };

  // Find theme for visual counts
  const qTheme = ITEM_THEMES.find((t) => t.id === currentQ.itemThemeId) || itemTheme;

  // =========================================================================
  // COMPLETED LESSON SUMMARY VIEW
  // =========================================================================
  if (status === 'completed') {
    const accuracy = Math.round((correctAnswersCount / questions.length) * 100);
    const earnedStars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;

    return (
      <div className="min-h-[550px] flex flex-col items-center justify-center p-4 max-w-lg mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-400 w-full"
        >
          <DuoMascot mood="celebrating" size="lg" className="mb-4" />

          <h2 className="text-2xl sm:text-3xl font-black text-emerald-600 mb-1">
            {isAr ? 'أحسنت! أتممت الدرس بنجاح 🎉' : 'Lesson Complete! Awesome 🎉'}
          </h2>
          <p className="text-sm font-bold text-slate-600 mb-6">
            {isAr ? lesson.titleAr : lesson.titleEn}
          </p>

          {/* Stars Display */}
          <div className="flex justify-center gap-3 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: i < earnedStars ? 1.2 : 0.9, rotate: 0 }}
                transition={{ delay: 0.2 + i * 0.2, type: 'spring' }}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center ${
                  i < earnedStars
                    ? 'bg-amber-400 text-yellow-950 shadow-lg border-2 border-white'
                    : 'bg-slate-100 text-slate-300'
                }`}
              >
                <Star
                  className={`w-8 h-8 ${i < earnedStars ? 'fill-yellow-300 text-yellow-950' : 'fill-slate-200 text-slate-300'}`}
                />
              </motion.div>
            ))}
          </div>

          {/* Stats Badges (XP, Accuracy, Streak) */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3">
              <div className="flex items-center justify-center gap-1 text-amber-600 font-black text-xs mb-1">
                <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{isAr ? 'الخبرة' : 'Total XP'}</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-amber-900">
                +{formatNumber(lesson.xpReward, soundConfig.numeralSystem)}
              </span>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3">
              <div className="flex items-center justify-center gap-1 text-emerald-600 font-black text-xs mb-1">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'الدقة' : 'Accuracy'}</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-emerald-900">
                {formatNumber(accuracy, soundConfig.numeralSystem)}%
              </span>
            </div>

            <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-3">
              <div className="flex items-center justify-center gap-1 text-orange-600 font-black text-xs mb-1">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>{isAr ? 'التوالي' : 'Streak'}</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-orange-900">
                +{formatNumber(1, soundConfig.numeralSystem)}
              </span>
            </div>
          </div>

          {/* Back to Path Button (Duolingo 3D Button) */}
          <button
            id="duo-lesson-finish-btn"
            onClick={onExit}
            className="w-full py-4 rounded-2xl bg-[#58CC02] hover:bg-[#46A302] text-white font-black text-lg shadow-[0_5px_0_#388302] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isAr ? 'متابعة المسار 🚀' : 'Continue Learning Path 🚀'}</span>
            {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // GAME OVER (OUT OF HEARTS) VIEW
  // =========================================================================
  if (status === 'game_over') {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-4 max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-rose-400 w-full"
        >
          <DuoMascot mood="sad" size="lg" className="mb-4" />
          <h2 className="text-2xl sm:text-3xl font-black text-rose-600 mb-2">
            {isAr ? 'نفدت القلوب ❤️!' : 'Out of Hearts ❤️!'}
          </h2>
          <p className="text-sm font-bold text-slate-600 mb-6 leading-relaxed">
            {isAr
              ? 'لا تقلق يا بطل! يمكنك مراجعة الأرقام أو إعادة المحاولة لتثبيت المعلومة.'
              : 'Don’t worry! Practice makes perfect. Try again or practice freely.'}
          </p>

          <button
            onClick={() => {
              setCurrentIndex(0);
              setStatus('answering');
            }}
            className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-base shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none transition-all mb-3 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{isAr ? 'إعادة المحاولة مجاناً 🔄' : 'Try Again Free 🔄'}</span>
          </button>

          <button
            onClick={onExit}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm border border-slate-300"
          >
            {isAr ? 'العودة للمسار' : 'Back to Path'}
          </button>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // ACTIVE QUESTION VIEW
  // =========================================================================
  return (
    <div className="max-w-2xl mx-auto flex flex-col min-h-[620px] justify-between select-none">
      {/* 1. DUOLINGO TOP NAVIGATION BAR */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 mb-4 shadow-sm">
        {/* Exit (X) Button */}
        <button
          id="duo-lesson-exit-btn"
          onClick={onExit}
          className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-slate-600 hover:text-rose-600 flex items-center justify-center shadow-xs border border-white transition-transform active:scale-90 cursor-pointer"
          title={isAr ? 'خروج' : 'Exit'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Smooth Animated Green Progress Bar */}
        <div className="flex-1 h-4 sm:h-5 bg-white/60 rounded-full overflow-hidden p-0.5 border border-white shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-[#58CC02] to-[#79E600] rounded-full shadow-[0_2px_4px_rgba(88,204,2,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* Hearts Life Counter with Shake Animation */}
        <motion.div
          animate={shakeHearts ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-2xl border border-rose-200 shadow-xs text-rose-500 font-black text-sm sm:text-base"
        >
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
          <span>{formatNumber(stats.hearts, soundConfig.numeralSystem)}</span>
        </motion.div>

        {/* Sound Voice Toggle */}
        <button
          onClick={handleSpeakQuestion}
          className="w-10 h-10 rounded-2xl bg-white/70 hover:bg-white text-emerald-700 flex items-center justify-center shadow-xs border border-white transition-transform active:scale-90 cursor-pointer"
          title={isAr ? 'قراءة السؤال بصوت عالٍ' : 'Read question'}
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* 2. QUESTION STAGE & MASCOT COMPANION */}
      <div className="flex-1 flex flex-col justify-center my-2">
        {/* Header Question Text */}
        <div className="flex items-start sm:items-center gap-3 mb-4">
          <DuoMascot mood={mascotMood} size="sm" interactive={true} className="shrink-0" />
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-sm border-2 border-emerald-300 flex-1 relative">
            <h3 className="text-base sm:text-xl font-black text-slate-800 leading-snug">
              {isAr ? currentQ.questionAr : currentQ.questionEn}
            </h3>
            {/* Bubble arrow pointing towards mascot */}
            <div
              className={`absolute top-4 ${
                isAr ? '-right-2 border-l-8 border-l-emerald-300' : '-left-2 border-r-8 border-r-emerald-300'
              } w-0 h-0 border-y-6 border-y-transparent`}
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* EXERCISE TYPE 1: VISUAL COUNTING (Apples, Stars, Cars...) */}
        {/* ------------------------------------------------------------- */}
        {currentQ.visualCount && currentQ.visualCount > 0 && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-2 border-amber-200/80 shadow-md mb-5 text-center">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto min-h-[90px]">
              {Array.from({ length: currentQ.visualCount }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring' }}
                  whileHover={{ scale: 1.25, rotate: 10 }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${qTheme.iconBg} flex items-center justify-center text-2xl sm:text-3xl shadow-sm border cursor-pointer select-none`}
                  onClick={() => soundManager.playPop()}
                >
                  {qTheme.emoji}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* EXERCISE TYPE 2: MULTIPLE CHOICE & FILL BLANK */}
        {/* ------------------------------------------------------------- */}
        {(currentQ.type === 'multiple_choice' ||
          currentQ.type === 'visual_count' ||
          currentQ.type === 'fill_blank') &&
          currentQ.options && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectOption(opt)}
                    className={`py-4 sm:py-5 px-4 rounded-2xl font-black text-xl sm:text-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border-2 ${
                      isSelected
                        ? 'bg-sky-100 text-sky-900 border-sky-400 shadow-[0_5px_0_#0284c7] -translate-y-1'
                        : 'bg-white text-slate-800 border-slate-200 shadow-[0_5px_0_#cbd5e1] hover:border-sky-300'
                    }`}
                  >
                    <span>{formatNumber(opt, soundConfig.numeralSystem)}</span>
                  </motion.button>
                );
              })}
            </div>
          )}

        {/* ------------------------------------------------------------- */}
        {/* EXERCISE TYPE 3: TRUE OR FALSE */}
        {/* ------------------------------------------------------------- */}
        {currentQ.type === 'true_false' && currentQ.options && (
          <div className="grid grid-cols-2 gap-4 my-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isYes = idx === 0;
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectOption(opt)}
                  className={`py-5 px-4 rounded-2xl font-black text-lg sm:text-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-2 ${
                    isSelected
                      ? isYes
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-400 shadow-[0_5px_0_#059669] -translate-y-1'
                        : 'bg-rose-100 text-rose-950 border-rose-400 shadow-[0_5px_0_#e11d48] -translate-y-1'
                      : 'bg-white text-slate-800 border-slate-200 shadow-[0_5px_0_#cbd5e1]'
                  }`}
                >
                  <span>{isYes ? '✅' : '❌'}</span>
                  <span>{opt}</span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* EXERCISE TYPE 4: EQUATION BLOCK BUILDER */}
        {/* ------------------------------------------------------------- */}
        {currentQ.type === 'equation_build' && currentQ.equationPieces && (
          <div className="my-2 flex flex-col gap-4">
            {/* Target Slots Area */}
            <div className="min-h-[70px] bg-white/70 backdrop-blur-md rounded-2xl border-2 border-dashed border-sky-300 p-3 flex flex-wrap items-center justify-center gap-2 shadow-inner">
              {equationTokens.length === 0 ? (
                <span className="text-xs sm:text-sm font-bold text-slate-400">
                  {isAr ? 'اضغط على البطاقات بالأسفل لبناء المعادلة' : 'Tap tokens below to build equation'}
                </span>
              ) : (
                equationTokens.map((token, i) => (
                  <motion.button
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => handleRemoveEquationPiece(i)}
                    className="px-4 py-2 bg-sky-500 hover:bg-rose-500 text-white font-black text-lg rounded-xl shadow-[0_3px_0_#0369a1] active:translate-y-0.5 cursor-pointer flex items-center gap-1"
                  >
                    <span>{formatNumber(token, soundConfig.numeralSystem)}</span>
                  </motion.button>
                ))
              )}
            </div>

            {/* Available Tokens Pool */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {currentQ.equationPieces.map((piece, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAddEquationPiece(piece)}
                  className="px-4 py-3 bg-white text-slate-800 font-black text-lg sm:text-xl rounded-2xl border-2 border-slate-200 shadow-[0_4px_0_#cbd5e1] hover:border-sky-400 active:translate-y-1 active:shadow-none cursor-pointer"
                >
                  <span>{formatNumber(piece, soundConfig.numeralSystem)}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* EXERCISE TYPE 5: PAIR MATCHING */}
        {/* ------------------------------------------------------------- */}
        {currentQ.type === 'match_pairs' && currentQ.matchingPairs && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 my-2">
            {/* Left Column */}
            <div className="flex flex-col gap-2.5">
              {currentQ.matchingPairs.map((pair) => {
                const isMatched = matchedPairs.includes(pair.id);
                const isSelected = selectedLeftPair === pair.id;

                return (
                  <button
                    key={`l_${pair.id}`}
                    disabled={isMatched}
                    onClick={() => handlePairClick('left', pair.id)}
                    className={`py-3.5 px-3 rounded-2xl font-black text-base sm:text-lg border-2 transition-all cursor-pointer text-center ${
                      isMatched
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300 opacity-50'
                        : isSelected
                        ? 'bg-sky-100 text-sky-900 border-sky-500 shadow-[0_4px_0_#0284c7] -translate-y-0.5'
                        : 'bg-white text-slate-800 border-slate-200 shadow-[0_4px_0_#cbd5e1]'
                    }`}
                  >
                    <span>{formatNumber(pair.left, soundConfig.numeralSystem)}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-2.5">
              {currentQ.matchingPairs.map((pair) => {
                const isMatched = matchedPairs.includes(pair.id);
                const isSelected = selectedRightPair === pair.id;

                return (
                  <button
                    key={`r_${pair.id}`}
                    disabled={isMatched}
                    onClick={() => handlePairClick('right', pair.id)}
                    className={`py-3.5 px-3 rounded-2xl font-black text-base sm:text-lg border-2 transition-all cursor-pointer text-center ${
                      isMatched
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300 opacity-50'
                        : isSelected
                        ? 'bg-sky-100 text-sky-900 border-sky-500 shadow-[0_4px_0_#0284c7] -translate-y-0.5'
                        : 'bg-white text-slate-800 border-slate-200 shadow-[0_4px_0_#cbd5e1]'
                    }`}
                  >
                    <span>{formatNumber(pair.right, soundConfig.numeralSystem)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. DUOLINGO SIGNATURE BOTTOM ACTION SHEET */}
      <div className="mt-4 pt-2">
        <AnimatePresence mode="wait">
          {status === 'answering' ? (
            <motion.div
              key="check_bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50"
            >
              <button
                id="duo-check-answer-btn"
                disabled={isCheckDisabled()}
                onClick={handleCheckAnswer}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all cursor-pointer ${
                  isCheckDisabled()
                    ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                    : 'bg-[#58CC02] hover:bg-[#46A302] text-white shadow-[0_5px_0_#388302] active:translate-y-1 active:shadow-none'
                }`}
              >
                <span>{isAr ? 'تحقق من الإجابة' : 'Check Answer'}</span>
              </button>
            </motion.div>
          ) : status === 'correct' ? (
            <motion.div
              key="correct_sheet"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="p-4 sm:p-5 bg-emerald-100/95 border-2 border-emerald-400 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 text-center sm:text-start">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-emerald-950">
                    {isAr ? 'ممتاز! إجابة صحيحة 🎉' : 'Awesome! Correct 🎉'}
                  </h4>
                  {currentQ.explanationAr && (
                    <p className="text-xs sm:text-sm font-bold text-emerald-800 mt-0.5">
                      {isAr ? currentQ.explanationAr : currentQ.explanationEn}
                    </p>
                  )}
                </div>
              </div>

              <button
                id="duo-correct-continue-btn"
                onClick={handleContinue}
                className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-[#58CC02] hover:bg-[#46A302] text-white font-black text-base shadow-[0_4px_0_#388302] active:translate-y-1 active:shadow-none cursor-pointer"
              >
                <span>{isAr ? 'متابعة' : 'Continue'}</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="incorrect_sheet"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="p-4 sm:p-5 bg-rose-100/95 border-2 border-rose-400 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 text-center sm:text-start">
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-rose-950">
                    {isAr ? 'الإجابة الصحيحة هي:' : 'Correct Answer:'}{' '}
                    <span className="underline">
                      {formatNumber(String(currentQ.correctAnswer), soundConfig.numeralSystem)}
                    </span>
                  </h4>
                  {currentQ.explanationAr && (
                    <p className="text-xs sm:text-sm font-bold text-rose-800 mt-0.5">
                      {isAr ? currentQ.explanationAr : currentQ.explanationEn}
                    </p>
                  )}
                </div>
              </div>

              <button
                id="duo-incorrect-continue-btn"
                onClick={handleContinue}
                className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-base shadow-[0_4px_0_#be123c] active:translate-y-1 active:shadow-none cursor-pointer"
              >
                <span>{isAr ? 'فهمت ذلك' : 'Got it'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
