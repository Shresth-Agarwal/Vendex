'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ChatWindow } from '@/components/ChatWindow';
import { chatApi } from '@/lib/api';
import { FiMessageCircle } from 'react-icons/fi';

export default function ManufacturerChatPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'MANUFACTURER') {
      router.push('/login');
      return;
    }
    loadConversations();
  }, [isAuthenticated, user]);

  const loadConversations = async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <FiMessageCircle className="w-8 h-8" />
        Messages
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Conversations</h2>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv.id);
                    setParticipantName(conv.participantName);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedConversation === conv.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <p className="font-medium">{conv.participantName}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation}
              participantName={participantName}
            />
          ) : (
            <div className="card h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FiMessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
