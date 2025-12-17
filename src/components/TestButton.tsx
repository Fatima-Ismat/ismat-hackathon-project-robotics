import React, { useState } from 'react';

/**
 * ULTRA-SIMPLE TEST BUTTON - Guaranteed to work
 * Use this to verify React rendering works at all
 */
export default function TestButton() {
  const [isOpen, setIsOpen] = useState(false);

  console.log('✅ TestButton component rendered!');

  return (
    <>
      {/* MAIN BUTTON */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          console.log('Button clicked! Open:', !isOpen);
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
          color: 'white',
          border: '3px solid yellow',
          borderRadius: '50%',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 2147483647, // Maximum possible z-index
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(255, 0, 0, 0.8)',
          fontWeight: 'bold',
        }}
      >
        🤖
      </button>

      {/* TEST PANEL */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '300px',
          padding: '20px',
          background: 'white',
          border: '3px solid red',
          borderRadius: '12px',
          zIndex: 2147483647,
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'red' }}>
            ✅ TEST BUTTON WORKS!
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
            This proves React is rendering. If you see this, the issue is with ChatWidget component, not React.
          </p>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: '8px 16px',
              background: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
