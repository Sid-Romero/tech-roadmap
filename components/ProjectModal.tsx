import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectStatus, SubTask, Resource, TimerState } from '../types';
import {
  X, Save, Github, Clock, BookOpen, CheckCircle2,
  ListTodo, Link2, Layers, Settings, Trash2, Plus, Zap,
  History, Play, Pause, AlertTriangle, TrendingUp, TrendingDown
} from './Icons.api';

interface ProjectModalProps {
  project: Project | null;
  allProjects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;

  // Timer Props passed from global context
  globalTimerState: TimerState;
  onTimerStart: (projectId: string) => void;
  onTimerPause: () => void;
}

type Tab = 'overview' | 'tactics' | 'intel' | 'log' | 'system';

const ProjectModal: React.FC<ProjectModalProps> = ({
    project, allProjects, isOpen, onClose, onSave, onDelete, readOnly = false,
    globalTimerState, onTimerStart, onTimerPause
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [newTech, setNewTech] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newResourceLabel, setNewResourceLabel] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  // Is this specific project currently running on the global timer?
  const isTimerActiveForThisProject = globalTimerState.projectId === project?.id;

  useEffect(() => {
    if (project) {
      setFormData(JSON.parse(JSON.stringify(project))); // Deep copy
      setActiveTab('overview');
    }
  }, [project]);

  // --- Chart Data Calculation ---
  const sessionChartData = useMemo(() => {
    if (!formData.sessions || formData.sessions.length === 0) return [];

    const daysMap = new Map<string, number>();

    // Sort chronological first
    const sortedSessions = [...formData.sessions].sort((a,b) => a.startTime - b.startTime);

    sortedSessions.forEach(session => {
        const dateKey = new Date(session.startTime).toISOString().split('T')[0]; // YYYY-MM-DD
        const current = daysMap.get(dateKey) || 0;
        daysMap.set(dateKey, current + session.durationSeconds);
    });

    // Convert to array format
    const chartData = Array.from(daysMap.entries()).map(([dateIso, seconds]) => {
        const dateObj = new Date(dateIso);
        return {
            label: dateObj.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
            fullDate: dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'}),
            hours: parseFloat((seconds / 3600).toFixed(1))
        };
    });

    // Return last 7 active days
    return chartData.slice(-7);
  }, [formData.sessions]);

  const maxChartHours = useMemo(() => {
      if (sessionChartData.length === 0) return 1;
      return Math.max(...sessionChartData.map(d => d.hours), 0.5); // Min 0.5 to avoid div/0
  }, [sessionChartData]);


  if (!isOpen || !project) return null;

  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange('status', e.target.value as ProjectStatus);
  };

  const handleSave = () => {
    if (project && formData) {
      onSave({ ...project, ...formData } as Project);
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(project.id);
  };

  // --- List Management Helpers ---

  const addTech = () => {
    if(!newTech) return;
    const current = formData.tech_stack || [];
    handleChange('tech_stack', [...current, newTech]);
    setNewTech('');
  };

  const removeTech = (tech: string) => {
    handleChange('tech_stack', (formData.tech_stack || []).filter(t => t !== tech));
  };

  const addTask = () => {
    if(!newTask) return;
    const task: SubTask = { id: Date.now().toString(), text: newTask, isCompleted: false };
    handleChange('checklist', [...(formData.checklist || []), task]);
    setNewTask('');
  };

  const toggleTask = (taskId: string) => {
    const updated = (formData.checklist || []).map(t =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    handleChange('checklist', updated);
  };

  const removeTask = (taskId: string) => {
    handleChange('checklist', (formData.checklist || []).filter(t => t.id !== taskId));
  };

  const addResource = () => {
    if(!newResourceLabel || !newResourceUrl) return;
    const res: Resource = { id: Date.now().toString(), label: newResourceLabel, url: newResourceUrl };
    handleChange('resources', [...(formData.resources || []), res]);
    setNewResourceLabel('');
    setNewResourceUrl('');
  };

  const removeResource = (resId: string) => {
    handleChange('resources', (formData.resources || []).filter(r => r.id !== resId));
  };

  const formatDuration = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
  };

  // --- Rendering ---

  const statusColors = {
    locked: 'bg-slate-200 text-slate-600',
    unlocked: 'bg-slate-100 text-slate-800 border-slate-300 border',
    in_progress: 'bg-sky-100 text-sky-700 border-sky-200 border',
    done: 'bg-emerald-100 text-emerald-700 border-emerald-200 border'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 md:p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0 bg-slate-50/50 rounded-t-xl">
          <div className="w-full mr-4">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider font-semibold ${statusColors[formData.status || 'locked']}`}>
                {formData.status?.replace('_', ' ')}
              </span>
              <span className="text-slate-500 text-xs font-mono">ID: {project.id} • {formData.category}</span>
            </div>
            {readOnly ? (
               <h2 className="text-2xl font-bold text-slate-900">{formData.title}</h2>
            ) : (
               <input
                 className="text-2xl font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-ocean-500 outline-none w-full"
                 value={formData.title}
                 onChange={(e) => handleChange('title', e.target.value)}
               />
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-6 overflow-x-auto shrink-0 bg-white">
          {[
            { id: 'overview', icon: Layers, label: 'Overview' },
            { id: 'tactics', icon: ListTodo, label: 'Tactics' },
            { id: 'intel', icon: Link2, label: 'Intel' },
            { id: 'log', icon: BookOpen, label: 'Log & History' },
            { id: 'system', icon: Settings, label: 'System', hidden: readOnly },
          ].map(tab => !tab.hidden && (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-slate-700'}
              `}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
               {/* Quick Action Bar */}
               {!readOnly && (
                   <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs uppercase font-bold text-slate-400">Total Focus</span>
                                <span className="text-2xl font-mono font-bold text-slate-800">{formData.time_spent_hours}h</span>
                            </div>
                            <div className="w-px h-8 bg-slate-300 mx-2"></div>
                            <div className="flex flex-col">
                                <span className="text-xs uppercase font-bold text-slate-400">Sessions</span>
                                <span className="text-lg font-mono font-bold text-slate-600">{formData.sessions?.length || 0}</span>
                            </div>
                        </div>

                        {/* Quick Start Button */}
                        <div>
                            {isTimerActiveForThisProject && globalTimerState.isRunning ? (
                                <button
                                    onClick={onTimerPause}
                                    className="flex items-center gap-2 px-6 py-3 bg-ocean-100 text-ocean-700 font-bold rounded-lg border border-ocean-200 hover:bg-ocean-200 transition-all"
                                >
                                    <Pause size={20} fill="currentColor"/> Pause Mission
                                </button>
                            ) : (
                                <button
                                    onClick={() => onTimerStart(project.id)}
                                    className="flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white font-bold rounded-lg hover:bg-ocean-700 transition-all shadow-lg shadow-ocean-600/20"
                                >
                                    <Play size={20} fill="currentColor"/> Start Focus Session
                                </button>
                            )}
                        </div>
                   </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Col */}
                  <div className="space-y-6">
                    <div>
                        <label className="text-slate-500 text-xs uppercase font-bold mb-2 block">Description</label>
                        <textarea
                          rows={4}
                          disabled={readOnly}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 outline-none resize-none"
                          value={formData.description}
                          onChange={e => handleChange('description', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-slate-500 text-xs uppercase font-bold mb-2 block">Tech Stack</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tech_stack?.map(tech => (
                                <span key={tech} className="px-2.5 py-1 bg-white border border-slate-200 shadow-sm rounded-md text-sm text-slate-700 flex items-center gap-2 font-medium">
                                    {tech}
                                    {!readOnly && <button onClick={() => removeTech(tech)} className="hover:text-red-500 text-slate-400"><X size={12}/></button>}
                                </span>
                            ))}
                        </div>
                        {!readOnly && (
                            <div className="flex gap-2">
                                <input
                                    className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm text-slate-700 focus:border-ocean-500 outline-none flex-1"
                                    placeholder="Add tech..."
                                    value={newTech}
                                    onChange={e => setNewTech(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addTech()}
                                />
                                <button onClick={addTech} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-600 text-xs"><Plus size={14}/></button>
                            </div>
                        )}
                    </div>
                  </div>

                  {/* Right Col */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-500 text-xs uppercase font-bold mb-2 block">Complexity (1-5)</label>
                            <input
                                type="range" min="1" max="5" step="1"
                                disabled={readOnly}
                                value={formData.complexity || 1}
                                onChange={e => handleChange('complexity', parseInt(e.target.value))}
                                className="w-full accent-ocean-600"
                            />
                            <div className="flex justify-between text-xs text-slate-500 font-medium mt-1">
                                <span>Novice</span>
                                <span>Expert</span>
                            </div>
                        </div>
                        <div>
                             <label className="text-slate-500 text-xs uppercase font-bold mb-2 flex items-center gap-1">
                                <TrendingUp size={12}/> Priority
                             </label>
                             <div className="flex bg-slate-100 p-1 rounded-lg">
                                {[
                                    {val: 'low', label: 'Low', activeClass: 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200'},
                                    {val: 'medium', label: 'Med', activeClass: 'bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-200'},
                                    {val: 'high', label: 'High', activeClass: 'bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-200'}
                                ].map((opt) => (
                                    <button
                                        key={opt.val}
                                        disabled={readOnly}
                                        onClick={() => handleChange('priority', opt.val)}
                                        className={`flex-1 py-1.5 text-xs font-bold uppercase rounded transition-all
                                            ${(formData.priority || 'medium') === opt.val ? opt.activeClass : 'text-slate-400 hover:text-slate-600'}
                                        `}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-500 text-xs uppercase font-bold mb-2 block">Project Status</label>
                        <select
                            disabled={readOnly}
                            value={formData.status}
                            onChange={handleStatusChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-700 focus:border-ocean-500 outline-none font-medium"
                        >
                            <option value="locked">Locked</option>
                            <option value="unlocked">Todo (Unlocked)</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-slate-500 text-xs uppercase font-bold mb-2 flex items-center gap-2"><Github size={14}/> Repo URL</label>
                            <input
                            type="text"
                            disabled={readOnly}
                            value={formData.github_url || ''}
                            onChange={e => handleChange('github_url', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-700 outline-none text-xs"
                            placeholder="https://github.com/..."
                        />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: TACTICS (Tasks) */}
          {activeTab === 'tactics' && (
              <div className="space-y-6">
                   <div className="flex items-center justify-between">
                       <h3 className="text-slate-900 font-bold">Mission Checklist</h3>
                       <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                           {formData.checklist?.filter(t => t.isCompleted).length || 0} / {formData.checklist?.length || 0} Completed
                       </div>
                   </div>

                   {/* Progress Bar */}
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                       <div
                         className="h-full bg-ocean-500 transition-all duration-300"
                         style={{ width: `${(formData.checklist?.length ? (formData.checklist.filter(t => t.isCompleted).length / formData.checklist.length * 100) : 0)}%`}}
                       />
                   </div>

                   <div className="space-y-2">
                       {formData.checklist?.map(task => (
                           <div key={task.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded hover:border-ocean-300 transition-colors shadow-sm">
                               <button
                                 onClick={() => !readOnly && toggleTask(task.id)}
                                 className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-ocean-500 bg-white'}`}
                               >
                                   {task.isCompleted && <CheckCircle2 size={14} />}
                               </button>
                               <span className={`flex-1 text-sm ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>{task.text}</span>
                               {!readOnly && (
                                   <button onClick={() => removeTask(task.id)} className="text-slate-400 hover:text-red-500">
                                       <X size={16} />
                                   </button>
                               )}
                           </div>
                       ))}
                   </div>

                   {!readOnly && (
                       <div className="flex gap-2 border-t border-slate-100 pt-4">
                           <input
                               className="flex-1 bg-slate-50 border border-slate-200 rounded p-2 text-slate-700 outline-none"
                               placeholder="Add new objective..."
                               value={newTask}
                               onChange={e => setNewTask(e.target.value)}
                               onKeyDown={e => e.key === 'Enter' && addTask()}
                           />
                           <button onClick={addTask} className="px-4 py-2 bg-ocean-900 text-white rounded hover:bg-ocean-800 text-sm font-medium shadow">Add</button>
                       </div>
                   )}
              </div>
          )}

          {/* TAB: INTEL (Resources) */}
          {activeTab === 'intel' && (
              <div className="space-y-6">
                  <h3 className="text-slate-900 font-bold">Resources & Intelligence</h3>
                  <div className="grid grid-cols-1 gap-3">
                      {formData.resources?.map(res => (
                          <div key={res.id} className="flex items-center justify-between p-3 bg-white rounded border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                              <a href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-ocean-700 hover:underline overflow-hidden group">
                                  <div className="p-2 bg-ocean-50 text-ocean-600 rounded-lg group-hover:bg-ocean-100">
                                     <Link2 size={18} className="shrink-0" />
                                  </div>
                                  <div className="flex flex-col truncate">
                                      <span className="font-semibold text-sm text-slate-800 group-hover:text-ocean-700">{res.label}</span>
                                      <span className="text-xs text-slate-500 truncate">{res.url}</span>
                                  </div>
                              </a>
                              {!readOnly && (
                                <button onClick={() => removeResource(res.id)} className="text-slate-400 hover:text-red-500 shrink-0 ml-2">
                                    <X size={16} />
                                </button>
                              )}
                          </div>
                      ))}
                  </div>

                  {!readOnly && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                          <input
                              className="md:col-span-1 bg-slate-50 border border-slate-200 rounded p-2 text-slate-700 outline-none text-sm"
                              placeholder="Label (e.g. Documentation)"
                              value={newResourceLabel}
                              onChange={e => setNewResourceLabel(e.target.value)}
                          />
                          <input
                              className="md:col-span-1 bg-slate-50 border border-slate-200 rounded p-2 text-slate-700 outline-none text-sm"
                              placeholder="URL"
                              value={newResourceUrl}
                              onChange={e => setNewResourceUrl(e.target.value)}
                          />
                          <button onClick={addResource} className="md:col-span-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 text-sm font-medium">Add Resource</button>
                      </div>
                  )}
              </div>
          )}

          {/* TAB: LOG (Markdown) & HISTORY */}
          {activeTab === 'log' && (
              <div className="h-full flex flex-col md:flex-row gap-6">
                  {/* Markdown Editor */}
                  <div className="flex-1 flex flex-col h-full">
                      <h3 className="text-slate-900 font-bold mb-4">Captain's Log (Notes)</h3>
                      {readOnly ? (
                           <div className="flex-1 bg-slate-50 p-6 rounded-lg border border-slate-200 overflow-y-auto">
                               <pre className="whitespace-pre-wrap text-sm text-slate-600 font-mono leading-relaxed">{formData.notes || "No entries yet."}</pre>
                           </div>
                      ) : (
                          <textarea
                            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700 focus:border-ocean-500 outline-none font-mono text-sm resize-none leading-relaxed shadow-inner"
                            placeholder="# Log Entry 2024.10.15&#10;- Implemented initial heuristic detection..."
                            value={formData.notes || ''}
                            onChange={e => handleChange('notes', e.target.value)}
                          />
                      )}
                  </div>

                  {/* Session History Sidebar with Chart */}
                  <div className="w-full md:w-1/3 border-l border-slate-100 pl-6 flex flex-col">
                      <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                          <History size={16}/> Session Activity
                      </h3>

                      {/* Bar Chart Visualization */}
                      {sessionChartData.length > 0 && (
                          <div className="mb-6 p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="h-24 flex items-end justify-between gap-1">
                                  {sessionChartData.map((data, idx) => {
                                      const heightPercent = Math.max(10, (data.hours / maxChartHours) * 100);
                                      return (
                                          <div key={idx} className="flex flex-col items-center flex-1 group relative">
                                              <div className="w-full bg-ocean-200 rounded-t-sm hover:bg-ocean-400 transition-all relative" style={{height: `${heightPercent}%`}}>
                                                 {/* Tooltip */}
                                                 <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity">
                                                     {data.fullDate}: {data.hours}h
                                                 </div>
                                              </div>
                                              <span className="text-[9px] text-slate-400 mt-1 font-mono">{data.label}</span>
                                          </div>
                                      )
                                  })}
                              </div>
                              <div className="text-[10px] text-center text-slate-400 mt-2 font-medium">Last 7 Active Days</div>
                          </div>
                      )}

                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                          {formData.sessions && formData.sessions.length > 0 ? (
                              [...formData.sessions].reverse().map(session => (
                                  <div key={session.id} className="bg-slate-50 border border-slate-200 rounded p-3 text-sm hover:bg-slate-100 transition-colors">
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="font-mono font-bold text-slate-700">{formatDuration(session.durationSeconds)}</span>
                                          <span className="text-[10px] text-slate-400 uppercase bg-white border border-slate-200 px-1 rounded">{session.type}</span>
                                      </div>
                                      <div className="text-xs text-slate-500">
                                          {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <div className="text-slate-400 text-xs italic text-center py-4">No recorded sessions.</div>
                          )}
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: SYSTEM (Settings) */}
          {activeTab === 'system' && !readOnly && (
              <div className="space-y-8">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h3 className="text-slate-900 font-bold mb-4 border-b border-slate-200 pb-2">Coordinates</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-slate-500 text-xs font-bold block mb-1">X Position</label>
                              <input
                                  type="number"
                                  value={formData.position?.x}
                                  onChange={e => handleChange('position', { ...formData.position, x: parseInt(e.target.value) })}
                                  className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700"
                              />
                          </div>
                           <div>
                              <label className="text-slate-500 text-xs font-bold block mb-1">Y Position</label>
                              <input
                                  type="number"
                                  value={formData.position?.y}
                                  onChange={e => handleChange('position', { ...formData.position, y: parseInt(e.target.value) })}
                                  className="w-full bg-white border border-slate-200 rounded p-2 text-slate-700"
                              />
                          </div>
                      </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                      <button
                          onClick={handleDelete}
                          className="w-full py-3 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                          <Trash2 size={18} /> Delete Node Permanently
                      </button>
                  </div>
              </div>
          )}

        </div>

        {/* Footer */}
        {!readOnly && (
          <div className="p-6 border-t border-slate-200 flex justify-between gap-3 shrink-0 bg-slate-50/80 rounded-b-xl">
            <div className="text-xs text-slate-500 flex items-center">
                {formData.checklist?.filter(t => t.isCompleted).length}/{formData.checklist?.length} Tasks • {formData.sessions?.length || 0} Sessions
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                Cancel
                </button>
                <button
                onClick={handleSave}
                className="px-6 py-2 bg-ocean-900 hover:bg-ocean-800 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-md shadow-ocean-900/20"
                >
                <Save size={18} /> Save Changes
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectModal;
