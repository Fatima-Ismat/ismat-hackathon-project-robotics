import React, { useState } from 'react';

/**
 * SIMPLIFIED CHATWIDGET - No CSS modules, no complex features
 * Just the core functionality to verify it works
 */
export default function SimpleChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Log that component rendered
  React.useEffect(() => {
    console.log('✅ SimpleChatWidget rendered successfully!');
  }, []);

  return (
    <div style={{ position: 'relative', zIndex: 999999 }}>
      {/* MAIN BUTTON */}
      {!isOpen && (
        <button
          onClick={() => {
            console.log('Button clicked, opening panel...');
            setIsOpen(true);
          }}
          aria-label="Open AI Chat - Simple"
          style={{
            position: 'fixed',
            bottom: '100px', // Different position from TestButton
            right: '20px',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(24, 144, 255, 0.6)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          💬
        </button>
      )}

      {/* CHAT PANEL */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '170px', // Above button
          right: '20px',
          width: '400px',
          maxWidth: 'calc(100vw - 40px)',
          height: '500px',
          maxHeight: 'calc(100vh - 200px)',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999999,
          overflow: 'hidden',
          border: '2px solid #1890ff',
        }}>
          {/* HEADER */}
          <div style={{
            padding: '15px 20px',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
          }}>
            <span>💬 Simple AI Chat</span>
            <button
              onClick={() => {
                console.log('Closing panel...');
                setIsOpen(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '28px',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1',
              }}
            >
              ×
            </button>
          </div>

          {/* CONTENT */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
          }}>
            <div style={{
              padding: '15px',
              background: '#f0f0f0',
              borderRadius: '8px',
              marginBottom: '10px',
            }}>
              <strong>✅ Simple ChatWidget Works!</strong>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
                This is a minimal version to test React rendering.
                If you see this, the issue is with the complex ChatWidget component.
              </p>
            </div>

            <div style={{
              padding: '15px',
              background: '#e3f2fd',
              borderRadius: '8px',
              marginBottom: '10px',
            }}>
              <strong>Backend:</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', wordBreak: 'break-all' }}>
                <code>https://ismat110-rag-chatbot.hf.space</code>
              </p>
            </div>

            <div style={{
              padding: '15px',
              background: '#fff3e0',
              borderRadius: '8px',
            }}>
              <strong>Next Step:</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                Open the iframe chatbot below to interact with your RAG system.
              </p>
            </div>
          </div>

          {/* FOOTER with link to iframe */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid #ddd',
            background: '#fafafa',
          }}>
            <button
              onClick={() => {
                const iframe = document.querySelector('iframe[title="RAG Chatbot"]');
                if (iframe) {
                  iframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setIsOpen(false);
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              Open Full Chatbot ↓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
