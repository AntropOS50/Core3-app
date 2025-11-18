// Coach Panel Component (Dashboard sidebar)
// /components/CoachPanel.tsx

'use client';

import { useRouter } from 'next/navigation';

interface CoachPanelProps {
  summary: string | null;
  currentWeek: number;
}

export default function CoachPanel({ summary, currentWeek }: CoachPanelProps) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm p-6 border border-purple-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl">
          🤖
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tvůj AI kouč</h3>
          <p className="text-xs text-gray-600">Vždy k dispozici</p>
        </div>
      </div>

      {summary && (
        <div className="mb-4 p-3 bg-white rounded-lg text-sm text-gray-700">
          {summary}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => router.push('/coach?type=ad_hoc')}
          className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm shadow-sm"
        >
          Otevřít kouče 💬
        </button>

        <div className="text-xs text-gray-600 space-y-1 pt-2">
          <div>✓ Pomoc s plánováním</div>
          <div>✓ Řešení prokrastinace</div>
          <div>✓ Týdenní reflexe</div>
        </div>
      </div>
    </div>
  );
}
