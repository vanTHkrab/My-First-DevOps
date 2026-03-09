import type { Message } from '@/types/chat';

export function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface BubbleProps {
  msg: Message;
  isSelf: boolean;
}

export function MessageBubble({ msg, isSelf }: BubbleProps) {
  return (
    <div className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
          ${isSelf ? 'bg-indigo-500' : 'bg-emerald-500'}`}
      >
        {initials(msg.sender)}
      </div>

      {/* Bubble + meta */}
      <div className={`flex flex-col gap-1 max-w-[70%] ${isSelf ? 'items-end' : 'items-start'}`}>
        {!isSelf && (
          <span className="text-xs text-gray-500 px-1">{msg.sender}</span>
        )}
        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word
            ${isSelf
              ? 'bg-indigo-500 text-white rounded-br-sm'
              : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
            }`}
        >
          {msg.message}
        </div>
        <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}
