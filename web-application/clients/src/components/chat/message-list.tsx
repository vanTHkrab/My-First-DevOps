import { useEffect, useRef } from 'react';
import type { Message } from '@/types/chat';
import { MessageBubble } from './message-bubble';

interface MessageListProps {
  messages: Message[];
  username: string;
}

export function MessageList({ messages, username }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 bg-gray-50/50">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 select-none my-auto">
          <span className="text-4xl">👋</span>
          <p className="text-sm">No messages yet — say hello!</p>
        </div>
      ) : (
        messages.map((m) => (
          <MessageBubble key={m.id} msg={m} isSelf={m.sender === username} />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
