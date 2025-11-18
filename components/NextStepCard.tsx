// Next Step Card Component
// /components/NextStepCard.tsx

'use client';

import { useRouter } from 'next/navigation';

interface NextStepCardProps {
  nextStep: string;
}

export default function NextStepCard({ nextStep }: NextStepCardProps) {
  const router = useRouter();

  const handleAction = () => {
    // Určit kam navigovat podle typu kroku
    if (nextStep.includes('onboarding') || nextStep.includes('rozhovor')) {
      router.push('/coach?type=onboarding');
    } else if (nextStep.includes('plán')) {
      router.push('/weekly-plan');
    } else if (nextStep.includes('tracker')) {
      router.push('/daily-tracker');
    } else {
      router.push('/coach');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium opacity-90 mb-1">
            Další krok
          </div>
          <h3 className="text-xl font-semibold mb-4">{nextStep}</h3>
          <button
            onClick={handleAction}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Pokračovat →
          </button>
        </div>
        <div className="ml-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
