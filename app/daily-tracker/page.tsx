// Daily Tracker Page
// /app/daily-tracker/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DailyTrackerPage() {
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    loadCurrentWeek();
    loadRecentEntries();
  }, []);

  const loadCurrentWeek = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        headers: { 'x-user-id': 'demo-user' },
      });
      const result = await response.json();
      if (result.success) {
        setCurrentWeek(result.data.currentWeek);
      }
    } catch (error) {
      console.error('Error loading week:', error);
    }
  };

  const loadRecentEntries = async () => {
    try {
      const response = await fetch('/api/daily-tracker', {
        headers: { 'x-user-id': 'demo-user' },
      });
      const result = await response.json();
      if (result.success) {
        setEntries(result.data.slice(0, 7)); // Posledních 7 dní
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          ...formData,
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error saving tracker:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Denní tracker</h1>
          <p className="text-gray-600 mt-1">Týden {currentWeek}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulář */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Jak se ti dnes daří?
              </h2>

              {/* Týden 1 - Základní tracking */}
              {currentWeek === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pracoval jsi dnes na kurzu?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => updateField('engagedToday', true)}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          formData.engagedToday === true
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Ano
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('engagedToday', false)}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          formData.engagedToday === false
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Ne
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jak vnímáš dnešní den? (1 = chaos, 5 = úplný klid)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateField('dayFeeling', val)}
                          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                            formData.dayFeeling === val
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Co tě dnes nejvíc frustrovalo? (volitelné)
                    </label>
                    <textarea
                      value={formData.frustrationNote || ''}
                      onChange={(e) =>
                        updateField('frustrationNote', e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Stručně popiš, co tě dnes trápilo..."
                    />
                  </div>
                </div>
              )}

              {/* Týden 2 - Focus bloky */}
              {currentWeek === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Měl jsi dnes focus blok?
                    </label>
                    <div className="flex gap-3">
                      {['YES', 'PARTIAL', 'NO'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateField('focusBlockDone', status)}
                          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                            formData.focusBlockDone === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status === 'YES'
                            ? 'Ano'
                            : status === 'PARTIAL'
                            ? 'Částečně'
                            : 'Ne'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jaký high-impact krok jsi dnes udělal?
                    </label>
                    <textarea
                      value={formData.highImpactStep || ''}
                      onChange={(e) =>
                        updateField('highImpactStep', e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Popište konkrétní krok s vysokou hodnotou..."
                    />
                  </div>

                  {formData.focusBlockDone !== 'YES' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Co tě vyrušilo?
                      </label>
                      <textarea
                        value={formData.disruptionReason || ''}
                        onChange={(e) =>
                          updateField('disruptionReason', e.target.value)
                        }
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Co ti zabránilo v deep work?"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Týden 3 - Prokrastinace */}
              {currentWeek === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Odkládal jsi dnes nějakou práci?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          updateField('procrastinationEvent', true)
                        }
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          formData.procrastinationEvent === true
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Ano
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateField('procrastinationEvent', false)
                        }
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          formData.procrastinationEvent === false
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Ne
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Použil jsi nějaký mikro-krok?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => updateField('microStepUsed', true)}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          formData.microStepUsed === true
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Ano
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('microStepUsed', false)}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          formData.microStepUsed === false
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Ne
                      </button>
                    </div>
                  </div>

                  {formData.microStepUsed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jaký mikro-krok jsi použil?
                      </label>
                      <textarea
                        value={formData.microStepContext || ''}
                        onChange={(e) =>
                          updateField('microStepContext', e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Popište, jaký první malý krok jsi udělal..."
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Týden 4 - Systém */}
              {currentWeek === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jak moc jsi dnes pracoval podle svého systému? (1-5)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateField('systemAlignment', val)}
                          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                            formData.systemAlignment === val
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Co pozitivního se dnes stalo?
                    </label>
                    <textarea
                      value={formData.positiveEvent || ''}
                      onChange={(e) =>
                        updateField('positiveEvent', e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jaký úspěch nebo pozitivní moment byl dnes?"
                    />
                  </div>
                </div>
              )}

              {/* Submit tlačítka */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {saving ? 'Ukládám...' : 'Uložit záznam'}
                </button>
              </div>
            </form>
          </div>

          {/* Historie */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Poslední záznamy
              </h3>
              {entries.length === 0 ? (
                <p className="text-sm text-gray-500">Zatím žádné záznamy</p>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(entry.date).toLocaleDateString('cs-CZ', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Týden {entry.weekNumber}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
