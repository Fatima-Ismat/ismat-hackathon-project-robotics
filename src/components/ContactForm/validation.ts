/**
 * Form validation logic for ContactForm component
 * Validates email format and field length limits
 */

export interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Email regex pattern (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Field constraints
const CONSTRAINTS = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  email: {
    maxLength: 254, // RFC 5321
  },
  message: {
    minLength: 10,
    maxLength: 1000,
  },
};

/**
 * Validate name field
 */
export function validateName(name: string): string | undefined {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'Name is required';
  }

  if (trimmed.length < CONSTRAINTS.name.minLength) {
    return `Name must be at least ${CONSTRAINTS.name.minLength} characters`;
  }

  if (trimmed.length > CONSTRAINTS.name.maxLength) {
    return `Name must not exceed ${CONSTRAINTS.name.maxLength} characters`;
  }

  return undefined;
}

/**
 * Validate email field
 */
export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();

  if (!trimmed) {
    return 'Email is required';
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address';
  }

  if (trimmed.length > CONSTRAINTS.email.maxLength) {
    return `Email must not exceed ${CONSTRAINTS.email.maxLength} characters`;
  }

  return undefined;
}

/**
 * Validate message field
 */
export function validateMessage(message: string): string | undefined {
  const trimmed = message.trim();

  if (!trimmed) {
    return 'Message is required';
  }

  if (trimmed.length < CONSTRAINTS.message.minLength) {
    return `Message must be at least ${CONSTRAINTS.message.minLength} characters`;
  }

  if (trimmed.length > CONSTRAINTS.message.maxLength) {
    return `Message must not exceed ${CONSTRAINTS.message.maxLength} characters`;
  }

  return undefined;
}

/**
 * Validate entire contact form
 */
export function validateContactForm(
  name: string,
  email: string,
  message: string
): ValidationResult {
  const errors: ValidationErrors = {};

  const nameError = validateName(name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const messageError = validateMessage(message);
  if (messageError) errors.message = messageError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
