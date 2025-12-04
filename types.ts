
export type ProjectStatus = 'locked' | 'unlocked' | 'in_progress' | 'done';

export interface Coordinates {
  x: number;
  y: number;
}

export interface SubTask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Resource {
  id: string;
  label: string;
  url: string;
}

export type SessionType = 'focus' | 'pomodoro' | 'manual';

export interface WorkSession {
  id: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number; // Stored in seconds for precision
  type: SessionType;
  notes?: string;
  taskId?: string; // Optional link to specific task
}

export interface Project {
  id: string;
  title: string;
  level: number;
  status: ProjectStatus;
  category: string;
  position: Coordinates;
  dependencies: string[]; // Array of project IDs
  description: string;
  tech_stack: string[];
  
  // Deep Detail Fields
  complexity?: number; // 1-5
  priority?: 'low' | 'medium' | 'high';
  checklist?: SubTask[];
  resources?: Resource[];
  sessions?: WorkSession[]; // New: Detailed time tracking

  // User editable fields
  github_url?: string;
  time_spent_hours?: number; // Legacy field, kept for backward compat or manual override
  notes?: string; // Markdown content
  completed_at?: string;
}

export interface Rank {
  id: string;
  title: string;
  minXP: number;
  icon: string; // Icon name
  color: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  conditionType: 'project_count' | 'hour_count' | 'tech_stack' | 'streak' | 'category_count';
  conditionDetail?: string; // Specific tech (e.g. "Python") or category (e.g. "Security")
  threshold: number;
}

export interface UserProfile {
  xp: number;
  level: number;
  unlockedBadges: string[]; // IDs of badges
}

export interface UserStats {
  xp: number;
  level: number;
  completedProjects: number;
  totalProjects: number;
  rankTitle: string;
  nextLevelXP: number;
  currentLevelXP: number;
}

// Global Timer State
export interface TimerState {
  projectId: string | null;
  taskId: string | null; // New: Optional specific task
  startTime: number | null;
  elapsedSeconds: number;
  isRunning: boolean;
  mode: 'focus' | 'pomodoro' | 'break';
  pomodoroDuration: number; // default 25 * 60
  breakDuration: number; // default 5 * 60
  durationGoal?: number; // For countdown mode
  isCountdown?: boolean;
}
