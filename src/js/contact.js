// Velmont — Contact page (Phase 4).
//
// Pure form validation lives below as `validate` — exported so Vitest can
// unit-test it without a DOM or EmailJS. The DOM-aware `initContactForm`
// wires the form to the validator and submits via EmailJS when configured.
//
// EmailJS env values are read from Vite's import.meta.env so the keys can
// be supplied in .env.local during development and in Vercel for production.

/**
 * @typedef {object} FormValues
 * @property {string} name
 * @property {string} company
 * @property {string} email
 * @property {string} phone
 * @property {string} projectType
 * @property {string} location
 * @property {string} message
 * @property {string} [website] honeypot field — must be empty
 */

/**
 * @typedef {object} ValidationResult
 * @property {boolean} valid
 * @property {Record<string,string>} errors
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pure validator — no DOM, no side effects.
 *
 * @param {FormValues} values
 * @returns {ValidationResult}
 */
export function validate(values) {
  const v = values || {};
  const errors = {};
  const name = String(v.name || '').trim();
  const email = String(v.email || '').trim();
  const message = String(v.message || '').trim();

  if (!name) errors.name = 'Please tell us your name.';
  if (!email) {
    errors.email = 'Please add an email address.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'That email address looks off — please check it.';
  }
  if (!message) errors.message = 'Please tell us a little about the project.';

  // Honeypot: bots fill the hidden "website" field — flag as invalid
  // without exposing the reason in errors (so the bot can't adapt).
  if (v.website) errors.honeypot = 'silent-bot-rejection';

  return { valid: Object.keys(errors).length === 0, errors };
}

/* ---- DOM wiring (browser-only) ---- */

function readForm(form) {
  const fd = new FormData(form);
  return {
    name: fd.get('name') || '',
    company: fd.get('company') || '',
    email: fd.get('email') || '',
    phone: fd.get('phone') || '',
    projectType: fd.get('projectType') || '',
    location: fd.get('location') || '',
    message: fd.get('message') || '',
    website: fd.get('website') || '',
  };
}

function clearErrors(form) {
  form.querySelectorAll('.vm-field').forEach((f) => f.classList.remove('is-invalid'));
  form.querySelectorAll('.vm-field__error').forEach((n) => n.remove());
}

function showErrors(form, errors) {
  Object.entries(errors).forEach(([name, msg]) => {
    if (name === 'honeypot') return;
    const input = form.querySelector('[name="' + name + '"]');
    if (!input) return;
    const field = input.closest('.vm-field');
    if (!field) return;
    field.classList.add('is-invalid');
    const err = document.createElement('p');
    err.className = 'vm-field__error';
    err.textContent = msg;
    field.appendChild(err);
  });
}

function setStatus(form, kind, message) {
  const status = form.querySelector('[data-form-status]');
  if (!status) return;
  status.textContent = message || '';
  status.classList.remove('is-success', 'is-error');
  if (kind === 'success') status.classList.add('is-success');
  if (kind === 'error') status.classList.add('is-error');
}

async function submitToEmailJS(values) {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  const SERVICE = env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE = env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = env.VITE_EMAILJS_PUBLIC_KEY;

  if (!SERVICE || !TEMPLATE || !PUBLIC_KEY) {
    // No credentials configured — surface a friendly message in dev, but
    // still resolve as success so manual testing of the UI flow works.
    console.warn('[contact] EmailJS env vars not set; skipping send.');
    return { ok: true, simulated: true };
  }

  const payload = {
    service_id: SERVICE,
    template_id: TEMPLATE,
    user_id: PUBLIC_KEY,
    template_params: {
      from_name: values.name,
      from_email: values.email,
      company: values.company,
      phone: values.phone,
      project_type: values.projectType,
      project_location: values.location,
      message: values.message,
      to_email: 'Info@velmontdesign.com',
    },
  };

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status };
}

/**
 * Wires the contact form. Idempotent — safe to call multiple times.
 * @param {string} [selector]
 */
export function initContactForm(selector) {
  const form = document.querySelector(selector || '[data-contact-form]');
  if (!form || form.dataset.bound === '1') return;
  form.dataset.bound = '1';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors(form);
    setStatus(form, 'neutral', '');

    const values = readForm(form);
    const result = validate(values);
    if (!result.valid) {
      showErrors(form, result.errors);
      // Honeypot triggered — silently pretend to succeed.
      if (result.errors.honeypot) {
        setStatus(form, 'success', "Thanks — we'll be in touch.");
      } else {
        setStatus(form, 'error', 'Please fix the highlighted fields and try again.');
      }
      return;
    }

    const submit = form.querySelector('[data-submit]');
    if (submit) submit.disabled = true;
    setStatus(form, 'neutral', 'Sending…');
    try {
      const sent = await submitToEmailJS(values);
      if (!sent.ok) throw new Error('EmailJS returned ' + sent.status);
      setStatus(form, 'success', "Thanks — we'll be in touch within one business day.");
      form.reset();
    } catch (err) {
      console.warn('[contact] send failed', err && err.message);
      setStatus(
        form,
        'error',
        "Something didn't go through. Please email Info@velmontdesign.com directly.",
      );
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}
