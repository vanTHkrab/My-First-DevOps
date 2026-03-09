'use client';

import { useState } from 'react';

interface UsernameScreenProps {
  onJoin: (name: string) => void;
}

export function UsernameScreen({ onJoin }: UsernameScreenProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onJoin(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <h1 className="text-2xl font-bold text-gray-800">WS Chat</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your name to join the room</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name…"
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition"
          >
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
}
