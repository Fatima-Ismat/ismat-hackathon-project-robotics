/**
 * ContactForm component with controlled inputs, validation, and localStorage persistence
 */

import React, { useState } from 'react';
import { addContactSubmission } from '@site/src/utils/localStorage';
import { validateContactForm, ValidationErrors } from './validation';
import styles from './styles.module.css';

interface ContactFormProps {
  onSuccess?: () => void;
}

type MessageType = 'success' | 'error' | null;

interface Message {
  type: MessageType;
  text: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // UI state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [displayMessage, setDisplayMessage] = useState<Message | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Character count for message field
  const messageLength = message.length;
  const messageMaxLength = 1000;
  const isNearLimit = messageLength > messageMaxLength * 0.9;

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setDisplayMessage(null);
    setErrors({});

    // Validate form
    const validation = validateContactForm(name, email, message);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setDisplayMessage({
        type: 'error',
        text: 'Please fix the errors above before submitting.',
      });
      return;
    }

    // Submit to localStorage
    setIsSubmitting(true);

    try {
      const submission = addContactSubmission(
        name.trim(),
        email.trim(),
        message.trim()
      );

      // Success!
      setDisplayMessage({
        type: 'success',
        text: 'Thank you for your message! We\'ve received your submission and will get back to you soon.',
      });

      // Reset form
      setName('');
      setEmail('');
      setMessage('');
      setErrors({});

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Log success for debugging
      console.log('Contact submission saved:', submission.id);
    } catch (error) {
      console.error('Failed to save contact submission:', error);
      setDisplayMessage({
        type: 'error',
        text: 'Sorry, something went wrong. Please try again or contact us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle input changes with validation
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    // Clear error when user starts typing
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Enforce max length
    if (value.length <= messageMaxLength) {
      setMessage(value);
      if (errors.message) {
        setErrors(prev => ({ ...prev, message: undefined }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.contactForm}>
      {/* Success/Error Message */}
      {displayMessage && (
        <div
          className={
            displayMessage.type === 'success'
              ? styles.successMessage
              : styles.errorMessage
          }
          role="alert"
        >
          {displayMessage.text}
        </div>
      )}

      {/* Name Field */}
      <div className={styles.formGroup}>
        <label htmlFor="contact-name" className={styles.label}>
          Name <span className={styles.required}>*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          className={`${styles.input} ${errors.name ? styles.error : ''}`}
          placeholder="Your full name"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span id="name-error" className={styles.errorText} role="alert">
            {errors.name}
          </span>
        )}
      </div>

      {/* Email Field */}
      <div className={styles.formGroup}>
        <label htmlFor="contact-email" className={styles.label}>
          Email <span className={styles.required}>*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          className={`${styles.input} ${errors.email ? styles.error : ''}`}
          placeholder="your.email@example.com"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className={styles.errorText} role="alert">
            {errors.email}
          </span>
        )}
      </div>

      {/* Message Field */}
      <div className={styles.formGroup}>
        <label htmlFor="contact-message" className={styles.label}>
          Message <span className={styles.required}>*</span>
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={handleMessageChange}
          className={`${styles.textarea} ${errors.message ? styles.error : ''}`}
          placeholder="Tell us about your project, question, or feedback..."
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={
            errors.message ? 'message-error' : 'message-count'
          }
        />
        <span
          id="message-count"
          className={`${styles.charCount} ${
            isNearLimit ? styles.charCountWarning : ''
          }`}
          aria-live="polite"
        >
          {messageLength} / {messageMaxLength}
        </span>
        {errors.message && (
          <span id="message-error" className={styles.errorText} role="alert">
            {errors.message}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;
