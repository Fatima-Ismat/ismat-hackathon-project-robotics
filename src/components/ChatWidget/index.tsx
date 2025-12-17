import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  selectedText?: string;
}

const BACKEND_URL = 'https://ismat110-rag-chatbot.hf.space';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // AUTO-SCROLL TO BOTTOM
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // SELECTION BUTTON LOGIC - FIXED
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      // REMOVE OLD BUTTON FIRST
      const oldButton = document.getElementById('ai-selection-btn');
      if (oldButton) oldButton.remove();
      
      if (text && text.length > 10) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        
        if (!rect) return;
        
        // CREATE NEW BUTTON
        const button = document.createElement('button');
        button.id = 'ai-selection-btn';
        button.className = styles.selectionButton || 'ai-selection-btn';
        button.textContent = '🤖 AI';
        button.style.cssText = `
          position: absolute;
          top: ${rect.top + window.scrollY - 40}px;
          left: ${rect.left + window.scrollX + rect.width/2 - 30}px;
          background: #4F46E5;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          z-index: 9999;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        button.onclick = () => {
          setSelectedText(text);
          setIsOpen(true);
          sendMessage(`Explain: "${text}"`, text);
          button.remove();
        };
        
        document.body.appendChild(button);
        
        // AUTO REMOVE AFTER 5 SECONDS
        setTimeout(() => {
          if (document.body.contains(button)) {
            button.remove();
          }
        }, 5000);
      }
    };
    
    // HIDE BUTTON ON CLICK/SCROLL
    const hideButton = () => {
      const button = document.getElementById('ai-selection-btn');
      if (button) button.remove();
    };
    
    // ADD EVENT LISTENERS
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', hideButton);
    document.addEventListener('scroll', hideButton);
    
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', hideButton);
      document.removeEventListener('scroll', hideButton);
      const button = document.getElementById('ai-selection-btn');
      if (button) button.remove();
    };
  }, []);
  
  // SEND MESSAGE FUNCTION - IMPROVED ERROR HANDLING
  const sendMessage = async (userMessage?: string, selected?: string) => {
    const messageText = userMessage || input.trim();
    if (!messageText || isStreaming) return;
    
    // ADD USER MESSAGE
    const userMsg: Message = {
      role: 'user',
      content: messageText,
      selectedText: selected || selectedText,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedText('');
    setIsStreaming(true);
    
    // ADD EMPTY ASSISTANT MESSAGE FOR STREAMING
    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);
    
    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          selected_text: selected || selectedText || '',
          session_id: sessionId,
          language: 'en'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (!response.body) {
        throw new Error('No response body from server');
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
                if (data.reply || data.content) {
                  const replyText = data.reply || data.content || '';
                  fullResponse += replyText;
                  
                  // UPDATE LAST ASSISTANT MESSAGE
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      lastMsg.content = fullResponse;
                    }
                    return newMessages;
                  });
                  
                  // SCROLL TO BOTTOM
                  clearTimeout(scrollTimeoutRef.current);
                  scrollTimeoutRef.current = setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }
              } catch (e) {
                console.warn('JSON parse error:', e);
              }
            }
          }
        }
      }
      
      setRetryCount(0);
      setLastError(null);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // UPDATE ERROR MESSAGE
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = `Error: ${errorMessage}. Please try again.`;
        }
        return newMessages;
      });
      
      setLastError(errorMessage);
      
    } finally {
      setIsStreaming(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };
  
  // CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      const button = document.getElementById('ai-selection-btn');
      if (button) button.remove();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div style={{ position: 'relative', zIndex: 99999 }}>
      {/* MAIN CHAT BUTTON - BULLETPROOF VISIBILITY */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chat"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#4F46E5',
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '24px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(24, 144, 255, 0.4)',
          zIndex: 99999,
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s, box-shadow 0.3s',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(24, 144, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.4)';
        }}
      >
        🤖
      </button>
      
      {/* CHAT PANEL */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '400px',
          maxWidth: 'calc(100vw - 40px)',
          height: '500px',
          maxHeight: 'calc(100vh - 120px)',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 99999,
          overflow: 'hidden',
        }}>
          {/* HEADER */}
          <div style={{
            padding: '15px 20px',
            backgroundColor: '#4F46E5',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ margin: 0 }}>AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
          
          {/* MESSAGES */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '15px',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}
              >
                <div style={{
                  display: 'inline-block',
                  padding: '10px 15px',
                  borderRadius: '18px',
                  maxWidth: '80%',
                  backgroundColor: msg.role === 'user' ? '#4F46E5' : '#f1f1f1',
                  color: msg.role === 'user' ? 'white' : 'black',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* INPUT FORM */}
          <form onSubmit={handleSubmit} style={{
            padding: '15px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '10px',
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI anything..."
              disabled={isStreaming}
              style={{
                flex: 1,
                padding: '10px 15px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                fontSize: '14px',
              }}
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                opacity: (isStreaming || !input.trim()) ? 0.5 : 1,
              }}
            >
              {isStreaming ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}