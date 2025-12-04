/**
 * Data Service - API Version
 * Replaces localStorage with backend API calls
 */

import { INITIAL_DATASET } from '../constants';
import { Project, WorkSession, UserProfile } from '../types';

// ----------------- Configuration -----------------
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Storage keys for token
const TOKEN_KEY = 'tech_roadmap_token';
const PROFILE_STORAGE_KEY = 'tech_roadmap_profile_v3';

// Fallback to localStorage when not authenticated (development)
const USE_LOCAL_FALLBACK = import.meta.env.VITE_USE_LOCAL_FALLBACK === 'true';

// ----------------- Auth Helpers -----------------
const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const isAuthenticated = (): boolean => {
  return !!getToken();
};

// ----------------- API Helpers -----------------
interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth token if available and not skipped
  const token = getToken();
  if (token && !skipAuth) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 - clear token and redirect to login
  if (response.status === 401) {
    clearToken();
    // Optionally trigger re-auth flow
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;

  return JSON.parse(text);
}

// ----------------- Local Storage Fallback -----------------
const PROJECT_STORAGE_KEY = 'tech_roadmap_projects_v3';

const localDataService = {
  getProjects: (): Project[] => {
    try {
      const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(INITIAL_DATASET));
      return INITIAL_DATASET;
    } catch (e) {
      console.error("Failed to load projects", e);
      return INITIAL_DATASET;
    }
  },
  saveProjects: (projects: Project[]) => {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
  },
};

