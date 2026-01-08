import React, { useState } from 'react';
import { Project, UserStats } from '../types';
import { Github, Clock, ExternalLink, Trophy, Layers } from './Icons.api';

interface PortfolioGridProps {
  projects: Project[];
  onProjectClick: (p: Project) => void;
  userStats?: UserStats;
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ projects, onProjectClick, userStats }) => {
  const [filter, setFilter] = useState('All');

  // Only show Done or In Progress for public view
  const visibleProjects = projects.filter(p => p.status === 'done' || p.status === 'in_progress');

  // Extract categories
  const categories = ['All', ...Array.from(new Set(visibleProjects.map(p => p.category)))];

  // Filter logic
  const filteredProjects = filter === 'All'
    ? visibleProjects
    : visibleProjects.filter(p => p.category === filter);

  // Stats calculation for hero
  const totalHours = visibleProjects.reduce((acc, p) => acc + (p.time_spent_hours || 0), 0);
  const techStackCount = new Set(visibleProjects.flatMap(p => p.tech_stack)).size;

  return (
    <div className="min-h-full bg-slate-50">

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
           <div className="flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="text-center md:text-left">
                   <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Engineering Portfolio</h1>
                   <p className="text-lg text-slate-500 max-w-2xl">
                       A documented journey of technical challenges, system designs, and production deployments.
                   </p>
               </div>

               {/* Stats Cards */}
               <div className="flex gap-4">
                   <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl min-w-[120px] text-center">
                       <div className="text-ocean-600 mb-1 flex justify-center"><Trophy size={20}/></div>
                       <div className="text-2xl font-bold text-slate-900">{userStats?.level || 1}</div>
                       <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Level</div>
                   </div>
                   <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl min-w-[120px] text-center">
                       <div className="text-ocean-600 mb-1 flex justify-center"><Clock size={20}/></div>
                       <div className="text-2xl font-bold text-slate-900">{totalHours}h</div>
                       <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Logged</div>
                   </div>
                   <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl min-w-[120px] text-center">
                       <div className="text-ocean-600 mb-1 flex justify-center"><Layers size={20}/></div>
                       <div className="text-2xl font-bold text-slate-900">{techStackCount}</div>
                       <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Techs</div>
                   </div>
               </div>
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center md:justify-start">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filter === cat
                        ? 'bg-ocean-900 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-ocean-300'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => onProjectClick(project)}
              className="group bg-white border border-slate-200 hover:border-ocean-300 rounded-xl overflow-hidden transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1"
            >
              <div className="h-2 bg-gradient-to-r from-ocean-500 to-sky-400"></div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600">
                        {project.category}
                    </span>
                    {project.status === 'in_progress' && (
                        <span className="bg-sky-50 text-sky-600 text-[10px] font-bold px-2 py-1 rounded border border-sky-100 uppercase tracking-wider">
                        In Progress
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-ocean-700 transition-colors">
                  {project.title}
                </h3>

                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(project.tech_stack || []).slice(0, 4).map(t => (
                    <span key={t} className="text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                        {t}
                    </span>
                  ))}
                  {(project.tech_stack || []).length > 4 && <span className="text-xs text-slate-400 self-center">+{(project.tech_stack || []).length - 4}</span>}
                </div>

                <div className="flex justify-between items-center text-slate-500 text-sm border-t border-slate-100 pt-4 mt-auto">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <Clock size={14} className="text-slate-400" />
                    <span>{project.time_spent_hours || 0} Hours</span>
                  </div>
                  {project.github_url && <div className="flex items-center gap-1 text-ocean-600 font-medium text-xs hover:underline">View Repo <ExternalLink size={12}/></div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
            <div className="text-center py-20 text-slate-400">
                <p>No projects found in this category.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default PortfolioGrid;
