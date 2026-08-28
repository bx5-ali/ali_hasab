import React from 'react';
import { MathModuleType, SoundConfig, UserStats } from '../types';
import { formatNumber } from '../utils/mathData';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Languages,
  Trophy,
  Flame,
  Zap,
  Heart,
  Target,
  ShoppingBag,
  Compass,
  Layers,
  Divide,
  Hash,
  Smartphone,
} from 'lucide-react';

interface NavbarProps {
  currentModule: MathModuleType;
  onSelectModule: (module: MathModuleType) => void;
  stats: UserStats;
  soundConfig: SoundConfig;
  onToggleSoundFx: () => void;
  onToggleVoice: () => void;
  onToggleNumerals: () => void;
  onToggleLanguage: () => void;
  onOpenQuests: () => void;
  onOpenShop: () => void;
  onOpenPlayStoreModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  onSelectModule,
  stats,
  soundConfig,
  onToggleSoundFx,
  onToggleNumerals,
  onToggleLanguage,
  onOpenQuests,
  onOpenShop,
  onOpenPlayStoreModal,
}) => {
  const isAr = soundConfig.language === 'ar';

  const navItems: { id: MathModuleType; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: 'duo_path',
      labelAr: 'مسار التعلم',
      labelEn: 'Learning Path',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'leaderboard',
      labelAr: 'دوري العباقرة',
      labelEn: 'Leagues',
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      id: 'counting',
      labelAr: 'العدّ البصري',
      labelEn: 'Counting Lab',
      icon: <Hash className="w-4 h-4" />,
    },
    {
      id: 'addition',
      labelAr: 'الجمع والطرح',
      labelEn: 'Add & Sub Lab',
      icon: <span className="font-black text-sm">±</span>,
    },
    {
      id: 'multiplication',
      labelAr: 'الضرب الذكي',
      labelEn: 'Multiply Lab',
      icon: <span className="font-black text-sm">×</span>,
    },
    {
      id: 'division',
      labelAr: 'القسمة العادلة',
      labelEn: 'Division Lab',
      icon: <Divide className="w-4 h-4" />,
    },
    {
      id: 'adventure',
      labelAr: 'تحدي المغامرة',
      labelEn: 'Adventure Challenge',
      icon: <Sparkles className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-2xl border-b border-white/40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Top Bar with Mascot Icon, Stats (Hearts, Gems, Streak, XP), and Settings */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Logo & Duolingo Title */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onSelectModule('duo_path')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#58CC02] border-2 border-white/80 flex items-center justify-center text-white shadow-md transform hover:scale-105 transition-transform">
              <span className="text-2xl">🦉</span>
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl text-white tracking-tight leading-none flex items-center gap-2 drop-shadow-xs">
                <span>{isAr ? 'رياضيات دولينجو للأطفال' : 'Duo Math Kids'}</span>
                <span className="text-[11px] bg-emerald-500/80 text-white font-black px-2 py-0.5 rounded-full border border-white/50 shadow-xs">
                  {isAr ? 'مسار تفاعلي' : 'Interactive Path'}
                </span>
              </h1>
              <p className="text-[11px] text-white/90 font-bold hidden sm:block mt-0.5 drop-shadow-xs">
                {isAr ? 'تعلم الحساب بالخطوات واللعب والمكافآت' : 'Gamified step-by-step math journey'}
              </p>
            </div>
          </div>

          {/* Duolingo Gamification Stats (Hearts, Gems, Streak, XP) & Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Hearts Counter (Clickable to open shop) */}
            <button
              id="user-hearts-badge"
              onClick={onOpenShop}
              className="flex items-center gap-1 bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/50 px-2.5 py-1 rounded-2xl shadow-md text-rose-500 font-black text-xs sm:text-sm cursor-pointer transition-all active:scale-95"
              title={isAr ? 'القلوب المتبقية (اضغط للشحن)' : 'Hearts (Click to refill)'}
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{formatNumber(stats.hearts, soundConfig.numeralSystem)}</span>
            </button>

            {/* Gems Counter (Clickable to open shop) */}
            <button
              id="user-gems-badge"
              onClick={onOpenShop}
              className="flex items-center gap-1 bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/50 px-2.5 py-1 rounded-2xl shadow-md text-sky-700 font-black text-xs sm:text-sm cursor-pointer transition-all active:scale-95"
              title={isAr ? 'الجواهر (اضغط للمتجر)' : 'Gems (Click for Shop)'}
            >
              <span>💎</span>
              <span className="text-white font-black drop-shadow-xs">
                {formatNumber(stats.gems, soundConfig.numeralSystem)}
              </span>
            </button>

            {/* Streak Counter */}
            <div
              className="flex items-center gap-1 bg-white/40 backdrop-blur-xl border border-white/50 px-2.5 py-1 rounded-2xl text-orange-400 font-black text-xs sm:text-sm shadow-md"
              title={isAr ? 'أيام الحماس المتتالية' : 'Streak Days'}
            >
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
              <span className="text-white font-black drop-shadow-xs">
                {formatNumber(stats.streak, soundConfig.numeralSystem)}
              </span>
            </div>

            {/* XP Points */}
            <div
              className="hidden md:flex items-center gap-1 bg-white/40 backdrop-blur-xl border border-white/50 px-2.5 py-1 rounded-2xl text-amber-300 font-black text-xs sm:text-sm shadow-md"
              title={isAr ? 'نقاط الخبرة' : 'Total XP'}
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span className="text-white font-black drop-shadow-xs">
                {formatNumber(stats.xp, soundConfig.numeralSystem)} XP
              </span>
            </div>

            {/* Daily Quests Trigger Button */}
            <button
              id="daily-quests-btn"
              onClick={onOpenQuests}
              className="p-1.5 sm:p-2 rounded-xl border border-white/50 bg-amber-400/80 hover:bg-amber-400 text-amber-950 shadow-md transition-all active:scale-95 cursor-pointer"
              title={isAr ? 'المهام اليومية' : 'Daily Quests'}
            >
              <Target className="w-4 h-4" />
            </button>

            {/* Shop Trigger Button */}
            <button
              id="duo-shop-btn"
              onClick={onOpenShop}
              className="p-1.5 sm:p-2 rounded-xl border border-white/50 bg-sky-400/80 hover:bg-sky-400 text-white shadow-md transition-all active:scale-95 cursor-pointer"
              title={isAr ? 'متجر الجواهر' : 'Gem Shop'}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            {/* Google Play / Android PWA Button */}
            <button
              id="playstore-export-btn"
              onClick={onOpenPlayStoreModal}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black border border-emerald-300 bg-emerald-600/90 hover:bg-emerald-500 text-white backdrop-blur-xl shadow-md transition-all active:scale-95 cursor-pointer"
              title={isAr ? 'جاهزية جوجل بلاي والتثبيت' : 'Google Play & Android Install'}
            >
              <Smartphone className="w-3.5 h-3.5 text-white animate-pulse" />
              <span className="hidden xs:inline">{isAr ? 'جوجل بلاي 📲' : 'Play Store'}</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              id="sound-fx-toggle-btn"
              onClick={onToggleSoundFx}
              className={`p-1.5 sm:p-2 rounded-xl border backdrop-blur-xl transition-all active:scale-95 shadow-md cursor-pointer ${
                soundConfig.soundFxEnabled
                  ? 'bg-white/40 text-white border-white/60 hover:bg-white/50'
                  : 'bg-white/15 text-white/50 border-white/20 hover:bg-white/25'
              }`}
              title={isAr ? (soundConfig.soundFxEnabled ? 'كتم المؤثرات' : 'تشغيل المؤثرات') : 'Toggle Sound FX'}
            >
              {soundConfig.soundFxEnabled ? <Volume2 className="w-4 h-4 text-yellow-200" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Numerals system toggle (١٢٣ / 123) */}
            <button
              id="numeral-system-toggle-btn"
              onClick={onToggleNumerals}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black border border-white/50 bg-white/30 text-white hover:bg-white/45 backdrop-blur-xl shadow-md transition-all active:scale-95 cursor-pointer"
              title={isAr ? 'تبديل شكل الأرقام (عربي / إنجليزي)' : 'Toggle Numeral Format (123 / ١٢٣)'}
            >
              {soundConfig.numeralSystem === 'eastern' ? '١٢٣' : '123'}
            </button>

            {/* Language Toggle */}
            <button
              id="language-toggle-btn"
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black border border-white/50 bg-white/30 text-white hover:bg-white/45 backdrop-blur-xl shadow-md transition-all active:scale-95 cursor-pointer"
              title="Change Language / تغيير اللغة"
            >
              <Languages className="w-3.5 h-3.5 text-white/80" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-2.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectModule(item.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-700 border-2 border-emerald-300 shadow-xl scale-102 font-black'
                    : 'bg-white/30 backdrop-blur-xl text-white border border-white/30 hover:bg-white/45 shadow-sm'
                }`}
              >
                <span>{item.icon}</span>
                <span>{isAr ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

