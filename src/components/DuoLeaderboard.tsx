import React from 'react';
import { LeaderboardUser, SoundConfig, UserStats } from '../types';
import { INITIAL_LEADERBOARD } from '../utils/duoData';
import { formatNumber } from '../utils/mathData';
import { soundManager } from '../utils/audio';
import { Trophy, Flame, Zap, Shield, Sparkles, ArrowUp, Medal } from 'lucide-react';
import { motion } from 'motion/react';

interface DuoLeaderboardProps {
  soundConfig: SoundConfig;
  stats: UserStats;
}

export const DuoLeaderboard: React.FC<DuoLeaderboardProps> = ({ soundConfig, stats }) => {
  const isAr = soundConfig.language === 'ar';

  // Build current leaderboard with user dynamic XP and rank
  const users: LeaderboardUser[] = INITIAL_LEADERBOARD.map((u) => {
    if (u.isCurrentUser) {
      return {
        ...u,
        xp: stats.xp,
        streak: stats.streak,
      };
    }
    return u;
  }).sort((a, b) => b.xp - a.xp);

  // Assign updated ranks
  const rankedUsers = users.map((u, idx) => ({
    ...u,
    rank: idx + 1,
  }));

  const leagueTitles = {
    bronze: { ar: 'دوري العباقرة البرونزي', en: 'Bronze League', color: 'from-amber-700 to-amber-900', icon: '🥉' },
    silver: { ar: 'دوري العباقرة الفضي', en: 'Silver League', color: 'from-slate-400 to-slate-600', icon: '🥈' },
    gold: { ar: 'دوري العباقرة الذهبي', en: 'Gold League', color: 'from-yellow-400 to-amber-600', icon: '🥇' },
    diamond: { ar: 'دوري العباقرة الماسي', en: 'Diamond League', color: 'from-cyan-400 to-blue-600', icon: '💎' },
  };

  const currentLeague = leagueTitles[stats.league || 'bronze'];

  return (
    <div className="max-w-xl mx-auto pb-16 select-none">
      {/* League Banner */}
      <div
        className={`w-full bg-gradient-to-r ${currentLeague.color} text-white rounded-3xl p-6 shadow-xl border-4 border-white/80 mb-6 text-center relative overflow-hidden`}
      >
        <div className="text-4xl sm:text-5xl mb-1">{currentLeague.icon}</div>
        <h2 className="text-2xl sm:text-3xl font-black drop-shadow-sm">
          {isAr ? currentLeague.ar : currentLeague.en}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-white/90 mt-1">
          {isAr ? 'أفضل 3 لاعبين ينتقلون إلى الدوري القادم كل أسبوع!' : 'Top 3 advance to the next league!'}
        </p>
      </div>

      {/* Leaderboard Table List */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-3 sm:p-4 border-2 border-slate-200/80 shadow-lg flex flex-col gap-2">
        <div className="flex items-center justify-between px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-wider">
          <span>{isAr ? 'الترتيب واللاعب' : 'Rank & Player'}</span>
          <span>{isAr ? 'نقاط الخبرة (XP)' : 'Total XP'}</span>
        </div>

        {rankedUsers.map((user) => {
          const isTop3 = user.rank <= 3;
          const isCurrentUser = user.isCurrentUser;

          return (
            <motion.div
              key={user.id}
              whileHover={{ scale: 1.01 }}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                isCurrentUser
                  ? 'bg-emerald-100/90 border-emerald-400 shadow-md ring-2 ring-emerald-300'
                  : isTop3
                  ? 'bg-amber-50/80 border-amber-200 shadow-xs'
                  : 'bg-white/70 border-slate-100'
              }`}
            >
              {/* Rank & Avatar & Name */}
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm ${
                    user.rank === 1
                      ? 'bg-yellow-400 text-yellow-950 shadow-xs'
                      : user.rank === 2
                      ? 'bg-slate-300 text-slate-900'
                      : user.rank === 3
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-500'
                  }`}
                >
                  {formatNumber(user.rank, soundConfig.numeralSystem)}
                </span>

                <div className="text-2xl sm:text-3xl">{user.avatar}</div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm sm:text-base font-black ${
                        isCurrentUser ? 'text-emerald-950' : 'text-slate-800'
                      }`}
                    >
                      {user.name}
                    </span>
                    {isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                        {isAr ? 'أنت' : 'YOU'}
                      </span>
                    )}
                  </div>

                  {user.streak > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-orange-500">
                      <Flame className="w-3.5 h-3.5 fill-orange-500" />
                      <span>
                        {formatNumber(user.streak, soundConfig.numeralSystem)}{' '}
                        {isAr ? 'أيام متتالية' : 'days streak'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* XP Counter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/90 text-amber-950 font-black text-sm sm:text-base border border-amber-300">
                <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{formatNumber(user.xp, soundConfig.numeralSystem)} XP</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
