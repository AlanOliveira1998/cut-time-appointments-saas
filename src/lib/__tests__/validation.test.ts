import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateName,
  validatePassword,
  formatPhone,
  validateFutureDate,
  validateWorkingHours
} from '../validation';

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name@domain.co.uk')).toBeNull();
      expect(validateEmail('user+tag@example.org')).toBeNull();
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBeTruthy();
      expect(validateEmail('test@')).toBeTruthy();
      expect(validateEmail('@example.com')).toBeTruthy();
      expect(validateEmail('')).toBeTruthy();
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('(11) 99999-9999')).toBeNull();
      expect(validatePhone('11999999999')).toBeNull();
      expect(validatePhone('(11) 9999-9999')).toBeNull();
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBeTruthy();
      expect(validatePhone('abc')).toBeTruthy();
      expect(validatePhone('')).toBeTruthy();
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      expect(validateName('João Silva')).toBeNull();
      expect(validateName('Maria')).toBeNull();
      expect(validateName('José da Silva Santos')).toBeNull();
    });

    it('should reject invalid names', () => {
      expect(validateName('A')).toBeTruthy();
      expect(validateName('123')).toBeTruthy();
      expect(validateName('João@Silva')).toBeTruthy();
      expect(validateName('')).toBeTruthy();
    });
  });

  describe('validatePassword', () => {
    it('should validate correct passwords', () => {
      expect(validatePassword('password123')).toBeNull();
      expect(validatePassword('MyPassword123!')).toBeNull();
    });

    it('should reject invalid passwords', () => {
      expect(validatePassword('123')).toBeTruthy();
      expect(validatePassword('')).toBeTruthy();
    });
  });

  describe('formatPhone', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
      expect(formatPhone('1199999999')).toBe('(11) 9999-9999');
      expect(formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999');
    });
  });

  describe('validateFutureDate', () => {
    it('should validate future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      
      expect(validateFutureDate(tomorrowString)).toBeNull();
    });

    it('should reject past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      expect(validateFutureDate(yesterdayString)).toBeTruthy();
    });
  });

  describe('validateWorkingHours', () => {
    it('should validate correct working hours', () => {
      expect(validateWorkingHours('09:00', '17:00')).toBeNull();
      expect(validateWorkingHours('08:30', '18:30')).toBeNull();
    });

    it('should reject invalid working hours', () => {
      expect(validateWorkingHours('17:00', '09:00')).toBeTruthy();
      expect(validateWorkingHours('18:00', '18:00')).toBeTruthy();
    });
  });
}); 