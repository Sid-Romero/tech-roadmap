import React from 'react';
import { UserStats, Rank, Badge } from '../types';
import { RANKS, BADGES } from '../constants';
import { Trophy, Star, Clock, Lock, CheckCircle2 } from './Icons.api';

interface ProfilePanelProps {
  stats: UserStats;
  currentRank: Rank;
  unlockedBadges: string[];
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ stats, currentRank, unlockedBadges }) => {
  // Calculate progress to next rank
  const nextRank = RANKS.find(r => r.minXP > stats.xp) || RANKS[RANKS.length - 1];
  const isMaxRank = currentRank.id === nextRank.id;

  const xpInRank = stats.xp - currentRank.minXP;
  const xpNeeded = nextRank.minXP - currentRank.minXP;
  const progressPercent = isMaxRank ? 100 : Math.min(100, Math.max(0, (xpInRank / xpNeeded) * 100));

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header / Player Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
            <div className="h-32 bg-gradient-to-r from-ocean-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
            </div>

            <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-center -mt-12 gap-6 relative">
                {/* Avatar / Rank Icon */}
                <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-ocean-600 relative z-10">
                    <Trophy size={48} />
                    <div className="absolute -bottom-3 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-full border border-white">
                        Lvl {stats.level}
                    </div>
                </div>

                <div className="flex-1 mb-2">
                    <h2 className="text-3xl font-bold text-slate-900">{currentRank.title}</h2>
                    <div className="text-slate-500 font-medium flex items-center gap-2">
                        <span>Total XP: {stats.xp.toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-ocean-600">{unlockedBadges.length} Badges</span>
                    </div>
                </div>

                 {/* Rank Progress */}
                <div className="w-full md:w-1/3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                        <span>Current Arena</span>
                        <span>{isMaxRank ? 'Max Rank' : 'Next Rank'}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-800 mb-2">
                        <span>{currentRank.title}</span>
                        <span className={isMaxRank ? 'text-ocean-600' : 'text-slate-400'}>{nextRank.title}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-ocean-500 transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 mt-1 font-mono">
                        {Math.floor(xpInRank)} / {isMaxRank ? '∞' : xpNeeded} XP
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="text-emerald-500 mb-2" size={24}/>
                <div className="text-2xl font-bold text-slate-900">{stats.completedProjects}</div>
                <div className="text-xs text-slate-500 uppercase font-bold">Projects Done</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <Clock className="text-ocean-500 mb-2" size={24}/>
                <div className="text-2xl font-bold text-slate-900">
                   {stats.totalProjects} {/* Placeholder: This should be total hours */}
                </div>
                <div className="text-xs text-slate-500 uppercase font-bold">Total Projects</div>
            </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <Star className="text-yellow-500 mb-2" size={24}/>
                <div className="text-2xl font-bold text-slate-900">{stats.level}</div>
                <div className="text-xs text-slate-500 uppercase font-bold">Player Level</div>
            </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <Trophy className="text-purple-500 mb-2" size={24}/>
                <div className="text-2xl font-bold text-slate-900">{RANKS.indexOf(currentRank) + 1}</div>
                <div className="text-xs text-slate-500 uppercase font-bold">Arena Rank</div>
            </div>
        </div>

        {/* Badges Collection */}
        <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500"/> Badge Collection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BADGES.map(badge => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    return (
                        <div key={badge.id} className={`
                            relative p-4 rounded-xl border-2 transition-all
                            ${isUnlocked
                                ? 'bg-white border-ocean-100 shadow-sm hover:border-ocean-300'
                                : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}
                        `}>
                            <div className="flex items-start gap-4">
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center shrink-0
                                    ${isUnlocked ? 'bg-ocean-50 text-ocean-600' : 'bg-slate-200 text-slate-400'}
                                `}>
                                    <Star size={20} fill={isUnlocked ? "currentColor" : "none"}/>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800">{badge.title}</h4>
                                        {isUnlocked && <CheckCircle2 size={14} className="text-emerald-500"/>}
                                        {!isUnlocked && <Lock size={12} className="text-slate-400"/>}
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">{badge.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePanel;
