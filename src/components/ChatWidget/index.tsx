import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  selectedText?: string;
}

const BACKEND_URL = 'https://physical-ai-book-api.onrender.com';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 10) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        const anchorNode = selection?.anchorNode;
        if (!anchorNode) return;

        const element = anchorNode.nodeType === Node.ELEMENT_NODE
          ? (anchorNode as HTMLElement)
          : (anchorNode.parentElement as HTMLElement);

        if (!element) return;

        const isInContent = element.closest('.markdown') ||
                           element.closest('article') ||
                           element.closest('main') ||
                           element.closest('[class*="hero"]') ||
                           element.closest('[class*="container"]') ||
                           element.closest('[class*="feature"]');

        if (isInContent && rect) {
          showSelectionButton(rect, text);
        }
      }
    };

    const showSelectionButton = (rect: DOMRect, text: string) => {
      let button = document.getElementById('ai-selection-btn');
      if (!button) {
        button = document.createElement('button');
        button.id = 'ai-selection-btn';
        button.className = styles.selectionButton;
        button.textContent = 'AI';
        document.body.appendChild(button);
      }

      button.style.top = `${rect.top + window.scrollY - 40}px`;
      button.style.left = `${rect.left + window.scrollX + rect.width / 2 - 20}px`;
      button.style.display = 'block';

      button.onclick = () => {
        setSelectedText(text);
        setIsOpen(true);
        sendMessage(`Explain this: "${text}"`, text);
        button!.style.display = 'none';
      };
    };

    const hideButton = () => {
      const button = document.getElementById('ai-selection-btn');
      if (button) button.style.display = 'none';
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', hideButton);
    document.addEventListener('scroll', hideButton, true);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', hideButton);
      document.removeEventListener('scroll', hideButton, true);
      const button = document.getElementById('ai-selection-btn');
      if (button) button.remove();
    };
  }, []);

  const sendMessage = async (userMessage?: string, selected?: string) => {
    const messageText = userMessage || input.trim();
    if (!messageText || isStreaming) return;

    const userMsg: Message = {
      role: 'user',
      content: messageText,
      selectedText: selected || selectedText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSelectedText('');
    setIsStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          selected_text: selected || selectedText || '',
          session_id: sessionId,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(6).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                if (data.reply) {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      lastMsg.content += data.reply;
                    }
                    return newMessages;
                  });
                }
              }
            } catch (e) {
              console.error('JSON parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = 'Error: Could not connect to AI backend.';
        }
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <>
      <button
        className={`${styles.chatButton} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chat"
      >
        AI
      </button>

      {isOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <span>AI Assistant</span>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${
                  msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                }`}
              >
                {msg.selectedText && (
                  <div className={styles.selectedContext}>
                    Selected: "{msg.selectedText}"
                  </div>
                )}
                <div className={styles.messageContent}>{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.chatInput} onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI anything..."
              disabled={isStreaming}
            />
            <button type="submit" disabled={isStreaming || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
