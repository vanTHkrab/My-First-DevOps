'use client';

import { useRef } from 'react';

interface ChatInputProps {
  value: string;
  connected: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export function ChatInput({
  value,
  connected,
  onChange,
  onSend,
  onTypingStart,
  onTypingStop,
}: ChatInputProps) {
  // Debounce timer — fires typing_stop 2s after the last keystroke
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);

    // Emit typing_start only once per typing session
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart();
    }

    // Reset the stop timer on every keystroke
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop();
    }, 2000);
  };

  const handleSend = () => {
    // Stop typing indicator immediately on send
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop();
    }
    onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-4 border-t border-gray-100 bg-white flex items-center gap-3">
      <input
        autoFocus
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Enter to send)"
        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50"
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || !connected}
        className="shrink-0 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl px-5 py-3 text-sm font-semibold transition flex items-center gap-2"
      >
        Send
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </div>
  );
}

