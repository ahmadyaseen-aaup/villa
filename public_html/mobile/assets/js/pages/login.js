import {
  initMobileCore,
  openMobileDialog
} from '../mobile-core.js';

initMobileCore();

const form = document.querySelector('[data-login-form]');
const username = document.getElementById('login-username');
const password = document.getElementById('login-password');
const passwordToggle = document.querySelector('[data-password-toggle]');
const capsLock = document.querySelector('[data-caps-lock]');
const submit = document.querySelector('[data-login-submit]');
const submitLabel = document.querySelector('[data-login-submit-label]');
const status = document.querySelector('[data-login-status]');
const notice = document.getElementById('login-notice');
const noticeTitle = notice?.querySelector('[data-notice-title]');
const noticeCopy = notice?.querySelector('[data-notice-copy]');
const noticeIcon = notice?.querySelector('[data-notice-icon]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const safeReturnPages = new Set([
  '01-home-discovery.html',
  '02-search-map-results.html',
  '03-villa-profile.html',
  '04-booking-request-review.html'
]);

const getSafeReturnTarget = () => {
  const requested = new URLSearchParams(window.location.search).get('returnTo');
  if (!requested || requested.includes('\\') || requested.startsWith('/')) return '01-home-discovery.html';

  try {
    const target = new URL(requested, window.location.href);
    const filename = target.pathname.split('/').pop();
    if (target.origin !== window.location.origin || !safeReturnPages.has(filename)) return '01-home-discovery.html';
    return `${filename}${target.search}${target.hash}`;
  } catch {
    return '01-home-discovery.html';
  }
};

const returnTarget = getSafeReturnTarget();
document.querySelectorAll('[data-return-link]').forEach((link) => {
  link.href = returnTarget;
});

const reason = new URLSearchParams(window.location.search).get('reason');
if (reason === 'favorites') {
  const context = document.querySelector('[data-login-context]');
  if (context) context.textContent = 'سجّل الدخول لحفظ الإقامات ومزامنة المفضلة بين أجهزتك.';
}

const getValidationMessage = (field) => {
  if (!field.value || (field.type !== 'password' && !field.value.trim())) {
    return field.type === 'password' ? 'أدخل كلمة المرور.' : 'أدخل اسم المستخدم.';
  }
  return '';
};

const validateField = (field) => {
  const message = getValidationMessage(field);
  const error = document.querySelector(`[data-error-for="${field.id}"]`);
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
  if (error) error.textContent = message;
  return !message;
};

[username, password].filter(Boolean).forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.hasAttribute('aria-invalid')) validateField(field);
    if (status) status.textContent = '';
  });
});

const updateCapsLock = (event) => {
  if (!capsLock) return;
  capsLock.hidden = !event.getModifierState?.('CapsLock');
};

password?.addEventListener('keydown', updateCapsLock);
password?.addEventListener('keyup', updateCapsLock);
password?.addEventListener('blur', () => {
  if (capsLock) capsLock.hidden = true;
});

passwordToggle?.addEventListener('click', () => {
  if (!password) return;
  const showing = password.type === 'text';
  password.type = showing ? 'password' : 'text';
  passwordToggle.setAttribute('aria-pressed', String(!showing));
  passwordToggle.setAttribute('aria-label', showing ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور');
  passwordToggle.querySelector('i')?.classList.toggle('bi-eye', showing);
  passwordToggle.querySelector('i')?.classList.toggle('bi-eye-slash', !showing);
  password.focus({ preventScroll: true });
});

const showNotice = ({ title, copy, icon = 'bi-shield-check', trigger }) => {
  if (!notice) return;
  if (noticeTitle) noticeTitle.textContent = title;
  if (noticeCopy) noticeCopy.textContent = copy;
  if (noticeIcon) noticeIcon.className = `bi ${icon}`;
  notice.returnFocusTarget = trigger || document.activeElement;
  openMobileDialog(notice);
};

document.querySelectorAll('[data-provider]').forEach((button) => {
  button.addEventListener('click', () => {
    const provider = button.dataset.provider;
    showNotice({
      title: `المتابعة عبر ${provider}`,
      copy: `عند ربط خدمة الهوية، ستغادر إلى صفحة ${provider} الآمنة ثم تعود إلى الشاشة التي بدأت منها. لم تُنشأ جلسة الآن.`,
      icon: provider === 'Apple' ? 'bi-apple' : 'bi-google',
      trigger: button
    });
  });
});

document.querySelectorAll('[data-auth-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const recovery = button.dataset.authAction === 'recovery';
    showNotice({
      title: recovery ? 'استعادة كلمة المرور' : 'إنشاء حساب جديد',
      copy: recovery
        ? 'سيستخدم المنتج المتصل مسار الاستعادة المعتمد للحساب دون افتراض تحقق عبر الهاتف.'
        : 'سيُفتح مسار التسجيل الأصلي عند اعتماد سياسة التحقق ودمج الحسابات.',
      icon: recovery ? 'bi-key' : 'bi-person-plus',
      trigger: button
    });
  });
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [username, password].filter(Boolean);
  const valid = fields.map(validateField).every(Boolean);
  if (!valid) {
    fields.find((field) => field.hasAttribute('aria-invalid'))?.focus();
    if (status) status.textContent = 'أكمل بيانات الدخول المطلوبة.';
    return;
  }

  if (submit) {
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
  }
  if (submitLabel) submitLabel.textContent = 'جارٍ التحقق…';
  if (status) status.textContent = 'تتم مراجعة الحقول محلياً.';

  window.setTimeout(() => {
    if (submit) {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
    if (submitLabel) submitLabel.textContent = 'تسجيل الدخول';
    if (status) status.textContent = 'الحقول جاهزة للإرسال عبر خدمة الهوية الآمنة.';
    showNotice({
      title: 'تسجيل الدخول جاهز للربط',
      copy: 'لم تُرسل بيانات الاعتماد ولم تُنشأ جلسة في هذا النموذج. سيعيدك المنتج المتصل إلى الشاشة السابقة بعد نجاح تسجيل الدخول.',
      icon: 'bi-shield-lock',
      trigger: submit
    });
  }, reducedMotion ? 0 : 380);
});
