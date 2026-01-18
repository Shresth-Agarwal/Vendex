import React, { useState } from 'react';
import { processCustomerIntent } from '../api/customer';
import { toApiError } from '../api/client';

interface ChatMessage {
  from: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const CustomerIntentView: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const newUserMessage: ChatMessage = {
      from: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await processCustomerIntent(trimmed);
      
      // Build the response message from the actual DTO structure
      let responseText = res.message || 'No response message';
      
      // Add clarifying question if present
      if (res.clarifying_question) {
        responseText += `\n\n${res.clarifying_question}`;
      }
      
      // Add bundle recommendations if present
      if (res.bundle && res.bundle.length > 0) {
        responseText += `\n\n📦 Recommended Items:`;
        res.bundle.forEach((item, idx) => {
          responseText += `\n\n${idx + 1}. ${item.sku}`;
          responseText += `\n   • Quantity Recommended: ${item.quantity_recommended} units`;
          responseText += `\n   • Available Stock: ${item.available_stock} units`;
          responseText += `\n   • Status: ${item.status}`;
          if (item.reasoning && item.reasoning.trim()) {
            responseText += `\n   • Reasoning: ${item.reasoning}`;
          }
        });
      }
      
      // Add metadata
      responseText += `\n\n[Action: ${res.action} | Intent: ${res.intent_category} | Confidence: ${(res.confidence_score * 100).toFixed(0)}%]`;

      const aiMessage: ChatMessage = {
        from: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, aiMessage]);
      setError(null);
    } catch (err) {
      const apiErr = toApiError(err);
      setError(apiErr.message);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        from: 'ai',
        text: `Error: ${apiErr.message}. Please try again.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Customer intent error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Customer Support Chat</div>
            <div className="card-subtitle">
              Chat with our AI assistant to help customers find products and answer questions.
            </div>
          </div>
        </div>

        <div className="stack-v">
          <div className="messages-column">
            {messages.length === 0 && (
              <p className="secondary-text">
                <strong>Try asking:</strong> "I need snacks for a movie night" or "What products do you have for a party?"
              </p>
            )}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`message-bubble ${m.from === 'user' ? 'user' : 'ai'}`}
              >
                <div>{m.text}</div>
                <div className="timestamp">
                  {m.from === 'user' ? 'You' : 'Vendex AI'} · {m.timestamp}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="stack-v" aria-label="Customer chat">
            <label className="field-label" htmlFor="chat-input">
              Message
            </label>
            <textarea
              id="chat-input"
              className="text-input textarea-input"
              placeholder="Ask a question as if you were a customer..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="stack-h wrap">
              <button
                type="submit"
                className="primary-button"
                disabled={loading || !input.trim()}
              >
                {loading ? 'Thinking...' : 'Send Message'}
              </button>
              <span className="secondary-text">
                Our AI assistant will help find the right products and answer questions.
              </span>
            </div>
          </form>

          {error && <div className="error-text">Error: {error}</div>}
        </div>
      </section>
    </>
  );
};

