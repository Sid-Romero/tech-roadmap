import React, { useEffect, useState } from 'react';
import { Rank } from '../types';
import { Crown, Star, X } from './Icons.api';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newRank: Rank;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, newLevel, newRank }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay for entrance animation
      setTimeout(() => setShowContent(true), 100);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300">
      <div className={`
        relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
        rounded-2xl border-2 border-yellow-500/30 shadow-2xl overflow-hidden
        transform transition-all duration-700 ease-out
        ${showContent ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-10 opacity-0'}
      `}>

        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-yellow-500/10 blur-3xl pointer-events-none"></div>

        {/* Confetti / Ray Burst (CSS simulated) */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_10s_linear_infinite] opacity-10 pointer-events-none"
             style={{ background: 'conic-gradient(from 0deg, transparent 0 20deg, #eab308 20deg 40deg, transparent 40deg 360deg)' }}>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">
          <X size={24} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center p-10 space-y-6">

          <div className="uppercase tracking-widest text-yellow-500 font-bold text-sm animate-pulse">Level Up!</div>

          {/* Rank Icon */}
          <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40"></div>
              <div className="w-24 h-24 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 border-2 border-white/20">
                  <Crown size={48} className="text-white drop-shadow-md" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-ocean-600 rounded-full flex items-center justify-center border-2 border-slate-900 text-white font-bold text-lg shadow">
                  {newLevel}
              </div>
          </div>

          <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                  <span className="text-yellow-400">Rank:</span> {newRank.title}
              </h2>
              <p className="text-slate-400 text-sm">
                  You have unlocked new potential. Keep grinding to reach the next arena.
              </p>
          </div>

          {/* Rewards Section */}
          <div className="w-full bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="text-xs text-slate-500 uppercase font-bold mb-3">Rewards Unlocked</div>
              <div className="flex justify-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-yellow-400">
                          <Star size={18} />
                      </div>
                      <span className="text-xs text-slate-300 font-bold">+Stats</span>
                  </div>
                   <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-ocean-400">
                          <Crown size={18} />
                      </div>
                      <span className="text-xs text-slate-300 font-bold">Prestige</span>
                  </div>
              </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-105"
          >
              Claim Rewards
          </button>

        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
