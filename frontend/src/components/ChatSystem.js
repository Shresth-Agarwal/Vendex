import React, { useState, useEffect, useRef } from 'react';
import { getAllManufacturers, getChatHistory, sendChatMessage } from '../services/api';
import './ChatSystem.css';
import { FiSend, FiMessageCircle, FiUser } from 'react-icons/fi';

const ChatSystem = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    loadManufacturers();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedManufacturer) {
      loadChatHistory();
      // Poll for new messages every 5 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadChatHistory();
      }, 5000);
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedManufacturer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadManufacturers = async () => {
    try {
      setLoading(true);
      const data = await getAllManufacturers();
      setManufacturers(data);
      if (data.length > 0 && !selectedManufacturer) {
        setSelectedManufacturer(data[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading manufacturers:', err);
      // Use mock data if backend fails
      setManufacturers([
        { id: 1, name: 'Demo Manufacturer 1', emailId: 'manufacturer1@example.com' },
        { id: 2, name: 'Demo Manufacturer 2', emailId: 'manufacturer2@example.com' },
      ]);
      if (!selectedManufacturer) {
        setSelectedManufacturer({ id: 1, name: 'Demo Manufacturer 1', emailId: 'manufacturer1@example.com' });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    if (!selectedManufacturer) return;

    try {
      const history = await getChatHistory(selectedManufacturer.id);
      setMessages(history || []);
    } catch (err) {
      console.error('Error loading chat history:', err);
      // If no messages, start with empty array
      if (messages.length === 0) {
        setMessages([]);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedManufacturer) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistically add message to UI
    const tempMessage = {
      id: Date.now(),
      message: messageText,
      sender: 'vendor',
      receiver: `manufacturer-${selectedManufacturer.id}`,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await sendChatMessage(selectedManufacturer.id, messageText);
      // Replace temp message with server response
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? response : msg
      ));
    } catch (err) {
      console.error('Error sending message:', err);
      // Keep the optimistic message, or remove it on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="chat-system">
      <div className="chat-header">
        <h1>Vendor-Manufacturer Chat</h1>
        <p>Communicate with manufacturers about orders and products</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="chat-container">
        <div className="manufacturers-sidebar">
          <h2>Manufacturers</h2>
          {manufacturers.length === 0 ? (
            <p className="no-manufacturers">No manufacturers available</p>
          ) : (
            <div className="manufacturers-list">
              {manufacturers.map(manufacturer => (
                <div
                  key={manufacturer.id}
                  className={`manufacturer-item ${selectedManufacturer?.id === manufacturer.id ? 'active' : ''}`}
                  onClick={() => setSelectedManufacturer(manufacturer)}
                >
                  <FiUser className="manufacturer-icon" />
                  <div className="manufacturer-info">
                    <h3>{manufacturer.name}</h3>
                    <p>{manufacturer.emailId}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chat-window">
          {selectedManufacturer ? (
            <>
              <div className="chat-header-bar">
                <div className="chat-partner-info">
                  <FiMessageCircle />
                  <div>
                    <h3>{selectedManufacturer.name}</h3>
                    <p>{selectedManufacturer.emailId}</p>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-chat">
                    <FiMessageCircle size={48} />
                    <p>No messages yet</p>
                    <p className="hint">Start a conversation by sending a message</p>
                  </div>
                ) : (
                  messages.map(message => {
                    const isVendor = message.sender === 'vendor';
                    return (
                      <div
                        key={message.id}
                        className={`message ${isVendor ? 'message-sent' : 'message-received'}`}
                      >
                        <div className="message-content">
                          <p>{message.message}</p>
                          <span className="message-time">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="message-input"
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!newMessage.trim() || sending}
                >
                  <FiSend />
                </button>
              </form>
            </>
          ) : (
            <div className="no-selection">
              <FiMessageCircle size={64} />
              <p>Select a manufacturer to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
