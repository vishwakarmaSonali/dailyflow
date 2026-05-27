import { Email } from '../src/domain/value-objects/Email';

describe('Email Value Object', () => {
  it('should create email with valid format', () => {
    const email = new Email('test@example.com');
    expect(email.value).toBe('test@example.com');
  });

  it('should throw error with invalid format', () => {
    expect(() => {
      new Email('invalid-email');
    }).toThrow('Invalid email format');
  });

  it('should compare emails (case insensitive)', () => {
    const email1 = new Email('Test@Example.com');
    const email2 = new Email('test@example.com');
    expect(email1.equals(email2)).toBe(true);
  });

  it('should return string representation', () => {
    const email = new Email('test@example.com');
    expect(email.toString()).toBe('test@example.com');
  });
});
