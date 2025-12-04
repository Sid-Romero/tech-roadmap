import React, { useState } from 'react';
import { Project, TimerState } from '../types';
import TimerWidget from './TimerWidget';
import { Layers, Target, Clock, AlertTriangle } from './Icons.api';

interface TimeStationProps {
  projects: Project[];
  timerState: TimerState;
  onStart: (projectId: string | null, taskId?: string) => void;
  onPause: () => void;
  onStop: () => void;
  onModeChange: (mode: 'focus' | 'pomodoro' | 'break') => void;
  onUpdateSettings?: (updates: Partial<TimerState>) => void;
}

const TimeStation: React.FC<TimeStationProps> = ({
  projects, timerState, onStart, onPause, onStop, onModeChange, onUpdateSettings
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  // Filter only projects that are unlocked, in_progress, or done
  const activeProjects = projects.filter(p => p.status !== 'locked');

  const selectedProject = activeProjects.find(p => p.id === selectedProjectId);
  const checklist = selectedProject?.checklist || [];

  const handleStartClick = () => {
    // If a project is selected in dropdown, use it. Otherwise null (Random/General).
    const pid = selectedProjectId || null;
    const tid = selectedTaskId || undefined;
    onStart(pid, tid);
  };

  return (
    <div className="h-full bg-slate-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Time Station</h1>
          <p className="text-slate-500">Manage your focus sessions and track deep work.</p>
        </div>

        {/* Control Panel Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">

                {/* Left: Configuration */}
                <div className="p-8 bg-slate-50 border-r border-slate-200 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                <Layers size={14} className="inline mr-1 mb-0.5"/> Select Project
                            </label>
                            <select
                                value={selectedProjectId}
                                onChange={(e) => {
                                    setSelectedProjectId(e.target.value);
                                    setSelectedTaskId(''); // Reset task when project changes
                                }}
                                disabled={timerState.isRunning}
                                className="w-full p-3 rounded-lg border border-slate-300 bg-white text-slate-800 shadow-sm focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 outline-none transition-all disabled:opacity-50"
                            >
                                <option value="">-- No Project (Random Work) --</option>
                                {activeProjects.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.title} {p.status === 'done' ? '(Completed)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedProjectId && checklist.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    <Target size={14} className="inline mr-1 mb-0.5"/> specific Task
                                </label>
                                <select
                                    value={selectedTaskId}
                                    onChange={(e) => setSelectedTaskId(e.target.value)}
                                    disabled={timerState.isRunning}
                                    className="w-full p-3 rounded-lg border border-slate-300 bg-white text-slate-800 shadow-sm focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 outline-none transition-all disabled:opacity-50"
                                >
                                    <option value="">-- General Project Work --</option>
                                    {checklist.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.text} {t.isCompleted ? '✓' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {!selectedProjectId && (
                            <div className="p-4 bg-ocean-50 border border-ocean-100 rounded-lg text-sm text-ocean-800 flex items-start gap-3">
                                <AlertTriangle className="shrink-0 mt-0.5" size={16}/>
                                <div>
                                    <strong>Free Flow Mode:</strong> Time tracked here will be logged to your global stats but won't be assigned to a specific roadmap node.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: The Widget */}
                <div className="p-8 flex items-center justify-center bg-white relative">
                    {/* If running for a different project than selected */}
                    {timerState.isRunning && timerState.projectId && timerState.projectId !== selectedProjectId && selectedProjectId !== '' && (
                         <div className="absolute inset-0 z-10 bg-white/90 flex flex-col items-center justify-center p-6 text-center">
                             <p className="text-slate-600 font-medium mb-4">Timer is running for another project.</p>
                             <button onClick={onStop} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold">Stop Current Timer</button>
                         </div>
                    )}

                    <TimerWidget
                        timerState={timerState}
                        onStart={handleStartClick}
                        onPause={onPause}
                        onStop={onStop}
                        onModeChange={onModeChange}
                        onUpdateSettings={onUpdateSettings}
                    />
                </div>
            </div>
        </div>

        {/* Recent Global History (Placeholder for now) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-ocean-600"/> Recent Activity
            </h3>
            <div className="space-y-3">
                {/* Aggregate all sessions from all projects and sort by date */}
                {projects.flatMap(p => p.sessions?.map(s => ({...s, projectTitle: p.title})) || [])
                    .sort((a, b) => b.startTime - a.startTime)
                    .slice(0, 5)
                    .map(session => (
                        <div key={session.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                            <div>
                                <div className="font-bold text-slate-800 text-sm">{session.projectTitle}</div>
                                <div className="text-xs text-slate-500">
                                    {new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                            <div className="font-mono font-bold text-ocean-700 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                {Math.floor(session.durationSeconds / 60)}m
                            </div>
                        </div>
                    ))}
                {projects.every(p => !p.sessions || p.sessions.length === 0) && (
                    <div className="text-center text-slate-400 py-4 italic">No sessions recorded yet. Start working!</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default TimeStation;
