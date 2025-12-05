import React, { useRef, useState, useEffect } from 'react';
import { Project } from '../types';
import GraphNode from './GraphNode';
import { XCircle, Link } from './Icons.api';

interface RoadmapGraphProps {
  projects: Project[];
  onNodeClick: (project: Project) => void;
  onProjectUpdate: (project: Project) => void;
  isPortfolioMode: boolean;
}

const RoadmapGraph: React.FC<RoadmapGraphProps> = ({
    projects, onNodeClick, onProjectUpdate, isPortfolioMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging State
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [hasDragged, setHasDragged] = useState(false);

  // Connecting State
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Hovering Connection State (for deletion)
  const [hoveredConnection, setHoveredConnection] = useState<{from: string, to: string} | null>(null);

  // Sync props to local state when not dragging
  useEffect(() => {
    if (!draggingId) {
        setLocalProjects(projects);
    }
  }, [projects, draggingId]);

  // --- Coordinate Helper ---
  const getRelPos = (e: React.MouseEvent | MouseEvent) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const scrollLeft = containerRef.current.scrollLeft;
      const scrollTop = containerRef.current.scrollTop;
      return {
          x: e.clientX - rect.left + scrollLeft,
          y: e.clientY - rect.top + scrollTop
      };
  };

  // --- Handlers ---

  const handleMouseDownNode = (e: React.MouseEvent, project: Project) => {
      if (isPortfolioMode) return;
      const pos = getRelPos(e);
      setDraggingId(project.id);
      setDragOffset({
          x: pos.x - project.position.x,
          y: pos.y - project.position.y
      });
      setHasDragged(false);
  };

  const handleConnectStart = (e: React.MouseEvent, project: Project) => {
      if (isPortfolioMode) return;
      const pos = getRelPos(e);
      setConnectingSourceId(project.id);
      setMousePos(pos);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      const pos = getRelPos(e);

      // Dragging Logic
      if (draggingId) {
          const dist = Math.sqrt(Math.pow(pos.x - (localProjects.find(p=>p.id===draggingId)?.position.x || 0), 2));
          if (dist > 5) setHasDragged(true);

          setLocalProjects(prev => prev.map(p => {
              if (p.id !== draggingId) return p;
              return {
                  ...p,
                  position: {
                      x: pos.x - dragOffset.x,
                      y: pos.y - dragOffset.y
                  }
              };
          }));
      }

      // Connecting Logic
      if (connectingSourceId) {
          setMousePos(pos);
      }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
      // 1. End Dragging
      if (draggingId) {
          if (hasDragged) {
              const updatedProject = localProjects.find(p => p.id === draggingId);
              if (updatedProject) {
                  onProjectUpdate(updatedProject);
              }
          }
          setDraggingId(null);
      }

      // 2. End Connecting
      if (connectingSourceId) {
          // Check if we dropped ONTO a node
          // We do this by simple proximity check since the events on nodes might be blocked by the SVG overlay
          // or complicated by bubbling.
          const pos = getRelPos(e);
          const targetNode = localProjects.find(p => {
              // 180px width, ~120px height roughly
              return Math.abs(p.position.x - pos.x) < 90 && Math.abs(p.position.y - pos.y) < 60;
          });

          if (targetNode && targetNode.id !== connectingSourceId) {
              // Valid connection?
              if (!targetNode.dependencies.includes(connectingSourceId)) {
                  // Prevent cycles (Basic check: don't connect if source depends on target)
                  const sourceNode = localProjects.find(p => p.id === connectingSourceId);
                  if (sourceNode && !sourceNode.dependencies.includes(targetNode.id)) {
                       const updatedTarget = {
                           ...targetNode,
                           dependencies: [...targetNode.dependencies, connectingSourceId]
                       };
                       onProjectUpdate(updatedTarget);
                  }
              }
          }
          setConnectingSourceId(null);
      }
  };

  const handleNodeClickWrapper = (project: Project) => {
      if (!hasDragged) {
          onNodeClick(project);
      }
  };

  const deleteConnection = (parentId: string, childId: string) => {
      if (isPortfolioMode) return;
      const childNode = localProjects.find(p => p.id === childId);
      if (childNode) {
          const updatedChild = {
              ...childNode,
              dependencies: childNode.dependencies.filter(id => id !== parentId)
          };
          onProjectUpdate(updatedChild);
          setHoveredConnection(null);
      }
  };


  // --- Render Helpers ---

  // Calculate SVG dimensions
  const maxX = Math.max(...localProjects.map(p => p.position.x)) + 400;
  const maxY = Math.max(...localProjects.map(p => p.position.y)) + 400;

  const renderConnections = () => {
    return localProjects.map(project => {
      if (isPortfolioMode && (project.status === 'locked')) return null;

      return project.dependencies.map(depId => {
        const parent = localProjects.find(p => p.id === depId);
        if (!parent) return null;
        if (isPortfolioMode && parent.status === 'locked') return null;

        const startX = parent.position.x;
        const startY = parent.position.y + 70; // Bottom
        const endX = project.position.x;
        const endY = project.position.y - 70; // Top

        const controlY = (startY + endY) / 2;
        const pathData = `M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`;

        const isConnectedActive = parent.status === 'done' && (project.status !== 'locked');
        const strokeColor = isConnectedActive ? '#0ea5e9' : '#cbd5e1';
        const opacity = isConnectedActive ? 0.8 : 0.5;

        // Interaction state
        const isHovered = !isPortfolioMode && hoveredConnection?.from === parent.id && hoveredConnection?.to === project.id;

        // Midpoint for delete button
        // Bezier midpoint approximation (t=0.5)
        const midX = 0.125 * startX + 0.375 * startX + 0.375 * endX + 0.125 * endX;
        const midY = 0.125 * startY + 0.375 * controlY + 0.375 * controlY + 0.125 * endY;

        return (
          <g key={`${parent.id}-${project.id}`}
             onMouseEnter={() => !isPortfolioMode && setHoveredConnection({from: parent.id, to: project.id})}
             onMouseLeave={() => !isPortfolioMode && setHoveredConnection(null)}
          >
            {/* Invisible thick path for easier hovering */}
            <path d={pathData} fill="none" stroke="transparent" strokeWidth="20" className="cursor-pointer" />

            {/* Visible path */}
            <path
              d={pathData}
              fill="none"
              stroke={isHovered ? '#ef4444' : strokeColor}
              strokeWidth={isHovered ? 3 : 2}
              opacity={isHovered ? 1 : opacity}
              className="transition-colors duration-200 pointer-events-none"
            />

            {/* Delete Button (Only visible on hover in edit mode) */}
            {isHovered && (
                <g
                    transform={`translate(${midX}, ${midY})`}
                    className="cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); deleteConnection(parent.id, project.id); }}
                >
                    <circle r="12" fill="#ef4444" />
                    <line x1="-4" y1="-4" x2="4" y2="4" stroke="white" strokeWidth="2" />
                    <line x1="-4" y1="4" x2="4" y2="-4" stroke="white" strokeWidth="2" />
                </g>
            )}

            {isConnectedActive && !isPortfolioMode && !isHovered && (
              <circle r="3" fill="#0ea5e9">
                <animateMotion dur="1.5s" repeatCount="indefinite" path={pathData} />
              </circle>
            )}
          </g>
        );
      });
    });
  };

  const renderTempConnection = () => {
      if (!connectingSourceId) return null;
      const source = localProjects.find(p => p.id === connectingSourceId);
      if (!source) return null;

      const startX = source.position.x;
      const startY = source.position.y + 70;
      const endX = mousePos.x;
      const endY = mousePos.y;

      return (
          <line
            x1={startX} y1={startY} x2={endX} y2={endY}
            stroke="#0ea5e9" strokeWidth="2" strokeDasharray="5,5"
            className="pointer-events-none"
          />
      );
  };

  return (
    <div
        ref={containerRef}
        className="relative w-full h-full overflow-auto bg-slate-50 cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop dragging if left window
    >
      {/* Dot Grid Background */}
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
        <svg className="absolute top-0 left-0 w-full h-full z-0 overflow-visible">
          {renderConnections()}
          {renderTempConnection()}
        </svg>

        {localProjects.map(project => (
          <GraphNode
            key={project.id}
            project={project}
            onClick={handleNodeClickWrapper}
            onMouseDown={handleMouseDownNode}
            onConnectStart={handleConnectStart}
            isPortfolioMode={isPortfolioMode}
          />
        ))}
      </div>
    </div>
  );
};

export default RoadmapGraph;
