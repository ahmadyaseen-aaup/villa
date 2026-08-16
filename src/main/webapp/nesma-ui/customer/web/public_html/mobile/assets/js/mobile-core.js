const selectAll = (selector, root = document) => [...root.querySelectorAll(selector)];

let toastTimer;

export function showMobileToast(message) {
  let toast = document.querySelector('[data-mobile-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.dataset.mobileToast = '';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

export function openMobileDialog(dialog) {
  if (!dialog) return;
  document.body.classList.add('has-mobile-dialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

export function closeMobileDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
  if (!document.querySelector('dialog[open]')) document.body.classList.remove('has-mobile-dialog');
}

function initDialogs() {
  selectAll('[data-dialog-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const dialog = document.getElementById(trigger.dataset.dialogOpen);
      if (dialog) dialog.returnFocusTarget = trigger;
      openMobileDialog(dialog);
    });
  });

  selectAll('[data-dialog-close]').forEach((trigger) => {
    trigger.addEventListener('click', () => closeMobileDialog(trigger.closest('dialog')));
  });

  selectAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeMobileDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      document.body.classList.toggle('has-mobile-dialog', Boolean(document.querySelector('dialog[open]')));
      if (dialog.returnFocusTarget?.isConnected) dialog.returnFocusTarget.focus();
      dialog.returnFocusTarget = null;
    });
  });
}

function initFavorites() {
  selectAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const dialog = document.getElementById('sign-in-dialog');
      if (dialog) {
        dialog.returnFocusTarget = button;
        openMobileDialog(dialog);
      } else {
        showMobileToast('سجّل الدخول لحفظ هذه الإقامة في المفضلة.');
      }
    });
  });
}

const guestLabel = (type, value) => {
  if (type === 'adults') return value === 1 ? 'بالغ' : 'بالغين';
  if (type === 'children') return value === 1 ? 'طفل' : 'أطفال';
  return value === 1 ? 'رضيع' : 'رُضّع';
};

function guestSummary(picker) {
  const values = ['adults', 'children', 'infants'].map((type) => {
    const value = Number(picker.querySelector(`[data-guest-value="${type}"]`)?.value || 0);
    return { type, value };
  });
  return values
    .filter(({ type, value }) => type === 'adults' || value > 0)
    .map(({ type, value }) => `${value} ${guestLabel(type, value)}`)
    .join('، ');
}

function updateGuestPicker(picker) {
  const capacity = Number(picker.dataset.capacity || 0);
  const capacityTypes = new Set(['adults', 'children']);
  const capacityTotal = [...capacityTypes].reduce((total, type) => {
    return total + Number(picker.querySelector(`[data-guest-value="${type}"]`)?.value || 0);
  }, 0);
  const capacityReached = capacity > 0 && capacityTotal >= capacity;
  selectAll('[data-guest-value]', picker).forEach((input) => {
    const value = Number(input.value);
    const minimum = Number(input.min || 0);
    const maximum = Number(input.max || 20);
    const output = picker.querySelector(`[data-guest-output="${input.dataset.guestValue}"]`);
    if (output) output.textContent = input.value;
    const decrease = picker.querySelector(`[data-counter-action="decrease"][data-guest-type="${input.dataset.guestValue}"]`);
    const increase = picker.querySelector(`[data-counter-action="increase"][data-guest-type="${input.dataset.guestValue}"]`);
    if (decrease) decrease.disabled = value <= minimum;
    if (increase) increase.disabled = value >= maximum || (capacityTypes.has(input.dataset.guestValue) && capacityReached);
  });
  const capacityStatus = picker.querySelector('[data-guest-capacity-status]');
  if (capacityStatus && capacity > 0) {
    capacityStatus.textContent = `السعة القصوى ${capacity} ضيوف من البالغين والأطفال. المتبقي ${Math.max(0, capacity - capacityTotal)}.`;
    capacityStatus.classList.remove('is-error');
  }
  const target = picker.dataset.guestPicker;
  selectAll(`[data-guest-summary="${target}"]`).forEach((summary) => {
    summary.textContent = guestSummary(picker);
  });
}

function initGuestPickers() {
  selectAll('[data-guest-picker]').forEach((picker) => {
    picker.addEventListener('click', (event) => {
      const button = event.target.closest('[data-counter-action]');
      if (!button) return;
      const input = picker.querySelector(`[data-guest-value="${button.dataset.guestType}"]`);
      if (!input) return;
      const direction = button.dataset.counterAction === 'increase' ? 1 : -1;
      const minimum = Number(input.min || 0);
      const maximum = Number(input.max || 20);
      const capacity = Number(picker.dataset.capacity || 0);
      const capacityStatus = picker.querySelector('[data-guest-capacity-status]');
      const capacityTypes = new Set(['adults', 'children']);
      const capacityTotal = [...capacityTypes].reduce((total, type) => {
        return total + Number(picker.querySelector(`[data-guest-value="${type}"]`)?.value || 0);
      }, 0);
      if (direction > 0 && capacity > 0 && capacityTypes.has(button.dataset.guestType) && capacityTotal >= capacity) {
        if (capacityStatus) {
          capacityStatus.textContent = `وصلت إلى السعة القصوى لهذه الإقامة: ${capacity} ضيوف من البالغين والأطفال.`;
          capacityStatus.classList.add('is-error');
        }
        showMobileToast(`السعة القصوى لهذه الإقامة ${capacity} ضيوف.`);
        return;
      }
      input.value = String(Math.min(maximum, Math.max(minimum, Number(input.value) + direction)));
      updateGuestPicker(picker);
      picker.dispatchEvent(new CustomEvent('guestchange', { bubbles: true }));
    });
    updateGuestPicker(picker);
  });
}