// ----------------- Main Data Service -----------------
export const dataService = {
  // === Authentication ===

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await apiRequest<{ access_token: string }>('/auth/login/json', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        skipAuth: true,
      });
      setToken(response.access_token);
      return true;
    } catch (e) {
      console.error('Login failed:', e);
      return false;
    }
  },

  async register(email: string, username: string, password: string): Promise<boolean> {
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
        skipAuth: true,
      });
      // Auto-login after registration
      return await this.login(username, password);
    } catch (e) {
      console.error('Registration failed:', e);
      throw e;
    }
  },

  logout(): void {
    clearToken();
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  },

  isAuthenticated,

  // === Projects ===

  async getProjects(): Promise<Project[]> {
    // Use local storage if not authenticated (development mode)
    if (!isAuthenticated() && USE_LOCAL_FALLBACK) {
      return localDataService.getProjects();
    }

    try {
      const projects = await apiRequest<Project[]>('/projects');
      return projects;
    } catch (e) {
      console.error('Failed to fetch projects:', e);
      // Fallback to local storage on error
      if (USE_LOCAL_FALLBACK) {
        return localDataService.getProjects();
      }
      throw e;
    }
  },

  async saveProjects(projects: Project[]): Promise<void> {
    if (!isAuthenticated() && USE_LOCAL_FALLBACK) {
      localDataService.saveProjects(projects);
      return;
    }
    // In API mode, this is handled by individual update calls
    console.warn('saveProjects is deprecated in API mode. Use updateProject instead.');
  },

  async updateProject(updatedProject: Project): Promise<Project[]> {
    if (!isAuthenticated() && USE_LOCAL_FALLBACK) {
      const projects = localDataService.getProjects();
      const newProjects = projects.map(p =>
        p.id === updatedProject.id ? updatedProject : p
      );
      localDataService.saveProjects(newProjects);
      return newProjects;
    }

    try {
      // Transform to API format (camelCase to snake_case where needed)
      const payload = {
        title: updatedProject.title,
        level: updatedProject.level,
        status: updatedProject.status,
        category: updatedProject.category,
        description: updatedProject.description,
        position: updatedProject.position,
        dependencies: updatedProject.dependencies,
        techStack: updatedProject.tech_stack,
        complexity: updatedProject.complexity,
        priority: updatedProject.priority,
        checklist: updatedProject.checklist,
        resources: updatedProject.resources,
        githubUrl: updatedProject.github_url,
        notes: updatedProject.notes,
        timeSpentHours: updatedProject.time_spent_hours,
        completedAt: updatedProject.completed_at,
      };

      await apiRequest<Project>(`/projects/${updatedProject.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      // Fetch updated list to reflect dependency changes
      return await this.getProjects();
    } catch (e) {
      console.error('Failed to update project:', e);
      throw e;
    }
  },

  async addProject(partialProject: Partial<Project>): Promise<Project[]> {
    if (!isAuthenticated() && USE_LOCAL_FALLBACK) {
      const projects = localDataService.getProjects();
      const newProject: Project = {
        id: `custom_${Date.now()}`,
        title: partialProject.title || "New Project",
        level: partialProject.level || 1,
        status: 'locked',
        category: partialProject.category || "General",
        position: partialProject.position || { x: 400, y: 400 },
        dependencies: partialProject.dependencies || [],
        description: partialProject.description || "Define your objectives.",
        tech_stack: partialProject.tech_stack || [],
        checklist: [],
        resources: [],
        complexity: 1,
        priority: 'medium',
        ...partialProject,
      } as Project;
      const newProjects = [...projects, newProject];
      localDataService.saveProjects(newProjects);
      return newProjects;
    }

    try {
      const payload = {
        title: partialProject.title || "New Project",
        level: partialProject.level || 1,
        category: partialProject.category || "General",
        description: partialProject.description || "Define your objectives.",
        position: partialProject.position || { x: 400, y: 400 },
        dependencies: partialProject.dependencies || [],
        techStack: partialProject.tech_stack || [],
        complexity: partialProject.complexity || 1,
        priority: partialProject.priority || 'medium',
      };

      await apiRequest<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return await this.getProjects();
    } catch (e) {
      console.error('Failed to add project:', e);
      throw e;
    }
  },

  async deleteProject(projectId: string): Promise<Project[]> {
    if (!isAuthenticated() && USE_LOCAL_FALLBACK) {
      const projects = localDataService.getProjects();
      const newProjects = projects.filter(p => p.id !== projectId);
      localDataService.saveProjects(newProjects);
      return newProjects;
    }

    try {
      await apiRequest(`/projects/${projectId}`, {
        method: 'DELETE',
      });
      return await this.getProjects();
    } catch (e) {
      console.error('Failed to delete project:', e);
      throw e;
    }
  },

  async addSessionToProject(projectId: string, session: WorkSession): Promise<Project[]> {
    if (!isAuthenticated() && USE_LOCAL_FALLBACK) {
      const projects = localDataService.getProjects();
      const project = projects.find(p => p.id === projectId);
      if (!project) return projects;

      const updatedProject = {
        ...project,
        sessions: [...(project.sessions || []), session]
      };
      return this.updateProject(updatedProject);
    }

    try {
      const payload = {
        startTime: session.startTime,
        endTime: session.endTime,
        durationSeconds: session.durationSeconds,
        type: session.type,
        notes: session.notes,
        taskId: session.taskId,
      };

      await apiRequest(`/projects/${projectId}/sessions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return await this.getProjects();
    } catch (e) {
      console.error('Failed to add session:', e);
      throw e;
    }
  },

  // === Profile / Gamification ===

  async getProfile(): Promise<UserProfile> {
    if (!isAuthenticated() && USE_LOCAL_FALLBACK) {
      try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        return { xp: 0, level: 1, unlockedBadges: [] };
      } catch (e) {
        return { xp: 0, level: 1, unlockedBadges: [] };
      }
    }

    try {
      const profile = await apiRequest<UserProfile>('/profile');
      return profile;
    } catch (e) {
      console.error('Failed to fetch profile:', e);
      return { xp: 0, level: 1, unlockedBadges: [] };
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!isAuthenticated() && USE_LOCAL_FALLBACK) {
      const current = await this.getProfile();
      const newProfile = { ...current, ...updates };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    }

    try {
      const payload = {
        xp: updates.xp,
        level: updates.level,
        unlockedBadges: updates.unlockedBadges,
      };

      const profile = await apiRequest<UserProfile>('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return profile;
    } catch (e) {
      console.error('Failed to update profile:', e);
      throw e;
    }
  },

  async addXP(amount: number): Promise<UserProfile> {
    if (!isAuthenticated() && USE_LOCAL_FALLBACK) {
      const profile = await this.getProfile();
      const newXP = profile.xp + amount;
      return await this.updateProfile({ xp: newXP });
    }

    try {
      const profile = await apiRequest<UserProfile>('/profile/xp', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      return profile;
    } catch (e) {
      console.error('Failed to add XP:', e);
      throw e;
    }
  },

  // === Utility ===

  resetData(): void {
    localStorage.removeItem(PROJECT_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    window.location.reload();
  },
};

// ----------------- Type Exports -----------------
export type { Project, WorkSession, UserProfile };
