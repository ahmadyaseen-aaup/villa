import { initCore, showToast } from '../core.js';

initCore();

const locale = document.documentElement.lang === 'ar' ? 'ar-SA-u-nu-latn' : document.documentElement.lang || 'en';
const priceFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
const formatPrice = (amount) => `${priceFormatter.format(amount)} ر.س.`;

const openModal = (dialog) => {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
  else dialog.setAttribute('open', '');
};

const closeModal = (dialog) => {
  if (!dialog) return;
  if (typeof dialog.close === 'function' && dialog.open) dialog.close();
  else dialog.removeAttribute('open');
};

const galleryItems = [
  {
    webp: 'assets/images/villa-modern.webp',
    fallback: 'assets/images/villa-modern.jpg',
    alt: 'المسبح الخارجي أمام فيلا الوادي الحديثة'
  },
  {
    webp: 'assets/images/villa-stone.webp',
    fallback: 'assets/images/villa-stone.jpg',
    alt: 'واجهة حجرية ومنطقة جلوس خارجية'
  },
  {
    webp: 'assets/images/villa-olive.webp',
    fallback: 'assets/images/villa-olive.jpg',
    alt: 'حديقة خضراء تحيط بالإقامة'
  },
  {
    webp: 'assets/images/villa-summer.webp',
    fallback: 'assets/images/villa-summer.jpg',
    alt: 'تراس واسع مطل على البحر'
  }
];

function initGalleryViewer() {
  const dialog = document.getElementById('gallery-dialog');
  const image = dialog?.querySelector('[data-gallery-viewer-image]');
  const source = dialog?.querySelector('[data-gallery-viewer-source]');
  const caption = dialog?.querySelector('[data-gallery-caption]');
  const counter = dialog?.querySelector('[data-gallery-current]');
  const thumbnails = [...(dialog?.querySelectorAll('[data-gallery-select]') || [])];
  if (!dialog || !image || !source || !caption || !counter) return;

  let activeIndex = 0;
  let touchStartX = 0;

  const render = (index, animate = true) => {
    activeIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[activeIndex];
    source.srcset = item.webp;
    image.src = item.fallback;
    image.alt = item.alt;
    caption.textContent = item.alt;
    counter.textContent = String(activeIndex + 1);
    thumbnails.forEach((thumbnail, thumbnailIndex) => {
      thumbnail.setAttribute('aria-pressed', String(thumbnailIndex === activeIndex));
    });
    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      image.classList.remove('is-changing');
      window.requestAnimationFrame(() => image.classList.add('is-changing'));
    }
  };

  document.querySelectorAll('[data-gallery-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      render(Number(trigger.dataset.galleryOpen || 0), false);
      openModal(dialog);
    });
  });

  dialog.querySelectorAll('[data-gallery-step]').forEach((button) => {
    button.addEventListener('click', () => render(activeIndex + Number(button.dataset.galleryStep)));
  });

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', () => render(Number(thumbnail.dataset.gallerySelect)));
  });

  dialog.addEventListener('keydown', (event) => {
    const rtl = document.documentElement.dir === 'rtl';
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      render(activeIndex + (rtl ? -1 : 1));
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      render(activeIndex + (rtl ? 1 : -1));
    }
  });

  dialog.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });

  dialog.addEventListener('touchend', (event) => {
    const distance = (event.changedTouches[0]?.clientX || 0) - touchStartX;
    if (Math.abs(distance) < 48) return;
    const rtl = document.documentElement.dir === 'rtl';
    const physicalDirection = distance > 0 ? -1 : 1;
    render(activeIndex + (rtl ? -physicalDirection : physicalDirection));
  }, { passive: true });

  image.addEventListener('animationend', () => image.classList.remove('is-changing'));
}

function initShare() {
  document.querySelector('[data-share]')?.addEventListener('click', async () => {
    const shareData = {
      title: document.title,
      text: 'فيلا الوادي الخاصة في العقبة',
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط الإقامة.');
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('يمكنك نسخ الرابط من شريط العنوان.');
    }
  });
}

