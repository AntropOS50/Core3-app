// Dashboard Page
// /app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { DashboardData } from '@/lib/api/types';
import WeekProgress from '@/components/WeekProgress';
import NextStepCard from '@/components/NextStepCard';
import GamificationPanel from '@/components/GamificationPanel';
import CoachPanel from '@/components/CoachPanel';
import DailyTrackerQuickAccess from '@/components/DailyTrackerQuickAccess';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        headers: {
          'x-user-id': 'demo-user', // TODO: Nahradit skutečnou autentizací
        },
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Načítám...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Chyba při načítání dat</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dobrý den, {data.user.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Fáze 1: Pracovní operační systém 1.0
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Týden</div>
              <div className="text-3xl font-bold text-blue-600">
                {data.currentWeek}/4
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Levý sloupec - Hlavní obsah */}
          <div className="lg:col-span-2 space-y-6">
            {/* Týdenní progress */}
            <WeekProgress currentWeek={data.currentWeek} />

            {/* Hlavní cíl */}
            {data.courseState?.mainGoal && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Tvůj hlavní cíl
                </h2>
                <p className="text-gray-700">{data.courseState.mainGoal}</p>
              </div>
            )}

            {/* Další krok */}
            <NextStepCard nextStep={data.nextStep} />

            {/* Denní tracker - rychlý přístup */}
            <DailyTrackerQuickAccess
              currentWeek={data.currentWeek}
              todayEntry={data.todayEntry}
              onUpdate={loadDashboard}
            />
          </div>

          {/* Pravý sloupec - Sidebar */}
          <div className="space-y-6">
            {/* Gamifikace */}
            <GamificationPanel gamification={data.gamification} />

            {/* AI Kouč panel */}
            <CoachPanel
              summary={data.coachSummary}
              currentWeek={data.currentWeek}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
