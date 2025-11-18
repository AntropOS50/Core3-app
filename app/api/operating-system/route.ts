// API Route: Operating System V1
// /app/api/operating-system/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, OperatingSystemV1Input } from '@/lib/api/types';

// GET - Získat pracovní OS uživatele
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';

    const os = await prisma.operatingSystemV1.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      data: os,
    } as ApiResponse);
  } catch (error) {
    console.error('Operating system GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání pracovního OS' } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Vytvořit nebo aktualizovat pracovní OS
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const input: OperatingSystemV1Input = await request.json();

    const os = await prisma.operatingSystemV1.upsert({
      where: { userId },
      create: {
        userId,
        planningRules: input.planningRules,
        antiProcrastinationRules: input.antiProcrastinationRules,
        visibleChanges: input.visibleChanges,
        aiSummary: input.aiSummary,
      },
      update: {
        planningRules: input.planningRules,
        antiProcrastinationRules: input.antiProcrastinationRules,
        visibleChanges: input.visibleChanges,
        aiSummary: input.aiSummary,
      },
    });

    // Udělit badge za dokončení OS V1
    const existingBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeCode: {
          userId,
          badgeCode: 'OS_V1_DONE',
        },
      },
    });

    if (!existingBadge) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeCode: 'OS_V1_DONE',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: os,
      message: 'Pracovní operační systém úspěšně uložen',
    } as ApiResponse);
  } catch (error) {
    console.error('Operating system POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při ukládání pracovního OS' } as ApiResponse,
      { status: 500 }
    );
  }
}
