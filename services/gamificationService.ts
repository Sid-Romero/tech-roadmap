
import { RANKS, BADGES } from '../constants';
import { UserProfile, Project, Badge, Rank } from '../types';

export const gamificationService = {
  // Base constants
  XP_TASK_COMPLETE: 50,
  XP_PER_HOUR_FOCUS: 100,

  // Calculate dynamic XP for a project based on complexity and time spent
  calculateProjectXP: (project: Project): number => {
    const baseXP = 500;
    const complexityBonus = (project.complexity || 1) * 150; // 150 to 750
    // Small bonus for time spent to encourage logging (capped at 500 extra)
    const timeBonus = Math.min(500, Math.floor((project.time_spent_hours || 0) * 10));
    
    return baseXP + complexityBonus + timeBonus;
  },

  getLevel: (xp: number): number => {
    // Linear-ish scaling: Level 1 -> 0, Level 2 -> 1000, Level 3 -> 2500...
    return Math.floor(Math.sqrt(xp) / 10) + 1;
  },

  getNextLevelXP: (currentLevel: number): number => {
    return Math.pow((currentLevel) * 10, 2);
  },

  getCurrentRank: (xp: number): Rank => {
    const sortedRanks = [...RANKS].sort((a, b) => b.minXP - a.minXP);
    return sortedRanks.find(r => xp >= r.minXP) || RANKS[0];
  },

  checkBadges: (profile: UserProfile, projects: Project[]): Badge[] => {
    const unlockedNow: Badge[] = [];
    
    const completedProjects = projects.filter(p => p.status === 'done');
    const completedCount = completedProjects.length;
    
    const totalSeconds = projects.reduce((acc, p) => {
        return acc + (p.sessions?.reduce((sAcc, s) => sAcc + s.durationSeconds, 0) || 0);
    }, 0);
    const totalHours = totalSeconds / 3600;

    BADGES.forEach(badge => {
      if (profile.unlockedBadges.includes(badge.id)) return;

      let qualified = false;
      
      switch (badge.conditionType) {
        case 'project_count':
            if (completedCount >= badge.threshold) qualified = true;
            break;
        case 'hour_count':
            if (totalHours >= badge.threshold) qualified = true;
            break;
        case 'category_count':
            const catCount = completedProjects.filter(p => p.category === badge.conditionDetail).length;
            if (catCount >= badge.threshold) qualified = true;
            break;
        case 'tech_stack':
            // Count projects where tech_stack includes the detail string
            const stackCount = completedProjects.filter(p => 
                p.tech_stack.some(t => t.toLowerCase().includes(badge.conditionDetail?.toLowerCase() || ''))
            ).length;
            if (stackCount >= badge.threshold) qualified = true;
            break;
      }

      if (qualified) {
        unlockedNow.push(badge);
      }
    });

    return unlockedNow;
  }
};
