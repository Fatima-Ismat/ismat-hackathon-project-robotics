import type {ReactNode} from 'react';
import React, { useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

// ChatWidget import karo
import ChatWidget from '@site/src/components/ChatWidget';

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
          
          <button
            onClick={() => {
              const event = new CustomEvent('open-chatwidget');
              window.dispatchEvent(event);
            }}
            className="button button--success button--lg"
            style={{marginLeft: '10px', backgroundColor: '#4F46E5'}}
          >
            🤖 Ask AI Assistant
          </button>
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

function ChatBotSection() {
  return (
    <section style={{
      padding: '40px 0',
      backgroundColor: '#f8f9fa',
      marginTop: '40px',
      borderTop: '1px solid #e9ecef'
    }}>
      <div className="container">
        <Heading as="h2" style={{textAlign: 'center', marginBottom: '30px'}}>
          💬 AI Assistant for This Book
        </Heading>
        <p style={{textAlign: 'center', marginBottom: '30px', fontSize: '18px'}}>
          Ask questions about robotics, AI, or select any text from the book to get explanations!
        </p>
        
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          border: '1px solid #ddd',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
          <ChatWidget />
        </div>
        
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          <p>
            <strong>How to use:</strong> 
            1. Click the AI button at bottom-right OR 
            2. Select any text in the book → Click the "AI" popup
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  
  useEffect(() => {
    const handleOpenChat = () => {
      console.log('Opening chat widget...');
    };
    
    window.addEventListener('open-chatwidget', handleOpenChat);
    return () => window.removeEventListener('open-chatwidget', handleOpenChat);
  }, []);
  
  return (
    <Layout
      title={`Home`}
      description="Learn Physical AI and Humanoid Robotics from fundamentals to deployment">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <ChatBotSection />
      </main>
    </Layout>
  );
}