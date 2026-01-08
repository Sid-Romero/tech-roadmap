
import React, { useRef, useState } from 'react';
import { UserStats, Rank, Project, UserProfile } from '../types';
import { RANKS, BADGES } from '../constants';
import { Trophy, Star, Clock, Lock, CheckCircle2, ExternalLink, Pencil, Camera, AlertTriangle, ShieldCheck, Globe, FileText, Zap, Eye, Download, X, Search, Users } from './Icons.api';
import CVModal from './CVModal';

interface ProfilePanelProps {
  stats: UserStats;
  currentRank: Rank;
  unlockedBadges: string[];
  projects: Project[];
  userProfile: UserProfile;
  username?: string;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  readOnly?: boolean;
  onPreview?: () => void;
  onProjectClick?: (project: Project) => void;
  onViewPublicProfile?: (username: string) => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({
    stats, currentRank, unlockedBadges, projects, userProfile, username, onUpdateProfile, readOnly = false, onPreview, onProjectClick, onViewPublicProfile
}) => {
  // Refs for file inputs
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');

  // Private Profile View
  if (readOnly && !userProfile.isPublic) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-500 pb-20">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Lock size={48} className="text-slate-300"/>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Private Profile</h2>
              <p className="text-slate-400">This user has chosen to keep their roadmap private.</p>
          </div>
      );
  }

  // Helper to process image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'bannerUrl') => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
          setErrorMsg("Image size exceeds 2MB limit.");
          setTimeout(() => setErrorMsg(null), 3000);
          return;
      }

      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result as string;
          onUpdateProfile({ [field]: base64String });
      };
      reader.readAsDataURL(file);

      // Reset input value to allow re-uploading same file if needed
      e.target.value = '';
  };

  const handleToggle = (key: keyof UserProfile) => {
      onUpdateProfile({ [key]: !userProfile[key] });
  };

  // Calculate progress to next rank
  const nextRank = RANKS.find(r => r.minXP > stats.xp) || RANKS[RANKS.length - 1];
  const isMaxRank = currentRank.id === nextRank.id;

  const xpInRank = stats.xp - currentRank.minXP;
  const xpNeeded = nextRank.minXP - currentRank.minXP;
  const progressPercent = isMaxRank ? 100 : Math.min(100, Math.max(0, (xpInRank / xpNeeded) * 100));

  // Project Filtering logic
  const visibleProjects = readOnly
    ? projects.filter(p => p.status === 'done' || (userProfile.showInProgress && p.status === 'in_progress'))
    : projects.filter(p => p.status === 'done');

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-10">

      {/* Inputs for File Upload - Only render if not readOnly */}
      {!readOnly && (
          <>
            <input
                type="file"
                ref={bannerInputRef}
                onChange={(e) => handleImageUpload(e, 'bannerUrl')}
                className="hidden"
                accept="image/*"
            />
            <input
                type="file"
                ref={avatarInputRef}
                onChange={(e) => handleImageUpload(e, 'avatarUrl')}
                className="hidden"
                accept="image/*"
            />
          </>
      )}

      {/* Error Toast */}
      {errorMsg && (
          <div className="fixed top-20 right-6 z-50 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-top-5">
              <AlertTriangle size={18} />
              <span className="text-sm font-bold">{errorMsg}</span>
          </div>
      )}

      {/* Banner & Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="h-48 relative group overflow-hidden">
             {/* Banner Image or Placeholder */}
             {userProfile.bannerUrl ? (
                 <img src={userProfile.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
             ) : (
                 <div className="w-full h-full bg-gradient-to-r from-ocean-600 via-indigo-600 to-purple-600 relative">
                     <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>
                     <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                 </div>
             )}

             {/* Edit Banner Buttons */}
             {!readOnly && (
                 <div className="absolute top-4 right-4 flex gap-2">
                     <button
                        onClick={() => bannerInputRef.current?.click()}
                        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all transform hover:scale-105"
                        title="Change Banner"
                     >
                         <Camera size={18} />
                     </button>
                     {userProfile.bannerUrl && (
                         <button
                            onClick={() => onUpdateProfile({ bannerUrl: null as any })}
                            className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all transform hover:scale-105"
                            title="Remove Banner"
                         >
                             <X size={18} />
                         </button>
                     )}
                 </div>
             )}
        </div>

        <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end md:items-center -mt-16 gap-6 relative pb-8">
                {/* Avatar */}
                <div className="relative group shrink-0">
                    <div className="w-32 h-32 bg-slate-900 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white overflow-hidden relative z-10">
                        {userProfile.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold tracking-tighter">TR</span>
                        )}

                        {/* Avatar Level Badge */}
                        <div className="absolute -bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Edit Avatar Buttons */}
                    {!readOnly && (
                        <>
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute bottom-2 right-[-8px] z-20 bg-white text-slate-700 hover:text-ocean-600 p-1.5 rounded-full border border-slate-200 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                title="Change Avatar"
                            >
                                <Pencil size={14} />
                            </button>
                            {userProfile.avatarUrl && (
                                <button
                                    onClick={() => onUpdateProfile({ avatarUrl: null as any })}
                                    className="absolute bottom-2 left-[-8px] z-20 bg-red-500 text-white hover:bg-red-600 p-1.5 rounded-full border border-white shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                    title="Remove Avatar"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </>
                    )}

                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 bg-yellow-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full border border-white shadow-sm flex items-center gap-1 whitespace-nowrap">
                        <Star size={12} fill="currentColor"/> Lvl {stats.level}
                    </div>
                </div>

                <div className="flex-1 mb-1 pt-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">{username || 'User'}</h2>
                    <div className="text-sm font-semibold text-slate-500 mt-2">{currentRank.title}</div>
                    <div className="text-slate-500 font-medium flex flex-wrap items-center gap-x-4 gap-y-1 mt-0">
                        <span className="flex items-center gap-1.5"><Trophy size={14} className="text-ocean-500"/> {stats.xp.toLocaleString()} XP</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500"/> {stats.completedProjects} Projects</span>
                    </div>
                </div>

                {/* Rank Progress */}
                <div className="w-full md:w-80 bg-white rounded-xl p-4 border border-slate-200 shadow-sm mt-4 md:mt-0">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                        <span>Current Arena</span>
                        <span>{isMaxRank ? 'Max Rank' : 'Next Rank'}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-800 mb-2">
                        <span>{currentRank.title}</span>
                        <span className={isMaxRank ? 'text-ocean-600' : 'text-slate-400'}>{nextRank.title}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                        <div className="h-full bg-gradient-to-r from-ocean-500 to-indigo-500 transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 mt-1 font-mono">
                        {Math.floor(xpInRank)} / {isMaxRank ? '∞' : xpNeeded} XP
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-12">

        {/* Search Bar - Prominent at top */}
        {!readOnly && onViewPublicProfile && (
            <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Find Other Developers</h3>
                    <p className="text-slate-500 text-sm">Search for public profiles by username</p>
                </div>
                <div className="flex gap-3 max-w-2xl mx-auto">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchUsername.trim()) {
                                    onViewPublicProfile(searchUsername.trim());
                                    setSearchUsername('');
                                }
                            }}
                            placeholder="Enter a username..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent focus:bg-white text-base transition-all"
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (searchUsername.trim()) {
                                onViewPublicProfile(searchUsername.trim());
                                setSearchUsername('');
                            }
                        }}
                        disabled={!searchUsername.trim()}
                        className="px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all text-sm font-bold uppercase tracking-wide"
                    >
                        Search
                    </button>
                </div>
            </section>
        )}

        {/* Badges Collection */}
        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20}/> Badge Collection
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {BADGES.map(badge => {
                    const isUnlocked = unlockedBadges.includes(badge.id);
                    return (
                        <div key={badge.id} className={`
                            relative p-4 rounded-xl border transition-all
                            ${isUnlocked
                                ? 'bg-white border-ocean-200 shadow-sm hover:border-ocean-400'
                                : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}
                        `}>
                            <div className="flex items-start gap-3">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                    ${isUnlocked ? 'bg-ocean-50 text-ocean-600' : 'bg-slate-200 text-slate-400'}
                                `}>
                                    <Star size={18} fill={isUnlocked ? "currentColor" : "none"}/>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <h4 className="font-bold text-sm text-slate-800">{badge.title}</h4>
                                        {isUnlocked && <CheckCircle2 size={12} className="text-emerald-500"/>}
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">{badge.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>

        {/* Privacy & Portfolio Settings - Hidden in Read Only Mode */}
        {!readOnly && (
            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                 <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <ShieldCheck className="text-slate-600" size={20}/>
                        <h3 className="text-lg font-bold text-slate-900">Privacy & Portfolio Settings</h3>
                     </div>
                     <div className="flex gap-4">
                        <button
                             onClick={() => setIsCVModalOpen(true)}
                             className="text-xs font-bold text-slate-700 flex items-center gap-1 hover:text-ocean-600 transition-colors"
                        >
                            <FileText size={14}/> Generate CV
                        </button>
                        <button
                             onClick={onPreview}
                             className="text-xs font-bold text-ocean-600 flex items-center gap-1 hover:underline"
                        >
                            <Eye size={14}/> Preview Public Profile
                        </button>
                     </div>
                 </div>
                 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                         {/* Public Profile Toggle */}
                         <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                             <div className="flex items-start gap-3">
                                 <div className={`p-2 rounded-full ${userProfile.isPublic ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                     <Globe size={20} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-slate-800 text-sm">Public Profile</h4>
                                     <p className="text-xs text-slate-500 max-w-[200px]">Allow others to view your roadmap and stats.</p>
                                 </div>
                             </div>
                             <button
                                 onClick={() => handleToggle('isPublic')}
                                 className={`w-11 h-6 rounded-full transition-colors relative ${userProfile.isPublic ? 'bg-ocean-600' : 'bg-slate-200'}`}
                             >
                                 <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${userProfile.isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                         </div>

                         {/* Show In Progress Toggle */}
                         <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                             <div className="flex items-start gap-3">
                                 <div className={`p-2 rounded-full ${userProfile.showInProgress ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                                     <Zap size={20} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-slate-800 text-sm">Show "In Progress"</h4>
                                     <p className="text-xs text-slate-500 max-w-[200px]">Display active projects in your public portfolio.</p>
                                 </div>
                             </div>
                             <button
                                 onClick={() => handleToggle('showInProgress')}
                                 className={`w-11 h-6 rounded-full transition-colors relative ${userProfile.showInProgress ? 'bg-ocean-600' : 'bg-slate-200'}`}
                             >
                                 <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${userProfile.showInProgress ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                         </div>
                     </div>

                     <div className="space-y-4">
                         {/* Personal CV Toggle */}
                         <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                             <div className="flex items-start gap-3">
                                 <div className={`p-2 rounded-full ${userProfile.showPersonalCV ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                     <FileText size={20} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-slate-800 text-sm">Personal CV</h4>
                                     <p className="text-xs text-slate-500 max-w-[200px]">Allow download of your uploaded Resume/CV.</p>
                                 </div>
                             </div>
                             <button
                                 onClick={() => handleToggle('showPersonalCV')}
                                 className={`w-11 h-6 rounded-full transition-colors relative ${userProfile.showPersonalCV ? 'bg-ocean-600' : 'bg-slate-200'}`}
                             >
                                 <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${userProfile.showPersonalCV ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                         </div>

                         {/* Generated CV Toggle */}
                         <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                             <div className="flex items-start gap-3">
                                 <div className={`p-2 rounded-full ${userProfile.showGeneratedCV ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                     <CheckCircle2 size={20} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-slate-800 text-sm">Generated Portfolio</h4>
                                     <p className="text-xs text-slate-500 max-w-[200px]">Auto-generate a CV based on completed nodes.</p>
                                 </div>
                             </div>
                             <button
                                 onClick={() => handleToggle('showGeneratedCV')}
                                 className={`w-11 h-6 rounded-full transition-colors relative ${userProfile.showGeneratedCV ? 'bg-ocean-600' : 'bg-slate-200'}`}
                             >
                                 <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${userProfile.showGeneratedCV ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                         </div>
                     </div>
                 </div>
            </section>
        )}

        {/* Project List */}
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={20}/>
                    {readOnly ? 'Public Projects' : 'Completed Missions'}
                </h3>
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{visibleProjects.length} Items</span>
            </div>

            {visibleProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleProjects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => onProjectClick?.(project)}
                            className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-ocean-300 transition-all group cursor-pointer"
                        >
                             <div className={`h-1.5 bg-gradient-to-r ${project.status === 'in_progress' ? 'from-sky-400 to-ocean-500' : 'from-emerald-400 to-ocean-500'}`}></div>
                             <div className="p-5">
                                 <div className="flex justify-between items-start mb-2">
                                     <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                                         {project.category}
                                     </span>
                                     {project.status === 'in_progress' ? (
                                        <span className="bg-sky-50 text-sky-600 text-[10px] font-bold px-2 py-1 rounded border border-sky-100 uppercase tracking-wider">
                                            In Progress
                                        </span>
                                     ) : (
                                         <div className="flex gap-1">
                                            {[...Array(project.complexity || 1)].map((_, i) => (
                                                <div key={i} className="w-1 h-3 rounded-full bg-ocean-400"></div>
                                            ))}
                                         </div>
                                     )}
                                 </div>
                                 <h4 className="font-bold text-slate-900 mb-2 group-hover:text-ocean-700 transition-colors">{project.title}</h4>
                                 <p className="text-xs text-slate-500 mb-4 line-clamp-2">{project.description}</p>

                                 <div className="flex flex-wrap gap-1 mb-4">
                                     {(project.tech_stack || []).slice(0, 3).map(tech => (
                                         <span key={tech} className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100">{tech}</span>
                                     ))}
                                     {(project.tech_stack || []).length > 3 && <span className="text-[10px] text-slate-400">+{(project.tech_stack || []).length - 3}</span>}
                                 </div>

                                 <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                     <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                                         <Clock size={12}/> {project.time_spent_hours || 0}h
                                     </span>
                                     {project.github_url && (
                                         <a href={project.github_url} target="_blank" rel="noreferrer" className="text-xs text-ocean-600 font-bold hover:underline flex items-center gap-1">
                                             Repo <ExternalLink size={12}/>
                                         </a>
                                     )}
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Lock size={20}/>
                    </div>
                    <p className="text-slate-500 font-medium">No visible projects.</p>
                </div>
            )}
        </section>

      </div>

      {/* CV Generator Modal */}
      <CVModal
          isOpen={isCVModalOpen}
          onClose={() => setIsCVModalOpen(false)}
          projects={projects}
          userProfile={userProfile}
          onUpdateProfile={onUpdateProfile}
      />

    </div>
  );
};

export default ProfilePanel;
