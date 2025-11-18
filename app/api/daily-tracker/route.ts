// API Route: Daily Tracker
// /app/api/daily-tracker/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, DailyTrackerInput } from '@/lib/api/types';

// GET - Získat denní záznamy (s filtrem)
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const weekNumber = searchParams.get('week');

    let where: any = { userId };

    if (date) {
      where.date = new Date(date);
    }

    if (weekNumber) {
      where.weekNumber = parseInt(weekNumber);
    }

    const entries = await prisma.dailyTrackerEntry.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: entries,
    } as ApiResponse);
  } catch (error) {
    console.error('Daily tracker GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání trackeru' } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Uložit denní záznam
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const input: DailyTrackerInput = await request.json();

    const date = new Date(input.date);
    date.setHours(0, 0, 0, 0);

    const entry = await prisma.dailyTrackerEntry.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      create: {
        userId,
        date,
        weekNumber: input.weekNumber,
        // Týden 1
        engagedToday: input.engagedToday,
        dayFeeling: input.dayFeeling,
        frustrationNote: input.frustrationNote,
        // Týden 2
        focusBlockDone: input.focusBlockDone as any,
        highImpactStep: input.highImpactStep,
        disruptionReason: input.disruptionReason,
        // Týden 3
        procrastinationEvent: input.procrastinationEvent,
        microStepUsed: input.microStepUsed,
        microStepContext: input.microStepContext,
        // Týden 4
        systemAlignment: input.systemAlignment,
        positiveEvent: input.positiveEvent,
      },
      update: {
        // Týden 1
        engagedToday: input.engagedToday,
        dayFeeling: input.dayFeeling,
        frustrationNote: input.frustrationNote,
        // Týden 2
        focusBlockDone: input.focusBlockDone as any,
        highImpactStep: input.highImpactStep,
        disruptionReason: input.disruptionReason,
        // Týden 3
        procrastinationEvent: input.procrastinationEvent,
        microStepUsed: input.microStepUsed,
        microStepContext: input.microStepContext,
        // Týden 4
        systemAlignment: input.systemAlignment,
        positiveEvent: input.positiveEvent,
      },
    });

    // Aktualizovat streak pro meaningful steps
    if (input.highImpactStep) {
      await updateStreak(userId, 'meaningful_step', date);
    }

    // Aktualizovat streak pro mikro-kroky
    if (input.microStepUsed) {
      await updateStreak(userId, 'micro_step_used', date);
    }

    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Denní záznam úspěšně uložen',
    } as ApiResponse);
  } catch (error) {
    console.error('Daily tracker POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při ukládání denního záznamu' } as ApiResponse,
      { status: 500 }
    );
  }
}

// Pomocná funkce pro aktualizaci streaku
async function updateStreak(userId: string, metric: string, date: Date) {
  const streak = await prisma.streak.findUnique({
    where: {
      userId_metric: {
        userId,
        metric,
      },
    },
  });

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  if (!streak) {
    // Vytvořit nový streak
    await prisma.streak.create({
      data: {
        userId,
        metric,
        currentStreak: 1,
        longestStreak: 1,
        lastDate: date,
      },
    });
  } else {
    const lastDate = new Date(streak.lastDate);
    lastDate.setHours(0, 0, 0, 0);

    let newCurrentStreak = streak.currentStreak;

    if (lastDate.getTime() === yesterday.getTime()) {
      // Pokračování streaku
      newCurrentStreak += 1;
    } else if (lastDate.getTime() < yesterday.getTime()) {
      // Přerušení streaku
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);

    await prisma.streak.update({
      where: {
        userId_metric: {
          userId,
          metric,
        },
      },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastDate: date,
      },
    });
  }
}
