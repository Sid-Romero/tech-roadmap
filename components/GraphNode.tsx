import React from 'react';
import { Project } from '../types';
import { Lock, CheckCircle2, Zap, Monitor } from './Icons.api';

interface GraphNodeProps {
  project: Project;
  onClick: (project: Project) => void;
  isPortfolioMode: boolean;
}

const GraphNode: React.FC<GraphNodeProps> = ({ project, onClick, isPortfolioMode }) => {
  const { x, y } = project.position;

  // Status styling - Light Mode Optimized
  const getStatusStyles = () => {
    switch (project.status) {
      case 'done':
        return 'border-ocean-500 bg-white text-slate-900 shadow-md shadow-ocean-500/10 hover:shadow-lg hover:shadow-ocean-500/20';
      case 'in_progress':
        return 'border-sky-400 bg-white text-slate-900 shadow-md shadow-sky-400/10 hover:shadow-lg hover:shadow-sky-400/20';
      case 'unlocked':
        return 'border-slate-300 bg-white text-slate-600 hover:border-ocean-400 hover:text-ocean-900 shadow-sm';
      case 'locked':
      default:
        return 'border-slate-200 bg-slate-50 text-slate-400 grayscale opacity-80';
    }
  };

  const getIcon = () => {
    if (project.status === 'locked') return <Lock size={20} className="text-slate-400" />;
    if (project.status === 'done') return <CheckCircle2 size={20} className="text-ocean-600" />;
    if (project.status === 'in_progress') return <Zap size={20} className="text-sky-500 animate-pulse" />;
    return <Monitor size={20} className="text-slate-500" />;
  };

  const priorityColor = {
    high: 'bg-rose-500',
    medium: 'bg-amber-500',
    low: 'bg-slate-300'
  }[project.priority || 'medium'];

  // Portfolio mode hides locked items entirely in parent, but if something slips through:
  if (isPortfolioMode && project.status === 'locked') return null;

  return (
    <div
      onClick={() => project.status !== 'locked' && onClick(project)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        width: '180px'
      }}
      className={`
        cursor-pointer transition-all duration-300 group z-10
      `}
    >
      <div className={`
        relative p-4 rounded-xl border-2
        flex flex-col items-center gap-2 text-center
        transition-all duration-200
        ${getStatusStyles()}
      `}>
        {/* Connector Handle Top (Visual only) */}
        <div className={`absolute -top-1.5 w-3 h-3 rounded-full border bg-white ${project.status === 'locked' ? 'border-slate-300' : 'border-slate-400'}`}></div>

        {/* Priority Dot */}
        {project.status !== 'locked' && !isPortfolioMode && (
          <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${priorityColor} border border-white shadow-sm`} title={`Priority: ${project.priority || 'medium'}`} />
        )}

        <div className="mb-1 p-2 rounded-full bg-slate-50 border border-slate-100">{getIcon()}</div>

        <h3 className="text-sm font-bold leading-tight">
          {project.title}
        </h3>

        <div className="flex gap-1 justify-center mt-1 flex-wrap">
          {project.tech_stack.slice(0, 2).map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 font-medium">
              {t}
            </span>
          ))}
        </div>

        {/* Connector Handle Bottom (Visual only) */}
        <div className={`absolute -bottom-1.5 w-3 h-3 rounded-full border bg-white ${project.status === 'locked' ? 'border-slate-300' : 'border-slate-400'}`}></div>
      </div>
    </div>
  );
};

export default GraphNode;
