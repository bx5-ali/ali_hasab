/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ItemTheme, MathModuleType, NumeralSystem, RewardModalData, SoundConfig, UserStats } from './types';
import { ITEM_THEMES } from './utils/mathData';
import { Navbar } from './components/Navbar';
import { ItemThemePicker } from './components/ItemThemePicker';
import { CountingModule } from './components/CountingModule';
import { OperationsModule } from './components/OperationsModule';
import { MultiplicationModule } from './components/MultiplicationModule';
import { DivisionModule } from './components/DivisionModule';
import { AdventureQuiz } from './components/AdventureQuiz';
import { StarRewardModal } from './components/StarRewardModal';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [currentModule, setCurrentModule] = useState<MathModuleType>('counting');
  const [itemTheme, setItemTheme] = useState<ItemTheme>(ITEM_THEMES[0]); // Apples by default
  const [rewardModal, setRewardModal] = useState<RewardModalData | null>(null);

  const [soundConfig, setSoundConfig] = useState<SoundConfig>({
    soundFxEnabled: true,
    voiceSpeechEnabled: true,
    language: 'ar',
    numeralSystem: 'eastern',
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('kids_math_stats');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      stars: 5,
      streak: 0,
      completedChallenges: 0,
      unlockedBadges: [],
    };
  });

  // Save stats to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem('kids_math_stats', JSON.stringify(stats));
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
    setStats((prev) => ({
      ...prev,
      stars: prev.stars + stars,
      completedChallenges: prev.completedChallenges + 1,
    }));

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
    <div className="min-h-screen bg-gradient-to-tr from-[#FF9A8B] via-[#FF6A88] to-[#FF99AC] text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
      {/* Decorative Ambient Frosted Blur Orbs */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-yellow-300/35 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-10 -right-10 w-96 h-96 bg-blue-400/35 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/4 w-80 h-80 bg-purple-300/25 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/4 right-1/3 w-64 h-64 bg-pink-300/30 rounded-full blur-2xl pointer-events-none z-0" />

      {/* Dynamic Star Rating Celebration Modal */}
      <StarRewardModal
        data={rewardModal}
        onClose={() => setRewardModal(null)}
        soundConfig={soundConfig}
        stats={stats}
        itemTheme={itemTheme}
      />

      {/* Top Navigation Bar with Frosted Glass Header */}
      <Navbar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
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
      />

      {/* Sub-header Bar: Item Theme Picker with Frosted Glass styling */}
      <div className="bg-white/20 backdrop-blur-xl border-b border-white/30 px-3 sm:px-6 py-2 relative z-10 shadow-xs">
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
          <motion.div
            key={currentModule}
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.22 }}
          >
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
        </AnimatePresence>
      </main>

      {/* Educational Frosted Glass Footer */}
      <footer className="mt-auto border-t border-white/30 bg-white/20 backdrop-blur-xl py-4 px-4 text-center text-xs text-white/90 font-medium relative z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-semibold text-white/95">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span>{isAr ? 'عالم الرياضيات للأطفال — تجسيد الأرقام والعمليات بصرياً' : 'Interactive Visual Math for Kids (6-12 Years)'}</span>
          </p>
          <p className="flex items-center gap-1 text-white/80 font-medium">
            <span>{isAr ? 'الرياضيات ممتعة وبصرية دائماً' : 'Math is visual, joyful & magical'}</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          </p>
        </div>
      </footer>
    </div>
  );
}
