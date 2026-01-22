'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiLock } from 'react-icons/fi';
import { chatApi } from '@/lib/api';
import { decryptMessage, encryptMessage } from '@/utils/encryption';
import { useAuthStore } from '@/store/authStore';

interface Message {
  id: string;
  senderId: number;
  senderName: string;
  message: string;
  encrypted?: boolean;
  timestamp: string;
}

interface ChatWindowProps {
  conversationId: string;
  participantName: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  participantName,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const data = await chatApi.getMessages(conversationId);
      
      // Decrypt messages if needed
      const decryptedMessages = data.map((msg: any) => ({
        ...msg,
        message: msg.encrypted && user
          ? decryptMessage(msg.message, user.id)
          : msg.message,
      }));
      
      setMessages(decryptedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      // Encrypt message before sending
      const encryptedMsg = encryptMessage(newMessage, user.id);
      
      await chatApi.sendMessage(conversationId, encryptedMsg);
      setNewMessage('');
      await loadMessages(); // Reload to get the new message
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card h-[600px] flex flex-col">
      <div className="border-b pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{participantName}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <FiLock className="w-3 h-3" />
              <span>End-to-end encrypted</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {!isOwn && (
                    <div className="text-xs font-medium mb-1 opacity-75">
                      {msg.senderName}
                    </div>
                  )}
                  <div className="text-sm">{msg.message}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="input-field flex-1"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="btn-primary flex items-center gap-2"
          >
            <FiSend className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
