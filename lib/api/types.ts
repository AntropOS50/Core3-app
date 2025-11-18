// Backend API Utility - Pomocné funkce a typy
// /lib/api/types.ts

import { User, CoursePhase1State, WeeklyPlan, DailyTrackerEntry } from '@prisma/client';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardData {
  user: User;
  courseState: CoursePhase1State | null;
  currentWeek: number;
  nextStep: string;
  todayEntry: DailyTrackerEntry | null;
  gamification: {
    weeklyScore: number;
    badges: Array<{ code: string; name: string; icon: string; earnedAt: Date }>;
    streaks: Array<{ metric: string; currentStreak: number; longestStreak: number }>;
  };
  coachSummary: string | null;
}

export interface WeeklyPlanInput {
  weekNumber: number;
  highValueTasks: string[];
  adminTasks: string[];
  lowValueTasks: string[];
  focusBlocks: Array<{
    dayOfWeek: number;
    startTime: string;
    durationMin: number;
  }>;
  notes?: string;
}

export interface DailyTrackerInput {
  date: string; // ISO date
  weekNumber: number;
  // Týden 1
  engagedToday?: boolean;
  dayFeeling?: number;
  frustrationNote?: string;
  // Týden 2
  focusBlockDone?: 'YES' | 'NO' | 'PARTIAL';
  highImpactStep?: string;
  disruptionReason?: string;
  // Týden 3
  procrastinationEvent?: boolean;
  microStepUsed?: boolean;
  microStepContext?: string;
  // Týden 4
  systemAlignment?: number;
  positiveEvent?: string;
}

export interface ProcrastinationPatternInput {
  description: string;
  patternType: string;
  microStep: string;
  triggerPhrases?: string[];
}

export interface OperatingSystemV1Input {
  planningRules: string[];
  antiProcrastinationRules: string[];
  visibleChanges: string[];
  aiSummary?: string;
}

export interface CoachMessageInput {
  message: string;
  interactionType: 'onboarding' | 'weekly_planning' | 'procrastination' | 'reflection' | 'ad_hoc';
  weekNumber?: number;
}

export interface CoachResponse {
  reply: string;
  suggestedActions?: Array<{
    label: string;
    action: string;
  }>;
  nextStep?: string;
}
