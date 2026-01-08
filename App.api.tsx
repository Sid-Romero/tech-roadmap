
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Project, UserStats, TimerState, WorkSession, UserProfile, Rank, Badge } from './types';
import { dataService } from './services/dataService.api';
import { gamificationService } from './services/gamificationService';
import RoadmapGraph from './components/RoadmapGraph';
import ProjectModal from './components/ProjectModal';
import PortfolioGrid from './components/PortfolioGrid';
import TableView from './components/TableView';
import TimeStation from './components/TimeStation';
import LevelUpModal from './components/LevelUpModal';
import RewardModal from './components/RewardModal';
import ProfilePanel from './components/ProfilePanel';
import LandingPage from './components/LandingPage';
import PublicProfileViewer from './components/PublicProfileViewer';
import { Trophy, Eye, EyeOff, Layout, Network, Table, Plus, Play, Pause, Square, Hourglass, User, ArrowLeft, RefreshCw, LogOut, Loader } from './components/Icons.api';// ===========================================
// AUTH COMPONENT
// ===========================================
interface AuthScreenProps {
  onAuthSuccess: () => void;
  onBack: () => void;
}

function AuthScreen({ onAuthSuccess, onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await dataService.login(username, password);
        if (success) {
          onAuthSuccess();
        } else {
          setError('Invalid credentials');
        }
      } else {
        await dataService.register(email, username, password);
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ocean-900 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-xl shadow-ocean-900/20 mx-auto mb-4">
            TR
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tech Roadmap</h1>
          <p className="text-slate-500 mt-1">Track your learning journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all"
                  placeholder="you@example.com"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isLogin ? 'Username or Email' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all"
                placeholder="johndoe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-ocean-900 text-white font-medium rounded-lg hover:bg-ocean-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// LOADING COMPONENT
// ===========================================
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-ocean-900 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-xl shadow-ocean-900/20 mx-auto mb-4 animate-pulse">
          TR
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Loader size={16} className="animate-spin" />
          <span>Loading your roadmap...</span>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// MAIN APP COMPONENT
// ===========================================
function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  // App State
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({ xp: 0, level: 1, unlockedBadges: [] });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPortfolioMode, setIsPortfolioMode] = useState(false);
  const [viewMode, setViewMode] = useState<'graph' | 'grid' | 'table' | 'time' | 'profile' | 'public-preview' | 'public-profile'>('profile');
  const [viewingUsername, setViewingUsername] = useState<string | null>(null);

  // Gamification Modal States
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelData, setNewLevelData] = useState<{level: number, rank: Rank} | null>(null);

  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<{xp: number, badges: Badge[], title: string}>({xp: 0, badges: [], title: ''});

  // --- Global Timer Logic ---
  const [timerState, setTimerState] = useState<TimerState>({
    projectId: null,
    taskId: null,
    startTime: null,
    elapsedSeconds: 0,
    isRunning: false,
    mode: 'focus',
    pomodoroDuration: 25 * 60,
    breakDuration: 5 * 60,
    isCountdown: false,
    durationGoal: 60 * 60
  });

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ===========================================
  // DATA LOADING (ASYNC)
  // ===========================================
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [projData, profData] = await Promise.all([
        dataService.getProjects(),
        dataService.getProfile()
      ]);
      setProjects(projData);
      setUserProfile(profData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // If auth error, logout
      if ((error as Error).message?.includes('Session expired')) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = dataService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        await loadData();
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [loadData]);

  // Timer interval effect
  useEffect(() => {
    if (timerState.isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerState.isRunning]);

  // ===========================================
  // AUTH HANDLERS
  // ===========================================
  const handleAuthSuccess = async () => {
    setIsAuthenticated(true);
    await loadData();
  };

  const handleLogout = () => {
    dataService.logout();
    setIsAuthenticated(false);
    setProjects([]);
    setUserProfile({ xp: 0, level: 1, unlockedBadges: [] });
  };

  // ===========================================
  // TIMER HANDLERS
  // ===========================================
  const handleTimerStart = (projectId: string | null, taskId?: string) => {
    if (timerState.projectId && timerState.projectId !== projectId) return;
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      projectId,
      taskId: taskId || null,
      startTime: prev.startTime || Date.now()
    }));
  };

  const handleTimerPause = () => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  };

  const handleTimerStop = async () => {
    if (timerState.elapsedSeconds > 0) {
      // 1. Save Session
      if (timerState.projectId) {
        const session: WorkSession = {
          id: Date.now().toString(),
          startTime: timerState.startTime || Date.now(),
          endTime: Date.now(),
          durationSeconds: timerState.elapsedSeconds,
          type: timerState.mode === 'break' ? 'manual' : timerState.mode as any,
          taskId: timerState.taskId || undefined
        };

        try {
          const updatedProjects = await dataService.addSessionToProject(timerState.projectId, session);
          setProjects(updatedProjects);

          if (selectedProject && selectedProject.id === timerState.projectId) {
            const updatedSelected = updatedProjects.find(p => p.id === selectedProject.id);
            if (updatedSelected) setSelectedProject(updatedSelected);
          }
        } catch (error) {
          console.error('Failed to save session:', error);
        }
      }

      // 2. Award XP
      const hours = timerState.elapsedSeconds / 3600;
      const xpEarned = Math.floor(hours * gamificationService.XP_PER_HOUR_FOCUS);
      if (xpEarned > 0) {
        await handleAwardXP(xpEarned);
      }
    }

    setTimerState(prev => ({
      ...prev,
      projectId: null,
      taskId: null,
      startTime: null,
      elapsedSeconds: 0,
      isRunning: false
    }));
  };

  const handleUpdateTimerSettings = (updates: Partial<TimerState>) => {
    setTimerState(prev => ({ ...prev, ...updates }));
  };

  // ===========================================
  // XP & GAMIFICATION (ASYNC)
  // ===========================================
  const handleAwardXP = async (amount: number, badgesUnlocked: Badge[] = []) => {
    try {
      const currentLevel = userProfile.level;
      let updatedProfile = await dataService.addXP(amount);

      // Update badges
      if (badgesUnlocked.length > 0) {
        const newBadgeIds = [...updatedProfile.unlockedBadges, ...badgesUnlocked.map(b => b.id)];
        updatedProfile = await dataService.updateProfile({ unlockedBadges: newBadgeIds });
      }

      // Check for level up
      const newLevel = gamificationService.getLevel(updatedProfile.xp);

      if (newLevel > currentLevel) {
        const newRank = gamificationService.getCurrentRank(updatedProfile.xp);
        setNewLevelData({ level: newLevel, rank: newRank });
        setShowLevelUp(true);
        updatedProfile = await dataService.updateProfile({ level: newLevel });
      }

      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  };

  // PROFILE HANDLERS (ASYNC)
  // ===========================================
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const newProfile = await dataService.updateProfile(updates);
      setUserProfile(newProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // ===========================================
  // PROJECT HANDLERS (ASYNC)
  // ===========================================
  const handleProjectClick = (project: Project) => {
    if (isPortfolioMode && project.status !== 'done') return;
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleAddProject = async () => {
    try {
      const newProjects = await dataService.addProject({
        title: "New Objective",
        status: 'locked',
        position: { x: 300, y: 300 }
      });
      setProjects(newProjects);

      const addedProject = newProjects.find(p => p.title === "New Objective");
      if (addedProject) {
        setSelectedProject(addedProject);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  };

  const handleSaveProject = async (updatedProject: Project) => {
    try {
      const wasJustCompleted =
        selectedProject?.status !== 'done' && updatedProject.status === 'done';

      // Update completed_at timestamp
      if (wasJustCompleted) {
        updatedProject.completed_at = new Date().toISOString();
      }

      const newProjects = await dataService.updateProject(updatedProject);
      setProjects(newProjects);

      // Update selected project reference
      const fresh = newProjects.find(p => p.id === updatedProject.id);
      if (fresh) setSelectedProject(fresh);

      // Award XP for completion
      if (wasJustCompleted) {
        const complexity = updatedProject.complexity || 1;
        const xpForCompletion = gamificationService.calculateProjectXP(updatedProject);
        const newBadges = gamificationService.checkBadges(userProfile, newProjects);

        setRewardData({
          xp: xpForCompletion,
          badges: newBadges,
          title: updatedProject.title
        });
        setShowReward(true);

        await handleAwardXP(xpForCompletion, newBadges);
      }
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const newProjects = await dataService.deleteProject(id);
        setProjects(newProjects);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const togglePortfolioMode = () => {
    const newValue = !isPortfolioMode;
    setIsPortfolioMode(newValue);
    if (newValue) {
      setViewMode('grid');
    } else {
      setViewMode('graph');
    }
  };

  const handleReset = () => {
    if (confirm('Reset all progress (Projects & XP)? This cannot be undone.')) {
      dataService.resetData();
    }
  };

  // ===========================================
  // COMPUTED VALUES
  // ===========================================
  const stats: UserStats = useMemo(() => {
    const completed = projects.filter(p => p.status === 'done').length;
    const rank = gamificationService.getCurrentRank(userProfile.xp);
    const nextLevelXP = gamificationService.getNextLevelXP(userProfile.level);

    return {
      completedProjects: completed,
      totalProjects: projects.length,
      xp: userProfile.xp,
      level: userProfile.level,
      rankTitle: rank.title,
      nextLevelXP: nextLevelXP,
      currentLevelXP: userProfile.xp
    };
  }, [projects, userProfile]);

  const activeTimerProjectTitle = projects.find(p => p.id === timerState.projectId)?.title;
  const currentRank = gamificationService.getCurrentRank(userProfile.xp);

  // ===========================================
  // RENDER HELPERS
  // ===========================================
  const renderContent = () => {
    switch (viewMode) {
      case 'graph':
        return <RoadmapGraph projects={projects} onNodeClick={handleProjectClick} onProjectUpdate={handleSaveProject} isPortfolioMode={isPortfolioMode} />;
      case 'grid':
        return <div className="h-full overflow-y-auto"><PortfolioGrid projects={projects} onProjectClick={handleProjectClick} userStats={stats} /></div>;
      case 'table':
        return <TableView projects={projects} onProjectClick={handleProjectClick} onStatusChange={(p, s) => handleSaveProject({...p, status: s})} onDelete={handleDeleteProject} />;
      case 'time':
        return <TimeStation
          projects={projects}
          timerState={timerState}
          onStart={handleTimerStart}
          onPause={handleTimerPause}
          onStop={handleTimerStop}
          onModeChange={(m) => setTimerState(prev => ({...prev, mode: m}))}
          onUpdateSettings={handleUpdateTimerSettings}
        />;
      case 'profile':
        return <ProfilePanel
          stats={stats}
          currentRank={currentRank}
          unlockedBadges={userProfile.unlockedBadges}
          projects={projects}
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          onPreview={() => setViewMode('public-preview')}
          onProjectClick={handleProjectClick}
          onViewPublicProfile={(username) => {
            setViewingUsername(username);
            setViewMode('public-profile');
          }}
        />;
      case 'public-preview':
        return <ProfilePanel
          stats={stats}
          currentRank={currentRank}
          unlockedBadges={userProfile.unlockedBadges}
          projects={projects}
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          readOnly={true}
          onProjectClick={handleProjectClick}
        />;
      case 'public-profile':
        if (!viewingUsername) return null;
        return <PublicProfileViewer
          username={viewingUsername}
          onBack={() => {
            setViewMode('profile');
            setViewingUsername(null);
          }}
        />;
      default:
        return null;
    }
  };

  // ===========================================
  // CONDITIONAL RENDERS
  // ===========================================

  // Show loading while checking auth
  if (isAuthenticated === null || (isAuthenticated && isLoading)) {
    return <LoadingScreen />;
  }

  // Show auth screen or landing page if not logged in
  if (!isAuthenticated) {
    // Show auth screen if not logged in
    if (showAuthScreen)
    {
      return <AuthScreen onAuthSuccess={handleAuthSuccess} onBack={() => setShowAuthScreen(false)} />;
    }
  return <LandingPage onLogin={() => setShowAuthScreen(true)} />;
  }

  // ===========================================
  // MAIN RENDER
  // ===========================================
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-ocean-200 selection:text-ocean-900 relative">

      {/* Navbar / HUD */}
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center justify-between px-6 z-40 shrink-0 shadow-sm">
        {viewMode === 'public-preview' ? (
          // simplified header for public preview
          <div className="flex items-center gap-4 w-full justify-between">
            <span className="bg-ocean-100 text-ocean-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse border border-ocean-200">
              Viewing Public Preview
            </span>
            <button
              onClick={() => setViewMode('profile')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-bold shadow-md"
            >
              <ArrowLeft size={18} /> Back to Dashboard
            </button>
          </div>
        ) : (
          // normal header
          <>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-ocean-900 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-ocean-900/20">
                TR
              </div>
              <h1 className="font-bold text-lg hidden md:block tracking-tight text-slate-800">Tech Roadmap</h1>

              {/* XP Bar */}
              <div className="hidden md:flex items-center gap-3 bg-slate-50 rounded-full px-4 py-1.5 border border-slate-200 ml-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setViewMode('profile')}>
                <Trophy size={16} className="text-yellow-500" />
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold text-slate-900">Lvl {stats.level}</span>
                  <span className="text-xs text-slate-500 font-semibold uppercase">{currentRank.title}</span>
                </div>
                <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden ml-2 relative">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, (stats.xp / (stats.nextLevelXP * 1.5)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggles */}
              <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button onClick={() => setViewMode('graph')} className={`p-1.5 rounded transition-all ${viewMode === 'graph' ? 'bg-white text-ocean-600 shadow-sm' : 'text-slate-400'}`} title="Graph"><Network size={18}/></button>
                <button onClick={() => setViewMode('table')} className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-white text-ocean-600 shadow-sm' : 'text-slate-400'}`} title="Table"><Table size={18}/></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white text-ocean-600 shadow-sm' : 'text-slate-400'}`} title="Portfolio"><Layout size={18}/></button>
                <button onClick={() => setViewMode('time')} className={`p-1.5 rounded transition-all ${viewMode === 'time' ? 'bg-white text-ocean-600 shadow-sm' : 'text-slate-400'}`} title="Time Station"><Hourglass size={18}/></button>
                <button onClick={() => setViewMode('profile')} className={`p-1.5 rounded transition-all ${viewMode === 'profile' ? 'bg-white text-ocean-600 shadow-sm' : 'text-slate-400'}`} title="Profile"><User size={18}/></button>
              </div>

              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              {/* CRUD Actions */}
              {!isPortfolioMode && (
                <button onClick={handleAddProject} className="flex items-center gap-2 px-3 py-1.5 bg-ocean-900 text-white font-medium rounded-lg text-sm hover:bg-ocean-800 transition-all shadow-md">
                  <Plus size={16} /> <span className="hidden sm:inline">New Node</span>
                </button>
              )}

              <button onClick={togglePortfolioMode} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${isPortfolioMode ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {isPortfolioMode ? <Eye size={16} /> : <EyeOff size={16} />}
                <span className="hidden sm:inline">{isPortfolioMode ? 'Public View' : 'Editor'}</span>
              </button>

              {!isPortfolioMode && (
                <button onClick={handleReset} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Reset Data">
                  <RefreshCw size={16} />
                </button>
              )}

              {/* Logout Button */}
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {renderContent()}
      </main>

      {/* Floating Active Timer Bar */}
      {!isPortfolioMode && (timerState.projectId || timerState.isRunning) && !isModalOpen && viewMode !== 'time' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-4 border border-slate-700">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Mission</span>
              <span className="text-xs font-bold truncate max-w-[150px]">{activeTimerProjectTitle || 'General Focus'}</span>
            </div>
            <div className="font-mono text-xl font-bold text-ocean-400 w-24 text-center">
              {new Date(timerState.elapsedSeconds * 1000).toISOString().substr(11, 8)}
            </div>
            <div className="flex items-center gap-1 bg-slate-800 rounded-full p-1">
              {timerState.isRunning ? (
                <button onClick={handleTimerPause} className="p-2 rounded-full hover:bg-slate-700 text-white"><Pause size={16}/></button>
              ) : (
                <button onClick={() => handleTimerStart(timerState.projectId, timerState.taskId || undefined)} className="p-2 rounded-full hover:bg-slate-700 text-ocean-400"><Play size={16}/></button>
              )}
              <button onClick={handleTimerStop} className="p-2 rounded-full hover:bg-red-900/50 text-red-400"><Square size={16}/></button>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Celebration */}
      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        newLevel={newLevelData?.level || 1}
        newRank={newLevelData?.rank || {id:'novice', title:'Novice', minXP:0, icon:'Star', color:''}}
      />

      {/* Project Completion Reward */}
      <RewardModal
        isOpen={showReward}
        onClose={() => setShowReward(false)}
        xpGained={rewardData.xp}
        badges={rewardData.badges}
        projectTitle={rewardData.title}
      />

      {/* Detail Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={selectedProject}
        allProjects={projects}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        readOnly={isPortfolioMode || viewMode === 'public-preview'}
        globalTimerState={timerState}
        onTimerStart={handleTimerStart}
        onTimerPause={handleTimerPause}
      />
    </div>
  );
}

export default App;
