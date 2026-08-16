import {
  formatArabicDate,
  initMobileCore,
  openMobileDialog
} from '../mobile-core.js';

initMobileCore();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const params = new URLSearchParams(window.location.search);
const form = document.querySelector('[data-mobile-review-form]');

const setText = (selector, value) => {
  if (!value) return;
  document.querySelectorAll(selector).forEach((target) => {
    target.textContent = value;
  });
};

const readParam = (name, maximumLength = 80) => params.get(name)?.trim().slice(0, maximumLength) || '';

const parseCount = (name, fallback, minimum = 0, maximum = 20) => {
  const value = Number.parseInt(readParam(name, 3), 10);
  return Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
};

const parseDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
};

const period = readParam('period') || 'إقامة ليلية';
const price = readParam('price', 40) || '960 د.أ';
const start = parseDate(readParam('start', 10));
const requestedEnd = parseDate(readParam('end', 10));
const isOvernight = /ليل/.test(period);
const end = isOvernight && start && requestedEnd && requestedEnd > start ? requestedEnd : null;
const adults = parseCount('adults', 2, 1, 6);
const children = parseCount('children', 0, 0, Math.max(0, 6 - adults));
const infants = parseCount('infants', 0, 0, 6);

const getDurationLabel = () => {
  if (!start) return 'لم تُحدد المدة بعد';
  if (!end) return isOvernight ? 'ليلة واحدة' : 'فترة واحدة';
  const nights = Math.max(1, Math.round((end - start) / 86400000));
  if (nights === 1) return 'ليلة واحدة';
  if (nights === 2) return 'ليلتان';
  if (nights <= 10) return `${nights} ليالٍ`;
  return `${nights} ليلة`;
};

const duration = getDurationLabel();
const dateSummary = start
  ? (end ? `${formatArabicDate(start)} — ${formatArabicDate(end)}` : formatArabicDate(start))
  : '';

setText('[data-review-period]', period);
setText('[data-review-price]', price);
setText('[data-review-adults]', String(adults));
setText('[data-review-children]', String(children));
setText('[data-review-infants]', String(infants));
setText('[data-review-duration]', duration);
if (dateSummary) setText('[data-review-dates]', dateSummary);

function initReviewMotion() {
  const topbar = document.querySelector('[data-review-topbar]');
  const updateTopbar = () => topbar?.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', updateTopbar, { passive: true });
  updateTopbar();

  const sections = [...document.querySelectorAll('.review-reveal')];
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('has-review-motion');
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      activeObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });
  sections.forEach((section) => observer.observe(section));
}

function initContactEditor() {
  const toggle = document.querySelector('[data-toggle-contact]');
  const save = document.querySelector('[data-save-contact]');
  const summary = document.querySelector('[data-contact-summary]');
  const fields = document.querySelector('[data-contact-fields]');
  const inputs = [...(fields?.querySelectorAll('input') || [])];
  if (!toggle || !save || !summary || !fields || !inputs.length) return;

  let snapshot = new Map();

  const updateSummary = () => {
    const values = Object.fromEntries(inputs.map((input) => [input.name, input.value.trim()]));
    setText('[data-contact-name]', values.fullName);
    setText('[data-contact-phone]', values.phone);
    setText('[data-contact-email]', values.email);
  };

  const setEditing = (editing, { restore = false, focus = true } = {}) => {
    if (restore) inputs.forEach((input) => {
      input.value = snapshot.get(input.name) ?? input.value;
    });
    fields.hidden = !editing;
    summary.hidden = editing;
    toggle.textContent = editing ? 'إلغاء' : 'تعديل';
    toggle.setAttribute('aria-expanded', String(editing));
    if (editing && focus) inputs[0].focus();
  };

  const openEditor = ({ focus = true } = {}) => {
    snapshot = new Map(inputs.map((input) => [input.name, input.value]));
    setEditing(true, { focus });
  };

  toggle.addEventListener('click', () => {
    if (fields.hidden) openEditor();
    else setEditing(false, { restore: true });
  });

  save.addEventListener('click', () => {
    const invalid = inputs.find((input) => !input.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      invalid.focus();
      return;
    }
    updateSummary();
    setEditing(false);
  });

  return { fields, summary, inputs, openEditor };
}

function initSpecialRequest() {
  const textarea = document.querySelector('.mobile-review-request textarea');
  const count = document.querySelector('[data-message-count]');
  const summary = document.querySelector('[data-request-summary]');
  if (!textarea || !count || !summary) return;

  const formatter = new Intl.NumberFormat('ar', { useGrouping: false });
  const update = () => {
    const length = textarea.value.length;
    count.textContent = `${formatter.format(length)} / ${formatter.format(textarea.maxLength)}`;
    summary.textContent = length ? 'تمت إضافة رسالة للمضيف' : 'لا يوجد طلب مضاف';
  };
  textarea.addEventListener('input', update);
  update();
}

const contactEditor = initContactEditor();
initSpecialRequest();
initReviewMotion();

const terms = document.querySelector('[data-review-terms]');
const termsError = document.querySelector('[data-terms-error]');
const submit = document.querySelector('[data-review-submit]');
const submitLabel = document.querySelector('[data-submit-label]');
const status = document.querySelector('[data-review-status]');
const successDialog = document.getElementById('review-success');

terms?.addEventListener('change', () => {
  if (!terms.checked) return;
  terms.removeAttribute('aria-invalid');
  if (termsError) termsError.hidden = true;
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    if (contactEditor?.fields.hidden) contactEditor.openEditor({ focus: false });
    form.reportValidity();
    form.querySelector(':invalid')?.focus();
    if (status) status.textContent = 'أكمل معلومات التواصل المطلوبة.';
    return;
  }

  if (!terms?.checked) {
    terms?.setAttribute('aria-invalid', 'true');
    if (termsError) termsError.hidden = false;
    terms?.focus();
    terms?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    if (status) status.textContent = 'وافق على الشروط والسياسة للمتابعة.';
    return;
  }

  if (submit) {
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
  }
  if (submitLabel) submitLabel.textContent = 'جارٍ التحقق…';
  if (status) status.textContent = 'جارٍ تجهيز معاينة الطلب.';

  const delay = reducedMotion.matches ? 0 : 420;
  window.setTimeout(() => {
    if (submit) {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
    if (submitLabel) submitLabel.textContent = 'إرسال الطلب';
    if (status) status.textContent = 'اكتملت محاكاة إرسال الطلب.';
    const successTrip = document.querySelector('[data-success-trip]');
    if (successTrip) {
      const dates = dateSummary || 'التاريخ قيد المراجعة';
      successTrip.textContent = `${period} · ${dates} · ${adults} بالغون، ${children} أطفال، ${infants} رُضّع`;
    }
    if (successDialog) successDialog.returnFocusTarget = submit;
    openMobileDialog(successDialog);
  }, delay);
});
