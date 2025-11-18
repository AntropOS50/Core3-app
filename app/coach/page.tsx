// AI Coach Chat Page
// /app/coach/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { CoachMessage } from '@/lib/ai-coach/coach';

export default function CoachPage() {
  const searchParams = useSearchParams();
  const interactionType = (searchParams.get('type') || 'ad_hoc') as any;

  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<
    Array<{ label: string; action: string }>
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, [interactionType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await fetch(
        `/api/coach/chat?type=${interactionType}`,
        {
          headers: {
            'x-user-id': 'demo-user',
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setMessages(result.data.messages || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: CoachMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({
          message: inputMessage,
          interactionType,
        }),
      });

      const result = await response.json();
      if (result.success) {
        const assistantMessage: CoachMessage = {
          role: 'assistant',
          content: result.data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setSuggestedActions(result.data.suggestedActions || []);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const interactionTitles = {
    onboarding: 'Onboarding - Pojďme se poznat',
    weekly_planning: 'Týdenní plánování',
    procrastination: 'Analýza prokrastinace',
    reflection: 'Týdenní reflexe',
    ad_hoc: 'Volná konverzace',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
              🤖
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Kouč</h1>
              <p className="text-gray-600">
                {interactionTitles[interactionType as keyof typeof interactionTitles]}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-250px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Vítej u AI kouče
                </h3>
                <p className="text-gray-600">
                  Jsem tady, abych ti pomohl na tvé cestě k tomu stát se
                  nenahraditelným v době AI. Jak ti můžu pomoct?
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('cs-CZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Actions */}
          {suggestedActions.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2">
                Doporučené akce:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedActions.map((action, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Napiš svou zprávu..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Odeslat
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