const toLocalDate = (value) => {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sameDate = (first, second) => first && second && toIsoDate(first) === toIsoDate(second);

export function formatArabicDate(date) {
  return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function initMobileCalendar(root, options = {}) {
  if (!root) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let start = toLocalDate(root.querySelector('[data-calendar-start]')?.value) || null;
  let end = toLocalDate(root.querySelector('[data-calendar-end]')?.value) || null;
  let singleDate = Boolean(options.singleDate || root.hasAttribute('data-calendar-single'));
  const title = root.querySelector('[data-calendar-title]');
  const grid = root.querySelector('[data-calendar-days]');
  const summary = root.querySelector('[data-calendar-summary]');
  const startLabel = root.querySelector('[data-calendar-start-label]');
  const endLabel = root.querySelector('[data-calendar-end-label]');
  const startState = root.querySelector('[data-calendar-start-state]');
  const endState = root.querySelector('[data-calendar-end-state]');
  const guidance = root.querySelector('[data-calendar-guidance]');
  const startInput = root.querySelector('[data-calendar-start]');
  const endInput = root.querySelector('[data-calendar-end]');
  const previousButton = root.querySelector('[data-calendar-previous]');
  const targetName = root.dataset.calendar;

  const updateSummary = () => {
    const label = start
      ? end && !singleDate
        ? `${formatArabicDate(start)} — ${formatArabicDate(end)}`
        : formatArabicDate(start)
      : options.emptyLabel || 'اختر التاريخ من التقويم';
    if (summary) summary.textContent = label;
    if (startLabel) startLabel.textContent = start ? formatArabicDate(start) : 'اختر تاريخاً';
    if (endLabel) endLabel.textContent = end ? formatArabicDate(end) : 'اختياري';
    startState?.classList.toggle('is-active', !start);
    endState?.classList.toggle('is-active', Boolean(start && !end && !singleDate));
    if (guidance) {
      guidance.textContent = !start
        ? 'اختر تاريخ الوصول، ثم المغادرة للإقامة الليلية.'
        : !end && !singleDate
          ? 'يمكنك تطبيق تاريخ واحد أو اختيار تاريخ المغادرة.'
          : 'تم تحديد التواريخ. يمكنك تعديلها من التقويم.';
    }
    selectAll(`[data-date-summary="${targetName}"]`).forEach((target) => {
      target.textContent = label;
    });
    if (startInput) startInput.value = start ? toIsoDate(start) : '';
    if (endInput) endInput.value = end ? toIsoDate(end) : '';
    root.dispatchEvent(new CustomEvent('datechange', { bubbles: true, detail: { start, end } }));
  };

  const render = () => {
    if (!grid) return;
    grid.replaceChildren();
    if (title) title.textContent = new Intl.DateTimeFormat('ar', { month: 'long', year: 'numeric' }).format(visibleMonth);
    const minimumMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (previousButton) previousButton.disabled = visibleMonth <= minimumMonth;
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const mondayOffset = (firstDay.getDay() + 1) % 7;
    for (let index = 0; index < mondayOffset; index += 1) grid.append(document.createElement('span'));

    const lastDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = new Intl.NumberFormat('ar', { useGrouping: false }).format(day);
      button.setAttribute('aria-label', formatArabicDate(date));
      button.disabled = date < today;
      const selected = sameDate(date, start) || sameDate(date, end);
      button.setAttribute('aria-pressed', String(Boolean(selected)));
      if (sameDate(date, today)) button.setAttribute('aria-current', 'date');
      if (selected) button.classList.add('is-selected');
      if (start && end && date > start && date < end) button.classList.add('is-in-range');
      button.addEventListener('click', () => {
        if (singleDate) {
          start = date;
          end = null;
        } else if (!start || end || date < start) {
          start = date;
          end = null;
        } else {
          end = date;
        }
        updateSummary();
        render();
      });
      grid.append(button);
    }
  };

  root.querySelector('[data-calendar-previous]')?.addEventListener('click', () => {
    const previous = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    const minimum = new Date(today.getFullYear(), today.getMonth(), 1);
    if (previous >= minimum) {
      visibleMonth = previous;
      render();
    }
  });
  root.querySelector('[data-calendar-next]')?.addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    render();
  });

  render();
  updateSummary();
  return {
    getDates: () => ({ start, end }),
    clear: () => {
      start = null;
      end = null;
      updateSummary();
      render();
    },
    setSingleDate: (value) => {
      singleDate = Boolean(value);
      if (singleDate) end = null;
      updateSummary();
      render();
    }
  };
}

function initPlaceholderLinks() {
  selectAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showMobileToast('هذه الوجهة ستتوفر في المرحلة التالية.');
    });
  });
}

export function initMobileCore() {
  initDialogs();
  initFavorites();
  initGuestPickers();
  initPlaceholderLinks();
}
