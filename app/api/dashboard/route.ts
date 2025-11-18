// API Route: Dashboard Data
// /app/api/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, DashboardData } from '@/lib/api/types';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implementovat autentizaci (získat userId z session)
    const userId = request.headers.get('x-user-id') || 'demo-user';

    // Získat uživatele
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Uživatel nenalezen' } as ApiResponse,
        { status: 404 }
      );
    }

    // Získat stav kurzu
    const courseState = await prisma.coursePhase1State.findUnique({
      where: { userId },
    });

    // Získat dnešní záznam
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntry = await prisma.dailyTrackerEntry.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    // Získat odznaky
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    // Získat streaky
    const streaks = await prisma.streak.findMany({
      where: { userId },
    });

    // Vypočítat týdenní skóre
    const weeklyScore = await calculateWeeklyScore(userId, courseState?.currentWeek || 1);

    // Určit další krok
    const nextStep = await determineNextStep(userId, courseState);

    // Získat shrnutí od kouče (poslední zpráva)
    const lastSession = await prisma.coachSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    const dashboardData: DashboardData = {
      user,
      courseState,
      currentWeek: courseState?.currentWeek || 1,
      nextStep,
      todayEntry,
      gamification: {
        weeklyScore,
        badges: badges.map(b => ({
          code: b.badgeCode,
          name: b.badge.name,
          icon: b.badge.icon,
          earnedAt: b.earnedAt,
        })),
        streaks: streaks.map(s => ({
          metric: s.metric,
          currentStreak: s.currentStreak,
          longestStreak: s.longestStreak,
        })),
      },
      coachSummary: lastSession?.summary || null,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    } as ApiResponse<DashboardData>);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání dashboardu' } as ApiResponse,
      { status: 500 }
    );
  }
}

// Pomocná funkce pro výpočet týdenního skóre
async function calculateWeeklyScore(userId: string, currentWeek: number): Promise<number> {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Pondělí
  weekStart.setHours(0, 0, 0, 0);

  const entries = await prisma.dailyTrackerEntry.findMany({
    where: {
      userId,
      date: { gte: weekStart },
      weekNumber: currentWeek,
    },
  });

  let score = 0;
  
  // +5 bodů za každý vyplněný den
  score += entries.length * 5;

  // Bonus za meaningful steps (vysokohodnotné kroky)
  const meaningfulDays = entries.filter(e => e.highImpactStep).length;
  if (meaningfulDays >= 4) {
    score += 20;
  }

  return Math.min(score, 100);
}

// Pomocná funkce pro určení dalšího kroku
async function determineNextStep(
  userId: string,
  courseState: any
): Promise<string> {
  if (!courseState) {
    return 'Začni onboarding rozhovor s AI koučem';
  }

  const currentWeek = courseState.currentWeek;

  // Zkontrolovat, zda má uživatel vyplněný cíl
  if (!courseState.mainGoal) {
    return 'Dokonči diagnostický rozhovor a nastav svůj hlavní cíl';
  }

  // Zkontrolovat týdenní plán
  if (currentWeek >= 2) {
    const weeklyPlan = await prisma.weeklyPlan.findUnique({
      where: {
        userId_weekNumber: {
          userId,
          weekNumber: currentWeek,
        },
      },
    });

    if (!weeklyPlan) {
      return `Vytvoř týdenní plán pro týden ${currentWeek}`;
    }
  }

  // Zkontrolovat dnešní tracker
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEntry = await prisma.dailyTrackerEntry.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  if (!todayEntry) {
    return 'Vyplň dnešní tracker';
  }

  // Default
  return `Pokračuj v týdnu ${currentWeek}`;
}
