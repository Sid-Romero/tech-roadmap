
import React, { useState, useEffect, useRef } from 'react';
import { Project, UserProfile, CVConfig } from '../types';
import { X, Save, Download, FileText, CheckSquare, Square, CheckCircle2 } from './Icons.api';

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const CVModal: React.FC<CVModalProps> = ({ isOpen, onClose, projects, userProfile, onUpdateProfile }) => {
  const [config, setConfig] = useState<CVConfig>({
      displayName: '',
      jobTitle: '',
      bio: '',
      excludedProjectIds: [],
      contactEmail: '',
      contactGithub: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const cvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        // Load config from profile or set defaults
        setConfig(prev => ({
            ...prev,
            displayName: userProfile.cvConfig?.displayName || 'Developer Name',
            jobTitle: userProfile.cvConfig?.jobTitle || 'Full Stack Developer',
            bio: userProfile.cvConfig?.bio || 'Driven developer building scalable solutions.',
            excludedProjectIds: userProfile.cvConfig?.excludedProjectIds || [],
            contactEmail: userProfile.cvConfig?.contactEmail || '',
            contactGithub: userProfile.cvConfig?.contactGithub || ''
        }));
    }
  }, [isOpen, userProfile.cvConfig]);

  if (!isOpen) return null;

  // Filter Projects
  const completedProjects = projects
      .filter(p => p.status === 'done')
      .filter(p => !config.excludedProjectIds.includes(p.id));

  // Aggregate Skills
  const allSkills = Array.from(new Set(completedProjects.flatMap(p => p.tech_stack))).sort();

  const handleToggleProject = (id: string) => {
      setConfig(prev => {
          const isExcluded = prev.excludedProjectIds.includes(id);
          const newExcluded = isExcluded
              ? prev.excludedProjectIds.filter(pid => pid !== id)
              : [...prev.excludedProjectIds, id];
          return { ...prev, excludedProjectIds: newExcluded };
      });
  };

  const handleSaveConfig = () => {
      onUpdateProfile({ cvConfig: config });
  };

  const handleDownloadPDF = () => {
      if (!cvRef.current) return;
      setIsGenerating(true);

      const element = cvRef.current;
      const opt = {
          margin: [10, 10, 10, 10], // top, left, bottom, right
          filename: `${config.displayName.replace(/\s+/g, '_')}_CV.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Check if html2pdf is loaded globally via CDN
      // @ts-ignore
      if (window.html2pdf) {
          // @ts-ignore
          window.html2pdf().set(opt).from(element).save().then(() => {
              setIsGenerating(false);
          });
      } else {
          alert("PDF generator library not loaded. Please try again or print the page.");
          setIsGenerating(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col md:flex-row shadow-2xl overflow-hidden">

        {/* LEFT: Configuration Sidebar */}
        <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-ocean-600"/> CV Builder
                </h2>
                <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Header Info</h3>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                        <input
                            className="w-full p-2 text-sm border border-slate-300 rounded focus:border-ocean-500 outline-none"
                            value={config.displayName}
                            onChange={(e) => setConfig({...config, displayName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Professional Title</label>
                        <input
                            className="w-full p-2 text-sm border border-slate-300 rounded focus:border-ocean-500 outline-none"
                            value={config.jobTitle}
                            onChange={(e) => setConfig({...config, jobTitle: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Email (Optional)</label>
                        <input
                            className="w-full p-2 text-sm border border-slate-300 rounded focus:border-ocean-500 outline-none"
                            value={config.contactEmail}
                            onChange={(e) => setConfig({...config, contactEmail: e.target.value})}
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Github URL (Optional)</label>
                        <input
                            className="w-full p-2 text-sm border border-slate-300 rounded focus:border-ocean-500 outline-none"
                            value={config.contactGithub}
                            onChange={(e) => setConfig({...config, contactGithub: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Short Bio</label>
                        <textarea
                            className="w-full p-2 text-sm border border-slate-300 rounded focus:border-ocean-500 outline-none resize-none"
                            rows={3}
                            value={config.bio}
                            onChange={(e) => setConfig({...config, bio: e.target.value})}
                        />
                    </div>
                </div>

                {/* Project Selection */}
                <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Projects</h3>
                     <div className="space-y-2">
                         {projects.filter(p => p.status === 'done').map(project => {
                             const isSelected = !config.excludedProjectIds.includes(project.id);
                             return (
                                 <div
                                    key={project.id}
                                    onClick={() => handleToggleProject(project.id)}
                                    className={`flex items-center gap-3 p-2 rounded cursor-pointer border transition-colors ${isSelected ? 'bg-white border-ocean-200' : 'bg-slate-100 border-transparent opacity-60'}`}
                                 >
                                     {isSelected ? <CheckSquare size={16} className="text-ocean-600"/> : <Square size={16} className="text-slate-400"/>}
                                     <span className="text-sm font-medium text-slate-700 truncate">{project.title}</span>
                                 </div>
                             )
                         })}
                         {projects.filter(p => p.status === 'done').length === 0 && (
                             <p className="text-xs text-slate-500 italic">No completed projects yet.</p>
                         )}
                     </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                <button
                    onClick={handleSaveConfig}
                    className="w-full py-2 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded transition-colors text-sm"
                >
                    <Save size={16}/> Save Configuration
                </button>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-ocean-900 hover:bg-ocean-800 text-white font-bold rounded transition-colors shadow-lg shadow-ocean-900/20 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isGenerating ? 'Generating...' : <><Download size={18}/> Download PDF</>}
                </button>
            </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="w-full md:w-2/3 bg-slate-200 p-8 overflow-y-auto flex justify-center">
             {/* A4 Paper Simulation */}
             <div
                ref={cvRef}
                id="cv-preview-content"
                className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] text-slate-900 relative"
             >
                 {/* CV Header */}
                 <header className="border-b-2 border-slate-900 pb-6 mb-8">
                     <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">{config.displayName || 'Your Name'}</h1>
                     <div className="text-lg font-medium text-slate-600 mb-4">{config.jobTitle || 'Professional Title'}</div>

                     <div className="flex flex-wrap gap-4 text-sm text-slate-600 font-mono">
                         {config.contactEmail && <span>{config.contactEmail}</span>}
                         {config.contactEmail && config.contactGithub && <span>•</span>}
                         {config.contactGithub && <span>{config.contactGithub}</span>}
                     </div>

                     {config.bio && (
                         <p className="mt-4 text-slate-700 leading-relaxed max-w-2xl text-sm">
                             {config.bio}
                         </p>
                     )}
                 </header>

                 {/* Skills Section */}
                 <section className="mb-8">
                     <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-200 pb-1 mb-3 text-slate-500">Technical Skills</h3>
                     <div className="flex flex-wrap gap-2">
                         {allSkills.map(skill => (
                             <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-200">
                                 {skill}
                             </span>
                         ))}
                         {allSkills.length === 0 && <span className="text-sm text-slate-400 italic">No skills generated from selected projects.</span>}
                     </div>
                 </section>

                 {/* Projects Section */}
                 <section>
                     <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-200 pb-1 mb-6 text-slate-500">Project Portfolio</h3>

                     <div className="space-y-8">
                         {completedProjects.map(project => (
                             <div key={project.id}>
                                 <div className="flex justify-between items-baseline mb-1">
                                     <h4 className="text-lg font-bold text-slate-900">{project.title}</h4>
                                     <span className="text-xs font-mono text-slate-500">{project.time_spent_hours || 0}h Focus</span>
                                 </div>
                                 <div className="flex gap-2 mb-2 text-xs text-ocean-600 font-medium">
                                     {project.category} • {(project.tech_stack || []).slice(0, 5).join(', ')}
                                 </div>
                                 <p className="text-sm text-slate-700 leading-relaxed">
                                     {project.description}
                                 </p>
                                 {project.github_url && (
                                     <div className="mt-1 text-xs text-slate-400 font-mono truncate">{project.github_url}</div>
                                 )}
                             </div>
                         ))}

                         {completedProjects.length === 0 && (
                             <div className="text-center py-10 border border-dashed border-slate-300 rounded text-slate-400 text-sm">
                                 No projects selected. Check completed projects in the sidebar.
                             </div>
                         )}
                     </div>
                 </section>

                 {/* Footer watermark (optional, minimal) */}
                 <div className="absolute bottom-4 right-4 text-[10px] text-slate-300 font-mono">
                     Generated via Tech Roadmap Tracker
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default CVModal;
