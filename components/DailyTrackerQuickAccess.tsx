// Daily Tracker Quick Access Component
// /components/DailyTrackerQuickAccess.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DailyTrackerQuickAccessProps {
  currentWeek: number;
  todayEntry: any;
  onUpdate: () => void;
}

export default function DailyTrackerQuickAccess({
  currentWeek,
  todayEntry,
  onUpdate,
}: DailyTrackerQuickAccessProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleQuickSave = async (data: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/daily-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          weekNumber: currentWeek,
          ...data,
        }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error saving tracker:', error);
    } finally {
      setSaving(false);
    }
  };

  const isToday = todayEntry !== null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Dnešní tracker</h2>
        {isToday && (
          <span className="text-green-600 text-sm font-medium">✓ Vyplněno</span>
        )}
      </div>

      {!isToday ? (
        <div>
          <p className="text-gray-600 mb-4">
            Ještě jsi dnes nevyplnil tracker. Jak se ti dnes daří?
          </p>
          <button
            onClick={() => router.push('/daily-tracker')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Vyplnit dnešní tracker
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">Dnešní záznam je vyplněný!</p>
          <button
            onClick={() => router.push('/daily-tracker')}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Zobrazit historii
          </button>
        </div>
      )}

      {/* Rychlá statistika */}
      {currentWeek >= 2 && todayEntry?.highImpactStep && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Dnešní high-impact krok:</div>
          <div className="text-sm text-gray-900 font-medium">
            {todayEntry.highImpactStep}
          </div>
        </div>
      )}
    </div>
  );
}
