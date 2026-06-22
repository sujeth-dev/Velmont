import { describe, it, expect } from 'vitest';
import { validate } from '../src/js/contact.js';

const FULL = {
  name: 'Rahul Mehta',
  company: 'Hyatt Hotels',
  email: 'rahul@example.com',
  phone: '+91 98765 43210',
  projectType: 'Hospitality',
  location: 'Bengaluru',
  message: 'We are exploring a 40,000 sq ft fit-out and would like to discuss scope.',
  website: '',
};

describe('contact form validate()', () => {
  it('accepts a fully filled, well-formed submission', () => {
    const r = validate(FULL);
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual({});
  });

  it('flags missing required name with a helpful message', () => {
    const r = validate({ ...FULL, name: '   ' });
    expect(r.valid).toBe(false);
    expect(r.errors.name).toBeTruthy();
  });

  it('flags missing required email', () => {
    const r = validate({ ...FULL, email: '' });
    expect(r.valid).toBe(false);
    expect(r.errors.email).toBeTruthy();
  });

  it('flags badly formatted email', () => {
    const r = validate({ ...FULL, email: 'not-an-email' });
    expect(r.valid).toBe(false);
    expect(r.errors.email).toMatch(/email/i);
  });

  it('flags missing required message', () => {
    const r = validate({ ...FULL, message: '' });
    expect(r.valid).toBe(false);
    expect(r.errors.message).toBeTruthy();
  });

  it('reports every missing required field at once', () => {
    const r = validate({ ...FULL, name: '', email: '', message: '' });
    expect(r.valid).toBe(false);
    expect(Object.keys(r.errors).sort()).toEqual(['email', 'message', 'name']);
  });

  it('treats a filled honeypot as a silent bot rejection', () => {
    const r = validate({ ...FULL, website: 'http://bot.example.com' });
    expect(r.valid).toBe(false);
    expect(r.errors.honeypot).toBeTruthy();
  });

  it('survives an undefined input by treating everything as missing', () => {
    const r = validate(undefined);
    expect(r.valid).toBe(false);
    expect(r.errors.name).toBeTruthy();
    expect(r.errors.email).toBeTruthy();
    expect(r.errors.message).toBeTruthy();
  });
});
