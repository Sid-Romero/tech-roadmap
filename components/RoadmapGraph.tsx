import React from 'react';
import { Project } from '../types';
import GraphNode from './GraphNode';

interface RoadmapGraphProps {
  projects: Project[];
  onNodeClick: (project: Project) => void;
  isPortfolioMode: boolean;
}

const RoadmapGraph: React.FC<RoadmapGraphProps> = ({ projects, onNodeClick, isPortfolioMode }) => {
  
  // Calculate SVG dimensions based on project positions
  const maxX = Math.max(...projects.map(p => p.position.x)) + 300;
  const maxY = Math.max(...projects.map(p => p.position.y)) + 300;

  // Generate SVG paths for connections
  const renderConnections = () => {
    return projects.map(project => {
      // Don't render lines for hidden items in portfolio mode
      if (isPortfolioMode && (project.status === 'locked')) return null;

      return project.dependencies.map(depId => {
        const parent = projects.find(p => p.id === depId);
        if (!parent) return null;

        // If parent is locked/hidden in portfolio mode, don't draw line
        if (isPortfolioMode && parent.status === 'locked') return null;

        const startX = parent.position.x;
        const startY = parent.position.y + 70; // Bottom of parent node approx
        const endX = project.position.x;
        const endY = project.position.y - 70; // Top of child node approx

        // Bezier curve for smooth flow
        const controlY = (startY + endY) / 2;
        const pathData = `M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`;

        // Line color based on connection status (Light Mode)
        const isConnectedActive = parent.status === 'done' && (project.status !== 'locked');
        const strokeColor = isConnectedActive ? '#0ea5e9' : '#cbd5e1'; // Ocean-500 vs Slate-300
        const opacity = isConnectedActive ? 0.8 : 0.5;
        const width = isConnectedActive ? 2.5 : 2;

        return (
          <g key={`${parent.id}-${project.id}`}>
            <path
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={width}
              opacity={opacity}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            {/* Animated Flow Packet for active connections */}
            {isConnectedActive && !isPortfolioMode && (
              <circle r="3" fill="#0ea5e9">
                <animateMotion
                  dur="1.5s"
                  repeatCount="indefinite"
                  path={pathData}
                />
              </circle>
            )}
          </g>
        );
      });
    });
  };

  return (
    <div className="relative w-full h-full overflow-auto bg-slate-50">
      {/* Dot Grid Background - Professional Look */}
      <div className="absolute inset-0 pointer-events-none z-0" 
           style={{
             backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
             backgroundSize: '24px 24px',
             opacity: 0.6,
             width: '100%',
             height: '100%',
             minWidth: maxX,
             minHeight: maxY
           }}>
      </div>

      <div className="relative z-10" style={{ width: maxX, height: maxY }}>
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          {renderConnections()}
        </svg>

        {projects.map(project => (
          <GraphNode 
            key={project.id} 
            project={project} 
            onClick={onNodeClick} 
            isPortfolioMode={isPortfolioMode}
          />
        ))}
      </div>
    </div>
  );
};

export default RoadmapGraph;