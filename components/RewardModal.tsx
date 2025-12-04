
import React, { useEffect, useState } from 'react';
import { Badge } from '../types';
import { CheckCircle2, Star, Trophy, Package, X } from './Icons.api';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  xpGained: number;
  badges: Badge[];
  projectTitle: string;
}

const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, xpGained, badges, projectTitle }) => {
  const [step, setStep] = useState(0); // 0: Closed, 1: Intro, 2: XP Count, 3: Badges
  const [displayedXP, setDisplayedXP] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setDisplayedXP(0);

      // Sequence
      setTimeout(() => setStep(2), 500); // Start XP
    } else {
      setStep(0);
    }
  }, [isOpen]);

  // XP Counter Animation
  useEffect(() => {
    if (step === 2) {
      let start = 0;
      const duration = 1500;
      const interval = 20;
      const increment = xpGained / (duration / interval);

      const timer = setInterval(() => {
        start += increment;
        if (start >= xpGained) {
          setDisplayedXP(xpGained);
          clearInterval(timer);
          setTimeout(() => setStep(3), 500); // Show Badges
        } else {
          setDisplayedXP(Math.floor(start));
        }
      }, interval);
      return () => clearInterval(timer);
    }
  }, [step, xpGained]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300">
      <div className="relative w-full max-w-lg flex flex-col items-center">

        {/* Close Button */}
        <button onClick={onClose} className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors">
            <X size={32} />
        </button>

        {/* Header - Mission Complete */}
        <div className={`transition-all duration-700 transform ${step >= 1 ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 uppercase tracking-wider drop-shadow-sm text-center mb-2">
                Mission Complete
            </h1>
            <p className="text-slate-300 text-center font-medium">{projectTitle}</p>
        </div>

        {/* Main Chest / Reward Box */}
        <div className="mt-8 relative w-full">

            {/* XP Section */}
            <div className={`
                bg-slate-800/90 border border-slate-600 rounded-2xl p-8 text-center shadow-2xl
                transition-all duration-700 transform
                ${step >= 2 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
            `}>
                <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 bg-ocean-600 rounded-full flex items-center justify-center shadow-lg shadow-ocean-600/50 animate-bounce">
                        <Star size={40} className="text-white" fill="currentColor"/>
                    </div>
                </div>
                <div className="text-5xl font-mono font-bold text-white mb-2">
                    +{displayedXP} <span className="text-2xl text-ocean-400">XP</span>
                </div>
                <div className="text-slate-400 text-sm uppercase tracking-widest font-bold">Experience Gained</div>
            </div>

            {/* Badges Section - Cards Flip */}
            {badges.length > 0 && step >= 3 && (
                <div className="mt-8 grid grid-cols-1 gap-4 w-full animate-in slide-in-from-bottom-10 fade-in duration-700">
                    <div className="text-center text-yellow-400 font-bold uppercase tracking-widest text-sm mb-2">Badges Unlocked!</div>
                    {badges.map((badge, idx) => (
                        <div key={badge.id}
                             className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-1 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
                             style={{animationDelay: `${idx * 200}ms`}}
                        >
                            <div className="bg-slate-900 rounded-lg p-4 flex items-center gap-4">
                                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 border border-yellow-500/50">
                                    <Trophy size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white">{badge.title}</h3>
                                    <p className="text-xs text-yellow-200/80">{badge.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Action Button */}
        {step >= 3 && (
             <button
                onClick={onClose}
                className="mt-10 px-10 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse"
             >
                 Collect Rewards
             </button>
        )}

      </div>
    </div>
  );
};

export default RewardModal;
