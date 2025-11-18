// Week Progress Component
// /components/WeekProgress.tsx

'use client';

interface WeekProgressProps {
  currentWeek: number;
}

const weekTitles = [
  'Start & diagnostika',
  'AI Kompas týdne',
  'Mikro-kroky proti prokrastinaci',
  'Pracovní operační systém',
];

const weekDescriptions = [
  'Kde jsem a kam chci jít (v AI době)',
  'Týden pod kontrolou',
  'Z odkládání na 1. mikro-krok',
  'Můj pracovní OS 1.0',
];

export default function WeekProgress({ currentWeek }: WeekProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Týden {currentWeek}: {weekTitles[currentWeek - 1]}
      </h2>
      <p className="text-gray-600 mb-6">{weekDescriptions[currentWeek - 1]}</p>

      {/* Progress bar */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((week) => (
          <div key={week} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                week < currentWeek
                  ? 'bg-green-500 text-white'
                  : week === currentWeek
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {week < currentWeek ? '✓' : week}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Týden {week}
              </div>
              <div className="text-xs text-gray-500">{weekTitles[week - 1]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