function initGuestCapacity() {
  const picker = document.querySelector('[data-guest-picker="profile-guests"]');
  const status = picker?.querySelector('[data-guest-capacity-status]');
  if (!picker || !status) return;

  const inputFor = (type) => picker.querySelector(`[data-guest-count="${type}"]`);
  const updateSummary = () => {
    const adults = Number(inputFor('adults')?.value || 0);
    const children = Number(inputFor('children')?.value || 0);
    const infants = Number(inputFor('infants')?.value || 0);
    const parts = [`${adults} ${adults === 1 ? 'بالغ' : 'بالغين'}`];
    if (children) parts.push(`${children} ${children === 1 ? 'طفل' : 'أطفال'}`);
    if (infants) parts.push(`${infants} ${infants === 1 ? 'رضيع' : 'رُضّع'}`);
    document.querySelectorAll('[data-guest-summary="profile-guests"]').forEach((target) => {
      target.textContent = parts.join('، ');
    });
    picker.querySelectorAll('[data-guest-count]').forEach((input) => {
      const output = picker.querySelector(`[data-guest-output="${input.dataset.guestCount}"]`);
      if (output) output.value = input.value;
    });
  };

  picker.addEventListener('click', (event) => {
    const button = event.target.closest('[data-counter-action]');
    if (!button) return;
    const adults = Number(inputFor('adults')?.value || 0);
    const children = Number(inputFor('children')?.value || 0);
    const capacity = Number(picker.dataset.capacity || 8);
    if (adults + children > capacity) {
      const changedInput = inputFor(button.dataset.guestType);
      if (button.dataset.counterAction === 'increase' && changedInput) {
        changedInput.value = String(Math.max(Number(changedInput.min || 0), Number(changedInput.value) - 1));
      }
      status.textContent = `هذه الإقامة تستوعب حتى ${capacity} ضيوف. تُراجع فئة الرُضّع حسب إعدادات السوق.`;
      status.classList.add('is-error');
      showToast(`السعة القصوى لهذه الإقامة ${capacity} ضيوف.`);
    } else {
      status.textContent = `السعة القصوى ${capacity} ضيوف، وتُراجع فئة الرُضّع حسب إعدادات السوق.`;
      status.classList.remove('is-error');
    }
    updateSummary();
  });
}

