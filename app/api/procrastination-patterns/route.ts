// API Route: Procrastination Patterns
// /app/api/procrastination-patterns/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, ProcrastinationPatternInput } from '@/lib/api/types';

// GET - Získat všechny vzorce prokrastinace uživatele
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';

    const patterns = await prisma.procrastinationPattern.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: patterns,
    } as ApiResponse);
  } catch (error) {
    console.error('Procrastination patterns GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání vzorců prokrastinace' } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Vytvořit nový vzorec prokrastinace
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const input: ProcrastinationPatternInput = await request.json();

    const pattern = await prisma.procrastinationPattern.create({
      data: {
        userId,
        description: input.description,
        patternType: input.patternType,
        microStep: input.microStep,
        triggerPhrases: input.triggerPhrases || [],
      },
    });

    // Zkontrolovat, zda má uživatel alespoň 3 vzorce pro badge
    const patternCount = await prisma.procrastinationPattern.count({
      where: { userId },
    });

    if (patternCount >= 3) {
      const existingBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeCode: {
            userId,
            badgeCode: 'ANTI_PROCRAST_PATTERNS',
          },
        },
      });

      if (!existingBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeCode: 'ANTI_PROCRAST_PATTERNS',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: pattern,
      message: 'Vzorec prokrastinace úspěšně uložen',
    } as ApiResponse);
  } catch (error) {
    console.error('Procrastination pattern POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při ukládání vzorce prokrastinace' } as ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE - Smazat vzorec prokrastinace
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const { searchParams } = new URL(request.url);
    const patternId = searchParams.get('id');

    if (!patternId) {
      return NextResponse.json(
        { success: false, error: 'ID vzorce není specifikováno' } as ApiResponse,
        { status: 400 }
      );
    }

    // Ověřit, že vzorec patří uživateli
    const pattern = await prisma.procrastinationPattern.findFirst({
      where: {
        id: patternId,
        userId,
      },
    });

    if (!pattern) {
      return NextResponse.json(
        { success: false, error: 'Vzorec nenalezen' } as ApiResponse,
        { status: 404 }
      );
    }

    await prisma.procrastinationPattern.delete({
      where: { id: patternId },
    });

    return NextResponse.json({
      success: true,
      message: 'Vzorec úspěšně smazán',
    } as ApiResponse);
  } catch (error) {
    console.error('Procrastination pattern DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při mazání vzorce' } as ApiResponse,
      { status: 500 }
    );
  }
}
