const selectAll = (selector, root = document) => [...root.querySelectorAll(selector)];

let toastTimer;

export function showToast(message) {
  let toast = document.querySelector('[data-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.toast = '';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function closePopover(popover, restoreFocus = false) {
  if (!popover || popover.hidden) return;
  const triggers = selectAll(`[aria-controls="${popover.id}"]`);
  const activeTrigger = popover.activePopoverTrigger
    || triggers.find((trigger) => trigger.getAttribute('aria-expanded') === 'true')
    || triggers[0];
  popover.hidden = true;
  triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
  delete popover.dataset.popoverAnchor;
  popover.activePopoverTrigger = null;
  if (restoreFocus && activeTrigger?.isConnected) activeTrigger.focus();
}

function closeAllPopovers(exceptId = '') {
  selectAll('[data-popover]').forEach((popover) => {
    if (popover.id !== exceptId) closePopover(popover);
  });
}

function initNavigation() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-nav-menu]');
  if (!toggle || !menu) return;
  const openLabel = toggle.dataset.menuOpenLabel || toggle.getAttribute('aria-label') || 'Open menu';
  const closeLabel = toggle.dataset.menuCloseLabel || openLabel;

  const closeMenu = (restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', openLabel);
    menu.classList.remove('is-open');
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? closeLabel : openLabel);
    menu.classList.toggle('is-open', open);
  });

  menu.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-nav-menu]')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
}

function initPopovers() {
  selectAll('[data-popover-target]').forEach((trigger) => {
    const targetId = trigger.dataset.popoverTarget;
    const popover = document.getElementById(targetId);
    if (!popover) return;

    trigger.setAttribute('aria-controls', targetId);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!popover.hidden) {
        closePopover(popover);
        return;
      }

      closeAllPopovers(targetId);
      selectAll(`[aria-controls="${targetId}"]`).forEach((item) => item.setAttribute('aria-expanded', 'false'));
      popover.activePopoverTrigger = trigger;
      if (trigger.dataset.popoverAnchor) popover.dataset.popoverAnchor = trigger.dataset.popoverAnchor;
      else delete popover.dataset.popoverAnchor;
      popover.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      popover.querySelector('input, button, select')?.focus();
    });
  });

  selectAll('[data-popover-close]').forEach((button) => {
    button.addEventListener('click', () => closePopover(button.closest('[data-popover]'), true));
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-popover], [data-popover-target]')) closeAllPopovers();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openPopover = document.querySelector('[data-popover]:not([hidden])');
    if (openPopover) closePopover(openPopover, true);
  });
}

function guestSummary(picker) {
  const count = (type) => Number(picker.querySelector(`[data-guest-count="${type}"]`)?.value || 0);
  const adults = count('adults');
  const children = count('children');
  const infants = count('infants');
  const parts = [`${adults} ${adults === 1 ? 'بالغ' : 'بالغين'}`];
  if (children) parts.push(`${children} ${children === 1 ? 'طفل' : 'أطفال'}`);
  if (infants) parts.push(`${infants} ${infants === 1 ? 'رضيع' : 'رُضّع'}`);
  return parts.join('، ');
}

function updateGuestPicker(picker) {
  picker.querySelectorAll('[data-guest-count]').forEach((input) => {
    const output = picker.querySelector(`[data-guest-output="${input.dataset.guestCount}"]`);
    if (output) output.value = input.value;
  });

  const targetId = picker.dataset.guestPicker;
  selectAll(`[data-guest-summary="${targetId}"]`).forEach((target) => {
    target.textContent = guestSummary(picker);
  });
}

function initGuestPickers() {
  selectAll('[data-guest-picker]').forEach((picker) => {
    picker.addEventListener('click', (event) => {
      const button = event.target.closest('[data-counter-action]');
      if (!button) return;
      const type = button.dataset.guestType;
      const input = picker.querySelector(`[data-guest-count="${type}"]`);
      if (!input) return;
      const min = Number(input.min || 0);
      const max = Number(input.max || 20);
      const direction = button.dataset.counterAction === 'increase' ? 1 : -1;
      input.value = String(Math.min(max, Math.max(min, Number(input.value) + direction)));
      updateGuestPicker(picker);
    });
    updateGuestPicker(picker);
  });
}

function initDestinationChoices() {
  selectAll('[data-destination-value]').forEach((button) => {
    button.addEventListener('click', () => {
      const destination = button.dataset.destinationValue;
      selectAll('[data-destination-summary]').forEach((target) => {
        target.textContent = destination;
      });
      selectAll('[data-destination-input]').forEach((input) => {
        input.value = destination;
      });
      closePopover(button.closest('[data-popover]'), true);
    });
  });
}

function initDatePickers() {
  selectAll('[data-date-picker]').forEach((picker) => {
    const apply = picker.querySelector('[data-apply-dates]');
    apply?.addEventListener('click', () => {
      const start = picker.querySelector('[data-date-start]')?.value;
      const end = picker.querySelector('[data-date-end]')?.value;
      const targetId = picker.dataset.datePicker;
      const label = start && end ? `${start} — ${end}` : start || 'أضف تواريخ اختيارية';
      selectAll(`[data-date-summary="${targetId}"]`).forEach((target) => {
        target.textContent = label;
      });
      closePopover(picker.closest('[data-popover]'), true);
    });
  });
}

function initChoiceGroups() {
  selectAll('[data-choice-group]').forEach((group) => {
    group.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-choice]');
      if (!choice) return;
      group.querySelectorAll('[data-choice]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === choice));
      });
      group.dispatchEvent(new CustomEvent('choicechange', { detail: choice.dataset.choice }));
    });
  });
}

function openDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

function initDialogs() {
  selectAll('[data-dialog-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => openDialog(document.getElementById(trigger.dataset.dialogOpen)));
  });
  selectAll('[data-dialog-close]').forEach((trigger) => {
    trigger.addEventListener('click', () => closeDialog(trigger.closest('dialog')));
  });
  selectAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });
}

function initFavorites() {
  selectAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openDialog(document.getElementById('sign-in-dialog'));
    });
  });
}

function initReveal() {
  const items = selectAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((item) => observer.observe(item));
}

function initPlaceholderLinks() {
  selectAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('هذه الوجهة ستتوفر في المرحلة التالية من النموذج.');
    });
  });
}

export function initCore() {
  initNavigation();
  initPopovers();
  initGuestPickers();
  initDestinationChoices();
  initDatePickers();
  initChoiceGroups();
  initDialogs();
  initFavorites();
  initReveal();
  initPlaceholderLinks();
  selectAll('[data-current-year]').forEach((target) => {
    target.textContent = String(new Date().getFullYear());
  });
}

export { closeAllPopovers };
