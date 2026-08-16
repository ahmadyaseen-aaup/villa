import { initCore, showToast } from '../core.js';

initCore();

const form = document.querySelector('[data-login-form]');
const password = document.getElementById('login-password');
const passwordToggle = document.querySelector('[data-password-toggle]');
const status = document.querySelector('[data-login-status]');

const validationMessage = (field) => {
  if (field.validity.valueMissing) {
    return field.type === 'password' ? 'أدخل كلمة المرور.' : 'أدخل اسم المستخدم.';
  }
  if (field.validity.tooShort) {
    return field.type === 'password' ? 'يجب ألا تقل كلمة المرور عن 8 أحرف.' : 'يجب ألا يقل اسم المستخدم عن 3 أحرف.';
  }
  return '';
};

const validateField = (field) => {
  const message = validationMessage(field);
  const error = document.querySelector(`[data-error-for="${field.id}"]`);
  field.setAttribute('aria-invalid', String(Boolean(message)));
  if (error) error.textContent = message;
  return !message;
};

form?.querySelectorAll('input').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    if (status) status.textContent = '';
  });
});

passwordToggle?.addEventListener('click', () => {
  if (!password) return;
  const visible = password.type === 'text';
  password.type = visible ? 'password' : 'text';
  passwordToggle.setAttribute('aria-pressed', String(!visible));
  passwordToggle.setAttribute('aria-label', visible ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور');
  passwordToggle.querySelector('i')?.classList.toggle('bi-eye', visible);
  passwordToggle.querySelector('i')?.classList.toggle('bi-eye-slash', !visible);
  password.focus({ preventScroll: true });
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('input')];
  const valid = fields.map(validateField).every(Boolean);
  if (!valid) {
    fields.find((field) => field.getAttribute('aria-invalid') === 'true')?.focus();
    return;
  }

  if (status) status.textContent = 'بيانات الدخول جاهزة للإرسال الآمن.';
  showToast('سيتم ربط تسجيل الدخول بخدمة الهوية في مرحلة التكامل.');
});

document.querySelectorAll('[data-provider]').forEach((button) => {
  button.addEventListener('click', () => {
    showToast(`سيتم ربط تسجيل الدخول عبر ${button.dataset.provider} بموفر الهوية.`);
  });
});

document.querySelector('[data-language-button]')?.addEventListener('click', () => {
  showToast('سيُتاح تغيير اللغة من إعدادات الحساب.');
});

document.querySelector('[data-forgot-password]')?.addEventListener('click', (event) => {
  event.preventDefault();
  showToast('سيتم ربط استعادة كلمة المرور بخدمة الحسابات.');
});

document.querySelector('[data-create-account]')?.addEventListener('click', (event) => {
  event.preventDefault();
  showToast('سيتم توفير إنشاء الحساب في صفحة مستقلة.');
});