function initBookingCalendar() {
  const calendar = document.querySelector('[data-profile-calendar]');
  const dialog = document.getElementById('profile-calendar-dialog');
  const opener = document.querySelector('[data-dialog-open="profile-calendar-dialog"]');
  const months = calendar?.querySelector('[data-calendar-months]');
  const heading = calendar?.querySelector('[data-calendar-heading]');
  const status = calendar?.querySelector('[data-calendar-status]');
  const previous = calendar?.querySelector('[data-calendar-previous]');
  const next = calendar?.querySelector('[data-calendar-next]');
  const clear = calendar?.querySelector('[data-calendar-clear]');
  const apply = calendar?.querySelector('[data-calendar-apply]');
  const title = document.getElementById('profile-calendar-title');
  const startInput = document.querySelector('[data-date-start]');
  const endInput = document.querySelector('[data-date-end]');
  const pricingGroup = document.querySelector('[data-period-pricing]');
  if (!calendar || !dialog || !opener || !months || !heading || !status || !previous || !next || !clear || !apply || !title || !startInput || !endInput || !pricingGroup) return null;

  const mobileQuery = window.matchMedia('(max-width: 47.99rem)');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const weekdayLabelFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  const dayFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric' });
  const dateLabelFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const summaryFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const addDays = (date, amount) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
  const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const dateValue = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const toIsoDate = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const visibleMonthCount = () => mobileQuery.matches ? 1 : 2;
  const isOvernight = () => pricingGroup.querySelector('[aria-pressed="true"]')?.dataset.choice === 'overnight';
  const firstDay = (() => {
    try {
      const localeInfo = new Intl.Locale(locale);
      const weekInfo = localeInfo.weekInfo || localeInfo.getWeekInfo?.();
      return Number(weekInfo?.firstDay ?? 6) % 7;
    } catch {
      return 6;
    }
  })();

  let committedStart = null;
  let committedEnd = null;
  let selectedStart = null;
  let selectedEnd = null;
  let anchorMonth = startOfMonth(today);
  let applied = false;

  const formatSummary = () => {
    if (!committedStart) return isOvernight() ? 'اختر التواريخ' : 'اختر تاريخ الزيارة';
    if (!isOvernight() || !committedEnd) return summaryFormatter.format(committedStart);
    return typeof summaryFormatter.formatRange === 'function'
      ? summaryFormatter.formatRange(committedStart, committedEnd)
      : `${summaryFormatter.format(committedStart)} — ${summaryFormatter.format(committedEnd)}`;
  };

  const updateDateControls = () => {
    document.querySelectorAll('[data-date-summary]').forEach((target) => { target.textContent = formatSummary(); });
    document.querySelectorAll('[data-date-control-label]').forEach((target) => {
      target.textContent = isOvernight() ? 'الوصول والمغادرة' : 'تاريخ الزيارة';
    });
  };

  const updateStatus = () => {
    if (!selectedStart) {
      status.textContent = isOvernight() ? 'اختر تاريخ الوصول، ثم تاريخ المغادرة.' : 'اختر تاريخ الزيارة.';
    } else if (isOvernight() && !selectedEnd) {
      status.textContent = `الوصول ${dateLabelFormatter.format(selectedStart)}. اختر تاريخ المغادرة.`;
    } else if (isOvernight()) {
      status.textContent = `من ${dateLabelFormatter.format(selectedStart)} إلى ${dateLabelFormatter.format(selectedEnd)}.`;
    } else {
      status.textContent = `تاريخ الزيارة ${dateLabelFormatter.format(selectedStart)}.`;
    }
    apply.disabled = !selectedStart || (isOvernight() && !selectedEnd);
  };

  const createMonth = (monthDate, rovingDate) => {
    const section = document.createElement('section');
    section.className = 'profile-calendar__month';
    section.setAttribute('aria-label', monthFormatter.format(monthDate));

    const monthTitle = document.createElement('h4');
    monthTitle.textContent = monthFormatter.format(monthDate);

    const weekdays = document.createElement('div');
    weekdays.className = 'profile-calendar__weekdays';
    weekdays.setAttribute('aria-hidden', 'true');
    const referenceSunday = new Date(2024, 0, 7);
    for (let offset = 0; offset < 7; offset += 1) {
      const weekdayDate = addDays(referenceSunday, (firstDay + offset) % 7);
      const label = document.createElement('span');
      label.textContent = weekdayFormatter.format(weekdayDate);
      label.title = weekdayLabelFormatter.format(weekdayDate);
      weekdays.append(label);
    }

    const days = document.createElement('div');
    days.className = 'profile-calendar__days';
    days.setAttribute('role', 'grid');
    const leadingBlanks = (monthDate.getDay() - firstDay + 7) % 7;
    for (let index = 0; index < leadingBlanks; index += 1) {
      const blank = document.createElement('span');
      blank.className = 'profile-calendar__blank';
      blank.setAttribute('aria-hidden', 'true');
      days.append(blank);
    }

    const totalDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const value = dateValue(date);
      const startSelected = selectedStart && value === dateValue(selectedStart);
      const endSelected = selectedEnd && value === dateValue(selectedEnd);
      const inRange = isOvernight() && selectedStart && selectedEnd && value > dateValue(selectedStart) && value < dateValue(selectedEnd);
      const button = document.createElement('button');
      button.className = 'profile-calendar__day';
      button.type = 'button';
      button.dataset.calendarDate = toIsoDate(date);
      button.textContent = dayFormatter.format(date);
      button.disabled = value < dateValue(today);
      button.tabIndex = !button.disabled && value === dateValue(rovingDate) ? 0 : -1;
      button.setAttribute('role', 'gridcell');
      button.setAttribute('aria-label', `${dateLabelFormatter.format(date)}${startSelected ? isOvernight() ? '، تاريخ الوصول' : '، تاريخ الزيارة' : endSelected ? '، تاريخ المغادرة' : inRange ? '، ضمن النطاق المحدد' : ''}`);
      button.setAttribute('aria-pressed', String(Boolean(startSelected || endSelected)));
      button.classList.toggle('is-today', value === dateValue(today));
      button.classList.toggle('is-range-start', Boolean(startSelected));
      button.classList.toggle('is-range-end', Boolean(endSelected));
      button.classList.toggle('is-in-range', Boolean(inRange));
      if (value === dateValue(today)) button.setAttribute('aria-current', 'date');
      days.append(button);
    }

    section.append(monthTitle, weekdays, days);
    return section;
  };

  const render = () => {
    const monthDates = Array.from({ length: visibleMonthCount() }, (_, index) => addMonths(anchorMonth, index));
    const rovingDate = selectedEnd || selectedStart || (dateValue(anchorMonth) === dateValue(startOfMonth(today)) ? today : anchorMonth);
    months.replaceChildren(...monthDates.map((month) => createMonth(month, rovingDate)));
    heading.textContent = monthDates.map((month) => monthFormatter.format(month)).join(' — ');
    previous.disabled = dateValue(anchorMonth) <= dateValue(startOfMonth(today));
    title.textContent = isOvernight() ? 'اختر الوصول والمغادرة' : 'اختر تاريخ الزيارة';
    updateStatus();
  };

  const focusDate = (date) => {
    const target = dateValue(date) < dateValue(today) ? today : date;
    const lastVisibleMonth = addMonths(anchorMonth, visibleMonthCount() - 1);
    const beforeVisible = dateValue(startOfMonth(target)) < dateValue(anchorMonth);
    const afterVisible = dateValue(startOfMonth(target)) > dateValue(lastVisibleMonth);
    if (beforeVisible || afterVisible) {
      anchorMonth = startOfMonth(target);
      render();
    }
    window.requestAnimationFrame(() => months.querySelector(`[data-calendar-date="${toIsoDate(target)}"]`)?.focus());
  };

  const selectDate = (date) => {
    if (!isOvernight()) {
      selectedStart = date;
      selectedEnd = null;
    } else if (!selectedStart || selectedEnd || dateValue(date) <= dateValue(selectedStart)) {
      selectedStart = date;
      selectedEnd = null;
    } else {
      selectedEnd = date;
    }
    render();
    focusDate(date);
  };

  const previewRange = (date) => {
    const previewEnd = isOvernight() && selectedStart && !selectedEnd && dateValue(date) > dateValue(selectedStart) ? dateValue(date) : null;
    months.querySelectorAll('[data-calendar-date]').forEach((button) => {
      const [year, month, day] = button.dataset.calendarDate.split('-').map(Number);
      const value = dateValue(new Date(year, month - 1, day));
      button.classList.toggle('is-in-preview', Boolean(previewEnd && value > dateValue(selectedStart) && value <= previewEnd));
    });
  };

  const stageCommittedDates = () => {
    selectedStart = committedStart;
    selectedEnd = isOvernight() ? committedEnd : null;
    anchorMonth = startOfMonth(committedStart || today);
    applied = false;
    render();
  };

  months.addEventListener('click', (event) => {
    const button = event.target.closest('[data-calendar-date]');
    if (!button || button.disabled) return;
    const [year, month, day] = button.dataset.calendarDate.split('-').map(Number);
    selectDate(new Date(year, month - 1, day));
  });

  months.addEventListener('pointerover', (event) => {
    const button = event.target.closest('[data-calendar-date]');
    if (!button) return;
    const [year, month, day] = button.dataset.calendarDate.split('-').map(Number);
    previewRange(new Date(year, month - 1, day));
  });

  months.addEventListener('pointerleave', () => previewRange(selectedStart || today));
  months.addEventListener('keydown', (event) => {
    const button = event.target.closest('[data-calendar-date]');
    if (!button) return;
    const [year, month, day] = button.dataset.calendarDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const rtl = document.documentElement.dir === 'rtl';
    const weekOffset = (date.getDay() - firstDay + 7) % 7;
    let target = null;
    if (event.key === 'ArrowRight') target = addDays(date, rtl ? -1 : 1);
    if (event.key === 'ArrowLeft') target = addDays(date, rtl ? 1 : -1);
    if (event.key === 'ArrowUp') target = addDays(date, -7);
    if (event.key === 'ArrowDown') target = addDays(date, 7);
    if (event.key === 'Home') target = addDays(date, -weekOffset);
    if (event.key === 'End') target = addDays(date, 6 - weekOffset);
    if (event.key === 'PageUp') target = addMonths(date, -1);
    if (event.key === 'PageDown') target = addMonths(date, 1);
    if (!target) return;
    event.preventDefault();
    focusDate(target);
  });

  previous.addEventListener('click', () => {
    if (previous.disabled) return;
    anchorMonth = addMonths(anchorMonth, -1);
    render();
    focusDate(anchorMonth);
  });

  next.addEventListener('click', () => {
    anchorMonth = addMonths(anchorMonth, 1);
    render();
    focusDate(anchorMonth);
  });

  clear.addEventListener('click', () => {
    selectedStart = null;
    selectedEnd = null;
    anchorMonth = startOfMonth(today);
    render();
    status.textContent = 'تم مسح الاختيار. اختر تاريخاً جديداً.';
  });

  apply.addEventListener('click', () => {
    if (apply.disabled) return;
    committedStart = selectedStart;
    committedEnd = isOvernight() ? selectedEnd : null;
    startInput.value = toIsoDate(committedStart);
    endInput.value = committedEnd ? toIsoDate(committedEnd) : '';
    applied = true;
    updateDateControls();
    document.dispatchEvent(new CustomEvent('profiledateschange', { detail: { start: committedStart, end: committedEnd } }));
    closeModal(dialog);
  });

  opener.addEventListener('click', stageCommittedDates);
  dialog.addEventListener('close', () => {
    if (!applied) {
      selectedStart = committedStart;
      selectedEnd = committedEnd;
    }
  });

  const handleViewportChange = () => render();
  if (typeof mobileQuery.addEventListener === 'function') mobileQuery.addEventListener('change', handleViewportChange);
  else mobileQuery.addListener(handleViewportChange);

  pricingGroup.addEventListener('choicechange', () => {
    if (!isOvernight()) {
      committedEnd = null;
      selectedEnd = null;
      endInput.value = '';
    }
    updateDateControls();
    render();
  });

  updateDateControls();
  render();
  return { open: () => { stageCommittedDates(); openModal(dialog); }, getDates: () => ({ start: committedStart, end: committedEnd }) };
}

