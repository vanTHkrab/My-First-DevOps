import { initials } from './message-bubble';

interface ChatHeaderProps {
  username: string;
  connected: boolean;
}

export function ChatHeader({ username, connected }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
      <div className="text-2xl">💬</div>
      <div className="flex-1">
        <h1 className="font-bold text-gray-800 text-lg leading-none">WS Chat</h1>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${connected ? 'bg-emerald-400' : 'bg-gray-300'}`}
          />
          <span className="text-xs text-gray-500">
            {connected ? 'Connected' : 'Connecting…'}
          </span>
        </div>
      </div>
      {/* Current user chip */}
      <div className="flex items-center gap-2 bg-indigo-50 rounded-full px-3 py-1">
        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
          {initials(username)}
        </div>
        <span className="text-sm font-medium text-indigo-700">{username}</span>
      </div>
    </div>
  );
}
