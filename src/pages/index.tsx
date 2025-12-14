import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Start Reading 📚
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  const features = [
    {
      title: 'Hands-On Learning',
      description: 'Build real robotics systems with ROS 2, NVIDIA Isaac, and modern AI frameworks',
    },
    {
      title: 'Vision-Language-Action Models',
      description: 'Master cutting-edge VLA models like RT-1, RT-2, and OpenVLA for robot control',
    },
    {
      title: 'Capstone Project',
      description: 'Integrate everything to build a conversational humanoid robot that performs household tasks',
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {features.map((feature, idx) => (
            <div key={idx} className={clsx('col col--4')}>
              <div className={`${styles.feature} glass-card`}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Home`}
      description="Learn Physical AI and Humanoid Robotics from fundamentals to deployment">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
      
      {/* 🚀 CHATBOT SCRIPT - ADDED HERE */}
      <script dangerouslySetInnerHTML={{
        __html: `
(function() {
  const API_URL = 'https://helpful-abundance.up.railway.app';
  const SESSION_ID = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = \`
    #chat-bubble {
      position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000; display: flex; align-items: center; justify-content: center;
      color: white; font-size: 28px; transition: transform 0.2s;
    }
    #chat-bubble:hover { transform: scale(1.1); }
    #chat-window {
      position: fixed; bottom: 90px; right: 20px; width: 350px; height: 500px;
      background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 10001; display: none; flex-direction: column;
    }
    #chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; padding: 15px; border-radius: 12px 12px 0 0;
      font-weight: 600; font-size: 16px;
    }
    #chat-messages {
      flex: 1; overflow-y: auto; padding: 15px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .message {
      max-width: 80%; padding: 10px 14px; border-radius: 10px;
      word-wrap: break-word; font-size: 14px; line-height: 1.5;
    }
    .message.user {
      align-self: flex-end; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .message.assistant {
      align-self: flex-start; background: #f0f0f0; color: #333;
    }
    .message.system {
      align-self: center; background: #fff3cd; color: #856404;
      font-size: 12px; padding: 6px 10px;
    }
    #chat-input-area {
      padding: 15px; border-top: 1px solid #e0e0e0; background: white;
      border-radius: 0 0 12px 12px;
    }
    #chat-input {
      width: 100%; padding: 10px; border: 2px solid #e0e0e0;
      border-radius: 8px; outline: none; font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #chat-input:focus { border-color: #667eea; }
    #send-btn {
      width: 100%; margin-top: 8px; padding: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; border: none; border-radius: 8px;
      cursor: pointer; font-weight: 600; font-size: 14px;
      transition: opacity 0.2s;
    }
    #send-btn:hover:not(:disabled) { opacity: 0.9; }
    #send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .typing-indicator {
      display: inline-flex; align-items: center; gap: 4px;
    }
    .typing-indicator span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #667eea; animation: bounce 1.4s infinite;
    }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-10px); }
    }
  \`;
  document.head.appendChild(style);

  // Create chat UI
  const chatHTML = \`
    <div id="chat-bubble" title="Ask about the book">💬</div>
    <div id="chat-window">
      <div id="chat-header">Robotics Book Assistant</div>
      <div id="chat-messages">
        <div class="message assistant">Hi! Ask me anything about the Physical AI & Humanoid Robotics book. You can also select text and ask questions about it!</div>
      </div>
      <div id="chat-input-area">
        <input id="chat-input" placeholder="Ask a question..." />
        <button id="send-btn">Send</button>
      </div>
    </div>
  \`;
  const chatContainer = document.createElement('div');
  chatContainer.innerHTML = chatHTML;
  document.body.appendChild(chatContainer);

  // Get elements
  const bubble = document.getElementById('chat-bubble');
  const window_ = document.getElementById('chat-window');
  const messages = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');

  let selectedText = '';

  // Toggle chat window
  bubble.onclick = () => {
    window_.style.display = window_.style.display === 'none' ? 'flex' : 'none';
    if (window_.style.display === 'flex') input.focus();
  };

  // Capture text selection
  document.addEventListener('mouseup', () => {
    const sel = window.getSelection().toString().trim();
    if (sel.length > 0 && sel.length < 2000) {
      selectedText = sel;
      const preview = sel.length > 60 ? sel.substring(0, 60) + '...' : sel;
      addMessage('system', '📝 Selected: "' + preview + '"');
    }
  });

  // Add message to UI
  function addMessage(role, content) {
    const msg = document.createElement('div');
    msg.className = 'message ' + role;
    if (role === 'assistant') {
      content = content.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
      content = content.replace(/\\*(.*?)\\*/g, '<em>$1</em>');
      content = content.replace(/\`(.*?)\`/g, '<code style="background:#e0e0e0;padding:2px 4px;border-radius:3px;">$1</code>');
      msg.innerHTML = content;
    } else {
      msg.textContent = content;
    }
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  // Send message
  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    addMessage('user', message);
    input.value = '';
    sendBtn.disabled = true;

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;

    try {
      const response = await fetch(API_URL + '/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          message: message,
          selected_text: selectedText || '',
          session_id: SESSION_ID
        })
      });

      if (!response.ok) throw new Error('HTTP ' + response.status);

      // Remove typing indicator
      messages.removeChild(typingDiv);

      // Read streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';
      let msgDiv = null;

      while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\\\\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6).trim();
            if (data === '[DONE]') break;
            if (!data) continue;

            assistantMsg += data;

            if (!msgDiv) {
              msgDiv = document.createElement('div');
              msgDiv.className = 'message assistant';
              messages.appendChild(msgDiv);
            }

            let formatted = assistantMsg;
            formatted = formatted.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
            formatted = formatted.replace(/\\*(.*?)\\*/g, '<em>$1</em>');
            formatted = formatted.replace(/\`(.*?)\`/g, '<code style="background:#e0e0e0;padding:2px 4px;border-radius:3px;">$1</code>');
            msgDiv.innerHTML = formatted;

            messages.scrollTop = messages.scrollHeight;
          }
        }
      }

      selectedText = '';

    } catch (err) {
      messages.removeChild(typingDiv);
      addMessage('assistant', '❌ Error: ' + err.message + '. Please try again.');
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.onclick = sendMessage;
  input.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
})();
        `
      }} />
    </Layout>
  );
}