import React, { useState, useEffect } from 'react';
import { ItemTheme, MathChallenge, MathModuleType, NumeralSystem, RewardModalData, SoundConfig, UserStats } from '../types';
import { generateChallenge, formatNumber } from '../utils/mathData';
import { soundManager, PRAISE_PHRASES_AR, PRAISE_PHRASES_EN } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  HelpCircle,
  Gamepad2,
  Star,
} from 'lucide-react';

interface AdventureQuizProps {
  itemTheme: ItemTheme;
  soundConfig: SoundConfig;
  stats: UserStats;
  onRewardStar: (rewardData?: Partial<RewardModalData>) => void;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
  onUnlockBadge: (badge: string) => void;
}

export const AdventureQuiz: React.FC<AdventureQuizProps> = ({
  itemTheme,
  soundConfig,
  stats,
  onRewardStar,
  onIncrementStreak,
  onResetStreak,
  onUnlockBadge,
}) => {
  const isAr = soundConfig.language === 'ar';
  const [selectedTopic, setSelectedTopic] = useState<MathModuleType>('counting');
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [currentChallenge, setCurrentChallenge] = useState<MathChallenge>(() =>
    generateChallenge('counting', 1)
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Generate a new challenge when topic or level changes
  const loadNewChallenge = (topic = selectedTopic, level = difficultyLevel) => {
    const nextCh = generateChallenge(topic, level);
    setCurrentChallenge(nextCh);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleSelectTopic = (topic: MathModuleType) => {
    setSelectedTopic(topic);
    loadNewChallenge(topic, difficultyLevel);
    if (soundConfig.soundFxEnabled) soundManager.playPop();
  };

  const handleSelectLevel = (level: number) => {
    setDifficultyLevel(level);
    loadNewChallenge(selectedTopic, level);
    if (soundConfig.soundFxEnabled) soundManager.playPop();
  };

  const handleAnswerClick = (ans: number) => {
    if (isAnswered) return;

    setSelectedAnswer(ans);
    setIsAnswered(true);

    const correct = ans === currentChallenge.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      if (soundConfig.soundFxEnabled) soundManager.playVictory();
      if (soundConfig.voiceSpeechEnabled) {
        const praiseArray = isAr ? PRAISE_PHRASES_AR : PRAISE_PHRASES_EN;
        const randomPraise = praiseArray[Math.floor(Math.random() * praiseArray.length)];
        soundManager.speak(randomPraise, isAr ? 'ar' : 'en');
      }
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {
        // silent
      }

      const earnedStars = showHint ? 2 : 3;
      onRewardStar({
        starsEarned: earnedStars,
        titleAr: earnedStars === 3 ? 'إجابة مذهلة وعبقرية!' : 'إجابة صحيحة يا بطل!',
        titleEn: earnedStars === 3 ? 'Brilliant Answer!' : 'Good Job, Champion!',
        detailAr: currentChallenge.questionAr,
        detailEn: currentChallenge.questionEn,
        bonusLabelAr: stats.streak >= 2 ? `مضاعف توالي ${formatNumber(stats.streak + 1, soundConfig.numeralSystem)} 🔥` : 'حل دقيق ومتقن',
        bonusLabelEn: stats.streak >= 2 ? `Streak Boost ${stats.streak + 1} 🔥` : 'Accurate Solution',
        onNext: () => {
          loadNewChallenge(selectedTopic, difficultyLevel);
        },
        onRetry: () => {
          loadNewChallenge(selectedTopic, difficultyLevel);
        },
      });
      onIncrementStreak();

      // Check badges unlock
      if (stats.completedChallenges + 1 >= 5) onUnlockBadge('math_champ');
      if (stats.streak + 1 >= 3) onUnlockBadge('streak_star');
      if (selectedTopic === 'multiplication') onUnlockBadge('mult_wizard');
      if (selectedTopic === 'division') onUnlockBadge('div_master');
    } else {
      if (soundConfig.soundFxEnabled) soundManager.playTryAgain();
      if (soundConfig.voiceSpeechEnabled) {
        soundManager.speak(isAr ? 'حاول مرة أخرى يا بطل!' : 'Try again!', isAr ? 'ar' : 'en');
      }
      onResetStreak();
    }
  };

  const badgesList = [
    { id: 'math_champ', titleAr: 'بطل الحساب', titleEn: 'Math Champion', icon: '🏆', req: '5 أسئلة ناجحة' },
    { id: 'streak_star', titleAr: 'نجم التوالي 🔥', titleEn: 'Streak Star', icon: '⚡', req: '3 إجابات متتالية' },
    { id: 'mult_wizard', titleAr: 'ساحر الضرب', titleEn: 'Multiply Wizard', icon: '✨', req: 'إتقان الضرب' },
    { id: 'div_master', titleAr: 'ملك القسمة', titleEn: 'Division King', icon: '👑', req: 'إتقان التوزيع العادل' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <section className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-6 text-white shadow-2xl border border-white/35 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none text-9xl">
          ⭐
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/30 text-white text-xs font-bold backdrop-blur-md mb-2 border border-white/40 shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-yellow-300" />
              {isAr ? 'ساحة التحدي والألعاب الرياضية' : 'Math Adventure Arena'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-xs">
              {isAr ? 'تحديات ممتعة واختبر مهاراتك الذكية' : 'Exciting Quests & Skill Challenges'}
            </h2>
            <p className="text-white/90 text-xs sm:text-sm max-w-xl mt-1 font-medium leading-relaxed">
              {isAr
                ? 'اختر الموضوع والمستوى، واستخدم الرياضيات البصرية لحل المسألة واجمع النجوم والأوسمة!'
                : 'Choose a topic and level, use visual math helpers, and earn stars & badges!'}
            </p>
          </div>

          {/* Player Stats Summary */}
          <div className="flex items-center gap-2 bg-white/25 p-2 rounded-2xl border border-white/40 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-1.5 bg-white/30 px-3.5 py-1.5 rounded-xl font-black text-sm text-white shadow-xs border border-white/40">
              <span className="text-yellow-300">⭐</span>
              <span>{formatNumber(stats.stars, soundConfig.numeralSystem)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/30 px-3.5 py-1.5 rounded-xl font-black text-sm text-white shadow-xs border border-white/40">
              <Flame className="w-4 h-4 text-yellow-300" />
              <span>{formatNumber(stats.streak, soundConfig.numeralSystem)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Topics & Difficulty Selectors */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] p-4 shadow-xl border border-white/35 space-y-3 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Topic Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'counting', labelAr: 'العدّ', labelEn: 'Counting', icon: '1️⃣' },
              { id: 'addition', labelAr: 'الجمع', labelEn: 'Addition', icon: '➕' },
              { id: 'subtraction', labelAr: 'الطرح', labelEn: 'Subtraction', icon: '➖' },
              { id: 'multiplication', labelAr: 'الضرب', labelEn: 'Multiplication', icon: '✖️' },
              { id: 'division', labelAr: 'القسمة', labelEn: 'Division', icon: '➗' },
            ].map((topic) => (
              <button
                key={topic.id}
                id={`quiz-topic-${topic.id}`}
                onClick={() => handleSelectTopic(topic.id as MathModuleType)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all backdrop-blur-xl ${
                  selectedTopic === topic.id
                    ? 'bg-white/95 text-pink-600 shadow-xl border border-white scale-102'
                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                }`}
              >
                <span>{topic.icon}</span>
                <span>{isAr ? topic.labelAr : topic.labelEn}</span>
              </button>
            ))}
          </div>

          {/* Difficulty Level Buttons */}
          <div className="flex items-center gap-1.5 bg-white/25 border border-white/40 p-1.5 rounded-2xl backdrop-blur-xl">
            <span className="text-xs font-black text-white px-2">
              {isAr ? 'المستوى:' : 'Level:'}
            </span>
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                id={`quiz-level-${lvl}`}
                onClick={() => handleSelectLevel(lvl)}
                className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                  difficultyLevel === lvl
                    ? 'bg-white/95 text-pink-600 shadow-md border border-white scale-105'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {formatNumber(lvl, soundConfig.numeralSystem)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xl border border-white/35 space-y-6 text-white">
        {/* Question Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-black text-white bg-white/30 px-3.5 py-1 rounded-full uppercase tracking-wider border border-white/40 shadow-xs">
            {isAr ? 'السؤال الحالي' : 'Active Question'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white leading-snug drop-shadow-xs">
            {isAr ? currentChallenge.questionAr : currentChallenge.questionEn}
          </h3>
        </div>

        {/* Visual Math Helper / Demonstration for the question */}
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-5 border-2 border-dashed border-white/40 min-h-[160px] flex flex-col items-center justify-center shadow-inner">
          {/* Visual depending on operation */}
          {currentChallenge.operation === 'count' && (
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-md">
              {Array.from({ length: currentChallenge.num1 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-12 h-12 rounded-2xl bg-white/50 border-2 border-white/60 shadow-lg flex items-center justify-center text-2xl backdrop-blur-xl"
                >
                  {itemTheme.emoji}
                </motion.div>
              ))}
            </div>
          )}

          {currentChallenge.operation === '+' && (
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {/* Group 1 */}
              <div className="flex flex-wrap gap-2 p-3.5 rounded-2xl bg-white/30 border border-white/40 backdrop-blur-xl shadow-md">
                {Array.from({ length: currentChallenge.num1 }).map((_, i) => (
                  <span key={i} className="text-2xl">
                    {itemTheme.emoji}
                  </span>
                ))}
              </div>
              <span className="text-3xl font-black text-yellow-300 drop-shadow-xs">+</span>
              {/* Group 2 */}
              <div className="flex flex-wrap gap-2 p-3.5 rounded-2xl bg-white/30 border border-white/40 backdrop-blur-xl shadow-md">
                {Array.from({ length: currentChallenge.num2 }).map((_, i) => (
                  <span key={i} className="text-2xl">
                    {itemTheme.emoji}
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentChallenge.operation === '-' && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md">
              {Array.from({ length: currentChallenge.num1 }).map((_, i) => {
                const isCrossed = i >= currentChallenge.num1 - currentChallenge.num2;
                return (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl relative border-2 backdrop-blur-xl ${
                      isCrossed
                        ? 'bg-white/10 border-dashed border-white/30 opacity-40'
                        : 'bg-white/50 shadow-md border-white/60'
                    }`}
                  >
                    <span>{itemTheme.emoji}</span>
                    {isCrossed && (
                      <span className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-2xl drop-shadow-xs">
                        ✕
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {currentChallenge.operation === '×' && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {Array.from({ length: currentChallenge.num1 }).map((_, bagI) => (
                <div
                  key={bagI}
                  className="p-3.5 rounded-2xl bg-white/30 border border-white/40 flex flex-col items-center gap-1.5 shadow-md backdrop-blur-xl"
                >
                  <span className="text-xs font-black text-yellow-200 drop-shadow-xs">
                    🛍️ {isAr ? `كيس ${formatNumber(bagI + 1, soundConfig.numeralSystem)}` : `Bag ${bagI + 1}`}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: currentChallenge.num2 }).map((_, itemI) => (
                      <span key={itemI} className="text-xl">
                        {itemTheme.emoji}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentChallenge.operation === '÷' && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1.5 flex-wrap justify-center">
                {Array.from({ length: currentChallenge.num1 }).map((_, i) => (
                  <span key={i} className="text-2xl">
                    {itemTheme.emoji}
                  </span>
                ))}
              </div>
              <span className="text-xs font-black text-yellow-200 drop-shadow-xs bg-white/20 px-3 py-1 rounded-full border border-white/30">
                {isAr
                  ? `مطلوب تقسيمها على ${formatNumber(currentChallenge.num2, soundConfig.numeralSystem)} أصدقاء بالتساوي`
                  : `Distribute equally among ${currentChallenge.num2} friends`}
              </span>
            </div>
          )}
        </div>

        {/* Hint button / drawer */}
        <div className="flex justify-center">
          {!showHint ? (
            <button
              id="quiz-show-hint-btn"
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 text-white hover:text-white/90 text-xs font-black bg-white/25 hover:bg-white/35 px-4 py-1.5 rounded-full border border-white/40 transition-all backdrop-blur-xl shadow-xs"
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isAr ? 'أحتاج تلميحاً ذكياً 💡' : 'Need a hint? 💡'}</span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-black text-white bg-white/30 border border-white/40 px-4 py-2 rounded-2xl flex items-center gap-2 max-w-md backdrop-blur-xl shadow-md"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
              <span>{isAr ? currentChallenge.hintAr : currentChallenge.hintEn}</span>
            </motion.div>
          )}
        </div>

        {/* Options Grid (Multiple Choice Answers) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {currentChallenge.options.map((opt) => {
            const isThisSelected = selectedAnswer === opt;
            const isThisCorrect = opt === currentChallenge.correctAnswer;

            let btnStyle = 'bg-white/25 hover:bg-white/40 text-white border-white/40 hover:scale-102 backdrop-blur-xl';

            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'bg-white/95 text-pink-600 border-white ring-4 ring-yellow-300/80 scale-105 shadow-2xl';
              } else if (isThisSelected && !isThisCorrect) {
                btnStyle = 'bg-red-500/80 text-white border-red-300 scale-95 opacity-80';
              } else {
                btnStyle = 'bg-white/10 text-white/40 border-white/20 opacity-40';
              }
            }

            return (
              <motion.button
                key={opt}
                id={`quiz-option-btn-${opt}`}
                onClick={() => handleAnswerClick(opt)}
                disabled={isAnswered}
                whileTap={{ scale: 0.95 }}
                className={`h-16 sm:h-20 rounded-3xl font-black text-2xl sm:text-3xl border-2 transition-all shadow-xl flex items-center justify-center cursor-pointer ${btnStyle}`}
              >
                <span className="drop-shadow-xs">{formatNumber(opt, soundConfig.numeralSystem)}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Feedback & Next Button */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 sm:p-5 rounded-3xl border-2 flex items-center justify-between flex-wrap gap-3 backdrop-blur-2xl shadow-2xl ${
              isCorrect
                ? 'bg-white/35 border-white text-white'
                : 'bg-red-500/40 border-red-300 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              ) : (
                <XCircle className="w-7 h-7 text-red-300" />
              )}
              <div>
                <h4 className="font-black text-sm sm:text-base drop-shadow-xs">
                  {isCorrect
                    ? isAr
                      ? 'إجابة صحيحة وممتازة! ⭐'
                      : 'Correct! Super Job! ⭐'
                    : isAr
                    ? `الإجابة الصحيحة هي: ${formatNumber(currentChallenge.correctAnswer, soundConfig.numeralSystem)}`
                    : `Correct answer is: ${currentChallenge.correctAnswer}`}
                </h4>
                <p className="text-xs text-white/90">
                  {isCorrect
                    ? isAr
                      ? 'واصل التحدي واجمع المزيد من النقاط الذهبية'
                      : 'Keep it up and earn more stars'
                    : isAr
                    ? 'لا بأس، كل محاولة تجعلك أكثر ذكاءً!'
                    : 'No worries, every try makes you smarter!'}
                </p>
              </div>
            </div>

            <button
              id="quiz-next-question-btn"
              onClick={() => loadNewChallenge()}
              className="flex items-center gap-2 bg-white/95 hover:bg-white text-pink-600 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl border border-white transition-transform active:scale-95"
            >
              <span>{isAr ? 'السؤال التالي' : 'Next Question'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </motion.div>
        )}
      </div>

      {/* Badges and Medals Showcase */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] p-5 shadow-2xl border border-white/35 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-yellow-300" />
          <h4 className="font-black text-white text-sm sm:text-base drop-shadow-xs">
            {isAr ? 'أوسمة وإنجازات البطل الصغير:' : 'Hero Badges & Achievements:'}
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badgesList.map((badge) => {
            const isUnlocked = stats.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                id={`badge-card-${badge.id}`}
                className={`p-3.5 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center gap-1 backdrop-blur-xl ${
                  isUnlocked
                    ? 'bg-white/40 border-white shadow-xl ring-2 ring-yellow-300/60'
                    : 'bg-white/10 border-white/20 opacity-50 grayscale'
                }`}
              >
                <span className="text-3xl">{badge.icon}</span>
                <span className="font-black text-xs text-white drop-shadow-xs">
                  {isAr ? badge.titleAr : badge.titleEn}
                </span>
                <span className="text-[10px] text-white/80 font-bold">{badge.req}</span>
                {isUnlocked && (
                  <span className="text-[9px] font-black text-pink-600 bg-white/95 px-2.5 py-0.5 rounded-full mt-0.5 shadow-xs border border-white">
                    {isAr ? 'مكتمل' : 'Unlocked'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
