import { initCore, showToast } from '../core.js';

initCore();

const params = new URLSearchParams(window.location.search);
const layout = document.querySelector('[data-results-layout]');
const mapStatus = document.querySelector('[data-map-status]');
const filterDialog = document.getElementById('filters-dialog');
const filterCount = document.querySelector('[data-filter-count]');

const countLabel = (value, singular, plural) => `${value} ${Number(value) === 1 ? singular : plural}`;

const formatDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(document.documentElement.lang || 'ar', { day: 'numeric', month: 'short' }).format(date);
};

const currentGuests = () => {
  const count = (type, fallback) => document.querySelector(`[data-guest-count="${type}"]`)?.value || fallback;
  return {
    adults: count('adults', params.get('adults') || '2'),
    children: count('children', params.get('children') || '0'),
    infants: count('infants', params.get('infants') || '0')
  };
};

const updateSearchSummary = () => {
  const destinationInput = document.querySelector('[data-destination-input]');
  const destination = destinationInput?.value.trim() || params.get('destination') || 'كل الوجهات';
  const start = document.querySelector('[data-search-start]')?.value || params.get('start') || '';
  const end = document.querySelector('[data-search-end]')?.value || params.get('end') || '';
  const guests = currentGuests();
  const guestParts = [countLabel(guests.adults, 'بالغ', 'بالغين')];
  if (Number(guests.children)) guestParts.push(countLabel(guests.children, 'طفل', 'أطفال'));
  if (Number(guests.infants)) guestParts.push(countLabel(guests.infants, 'رضيع', 'رُضّع'));

  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);
  const dateText = formattedStart && formattedEnd ? `${formattedStart} — ${formattedEnd}` : formattedStart || 'دون تواريخ';
  const guestText = guestParts.join('، ');

  document.querySelectorAll('[data-destination-summary]').forEach((target) => {
    target.textContent = destination;
  });
  document.querySelectorAll('[data-result-date-summary]').forEach((target) => {
    target.textContent = dateText === 'دون تواريخ' ? 'التواريخ اختيارية' : dateText;
  });
  document.querySelectorAll('[data-result-guest-summary]').forEach((target) => {
    target.textContent = guestText;
  });
  document.querySelectorAll('[data-search-criteria]').forEach((target) => {
    target.textContent = `${dateText} · ${guestText} · كل الفترات`;
  });
};

const setMapStatus = (message, updating = false) => {
  if (!mapStatus) return;
  const icon = mapStatus.querySelector('i') || document.createElement('i');
  icon.className = updating ? 'bi bi-arrow-repeat' : 'bi bi-check2-circle';
  icon.setAttribute('aria-hidden', 'true');
  mapStatus.replaceChildren(icon, document.createTextNode(` ${message}`));
  mapStatus.classList.toggle('is-updating', updating);
};

let mapRefreshTimer;
const scheduleMapRefresh = () => {
  window.clearTimeout(mapRefreshTimer);
  setMapStatus('جارٍ تحديث النتائج ضمن نطاق الخريطة…', true);
  mapRefreshTimer = window.setTimeout(() => {
    setMapStatus('تم تحديث 24 إقامة ضمن النطاق الحالي.');
  }, 620);
};

const activeFilterCount = () => {
  if (!filterDialog) return 0;
  const checked = filterDialog.querySelectorAll('input[type="checkbox"]:checked').length;
  const prices = [...filterDialog.querySelectorAll('input[type="number"]')].filter((input) => input.value.trim()).length;
  return checked + prices;
};

const updateFilterCount = () => {
  const count = activeFilterCount();
  if (!filterCount) return;
  filterCount.textContent = String(count);
  filterCount.hidden = count === 0;
};

updateSearchSummary();

document.querySelectorAll('[data-results-view]').forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.resultsView;
    document.querySelectorAll('[data-results-view]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    layout?.setAttribute('data-active-view', view);
  });
});

document.querySelectorAll('[data-quick-search]').forEach((button) => {
  button.addEventListener('click', () => {
    updateSearchSummary();
    showToast('تم تحديث النتائج وفق معايير رحلتك.');
  });
});

document.querySelector('[data-choice-group]')?.addEventListener('choicechange', (event) => {
  const labels = {
    all: 'كل الفترات',
    overnight: 'المبيت',
    'full-day': 'اليوم الكامل',
    morning: 'الفترة الصباحية',
    evening: 'الفترة المسائية'
  };
  showToast(`تم عرض ${labels[event.detail] || 'الفترة المختارة'}.`);
});

document.querySelectorAll('[data-map-control]').forEach((button) => {
  button.addEventListener('click', () => {
    scheduleMapRefresh();
  });
});

document.querySelectorAll('[data-map-result-id]').forEach((pin) => {
  const card = document.querySelector(`[data-result-id="${pin.dataset.mapResultId}"]`);
  if (!card) return;

  const activate = () => {
    pin.classList.add('is-active');
    card.classList.add('is-map-highlighted');
  };
  const deactivate = () => {
    pin.classList.remove('is-active');
    card.classList.remove('is-map-highlighted');
  };

  pin.addEventListener('mouseenter', activate);
  pin.addEventListener('mouseleave', deactivate);
  pin.addEventListener('focus', activate);
  pin.addEventListener('blur', deactivate);
  card.addEventListener('mouseenter', activate);
  card.addEventListener('mouseleave', deactivate);
  card.addEventListener('focusin', activate);
  card.addEventListener('focusout', (event) => {
    if (!card.contains(event.relatedTarget)) deactivate();
  });
});

filterDialog?.addEventListener('change', updateFilterCount);
filterDialog?.addEventListener('input', updateFilterCount);

document.querySelector('[data-clear-filters]')?.addEventListener('click', () => {
  filterDialog?.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = false;
  });
  filterDialog?.querySelectorAll('input[type="number"]').forEach((input) => {
    input.value = '';
  });
  updateFilterCount();
});

document.querySelector('[data-apply-filters]')?.addEventListener('click', (event) => {
  updateFilterCount();
  event.currentTarget.closest('dialog')?.close();
  const count = activeFilterCount();
  showToast(count ? `تم تطبيق ${count} من عوامل التصفية.` : 'تم عرض النتائج من دون عوامل تصفية إضافية.');
});
