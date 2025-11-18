// Gamification Panel Component
// /components/GamificationPanel.tsx

'use client';

interface Badge {
  code: string;
  name: string;
  icon: string;
  earnedAt: Date;
}

interface Streak {
  metric: string;
  currentStreak: number;
  longestStreak: number;
}

interface GamificationPanelProps {
  gamification: {
    weeklyScore: number;
    badges: Badge[];
    streaks: Streak[];
  };
}

const badgeIcons: Record<string, string> = {
  GOAL_LOCKED: '🎯',
  FIRST_WEEKLY_PLAN: '📋',
  ANTI_PROCRAST_PATTERNS: '⚡',
  OS_V1_DONE: '🚀',
};

const streakLabels: Record<string, string> = {
  meaningful_step: 'Významné kroky',
  micro_step_used: 'Použití mikro-kroků',
};

export default function GamificationPanel({ gamification }: GamificationPanelProps) {
  return (
    <div className="space-y-6">
      {/* Týdenní skóre */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Týdenní pokrok
        </h3>
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Skóre</span>
            <span className="font-semibold text-gray-900">
              {gamification.weeklyScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${gamification.weeklyScore}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Vyplň tracker každý den a pracuj na high-value úkolech
        </p>
      </div>

      {/* Odznaky */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Odznaky</h3>
        {gamification.badges.length === 0 ? (
          <p className="text-sm text-gray-500">Zatím žádné odznaky</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {gamification.badges.map((badge) => (
              <div
                key={badge.code}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-3xl mb-2">
                  {badgeIcons[badge.code] || '🏆'}
                </div>
                <div className="text-xs text-center text-gray-700 font-medium">
                  {badge.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Streaky */}
      {gamification.streaks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Série</h3>
          <div className="space-y-3">
            {gamification.streaks.map((streak) => (
              <div key={streak.metric} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {streakLabels[streak.metric] || streak.metric}
                  </div>
                  <div className="text-xs text-gray-500">
                    Nejdelší: {streak.longestStreak} dní
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {streak.currentStreak}🔥
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
