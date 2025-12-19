import React, { useState, useRef, useEffect } from 'react';

/**
 * SINGLE BLUE CHATBOT - Bottom-right corner
 * Complete chat functionality with rate limiting
 * ✅ Now supports auto-sending selected text from page
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const BACKEND_URL = 'https://ismat110-rag-chatbot.hf.space';
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Request queue for rate limiting
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastRequestTime = 0;

  async add(request: () => Promise<void>) {
    this.queue.push(request);
    if (!this.processing) {
      this.process();
    }
  }

  private async process() {
    this.processing = true;
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve =>
          setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
        );
      }

      const request = this.queue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        await request();
      }
    }
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for Physical AI & Humanoid Robotics. Ask me anything about ROS 2, NVIDIA Isaac, VLA models, or robotics concepts!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Selected text detection ---
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
        sendMessage(selection);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const sendMessage = async (text?: string) => {
    const messageContent = text || input.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    if (!text) setInput('');
    setIsLoading(true);

    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    let retryCount = 0;
    const makeRequest = async (): Promise<void> => {
      try {
        const response = await fetch(`${BACKEND_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageContent,
            selected_text: text || null,
            session_id: sessionId,
            language: 'en',
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6).trim();
              if (jsonStr) {
                try {
                  const data = JSON.parse(jsonStr);
                  const replyText = data.reply || data.content || '';
                  fullResponse += replyText;

                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      lastMsg.content = fullResponse;
                    }
                    return newMessages;
                  });
                } catch (e) {
                  console.warn('JSON parse error:', e);
                }
              }
            }
          }
        }
      } catch (error) {
        if (retryCount < MAX_RETRIES && error instanceof Error &&
            (error.message.includes('429') || error.message.includes('rate limit'))) {
          retryCount++;
          console.log(`Rate limit hit, retrying (${retryCount}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
          return makeRequest();
        }

        console.error('Chat error:', error);
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content = `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`;
          }
          return newMessages;
        });
      } finally {
        setIsLoading(false);
      }
    };

    await requestQueue.add(makeRequest);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="floating-chatbot-corner">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Chatbot"
          style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '28px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(24, 144, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid #007bff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '15px 20px',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>🤖 Robotics Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            backgroundColor: '#f8f9fa',
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: msg.role === 'user' ? '#1890ff' : 'white',
                  color: msg.role === 'user' ? 'white' : '#333',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '14px',
                  lineHeight: '1.4',
                }}>
                  {msg.content || (isLoading && idx === messages.length - 1 ? '...' : '')}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            padding: '15px',
            borderTop: '1px solid #e0e0e0',
            backgroundColor: 'white',
            display: 'flex',
            gap: '8px',
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about robotics..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #d0d0d0',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              style={{
                padding: '10px 20px',
                background: (isLoading || !input.trim()) ? '#ccc' : 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
