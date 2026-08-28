/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ItemTheme,
  MathModuleType,
  PathLesson,
  RewardModalData,
  SoundConfig,
  UserStats,
} from './types';
import { ITEM_THEMES } from './utils/mathData';
import { INITIAL_DAILY_QUESTS } from './utils/duoData';
import { Navbar } from './components/Navbar';
import { ItemThemePicker } from './components/ItemThemePicker';
import { DuoPathView } from './components/DuoPathView';
import { DuoLessonSession } from './components/DuoLessonSession';
import { DuoLeaderboard } from './components/DuoLeaderboard';
import { DuoQuestsModal } from './components/DuoQuestsModal';
import { DuoShopModal } from './components/DuoShopModal';
import { CountingModule } from './components/CountingModule';
import { OperationsModule } from './components/OperationsModule';
import { MultiplicationModule } from './components/MultiplicationModule';
import { DivisionModule } from './components/DivisionModule';
import { AdventureQuiz } from './components/AdventureQuiz';
import { StarRewardModal } from './components/StarRewardModal';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { soundManager } from './utils/audio';

export default function App() {
  const [currentModule, setCurrentModule] = useState<MathModuleType>('duo_path');
  const [activeLesson, setActiveLesson] = useState<PathLesson | null>(null);
  const [itemTheme, setItemTheme] = useState<ItemTheme>(ITEM_THEMES[0]); // Apples by default
  const [rewardModal, setRewardModal] = useState<RewardModalData | null>(null);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

  const [soundConfig, setSoundConfig] = useState<SoundConfig>({
    soundFxEnabled: true,
    voiceSpeechEnabled: true,
    language: 'ar',
    numeralSystem: 'eastern',
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('kids_math_duo_stats_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      stars: 12,
      streak: 3,
      completedChallenges: 0,
      unlockedBadges: ['badge_first_star'],
      xp: 85,
      gems: 45,
      hearts: 5,
      maxHearts: 5,
      unlockedLessonIds: ['u1_l1', 'u1_l2'],
      completedLessonIds: [],
      lessonStars: {},
      openedChests: [],
      dailyQuests: INITIAL_DAILY_QUESTS,
      league: 'bronze',
    };
  });

  // Save stats to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem('kids_math_duo_stats_v2', JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  // Update HTML document direction and lang on language toggle
  useEffect(() => {
    document.documentElement.dir = soundConfig.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = soundConfig.language;
  }, [soundConfig.language]);

  const handleRewardStar = (rewardData?: Partial<RewardModalData>) => {
    const stars = rewardData?.starsEarned !== undefined ? rewardData.starsEarned : 3;
    setStats((prev) => {
      // Update daily quest for stars if active
      const updatedQuests = prev.dailyQuests.map((q) => {
        if (q.id === 'quest_3') {
          return { ...q, progress: Math.min(q.target, q.progress + 1) };
        }
        return q;
      });

      return {
        ...prev,
        stars: prev.stars + stars,
        xp: prev.xp + stars * 5,
        completedChallenges: prev.completedChallenges + 1,
        dailyQuests: updatedQuests,
      };
    });

    setRewardModal({
      isOpen: true,
      starsEarned: stars,
      maxStars: rewardData?.maxStars || 3,
      titleAr: rewardData?.titleAr || 'أحسنت يا بطل الرياضيات!',
      titleEn: rewardData?.titleEn || 'Awesome Math Champion!',
      detailAr: rewardData?.detailAr || 'إجابة صحيحة ومتقنة 100%!',
      detailEn: rewardData?.detailEn || '100% Correct and Spot On!',
      bonusLabelAr: rewardData?.bonusLabelAr,
      bonusLabelEn: rewardData?.bonusLabelEn,
      onNext: rewardData?.onNext,
      onRetry: rewardData?.onRetry,
    });
  };

  // Duolingo Lesson Completion Handler
  const handleCompleteLesson = (lessonId: string, earnedStars: number, earnedXp: number) => {
    setStats((prev) => {
      const isFirstTime = !prev.completedLessonIds.includes(lessonId);
      const updatedCompleted = isFirstTime ? [...prev.completedLessonIds, lessonId] : prev.completedLessonIds;
      const updatedLessonStars = { ...prev.lessonStars, [lessonId]: Math.max(earnedStars, prev.lessonStars[lessonId] || 0) };

      // Update quests progress
      const updatedQuests = prev.dailyQuests.map((q) => {
        if (q.id === 'quest_1') {
          return { ...q, progress: Math.min(q.target, q.progress + earnedXp) };
        }
        if (q.id === 'quest_2') {
          return { ...q, progress: Math.min(q.target, q.progress + 1) };
        }
        if (q.id === 'quest_3' && earnedStars >= 3) {
          return { ...q, progress: Math.min(q.target, q.progress + 1) };
        }
        return q;
      });

      return {
        ...prev,
        xp: prev.xp + earnedXp,
        stars: prev.stars + earnedStars,
        gems: prev.gems + (earnedStars * 2),
        completedLessonIds: updatedCompleted,
        lessonStars: updatedLessonStars,
        dailyQuests: updatedQuests,
      };
    });
  };

  // Chest Reward Handler
  const handleOpenChest = (chestId: string, gems: number, stars: number) => {
    setStats((prev) => ({
      ...prev,
      gems: prev.gems + gems,
      stars: prev.stars + stars,
      xp: prev.xp + gems,
      openedChests: [...(prev.openedChests || []), chestId],
    }));
  };

  // Claim Daily Quest Reward
  const handleClaimQuest = (questId: string, xpReward: number, gemReward: number) => {
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + xpReward,
      gems: prev.gems + gemReward,
      dailyQuests: prev.dailyQuests.map((q) => (q.id === questId ? { ...q, completed: true } : q)),
    }));
  };

  // Heart deduction on wrong answer
  const handleDeductHeart = () => {
    setStats((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
    }));
  };

  // Heart refill from shop
  const handleRefillHearts = () => {
    setStats((prev) => ({
      ...prev,
      gems: Math.max(0, prev.gems - 20),
      hearts: prev.maxHearts,
    }));
  };

  // Buy Streak Freeze
  const handleBuyStreakFreeze = () => {
    setStats((prev) => ({
      ...prev,
      gems: Math.max(0, prev.gems - 50),
    }));
  };

  const handleIncrementStreak = () => {
    setStats((prev) => ({
      ...prev,
      streak: prev.streak + 1,
    }));
  };

  const handleResetStreak = () => {
    setStats((prev) => ({
      ...prev,
      streak: 0,
    }));
  };

  const handleUnlockBadge = (badgeId: string) => {
    setStats((prev) => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;
      return {
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, badgeId],
      };
    });
  };

  const isAr = soundConfig.language === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#58CC02]/25 via-[#1CB0F6]/20 to-[#FF9600]/25 text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
      {/* Decorative Ambient Frosted Blur Orbs (Duolingo Palette: Green, Sky, Amber, Rose) */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-[#58CC02]/30 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-10 -right-10 w-96 h-96 bg-[#1CB0F6]/30 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/4 w-80 h-80 bg-[#FFD700]/25 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/4 right-1/3 w-64 h-64 bg-[#FF4B4B]/20 rounded-full blur-2xl pointer-events-none z-0" />

      {/* Dynamic Star Rating Celebration Modal */}
      <StarRewardModal
        data={rewardModal}
        onClose={() => setRewardModal(null)}
        soundConfig={soundConfig}
        stats={stats}
        itemTheme={itemTheme}
      />

      {/* Daily Quests Modal */}
      <DuoQuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        soundConfig={soundConfig}
        stats={stats}
        onClaimQuest={handleClaimQuest}
      />

      {/* Shop Modal */}
      <DuoShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        soundConfig={soundConfig}
        stats={stats}
        onRefillHearts={handleRefillHearts}
        onBuyStreakFreeze={handleBuyStreakFreeze}
      />

      {/* Top Navigation Bar with Duolingo Gamification Stats */}
      <Navbar
        currentModule={currentModule}
        onSelectModule={(mod) => {
          setActiveLesson(null);
          setCurrentModule(mod);
        }}
        stats={stats}
        soundConfig={soundConfig}
        onToggleSoundFx={() =>
          setSoundConfig((prev) => ({ ...prev, soundFxEnabled: !prev.soundFxEnabled }))
        }
        onToggleVoice={() =>
          setSoundConfig((prev) => ({
            ...prev,
            voiceSpeechEnabled: !prev.voiceSpeechEnabled,
          }))
        }
        onToggleNumerals={() =>
          setSoundConfig((prev) => ({
            ...prev,
            numeralSystem: prev.numeralSystem === 'eastern' ? 'western' : 'eastern',
          }))
        }
        onToggleLanguage={() =>
          setSoundConfig((prev) => ({
            ...prev,
            language: prev.language === 'ar' ? 'en' : 'ar',
          }))
        }
        onOpenQuests={() => {
          soundManager.playPop();
          setIsQuestsOpen(true);
        }}
        onOpenShop={() => {
          soundManager.playPop();
          setIsShopOpen(true);
        }}
      />

      {/* Sub-header Bar: Item Theme Picker with Frosted Glass styling */}
      <div className="bg-white/30 backdrop-blur-xl border-b border-white/40 px-3 sm:px-6 py-2 relative z-10 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <ItemThemePicker
            currentTheme={itemTheme}
            onSelectTheme={setItemTheme}
            language={soundConfig.language}
          />
        </div>
      </div>

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 relative z-10">
        <AnimatePresence mode="wait">
          {/* If in an active Duolingo Lesson Session */}
          {activeLesson ? (
            <motion.div
              key={`lesson_${activeLesson.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DuoLessonSession
                lesson={activeLesson}
                soundConfig={soundConfig}
                stats={stats}
                onCompleteLesson={handleCompleteLesson}
                onExit={() => setActiveLesson(null)}
                onRewardStar={handleRewardStar}
                onIncrementStreak={handleIncrementStreak}
                onDeductHeart={handleDeductHeart}
                itemTheme={itemTheme}
              />
            </motion.div>
          ) : (
            <motion.div
              key={currentModule}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.22 }}
            >
              {/* 1. DUOLINGO LEARNING PATH (Default Primary View) */}
              {currentModule === 'duo_path' && (
                <DuoPathView
                  soundConfig={soundConfig}
                  stats={stats}
                  onStartLesson={(lesson) => setActiveLesson(lesson)}
                  onOpenChest={handleOpenChest}
                />
              )}

              {/* 2. DUOLINGO LEADERBOARD & LEAGUES */}
              {currentModule === 'leaderboard' && (
                <DuoLeaderboard soundConfig={soundConfig} stats={stats} />
              )}

              {/* 3. INTERACTIVE VISUAL LABS */}
              {currentModule === 'counting' && (
                <CountingModule
                  itemTheme={itemTheme}
                  soundConfig={soundConfig}
                  onRewardStar={handleRewardStar}
                />
              )}

              {currentModule === 'addition' && (
                <OperationsModule
                  itemTheme={itemTheme}
                  soundConfig={soundConfig}
                  onRewardStar={handleRewardStar}
                />
              )}

              {currentModule === 'multiplication' && (
                <MultiplicationModule
                  itemTheme={itemTheme}
                  soundConfig={soundConfig}
                  onRewardStar={handleRewardStar}
                />
              )}

              {currentModule === 'division' && (
                <DivisionModule
                  itemTheme={itemTheme}
                  soundConfig={soundConfig}
                  onRewardStar={handleRewardStar}
                />
              )}

              {currentModule === 'adventure' && (
                <AdventureQuiz
                  itemTheme={itemTheme}
                  soundConfig={soundConfig}
                  stats={stats}
                  onRewardStar={handleRewardStar}
                  onIncrementStreak={handleIncrementStreak}
                  onResetStreak={handleResetStreak}
                  onUnlockBadge={handleUnlockBadge}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Educational Frosted Glass Footer */}
      <footer className="mt-auto border-t border-white/40 bg-white/30 backdrop-blur-xl py-4 px-4 text-center text-xs text-slate-700 font-medium relative z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2.5 h-2.5 bg-[#58CC02] rounded-full animate-pulse shadow-[0_0_8px_#58cc02]" />
            <span>
              {isAr
                ? 'رياضيات دولينجو للأطفال — مسار تعليمي متكامل باللعب والمكافآت التفاعلية'
                : 'Duo Math for Kids — Gamified, Visual & Interactive Math Journey'}
            </span>
          </p>
          <p className="flex items-center gap-1 text-slate-600 font-bold">
            <span>{isAr ? 'الرياضيات ممتعة وبصرية دائماً' : 'Math is visual, joyful & magical'}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          </p>
        </div>
      </footer>
    </div>
  );
}
