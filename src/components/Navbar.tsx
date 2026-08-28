import React from 'react';
import { MathModuleType, NumeralSystem, SoundConfig, UserStats } from '../types';
import { formatNumber } from '../utils/mathData';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Languages,
  Award,
  Hash,
  Calculator,
  Divide,
  Trophy,
  Flame,
  Plus,
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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  onSelectModule,
  stats,
  soundConfig,
  onToggleSoundFx,
  onToggleVoice,
  onToggleNumerals,
  onToggleLanguage,
}) => {
  const isAr = soundConfig.language === 'ar';

  const navItems: { id: MathModuleType; labelAr: string; labelEn: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'counting',
      labelAr: 'العدّ والاستكشاف',
      labelEn: 'Counting & Numbers',
      icon: <Hash className="w-4 h-4" />,
      color: 'bg-emerald-500 text-white',
    },
    {
      id: 'addition',
      labelAr: 'الجمع والطرح',
      labelEn: 'Add & Subtract',
      icon: <span className="font-black text-sm">±</span>,
      color: 'bg-sky-500 text-white',
    },
    {
      id: 'multiplication',
      labelAr: 'الضرب الذكي',
      labelEn: 'Multiplication',
      icon: <span className="font-black text-sm">×</span>,
      color: 'bg-purple-500 text-white',
    },
    {
      id: 'division',
      labelAr: 'القسمة العادلة',
      labelEn: 'Fair Division',
      icon: <Divide className="w-4 h-4" />,
      color: 'bg-rose-500 text-white',
    },
    {
      id: 'adventure',
      labelAr: 'المغامرة والتحدي',
      labelEn: 'Challenge Quest',
      icon: <Trophy className="w-4 h-4" />,
      color: 'bg-amber-500 text-white',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/25 backdrop-blur-2xl border-b border-white/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Top bar with logo, stats, and audio settings */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-yellow-400/90 border border-white/60 flex items-center justify-center text-white shadow-lg transform hover:scale-105 transition-transform backdrop-blur-md">
              <span className="text-2xl">🧮</span>
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl text-white tracking-tight leading-none flex items-center gap-2 drop-shadow-xs">
                <span>{isAr ? 'عالم الرياضيات البصرية' : 'Visual Math Adventure'}</span>
                <span className="text-xs bg-white/30 text-white font-bold px-2.5 py-0.5 rounded-full border border-white/40 backdrop-blur-md shadow-xs">
                  {isAr ? 'للأطفال 6-12' : 'Ages 6-12'}
                </span>
              </h1>
              <p className="text-xs text-white/80 font-medium hidden sm:block mt-0.5 drop-shadow-xs">
                {isAr ? 'التعلم باللعب وتجسيد الأرقام والعمليات' : 'Interactive visual & gamified math'}
              </p>
            </div>
          </div>

          {/* Controls: Stars, Streak, Sounds, Numerals, Language */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Stars counter */}
            <div
              id="user-stars-badge"
              className="flex items-center gap-1.5 bg-white/30 backdrop-blur-xl border border-white/40 px-3 py-1 rounded-2xl shadow-lg text-white font-black text-sm"
              title={isAr ? 'النجوم المكتسبة' : 'Earned Stars'}
            >
              <span className="text-base animate-pulse">⭐</span>
              <span className="font-black text-yellow-300 drop-shadow-xs">
                {formatNumber(stats.stars, soundConfig.numeralSystem)}
              </span>
            </div>

            {/* Streak counter */}
            {stats.streak > 0 && (
              <div
                className="flex items-center gap-1 bg-white/30 backdrop-blur-xl border border-white/40 px-2.5 py-1 rounded-2xl text-yellow-300 font-bold text-xs shadow-lg"
                title={isAr ? 'الحماس والتتالي' : 'Streak'}
              >
                <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-bounce" />
                <span className="font-extrabold">{formatNumber(stats.streak, soundConfig.numeralSystem)}</span>
              </div>
            )}

            {/* Sound FX Toggle */}
            <button
              id="sound-fx-toggle-btn"
              onClick={onToggleSoundFx}
              className={`p-1.5 sm:p-2 rounded-xl border backdrop-blur-xl transition-all active:scale-95 shadow-md ${
                soundConfig.soundFxEnabled
                  ? 'bg-white/40 text-white border-white/60 hover:bg-white/50 ring-1 ring-white/50'
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
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black border border-white/40 bg-white/30 text-white hover:bg-white/45 backdrop-blur-xl shadow-md transition-all active:scale-95"
              title={isAr ? 'تبديل شكل الأرقام (عربي / إنجليزي)' : 'Toggle Numeral Format (123 / ١٢٣)'}
            >
              {soundConfig.numeralSystem === 'eastern' ? '١٢٣' : '123'}
            </button>

            {/* Language Toggle */}
            <button
              id="language-toggle-btn"
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black border border-white/40 bg-white/30 text-white hover:bg-white/45 backdrop-blur-xl shadow-md transition-all active:scale-95"
              title="Change Language / تغيير اللغة"
            >
              <Languages className="w-3.5 h-3.5 text-white/80" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs for the 4 pedagogical modules + Challenge Quest */}
        <nav className="mt-2.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectModule(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-white/90 backdrop-blur-xl text-pink-600 font-black border-2 border-white shadow-xl scale-102'
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
