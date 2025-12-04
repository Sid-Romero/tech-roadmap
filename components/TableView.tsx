import React from 'react';
import { Project, ProjectStatus } from '../types';
import { MoreHorizontal, Clock, Zap, CheckCircle2, Lock, Trash2 } from './Icons.api';

interface TableViewProps {
  projects: Project[];
  onProjectClick: (p: Project) => void;
  onStatusChange: (project: Project, newStatus: ProjectStatus) => void;
  onDelete: (id: string) => void;
}

const TableView: React.FC<TableViewProps> = ({ projects, onProjectClick, onStatusChange, onDelete }) => {
  // Group by category
  const categories = Array.from(new Set(projects.map(p => p.category))).sort();

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'done': return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit"><CheckCircle2 size={12}/> Done</span>;
      case 'in_progress': return <span className="flex items-center gap-1.5 text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100 w-fit"><Zap size={12}/> In Progress</span>;
      case 'unlocked': return <span className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 w-fit"><div className="w-2 h-2 rounded-full border border-slate-400 bg-transparent"/> Todo</span>;
      case 'locked': return <span className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 w-fit"><Lock size={12}/> Locked</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl h-full overflow-y-auto custom-scrollbar">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {categories.map(category => {
           const categoryProjects = projects.filter(p => p.category === category);
           if (categoryProjects.length === 0) return null;

           return (
             <div key={category} className="border-b border-slate-200 last:border-0">
               {/* Category Header */}
               <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                 <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm">{category}</h3>
                 <span className="text-xs text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{categoryProjects.length} Projects</span>
               </div>

               {/* Table */}
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="text-xs text-slate-500 border-b border-slate-200 bg-white">
                       <th className="px-6 py-3 font-semibold uppercase w-1/4">Project Name</th>
                       <th className="px-6 py-3 font-semibold uppercase">Status</th>
                       <th className="px-6 py-3 font-semibold uppercase">Priority</th>
                       <th className="px-6 py-3 font-semibold uppercase">Complexity</th>
                       <th className="px-6 py-3 font-semibold uppercase">Tech Stack</th>
                       <th className="px-6 py-3 font-semibold uppercase text-right">Hours</th>
                       <th className="px-6 py-3 font-semibold uppercase text-center w-24">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {categoryProjects.map(project => (
                       <tr key={project.id} className="hover:bg-slate-50 transition-colors group">
                         <td className="px-6 py-4">
                           <div className="font-semibold text-slate-900 group-hover:text-ocean-700 transition-colors cursor-pointer" onClick={() => onProjectClick(project)}>
                             {project.title}
                           </div>
                           <div className="text-xs text-slate-500 truncate max-w-xs">{project.description}</div>
                         </td>
                         <td className="px-6 py-4 text-xs font-medium">
                           {getStatusBadge(project.status)}
                         </td>
                         <td className="px-6 py-4">
                            {project.priority === 'high' && <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 uppercase tracking-wide">High</span>}
                            {project.priority === 'medium' && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase tracking-wide">Med</span>}
                            {(!project.priority || project.priority === 'low') && <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase tracking-wide">Low</span>}
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex gap-1">
                             {[...Array(5)].map((_, i) => (
                               <div key={i} className={`h-1.5 w-4 rounded-sm ${i < (project.complexity || 1) ? 'bg-ocean-400' : 'bg-slate-200'}`}></div>
                             ))}
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex flex-wrap gap-1">
                             {project.tech_stack.slice(0, 3).map(t => (
                               <span key={t} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600 font-medium">
                                 {t}
                               </span>
                             ))}
                             {project.tech_stack.length > 3 && (
                               <span className="px-1.5 py-0.5 text-[10px] text-slate-400">+{project.tech_stack.length - 3}</span>
                             )}
                           </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500 text-right font-mono">
                           {project.time_spent_hours || 0}h
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => onProjectClick(project)}
                                className="p-1.5 text-slate-400 hover:text-ocean-700 hover:bg-ocean-50 rounded transition-colors"
                                title="Edit Details"
                            >
                                <MoreHorizontal size={18} />
                            </button>
                            <button
                                onClick={() => onDelete(project.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete Node"
                            >
                                <Trash2 size={18} />
                            </button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default TableView;
