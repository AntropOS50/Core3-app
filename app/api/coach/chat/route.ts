// API Route: AI Coach Chat
// /app/api/coach/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AICoach, CoachContext } from '@/lib/ai-coach/coach';
import { ApiResponse, CoachMessageInput, CoachResponse } from '@/lib/api/types';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const input: CoachMessageInput = await request.json();

    // Získat kontext uživatele
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        courseState: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Uživatel nenalezen' } as ApiResponse,
        { status: 404 }
      );
    }

    const currentWeek = input.weekNumber || user.courseState?.currentWeek || 1;

    // Získat další kontext podle typu interakce
    let weeklyPlan;
    let dailyEntries;
    let patterns;

    if (input.interactionType === 'weekly_planning') {
      weeklyPlan = await prisma.weeklyPlan.findUnique({
        where: {
          userId_weekNumber: {
            userId,
            weekNumber: currentWeek,
          },
        },
      });
    }

    if (input.interactionType === 'reflection') {
      dailyEntries = await prisma.dailyTrackerEntry.findMany({
        where: {
          userId,
          weekNumber: currentWeek,
        },
        orderBy: { date: 'asc' },
      });
    }

    if (input.interactionType === 'procrastination') {
      patterns = await prisma.procrastinationPattern.findMany({
        where: { userId },
      });
    }

    // Sestavit kontext pro AI kouče
    const context: CoachContext = {
      userId,
      currentWeek,
      interactionType: input.interactionType,
      user: {
        name: user.name,
        roleDescription: user.roleDescription || undefined,
        workContext: user.workContext || undefined,
        mainGoal: user.courseState?.mainGoal || undefined,
      },
      weeklyPlan,
      dailyEntries,
      patterns,
    };

    // Načíst historii konverzace
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const coach = new AICoach(apiKey);
    const conversationHistory = await coach.loadConversationHistory(
      userId,
      input.interactionType,
      currentWeek
    );

    // Získat odpověď od AI kouče
    const response = await coach.chat(context, input.message, conversationHistory);

    // Uložit zprávy do databáze
    const newMessages = [
      ...conversationHistory,
      {
        role: 'user' as const,
        content: input.message,
        timestamp: new Date(),
      },
      {
        role: 'assistant' as const,
        content: response.reply,
        timestamp: new Date(),
      },
    ];

    await coach.saveConversation(
      userId,
      currentWeek,
      input.interactionType,
      newMessages
    );

    const coachResponse: CoachResponse = {
      reply: response.reply,
      suggestedActions: response.suggestedActions,
      nextStep: response.nextStep,
    };

    return NextResponse.json({
      success: true,
      data: coachResponse,
    } as ApiResponse<CoachResponse>);
  } catch (error) {
    console.error('Coach chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při komunikaci s AI koučem' } as ApiResponse,
      { status: 500 }
    );
  }
}

// GET - Načíst historii konverzace
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user';
    const { searchParams } = new URL(request.url);
    const interactionType = searchParams.get('type') || 'ad_hoc';
    const weekNumber = searchParams.get('week');

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const coach = new AICoach(apiKey);
    const history = await coach.loadConversationHistory(
      userId,
      interactionType,
      weekNumber ? parseInt(weekNumber) : undefined
    );

    return NextResponse.json({
      success: true,
      data: { messages: history },
    } as ApiResponse);
  } catch (error) {
    console.error('Coach history GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Chyba při načítání historie' } as ApiResponse,
      { status: 500 }
    );
  }
}
