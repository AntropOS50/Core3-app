// API Route: Weekly Plans
// /app/api/weekly-plan/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, WeeklyPlanInput } from '@/lib/api/types';

// GET - Získat týdenní plán
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const { searchParams } = new URL(request.url);
    const weekNumber = parseInt(searchParams.get('week') || '1');

    const weeklyPlan = await prisma.weeklyPlan.findUnique({
      where: {
        userId_weekNumber: {
          userId,
          weekNumber,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: weeklyPlan,
    } as ApiResponse);
  } catch (error) {
    console.error('Weekly plan GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání týdenního plánu' } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Vytvořit nebo aktualizovat týdenní plán
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const input: WeeklyPlanInput = await request.json();

    const weeklyPlan = await prisma.weeklyPlan.upsert({
      where: {
        userId_weekNumber: {
          userId,
          weekNumber: input.weekNumber,
        },
      },
      create: {
        userId,
        weekNumber: input.weekNumber,
        highValueTasks: input.highValueTasks,
        adminTasks: input.adminTasks,
        lowValueTasks: input.lowValueTasks,
        focusBlocks: input.focusBlocks as any,
        notes: input.notes,
      },
      update: {
        highValueTasks: input.highValueTasks,
        adminTasks: input.adminTasks,
        lowValueTasks: input.lowValueTasks,
        focusBlocks: input.focusBlocks as any,
        notes: input.notes,
      },
    });

    // Udělit badge, pokud je to první týdenní plán
    const existingBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeCode: {
          userId,
          badgeCode: 'FIRST_WEEKLY_PLAN',
        },
      },
    });

    if (!existingBadge) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeCode: 'FIRST_WEEKLY_PLAN',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: weeklyPlan,
      message: 'Týdenní plán úspěšně uložen',
    } as ApiResponse);
  } catch (error) {
    console.error('Weekly plan POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při ukládání týdenního plánu' } as ApiResponse,
      { status: 500 }
    );
  }
}
