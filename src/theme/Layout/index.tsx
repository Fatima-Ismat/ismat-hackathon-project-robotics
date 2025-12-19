import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import Chatbot from '@site/src/components/Chatbot';
import '@site/src/styles/chatbot.css';

export default function Layout(props: any) {
  return (
    <>
      <OriginalLayout {...props} />
      {/* Inject chatbot on ALL pages (homepage + docs) */}
      <Chatbot />
    </>
  );
}
