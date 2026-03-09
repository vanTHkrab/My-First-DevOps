'use client';

import { useEffect, useState, useCallback } from 'react';
import {useSocket} from '@/context/socket-context';
import type { Message } from '@/types/chat';
import { UsernameScreen } from '@/components/chat/username-screen';
import { ChatHeader } from '@/components/chat/chat-header';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import { TypingIndicator } from '@/components/chat/typing-indicator';

export default function ChatWindow() {
  const [username, setUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

    const onTypingStart = ({ sender }: { sender: string }) =>
      setTypingUsers((prev) => prev.includes(sender) ? prev : [...prev, sender]);

    const onTypingStop = ({ sender }: { sender: string }) =>
      setTypingUsers((prev) => prev.filter((u) => u !== sender));

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onMessage);
    socket.on('typing_start', onTypingStart);
    socket.on('typing_stop', onTypingStop);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onMessage);
      socket.off('typing_start', onTypingStart);
      socket.off('typing_stop', onTypingStop);
    };
  }, [socket]);

  const emitTypingStart = useCallback(() => {
    if (!username || !socket?.connected) return;
    socket.emit('typing_start', { sender: username });
  }, [username, socket]);

  const emitTypingStop = useCallback(() => {
    if (!username || !socket?.connected) return;
    socket.emit('typing_stop', { sender: username });
  }, [username, socket]);

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !username || !socket?.connected) return;

    const msg: Message = {
      id: (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') 
            ? crypto.randomUUID() 
            : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: username,
      message: trimmed,
      timestamp: Date.now(),
    };

    socket.emit('send_message', msg);
    setInput('');
  }, [input, username, socket]);

  if (!username) {
    return <UsernameScreen onJoin={setUsername} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden h-[90vh]">
        <ChatHeader username={username} connected={connected} />
        <MessageList messages={messages} username={username} />
        <TypingIndicator typingUsers={typingUsers} />
        <ChatInput
          value={input}
          connected={connected}
          onChange={setInput}
          onSend={sendMessage}
          onTypingStart={emitTypingStart}
          onTypingStop={emitTypingStop}
        />
      </div>
    </div>
  );
}