function initPricing(calendarController) {
  const pricingGroup = document.querySelector('[data-period-pricing]');
  if (!pricingGroup) return;

  const update = () => {
    const selected = pricingGroup.querySelector('[aria-pressed="true"]');
    if (!selected) return;
    const basePrice = Number(selected.dataset.price || 0);
    const { start, end } = calendarController?.getDates() || {};
    const overnight = selected.dataset.choice === 'overnight';
    const nights = overnight && start && end ? Math.max(1, Math.round((end - start) / 86400000)) : 1;
    const estimate = basePrice * nights;
    document.querySelectorAll('[data-base-price]').forEach((target) => { target.textContent = formatPrice(basePrice); });
    document.querySelectorAll('[data-estimated-price]').forEach((target) => { target.textContent = formatPrice(estimate); });
    document.querySelectorAll('[data-selected-period]').forEach((target) => { target.textContent = selected.dataset.label; });
    document.querySelectorAll('[data-price-unit]').forEach((target) => { target.textContent = selected.dataset.unit; });
    document.querySelectorAll('[data-price-breakdown]').forEach((target) => {
      target.textContent = overnight && nights > 1 ? `${formatPrice(basePrice)} × ${nights} ليالٍ` : formatPrice(basePrice);
    });
  };

  pricingGroup.addEventListener('choicechange', update);
  document.addEventListener('profiledateschange', update);
  update();
}

