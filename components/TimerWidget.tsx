import React, { useEffect, useState, useRef } from 'react';
import { TimerState } from '../types';
import { Play, Pause, Square, Settings, Coffee, AlertTriangle, CheckCircle2 } from './Icons.api';

interface TimerWidgetProps {
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onModeChange: (mode: 'focus' | 'pomodoro' | 'break') => void;
  onUpdateSettings?: (updates: Partial<TimerState>) => void;
  compact?: boolean;
}

const TimerWidget: React.FC<TimerWidgetProps> = ({
  timerState, onStart, onPause, onStop, onModeChange, onUpdateSettings, compact = false
}) => {
  const [isIdle, setIsIdle] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local state for settings form
  const [localPomo, setLocalPomo] = useState(timerState.pomodoroDuration / 60);
  const [localBreak, setLocalBreak] = useState(timerState.breakDuration / 60);
  const [localGoal, setLocalGoal] = useState((timerState.durationGoal || 3600) / 60);

  useEffect(() => {
    // Sync local state when props change
    setLocalPomo(Math.floor(timerState.pomodoroDuration / 60));
    setLocalBreak(Math.floor(timerState.breakDuration / 60));
    setLocalGoal(Math.floor((timerState.durationGoal || 3600) / 60));
  }, [timerState.pomodoroDuration, timerState.breakDuration, timerState.durationGoal]);

  const saveSettings = () => {
    if (onUpdateSettings) {
      onUpdateSettings({
        pomodoroDuration: localPomo * 60,
        breakDuration: localBreak * 60,
        durationGoal: localGoal * 60
      });
    }
    setShowSettings(false);
  };

  // Format seconds into MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;

    const timeStr = h > 0
        ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    return isNegative ? `-${timeStr}` : timeStr;
  };

  // Determine display time based on mode
  let displaySeconds = timerState.elapsedSeconds;
  let target = 0;
  let isCountDownDisplay = false;

  if (timerState.mode === 'pomodoro') {
      target = timerState.pomodoroDuration;
      displaySeconds = target - timerState.elapsedSeconds;
      isCountDownDisplay = true;
  } else if (timerState.mode === 'break') {
      target = timerState.breakDuration;
      displaySeconds = target - timerState.elapsedSeconds;
      isCountDownDisplay = true;
  } else if (timerState.mode === 'focus' && timerState.isCountdown) {
      target = timerState.durationGoal || 3600;
      displaySeconds = target - timerState.elapsedSeconds;
      isCountDownDisplay = true;
  }

  // Idle Detection Logic
  useEffect(() => {
    const resetIdleTimer = () => {
      if (isIdle) setIsIdle(false);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

      // Set idle threshold to 15 minutes (900000ms)
      if (timerState.isRunning) {
        idleTimeoutRef.current = setTimeout(() => {
          setIsIdle(true);
        }, 15 * 60 * 1000);
      }
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [timerState.isRunning, isIdle]);

  return (
    <div className={`
      relative flex flex-col items-center justify-center transition-all
      ${compact ? 'p-2' : 'p-6 w-full max-w-sm mx-auto'}
    `}>

      {/* Settings Panel Overlay */}
      {showSettings && !compact && (
          <div className="absolute inset-0 z-30 bg-white rounded-xl flex flex-col p-6 animate-in fade-in zoom-in-95">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <Settings size={18}/> Timer Settings
             </h3>
             <div className="space-y-4 flex-1 overflow-y-auto">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pomodoro Length (min)</label>
                    <input type="number" min="1" value={localPomo} onChange={e => setLocalPomo(parseInt(e.target.value) || 1)} className="w-full p-2 border border-slate-300 rounded"/>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Break Length (min)</label>
                    <input type="number" min="1" value={localBreak} onChange={e => setLocalBreak(parseInt(e.target.value) || 1)} className="w-full p-2 border border-slate-300 rounded"/>
                 </div>
                 <div className="pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input
                            type="checkbox"
                            checked={timerState.isCountdown || false}
                            onChange={(e) => onUpdateSettings && onUpdateSettings({isCountdown: e.target.checked})}
                            className="w-4 h-4 text-ocean-600 rounded focus:ring-ocean-500"
                        />
                        <span className="text-sm font-bold text-slate-700">Use Countdown for Focus</span>
                    </label>
                    {timerState.isCountdown && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Focus Goal (min)</label>
                            <input type="number" min="1" value={localGoal} onChange={e => setLocalGoal(parseInt(e.target.value) || 1)} className="w-full p-2 border border-slate-300 rounded"/>
                        </div>
                    )}
                 </div>
             </div>
             <div className="mt-4 flex gap-2">
                 <button onClick={() => setShowSettings(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                 <button onClick={saveSettings} className="flex-1 py-2 bg-ocean-600 text-white font-bold rounded hover:bg-ocean-700">Save</button>
             </div>
          </div>
      )}

      {/* Idle Warning Overlay */}
      {isIdle && timerState.isRunning && !compact && (
        <div className="absolute inset-0 bg-red-900/90 z-20 flex flex-col items-center justify-center text-center p-4 rounded-xl animate-pulse">
            <AlertTriangle className="text-yellow-400 mb-2" size={32} />
            <h3 className="font-bold text-lg text-white">Are you still there?</h3>
            <p className="text-sm mb-4 text-white/80">Timer is running without activity.</p>
            <button
                onClick={() => setIsIdle(false)}
                className="px-4 py-2 bg-white text-red-900 font-bold rounded"
            >
                I'm back
            </button>
        </div>
      )}

      {/* Header / Mode Switcher */}
      {!compact && (
        <div className="flex justify-between w-full mb-8">
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <button
                onClick={() => onModeChange('focus')}
                className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition-colors ${timerState.mode === 'focus' ? 'bg-ocean-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
                Focus
            </button>
            <button
                onClick={() => onModeChange('pomodoro')}
                className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition-colors ${timerState.mode === 'pomodoro' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
                Pomo
            </button>
            <button
                onClick={() => onModeChange('break')}
                className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition-colors ${timerState.mode === 'break' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
                Break
            </button>
            </div>

            {/* Settings Button */}
            {!timerState.isRunning && (
                <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                    <Settings size={20} />
                </button>
            )}
        </div>
      )}

      {/* Main Clock */}
      <div className={`font-mono font-bold tracking-widest text-slate-800 ${compact ? 'text-2xl' : 'text-7xl mb-8'} transition-colors ${displaySeconds < 0 ? 'text-red-500' : ''}`}>
        {formatTime(displaySeconds)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {!timerState.isRunning ? (
          <button
            onClick={onStart}
            className={`
                flex items-center justify-center rounded-full text-white transition-all shadow-xl shadow-ocean-600/30
                ${compact ? 'w-8 h-8 bg-ocean-600' : 'w-20 h-20 bg-ocean-600 hover:scale-105 hover:bg-ocean-500'}
            `}
          >
            <Play size={compact ? 16 : 36} fill="currentColor" className="ml-1"/>
          </button>
        ) : (
          <button
            onClick={onPause}
            className={`
                flex items-center justify-center rounded-full bg-white text-slate-700 hover:text-ocean-600 hover:border-ocean-300 transition-all border-2 border-slate-200 shadow-sm
                ${compact ? 'w-8 h-8' : 'w-20 h-20 hover:scale-105'}
            `}
          >
            <Pause size={compact ? 16 : 36} fill="currentColor" />
          </button>
        )}

        {/* Stop Button (only if elapsed time > 0) */}
        {(timerState.elapsedSeconds > 0 || timerState.isRunning) && (
             <button
                onClick={onStop}
                className={`
                    flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100 hover:border-red-500
                    ${compact ? 'w-8 h-8' : 'w-14 h-14'}
                `}
                title="Stop & Save Session"
            >
                <Square size={compact ? 14 : 24} fill="currentColor" />
            </button>
        )}
      </div>

      {/* Footer Info */}
      {!compact && (
          <div className="mt-8 text-sm text-slate-400 min-h-[24px]">
              {timerState.mode === 'pomodoro' && (
                  <span className="flex items-center gap-2"><Coffee size={16} /> Break in {formatTime(target - timerState.elapsedSeconds)}</span>
              )}
               {timerState.mode === 'focus' && timerState.isCountdown && (
                  <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Goal: {Math.floor(target/60)} min</span>
              )}
          </div>
      )}
    </div>
  );
};

export default TimerWidget;
