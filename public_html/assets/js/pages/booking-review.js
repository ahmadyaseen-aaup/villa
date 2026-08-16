import { initCore } from '../core.js';

initCore();

const params = new URLSearchParams(window.location.search);
const form = document.querySelector('[data-review-form]');
const terms = document.querySelector('[data-terms]');
const termsError = document.querySelector('[data-terms-error]');
const submitButton = document.querySelector('[data-submit-request]');
const submitLabel = document.querySelector('[data-submit-label]');
const formStatus = document.querySelector('[data-form-status]');
const successDialog = document.getElementById('request-success-dialog');

const readParam = (name, maximumLength = 80) => {
  const value = params.get(name)?.trim();
  return value ? value.slice(0, maximumLength) : '';
};

const setText = (selector, value) => {
  if (!value) return;
  document.querySelectorAll(selector).forEach((target) => {
    target.textContent = value;
  });
};

const parseCount = (name, fallback, minimum = 0) => {
  const value = Number.parseInt(readParam(name, 3), 10);
  return Number.isFinite(value) ? Math.min(50, Math.max(minimum, value)) : fallback;
};

const parseLocalDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (date.getFullYear() !== Number(match[1]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) return null;
  return date;
};

const dateFormatter = new Intl.DateTimeFormat('ar', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const startDate = parseLocalDate(readParam('start', 10));
const endDate = parseLocalDate(readParam('end', 10));
const dateSummary = startDate
  ? endDate && endDate >= startDate
    ? `${dateFormatter.format(startDate)} — ${dateFormatter.format(endDate)}`
    : dateFormatter.format(startDate)
  : '';

setText('[data-review-period]', readParam('period'));
setText('[data-review-price]', readParam('price', 40));
setText('[data-review-dates]', dateSummary);
setText('[data-review-adults]', String(parseCount('adults', 2, 1)));
setText('[data-review-children]', String(parseCount('children', 0)));
setText('[data-review-infants]', String(parseCount('infants', 0)));

const clearTermsError = () => {
  if (!terms || !termsError) return;
  terms.removeAttribute('aria-invalid');
  termsError.hidden = true;
};

terms?.addEventListener('change', () => {
  if (terms.checked) clearTermsError();
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    if (formStatus) formStatus.textContent = 'يرجى إكمال بيانات التواصل المطلوبة.';
    form.querySelector(':invalid')?.focus();
    return;
  }

  if (!terms?.checked) {
    terms?.setAttribute('aria-invalid', 'true');
    if (termsError) termsError.hidden = false;
    if (formStatus) formStatus.textContent = 'وافق على الشروط للمتابعة.';
    terms?.focus();
    return;
  }

  clearTermsError();
  if (submitButton) submitButton.disabled = true;
  if (submitLabel) submitLabel.textContent = 'جارٍ تجهيز المعاينة…';
  if (formStatus) formStatus.textContent = 'جارٍ تجهيز معاينة الطلب.';

  const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
  window.setTimeout(() => {
    if (submitButton) submitButton.disabled = false;
    if (submitLabel) submitLabel.textContent = 'إرسال طلب الإقامة';
    if (formStatus) formStatus.textContent = 'اكتملت محاكاة إرسال الطلب.';
    if (typeof successDialog?.showModal === 'function') successDialog.showModal();
    else successDialog?.setAttribute('open', '');
  }, delay);
});