function initBooking(calendarController) {
  const form = document.querySelector('[data-booking-form]');
  const pricingGroup = document.querySelector('[data-period-pricing]');
  if (!form || !pricingGroup) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = pricingGroup.querySelector('[aria-pressed="true"]');
    const dates = calendarController?.getDates() || {};
    if (!dates.start || (selected?.dataset.choice === 'overnight' && !dates.end)) {
      showToast(selected?.dataset.choice === 'overnight' ? 'اختر تاريخ الوصول والمغادرة أولاً.' : 'اختر تاريخ الزيارة أولاً.');
      calendarController?.open();
      return;
    }

    const formData = new FormData(form);
    const overnight = selected?.dataset.choice === 'overnight';
    const nights = overnight && dates.end ? Math.max(1, Math.round((dates.end - dates.start) / 86400000)) : 1;
    const price = Number(selected?.dataset.price || 1280) * nights;
    const params = new URLSearchParams({
      period: selected?.dataset.label || 'إقامة ليلية',
      price: formatPrice(price),
      start: formData.get('start') || '',
      adults: formData.get('adults') || '2',
      children: formData.get('children') || '0',
      infants: formData.get('infants') || '0'
    });
    if (formData.get('end')) params.set('end', formData.get('end'));
    window.location.href = `04-booking-request-review.html?${params.toString()}`;
  });
}

function initMobileBookingBar() {
  const bar = document.querySelector('.mobile-booking-bar');
  const footer = document.querySelector('.marketplace-footer');
  if (!bar || !footer || !('IntersectionObserver' in window)) return;

  new IntersectionObserver(([entry]) => {
    bar.classList.toggle('is-hidden', entry.isIntersecting);
    bar.setAttribute('aria-hidden', String(entry.isIntersecting));
  }, { rootMargin: '0px 0px 88px 0px', threshold: .01 }).observe(footer);
}

initGalleryViewer();
initShare();
initGuestCapacity();
const calendarController = initBookingCalendar();
initPricing(calendarController);
initBooking(calendarController);
initMobileBookingBar();

document.querySelector('[data-show-reviews]')?.addEventListener('click', () => {
  showToast('سيُفتح سجل التقييمات الكامل عند ربط الصفحة بالخدمة الخلفية.');
});
