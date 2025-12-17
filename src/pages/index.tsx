import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ChatWidget from '@site/src/components/ChatWidget';
import TestButton from '@site/src/components/TestButton';

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
        
        {/* ✅ SIMPLE IFRAME CHATBOT */}
        <section style={{
          padding: '40px 0',
          backgroundColor: '#f8f9fa',
          marginTop: '40px'
        }}>
          <div className="container">
            <Heading as="h2" style={{textAlign: 'center', marginBottom: '20px'}}>
              🤖 AI Assistant Chat
            </Heading>
            <p style={{textAlign: 'center', marginBottom: '30px'}}>
              Ask questions about robotics, AI, or any topic from the book
            </p>
            
            <iframe
              src="https://ismat110-rag-chatbot.hf.space"
              width="100%"
              height="550"
              style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }}
              title="RAG Chatbot"
            />
            
            <div style={{
              marginTop: '15px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#666'
            }}>
              <p>Powered by your Hugging Face backend: <code>ismat110-rag-chatbot.hf.space</code></p>
            </div>
          </div>
        </section>
      </main>

      {/* ✅ FLOATING CHATWIDGET BUTTON */}
      <ChatWidget />

      {/* 🧪 TEST BUTTON - Red with yellow border (should be VERY visible) */}
      <TestButton />
    </Layout>
  );
}