// Root Landing Page
// /app/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  // Automatické přesměrování po 2 sekundách
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleStart = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center animate-fade-in">
        {/* Logo / Icon */}
        <div className="mb-8">
          <div className="inline-block p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
        </div>

        {/* Hlavní nadpis */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          Stát se nenahraditelným
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
            v době AI
          </span>
        </h1>

        {/* Popis */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          4týdenní transformační program pro profesionály, kteří chtějí vybudovat
          svůj pracovní operační systém 1.0
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-1">Jasný cíl</h3>
            <p className="text-sm text-gray-600">
              Stanovíš si osobní cíl a AI kouč tě provede celým programem
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-1">Denní tracking</h3>
            <p className="text-sm text-gray-600">
              Sleduj svůj pokrok a získávej odznaky za dosažené milníky
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-900 mb-1">AI kouč</h3>
            <p className="text-sm text-gray-600">
              Osobní AI asistent tě provází každým krokem programu
            </p>
          </div>
        </div>

        {/* CTA tlačítko */}
        <button
          onClick={handleStart}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Začít program
          <svg
            className="w-5 h-5"
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
        </button>

        {/* Automatické přesměrování info */}
        <p className="text-sm text-gray-500 mt-6">
          Automatické přesměrování za 2 sekundy...
        </p>

        {/* 4 týdny přehled */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Co tě čeká v programu
          </h2>
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-left p-4 bg-white rounded-lg shadow-sm">
              <div className="font-bold text-blue-600 mb-2">Týden 1</div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Start & diagnostika
              </h4>
              <p className="text-sm text-gray-600">
                Kde jsem a kam chci jít v AI době
              </p>
            </div>

            <div className="text-left p-4 bg-white rounded-lg shadow-sm">
              <div className="font-bold text-blue-600 mb-2">Týden 2</div>
              <h4 className="font-semibold text-gray-900 mb-1">
                AI Kompas týdne
              </h4>
              <p className="text-sm text-gray-600">
                Týden pod kontrolou s focus bloky
              </p>
            </div>

            <div className="text-left p-4 bg-white rounded-lg shadow-sm">
              <div className="font-bold text-blue-600 mb-2">Týden 3</div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Mikro-kroky
              </h4>
              <p className="text-sm text-gray-600">
                Z odkládání na první mikro-krok
              </p>
            </div>

            <div className="text-left p-4 bg-white rounded-lg shadow-sm">
              <div className="font-bold text-blue-600 mb-2">Týden 4</div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Pracovní OS 1.0
              </h4>
              <p className="text-sm text-gray-600">
                Můj osobní pracovní systém
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
