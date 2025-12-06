/**
 * Contact Page - Get in touch with the author and join the waitlist
 */

import React from 'react';
import Layout from '@theme/Layout';
import ContactForm from '@site/src/components/ContactForm';
import styles from './contact.module.css';

export default function Contact(): JSX.Element {
  return (
    <Layout
      title="Contact"
      description="Get in touch with Ismat Fatima about the Physical AI & Humanoid Robotics book"
    >
      <main className={styles.contactPage}>
        <div className={styles.container}>
          {/* Header Section */}
          <header className={styles.header}>
            <h1 className={styles.title}>Get in Touch</h1>
            <p className={styles.subtitle}>
              Have questions about Physical AI and Humanoid Robotics? Want to provide feedback or join our waitlist for advanced content? We'd love to hear from you!
            </p>
          </header>

          {/* Contact Form */}
          <section className={styles.formSection}>
            <ContactForm />
          </section>

          {/* Waitlist Information */}
          <section className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>📚 Join the Waitlist</h2>
              <p className={styles.infoText}>
                Be among the first to know when we release:
              </p>
              <ul className={styles.featureList}>
                <li>Advanced chapters on sim-to-real transfer techniques</li>
                <li>Interactive code labs with ROS 2 and NVIDIA Isaac</li>
                <li>Live webinars and Q&A sessions</li>
                <li>Exclusive access to research updates and case studies</li>
              </ul>
            </div>

            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>💬 Feedback Welcome</h2>
              <p className={styles.infoText}>
                Your input helps us improve this educational resource. Share your:
              </p>
              <ul className={styles.featureList}>
                <li>Technical questions or clarifications needed</li>
                <li>Suggestions for additional topics or chapters</li>
                <li>Real-world use cases and applications</li>
                <li>Ideas for hands-on projects and assessments</li>
              </ul>
            </div>
          </section>

          {/* Author Information */}
          <section className={styles.authorSection}>
            <div className={styles.authorCard}>
              <h2 className={styles.authorName}>About the Author</h2>
              <p className={styles.authorBio}>
                <strong>Ismat Fatima</strong> is a researcher and educator specializing in Physical AI, Humanoid Robotics, and autonomous systems. With experience in ROS 2, NVIDIA Isaac, and Vision-Language-Action models, Ismat creates educational content to make cutting-edge robotics accessible to learners worldwide.
              </p>
            </div>
          </section>

          {/* Privacy Notice */}
          <section className={styles.privacySection}>
            <h3 className={styles.privacyTitle}>🔒 Privacy & Data</h3>
            <p className={styles.privacyText}>
              Your contact information is stored locally in your browser using localStorage. We do not send your data to any external servers. Your privacy is important to us, and we only use the information you provide to respond to your inquiry or add you to our waitlist.
            </p>
            <p className={styles.privacyNote}>
              <em>Note: Clearing your browser data will remove your submission. For important inquiries, please reach out via email as well.</em>
            </p>
          </section>
        </div>
      </main>
    </Layout>
  );
}
