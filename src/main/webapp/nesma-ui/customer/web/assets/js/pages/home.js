import { closeAllPopovers, initCore, showToast } from '../core.js';

initCore();

const CONSENT_KEY = 'marketplace.personalization.consent.v1';
const RECENT_DESTINATIONS_KEY = 'marketplace.personalization.destinations.v1';
const RECENT_PROPERTIES_KEY = 'marketplace.personalization.properties.v1';
const STORY_VIEWED_KEY = 'marketplace.personalization.story-views.v1';
const VALID_REGION_STATES = new Set(['ready', 'loading', 'empty', 'error', 'offline']);
const memoryStorage = new Map();

const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStorage.get(key) || null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryStorage.set(key, value);
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      memoryStorage.delete(key);
    }
  }
};

function readArray(key) {
  try {
    const value = JSON.parse(storage.get(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeArray(key, value) {
  storage.set(key, JSON.stringify(value));
}

function normalizeSearch(value = '') {
  return value
    .normalize('NFKD')
    .toLocaleLowerCase('ar')
    .replace(/[\u064b-\u065f]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

function initRangeCalendars(updateMobileSummary = () => {}) {
  document.querySelectorAll('[data-range-calendar]').forEach((calendar) => {
    const months = calendar.querySelector('[data-calendar-months]');
    const heading = calendar.querySelector('[data-calendar-heading]');
    const status = calendar.querySelector('[data-calendar-status]');
    const previous = calendar.querySelector('[data-calendar-previous]');
    const next = calendar.querySelector('[data-calendar-next]');
    const clear = calendar.querySelector('[data-calendar-clear]');
    const apply = calendar.querySelector('[data-apply-dates]');
    const startInput = calendar.querySelector('[data-date-start]');
    const endInput = calendar.querySelector('[data-date-end]');
    const popoverId = calendar.closest('[data-popover]')?.id;
    const triggers = popoverId ? [...document.querySelectorAll(`[data-popover-target="${popoverId}"]`)] : [];
    if (!months || !heading || !status || !previous || !next || !clear || !apply || !startInput || !endInput) return;

    const locale = document.documentElement.lang || 'ar';
    const mobileQuery = window.matchMedia('(max-width: 47.99rem)');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
    const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
    const weekdayLabelFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    const dayFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric' });
    const dateLabelFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const summaryFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    const dateValue = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const addDays = (date, amount) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
    const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
    const toIsoDate = (date) => [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
    const parseIsoDate = (value) => {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
      if (!match) return null;
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return toIsoDate(date) === value ? date : null;
    };
    const localeFirstDay = () => {
      try {
        const localeInfo = new Intl.Locale(locale);
        const weekInfo = localeInfo.weekInfo || localeInfo.getWeekInfo?.();
        return Number(weekInfo?.firstDay ?? 6) % 7;
      } catch {
        return 6;
      }
    };
    const firstDay = localeFirstDay();
    const visibleMonthCount = () => mobileQuery.matches ? 1 : 2;
    const formatSummary = (start, end) => {
      if (!start) return 'التواريخ اختيارية';
      if (!end) return summaryFormatter.format(start);
      return typeof summaryFormatter.formatRange === 'function'
        ? summaryFormatter.formatRange(start, end)
        : `${summaryFormatter.format(start)} — ${summaryFormatter.format(end)}`;
    };

    let committedStart = parseIsoDate(startInput.value);
    let committedEnd = parseIsoDate(endInput.value);
    let selectedStart = committedStart;
    let selectedEnd = committedEnd;
    let anchorMonth = startOfMonth(committedStart || today);
    let renderedMonthCount = visibleMonthCount();

    const setSummary = (start, end) => {
      document.querySelectorAll(`[data-date-summary="${calendar.dataset.datePicker}"]`).forEach((target) => {
        target.textContent = formatSummary(start, end);
      });
      updateMobileSummary();
    };

    const updateStatus = () => {
      if (!selectedStart) {
        status.textContent = 'اختر تاريخ الوصول، ثم تاريخ المغادرة.';
      } else if (!selectedEnd) {
        status.textContent = `الوصول ${dateLabelFormatter.format(selectedStart)}. اختر المغادرة لإضافة نطاق، أو طبّق هذا التاريخ.`;
      } else {
        status.textContent = `من ${dateLabelFormatter.format(selectedStart)} إلى ${dateLabelFormatter.format(selectedEnd)}.`;
      }
      apply.disabled = !selectedStart;
    };

    const isVisible = (date) => {
      const start = dateValue(anchorMonth);
      const end = dateValue(addMonths(anchorMonth, renderedMonthCount));
      return dateValue(date) >= start && dateValue(date) < end;
    };

    const focusDate = (date) => {
      const target = dateValue(date) < dateValue(today) ? today : date;
      if (!isVisible(target)) {
        const targetMonth = startOfMonth(target);
        anchorMonth = dateValue(targetMonth) < dateValue(anchorMonth)
          ? targetMonth
          : addMonths(targetMonth, -(renderedMonthCount - 1));
        render();
      }
      window.requestAnimationFrame(() => {
        months.querySelector(`[data-calendar-date="${toIsoDate(target)}"]`)?.focus();
      });
    };

    const createMonth = (monthDate, rovingDate) => {
      const section = document.createElement('section');
      section.className = 'home-calendar__month';
      section.setAttribute('aria-label', monthFormatter.format(monthDate));

      const title = document.createElement('h3');
      title.textContent = monthFormatter.format(monthDate);

      const weekdays = document.createElement('div');
      weekdays.className = 'home-calendar__weekdays';
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
      days.className = 'home-calendar__days';
      days.setAttribute('role', 'grid');
      const leadingBlanks = (monthDate.getDay() - firstDay + 7) % 7;
      for (let index = 0; index < leadingBlanks; index += 1) {
        const blank = document.createElement('span');
        blank.className = 'home-calendar__blank';
        blank.setAttribute('aria-hidden', 'true');
        days.append(blank);
      }

      const totalDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= totalDays; day += 1) {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        const isoDate = toIsoDate(date);
        const value = dateValue(date);
        const isPast = value < dateValue(today);
        const isStart = selectedStart && value === dateValue(selectedStart);
        const isEnd = selectedEnd && value === dateValue(selectedEnd);
        const isRange = selectedStart && selectedEnd && value > dateValue(selectedStart) && value < dateValue(selectedEnd);
        const button = document.createElement('button');
        button.className = 'home-calendar__day';
        button.type = 'button';
        button.dataset.calendarDate = isoDate;
        button.textContent = dayFormatter.format(date);
        button.disabled = isPast;
        button.tabIndex = !isPast && value === dateValue(rovingDate) ? 0 : -1;
        button.setAttribute('role', 'gridcell');
        button.setAttribute('aria-label', `${dateLabelFormatter.format(date)}${isStart ? '، تاريخ الوصول' : isEnd ? '، تاريخ المغادرة' : isRange ? '، ضمن النطاق المحدد' : ''}`);
        button.setAttribute('aria-pressed', String(Boolean(isStart || isEnd)));
        button.classList.toggle('is-today', value === dateValue(today));
        button.classList.toggle('is-range-start', Boolean(isStart));
        button.classList.toggle('is-range-end', Boolean(isEnd));
        button.classList.toggle('is-in-range', Boolean(isRange));
        if (value === dateValue(today)) button.setAttribute('aria-current', 'date');
        days.append(button);
      }

      section.append(title, weekdays, days);
      return section;
    };

    function render() {
      renderedMonthCount = visibleMonthCount();
      const rovingDate = selectedEnd || selectedStart || (isVisible(today) ? today : anchorMonth);
      const monthDates = Array.from({ length: renderedMonthCount }, (_, index) => addMonths(anchorMonth, index));
      months.replaceChildren(...monthDates.map((month) => createMonth(month, rovingDate)));
      heading.textContent = monthDates.map((month) => monthFormatter.format(month)).join(' — ');
      previous.disabled = dateValue(anchorMonth) <= dateValue(startOfMonth(today));
      updateStatus();
    }

    const selectDate = (date) => {
      if (!selectedStart || selectedEnd) {
        selectedStart = date;
        selectedEnd = null;
      } else if (dateValue(date) < dateValue(selectedStart)) {
        selectedStart = date;
      } else if (dateValue(date) > dateValue(selectedStart)) {
        selectedEnd = date;
      }
      window.requestAnimationFrame(() => {
        render();
        focusDate(date);
      });
    };

    const previewRange = (date) => {
      const previewEnd = selectedStart && !selectedEnd && dateValue(date) > dateValue(selectedStart) ? dateValue(date) : null;
      months.querySelectorAll('[data-calendar-date]').forEach((button) => {
        const buttonDate = parseIsoDate(button.dataset.calendarDate);
        const value = buttonDate ? dateValue(buttonDate) : 0;
        button.classList.toggle('is-in-preview', Boolean(previewEnd && value > dateValue(selectedStart) && value <= previewEnd));
      });
    };

    const changeDateMonth = (date, amount) => {
      const targetMonth = new Date(date.getFullYear(), date.getMonth() + amount, 1);
      const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
      return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), Math.min(date.getDate(), lastDay));
    };

    months.addEventListener('click', (event) => {
      const button = event.target.closest('[data-calendar-date]');
      const date = parseIsoDate(button?.dataset.calendarDate);
      if (date && !button.disabled) selectDate(date);
    });
    months.addEventListener('pointerover', (event) => {
      const date = parseIsoDate(event.target.closest('[data-calendar-date]')?.dataset.calendarDate);
      if (date) previewRange(date);
    });
    months.addEventListener('pointerleave', () => previewRange(selectedStart));
    months.addEventListener('keydown', (event) => {
      const button = event.target.closest('[data-calendar-date]');
      const date = parseIsoDate(button?.dataset.calendarDate);
      if (!date) return;

      const rtl = document.documentElement.dir === 'rtl';
      const weekOffset = (date.getDay() - firstDay + 7) % 7;
      let target = null;
      if (event.key === 'ArrowRight') target = addDays(date, rtl ? -1 : 1);
      if (event.key === 'ArrowLeft') target = addDays(date, rtl ? 1 : -1);
      if (event.key === 'ArrowUp') target = addDays(date, -7);
      if (event.key === 'ArrowDown') target = addDays(date, 7);
      if (event.key === 'Home') target = addDays(date, -weekOffset);
      if (event.key === 'End') target = addDays(date, 6 - weekOffset);
      if (event.key === 'PageUp') target = changeDateMonth(date, -1);
      if (event.key === 'PageDown') target = changeDateMonth(date, 1);
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
      committedStart = null;
      committedEnd = null;
      startInput.value = '';
      endInput.value = '';
      anchorMonth = startOfMonth(today);
      render();
      status.textContent = 'تم مسح التواريخ. يمكنك اختيار تاريخ جديد أو المتابعة من دون تواريخ.';
      setSummary(null, null);
    });
    calendar.querySelectorAll('[data-popover-close]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedStart = committedStart;
        selectedEnd = committedEnd;
        anchorMonth = startOfMonth(committedStart || today);
        render();
      });
    });
    apply.addEventListener('click', () => {
      if (!selectedStart) return;
      committedStart = selectedStart;
      committedEnd = selectedEnd;
      startInput.value = toIsoDate(committedStart);
      endInput.value = committedEnd ? toIsoDate(committedEnd) : '';
    }, { capture: true });
    apply.addEventListener('click', () => setSummary(committedStart, committedEnd));
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        if (popoverId && document.getElementById(popoverId)?.hidden) return;
        selectedStart = committedStart;
        selectedEnd = committedEnd;
        anchorMonth = startOfMonth(committedStart || today);
        render();
        focusDate(selectedEnd || selectedStart || today);
      });
    });

    const handleViewportChange = () => {
      if (renderedMonthCount !== visibleMonthCount()) render();
    };
    if (typeof mobileQuery.addEventListener === 'function') mobileQuery.addEventListener('change', handleViewportChange);
    else mobileQuery.addListener(handleViewportChange);
    render();
  });
}

function initRailControls() {
  document.querySelectorAll('[data-rail-control]').forEach((control) => {
    control.addEventListener('click', () => {
      const rail = document.getElementById(control.dataset.railTarget);
      if (!rail) return;

      const isNext = control.dataset.railDirection === 'next';
      const inlineForwardMultiplier = getComputedStyle(rail).direction === 'rtl' ? -1 : 1;
      const distance = Math.max(280, rail.clientWidth * .72);
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      rail.scrollBy({ left: inlineForwardMultiplier * (isNext ? distance : -distance), behavior });
    });
  });
}

function initStoryViewer() {
  const viewer = document.querySelector('[data-story-viewer]');
  const triggers = [...document.querySelectorAll('[data-story-trigger]')];
  if (!viewer || !triggers.length) return;

  const viewerImage = viewer.querySelector('[data-story-viewer-image]');
  const avatar = viewer.querySelector('[data-story-viewer-avatar]');
  const title = viewer.querySelector('[data-story-viewer-title]');
  const location = viewer.querySelector('[data-story-viewer-location]');
  const caption = viewer.querySelector('[data-story-viewer-caption]');
  const propertyLink = viewer.querySelector('[data-story-viewer-link]');
  const progress = viewer.querySelector('[data-story-progress]');
  const status = viewer.querySelector('[data-story-status]');
  const pauseButton = viewer.querySelector('[data-story-pause]');
  const closeButton = viewer.querySelector('[data-story-close]');
  const previousButton = viewer.querySelector('[data-story-previous]');
  const nextButton = viewer.querySelector('[data-story-next]');
  if (!viewerImage || !avatar || !title || !location || !caption || !propertyLink || !progress || !status || !pauseButton || !closeButton || !previousButton || !nextButton) return;

  const stories = triggers.map((trigger) => ({
    id: String(trigger.dataset.storyId || ''),
    title: String(trigger.dataset.storyTitle || ''),
    location: String(trigger.dataset.storyLocation || ''),
    caption: String(trigger.dataset.storyCaption || ''),
    href: safePagePath(trigger.dataset.storyHref),
    thumbnail: safeImagePath(trigger.querySelector('img')?.getAttribute('src')),
    slides: String(trigger.dataset.storySlides || '')
      .split(',')
      .map((path) => safeImagePath(path.trim()))
      .filter(Boolean)
  })).filter((story) => story.id && story.title && story.slides.length);
  if (!stories.length) return;

  const slideDuration = 6500;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sessionViewed = new Set(
    currentConsent() === 'allow'
      ? readArray(STORY_VIEWED_KEY).filter((id) => typeof id === 'string')
      : []
  );

  let storyIndex = 0;
  let slideIndex = 0;
  let progressFills = [];
  let animationFrame = 0;
  let startedAt = 0;
  let elapsed = 0;
  let renderToken = 0;
  let manualPaused = false;
  let visibilityPaused = document.hidden;
  let restoreFocusTo = null;
  let closeTimer = 0;
  let pointerStart = null;
  let suppressClick = false;

  const isOpen = () => viewer.hasAttribute('open');
  const isRtl = () => (document.documentElement.dir || getComputedStyle(viewer).direction) === 'rtl';
  const isPaused = () => manualPaused || visibilityPaused;

  const syncDirection = () => {
    previousButton.querySelector('i').className = `bi ${isRtl() ? 'bi-chevron-right' : 'bi-chevron-left'}`;
    nextButton.querySelector('i').className = `bi ${isRtl() ? 'bi-chevron-left' : 'bi-chevron-right'}`;
    propertyLink.querySelector('i').className = `bi ${isRtl() ? 'bi-arrow-left' : 'bi-arrow-right'}`;
  };

  const syncPauseControl = () => {
    const paused = isPaused();
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'متابعة تشغيل القصة' : 'إيقاف القصة مؤقتاً');
    pauseButton.querySelector('i').className = `bi ${paused ? 'bi-play-fill' : 'bi-pause-fill'}`;
  };

  const stopProgress = () => {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const setProgress = (value) => {
    progressFills.forEach((fill, index) => {
      const amount = index < slideIndex ? 1 : index === slideIndex ? value : 0;
      fill.style.transform = `scaleX(${Math.max(0, Math.min(1, amount))})`;
    });
  };

  const markViewed = (story) => {
    sessionViewed.add(story.id);
    triggers.find((trigger) => trigger.dataset.storyId === story.id)?.classList.add('is-viewed');
    if (currentConsent() !== 'allow') return;
    const persisted = readArray(STORY_VIEWED_KEY).filter((id) => typeof id === 'string' && id !== story.id);
    writeArray(STORY_VIEWED_KEY, [story.id, ...persisted].slice(0, 24));
  };

  const preloadNext = () => {
    const story = stories[storyIndex];
    const path = story.slides[slideIndex + 1] || stories[storyIndex + 1]?.slides[0];
    if (!path) return;
    const preload = new Image();
    preload.decoding = 'async';
    preload.src = safeImagePath(path);
  };

  const navigate = (direction) => {
    const story = stories[storyIndex];
    if (direction > 0 && slideIndex < story.slides.length - 1) {
      slideIndex += 1;
      renderCurrent();
      return;
    }
    if (direction < 0 && slideIndex > 0) {
      slideIndex -= 1;
      renderCurrent();
      return;
    }
    if (direction > 0 && storyIndex < stories.length - 1) {
      storyIndex += 1;
      slideIndex = 0;
      renderCurrent();
      return;
    }
    if (direction < 0 && storyIndex > 0) {
      storyIndex -= 1;
      slideIndex = stories[storyIndex].slides.length - 1;
      renderCurrent();
      return;
    }
    if (direction > 0) closeViewer();
  };

  const tick = (timestamp) => {
    if (!isOpen() || isPaused()) return;
    elapsed = Math.max(0, timestamp - startedAt);
    const amount = Math.min(1, elapsed / slideDuration);
    setProgress(amount);
    if (amount >= 1) {
      elapsed = 0;
      navigate(1);
      return;
    }
    animationFrame = window.requestAnimationFrame(tick);
  };

  const startProgress = () => {
    stopProgress();
    syncPauseControl();
    if (!isOpen() || isPaused()) return;
    startedAt = performance.now() - elapsed;
    animationFrame = window.requestAnimationFrame(tick);
  };

  const renderProgress = (count) => {
    const segments = Array.from({ length: count }, () => {
      const segment = document.createElement('span');
      const fill = document.createElement('i');
      segment.append(fill);
      return segment;
    });
    progress.replaceChildren(...segments);
    progressFills = segments.map((segment) => segment.firstElementChild);
  };

  function renderCurrent() {
    const story = stories[storyIndex];
    const slide = story.slides[slideIndex];
    const token = renderToken += 1;
    stopProgress();
    elapsed = 0;
    viewer.classList.add('is-changing');

    title.textContent = story.title;
    location.textContent = story.location;
    caption.textContent = story.caption;
    propertyLink.href = story.href;
    avatar.src = story.thumbnail;
    avatar.alt = '';
    viewerImage.alt = `${story.title}، لقطة ${slideIndex + 1} من ${story.slides.length}`;
    viewerImage.src = slide;
    renderProgress(story.slides.length);
    setProgress(0);
    markViewed(story);
    previousButton.disabled = storyIndex === 0 && slideIndex === 0;
    nextButton.setAttribute('aria-label', storyIndex === stories.length - 1 && slideIndex === story.slides.length - 1 ? 'إنهاء القصص' : 'اللقطة التالية');
    status.textContent = `${story.title}، القصة ${storyIndex + 1} من ${stories.length}، اللقطة ${slideIndex + 1} من ${story.slides.length}. محتوى ممول.`;

    const decoded = typeof viewerImage.decode === 'function' ? viewerImage.decode() : Promise.resolve();
    Promise.resolve(decoded).catch(() => {}).finally(() => {
      if (token !== renderToken || !isOpen()) return;
      viewer.classList.remove('is-changing');
      startProgress();
      preloadNext();
    });
  }

  const setManualPaused = (paused) => {
    if (manualPaused === paused) return;
    if (paused && animationFrame) elapsed = Math.max(0, performance.now() - startedAt);
    manualPaused = paused;
    if (isPaused()) stopProgress();
    else startProgress();
    syncPauseControl();
  };

  const finishClose = () => {
    window.clearTimeout(closeTimer);
    stopProgress();
    viewer.classList.remove('is-open', 'is-changing');
    if (viewer.hasAttribute('open')) {
      if (typeof viewer.close === 'function') viewer.close();
      else viewer.removeAttribute('open');
    }
  };

  function closeViewer() {
    if (!isOpen()) return;
    viewer.classList.remove('is-open');
    stopProgress();
    if (reducedMotion.matches) finishClose();
    else closeTimer = window.setTimeout(finishClose, 180);
  }

  const cleanupClosedViewer = () => {
    window.clearTimeout(closeTimer);
    stopProgress();
    viewer.classList.remove('is-open', 'is-changing');
    manualPaused = false;
    elapsed = 0;
    const target = restoreFocusTo;
    restoreFocusTo = null;
    if (target instanceof HTMLElement && target.isConnected) target.focus({ preventScroll: true });
  };

  const openViewer = (index, trigger) => {
    if (!stories[index]) return;
    window.clearTimeout(closeTimer);
    closeAllPopovers();
    restoreFocusTo = trigger;
    storyIndex = index;
    slideIndex = 0;
    manualPaused = false;
    visibilityPaused = document.hidden;
    syncDirection();
    if (!isOpen()) {
      if (typeof viewer.showModal === 'function') viewer.showModal();
      else viewer.setAttribute('open', '');
    }
    window.requestAnimationFrame(() => viewer.classList.add('is-open'));
    renderCurrent();
    closeButton.focus({ preventScroll: true });
  };

  triggers.forEach((trigger) => {
    trigger.classList.toggle('is-viewed', sessionViewed.has(trigger.dataset.storyId));
    trigger.addEventListener('click', () => {
      const index = stories.findIndex((story) => story.id === trigger.dataset.storyId);
      openViewer(index, trigger);
    });
  });

  pauseButton.addEventListener('click', () => setManualPaused(!manualPaused));
  closeButton.addEventListener('click', closeViewer);
  previousButton.addEventListener('click', () => navigate(-1));
  nextButton.addEventListener('click', () => navigate(1));

  viewer.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeViewer();
  });
  viewer.addEventListener('close', cleanupClosedViewer);
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(isRtl() ? 1 : -1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      navigate(isRtl() ? -1 : 1);
    } else if (event.key === ' ' && !event.target.closest('button, a')) {
      event.preventDefault();
      setManualPaused(!manualPaused);
    } else if (event.key === 'Tab') {
      const focusable = [...viewer.querySelectorAll('button:not(:disabled), a[href]')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  viewer.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  viewer.addEventListener('pointerup', (event) => {
    if (!pointerStart || event.pointerType === 'mouse') return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    suppressClick = true;
    navigate(isRtl() ? (deltaX > 0 ? 1 : -1) : (deltaX < 0 ? 1 : -1));
    window.setTimeout(() => { suppressClick = false; }, 0);
  });
  viewer.addEventListener('click', (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, { capture: true });

  document.addEventListener('visibilitychange', () => {
    if (!isOpen()) return;
    if (document.hidden && animationFrame) elapsed = Math.max(0, performance.now() - startedAt);
    visibilityPaused = document.hidden;
    if (isPaused()) stopProgress();
    else startProgress();
    syncPauseControl();
  });

  document.addEventListener('home:behavior-reset', () => {
    sessionViewed.clear();
    triggers.forEach((trigger) => trigger.classList.remove('is-viewed'));
  });
}

function currentConsent() {
  const value = storage.get(CONSENT_KEY);
  return value === 'deny' ? 'deny' : 'allow';
}

function clearBehaviorHistory() {
  storage.remove(RECENT_DESTINATIONS_KEY);
  storage.remove(RECENT_PROPERTIES_KEY);
  storage.remove(STORY_VIEWED_KEY);
  document.dispatchEvent(new CustomEvent('home:behavior-reset'));
}

function recentDestinations() {
  if (currentConsent() !== 'allow') return [];
  return readArray(RECENT_DESTINATIONS_KEY)
    .filter((value) => typeof value === 'string' && value.trim())
    .slice(0, 5);
}

function recordDestination(destination) {
  const value = String(destination || '').trim();
  if (currentConsent() !== 'allow' || !value || value === 'كل الوجهات') return;
  const next = [value, ...recentDestinations().filter((item) => normalizeSearch(item) !== normalizeSearch(value))].slice(0, 5);
  writeArray(RECENT_DESTINATIONS_KEY, next);
}

function safeImagePath(value) {
  return /^assets\/images\/[a-z0-9._-]+\.(?:jpe?g|webp)$/i.test(value || '') ? value : 'assets/images/hero-villa.jpg';
}

function safePagePath(value) {
  return /^(?:0[1-4]-[a-z0-9-]+\.html)(?:[?#].*)?$/i.test(value || '') ? value : '03-villa-profile.html';
}

function recordProperty(card) {
  if (currentConsent() !== 'allow' || !card) return;
  const link = card.querySelector('.home-property-card__image');
  const name = link?.querySelector('strong')?.textContent?.trim();
  const location = link?.querySelector('small')?.textContent?.trim();
  const image = link?.querySelector('img')?.getAttribute('src');
  const id = card.dataset.propertyId;
  if (!id || !name || !location || !image) return;

  const property = {
    id,
    name,
    location,
    image: safeImagePath(image),
    href: safePagePath(link.getAttribute('href')),
    rating: card.querySelector('.home-property-card__rating')?.textContent?.trim() || '',
    price: card.querySelector('.home-property-card__price strong')?.textContent?.trim() || '',
    facts: [...card.querySelectorAll('.home-property-card__facts span')].map((item) => item.textContent.trim()).filter(Boolean).slice(0, 3)
  };
  const existing = readArray(RECENT_PROPERTIES_KEY).filter((item) => item?.id !== property.id);
  writeArray(RECENT_PROPERTIES_KEY, [property, ...existing].slice(0, 6));
}

function createRecentPropertyCard(property) {
  const article = document.createElement('article');
  article.className = 'home-property-card';

  const link = document.createElement('a');
  link.className = 'home-property-card__image';
  link.href = safePagePath(property.href);

  const image = document.createElement('img');
  image.src = safeImagePath(property.image);
  image.width = 1536;
  image.height = 1024;
  image.alt = `${property.name} في ${property.location}`;
  image.loading = 'lazy';
  image.decoding = 'async';

  const label = document.createElement('span');
  const name = document.createElement('strong');
  const location = document.createElement('small');
  name.textContent = property.name;
  location.textContent = property.location;
  label.append(name, location);
  link.append(image, label);
  article.append(link);

  if (Array.isArray(property.facts) && property.facts.length) {
    const facts = document.createElement('div');
    facts.className = 'home-property-card__facts';
    property.facts.slice(0, 3).forEach((fact) => {
      const item = document.createElement('span');
      const icon = document.createElement('i');
      icon.className = 'bi bi-check-circle';
      icon.setAttribute('aria-hidden', 'true');
      item.append(icon, document.createTextNode(String(fact).slice(0, 40)));
      facts.append(item);
    });
    article.append(facts);
  }

  const meta = document.createElement('div');
  meta.className = 'home-property-card__meta';
  const rating = document.createElement('span');
  rating.className = 'home-property-card__rating';
  rating.textContent = String(property.rating || '').slice(0, 12);
  const price = document.createElement('span');
  price.className = 'home-property-card__price';
  const priceLabel = document.createElement('small');
  const priceValue = document.createElement('strong');
  priceLabel.textContent = 'ابتداءً من';
  priceValue.textContent = String(property.price || '').slice(0, 24);
  price.append(priceLabel, priceValue);
  meta.append(rating, price);
  article.append(meta);
  return article;
}

function renderRecentlyViewed() {
  const section = document.querySelector('[data-recent-section]');
  const track = document.querySelector('[data-recent-track]');
  if (!section || !track) return;

  const properties = currentConsent() === 'allow'
    ? readArray(RECENT_PROPERTIES_KEY).filter((item) => item && typeof item === 'object' && typeof item.id === 'string').slice(0, 6)
    : [];
  track.replaceChildren(...properties.map(createRecentPropertyCard));
  section.hidden = properties.length === 0;
}

function destinationOption(value, recent = false) {
  const button = document.createElement('button');
  button.className = 'home-destination-option';
  button.type = 'button';
  button.setAttribute('role', 'option');
  button.setAttribute('aria-selected', 'false');
  button.dataset.destinationOption = value;
  button.dataset.destinationSearch = value;

  const icon = document.createElement('i');
  icon.className = recent ? 'bi bi-clock-history' : 'bi bi-geo-alt';
  icon.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  const title = document.createElement('strong');
  const subtitle = document.createElement('small');
  title.textContent = value;
  subtitle.textContent = recent ? 'بحث حديث' : 'وجهة';
  text.append(title, subtitle);
  button.append(icon, text);
  return button;
}

function renderRecentDestinations() {
  const group = document.querySelector('[data-recent-destination-group]');
  const list = document.querySelector('[data-recent-destination-list]');
  if (!group || !list) return;
  const destinations = recentDestinations();
  list.replaceChildren(...destinations.map((value) => destinationOption(value, true)));
  group.hidden = destinations.length === 0;
}

function initDestinationAutocomplete(updateMobileSummary) {
  const input = document.querySelector('[data-destination-input]');
  const listbox = document.getElementById('destination-suggestions');
  const status = document.querySelector('[data-destination-status]');
  const empty = document.querySelector('[data-destination-empty]');
  const triggers = [...document.querySelectorAll('[data-popover-target="destination-popover"]')];
  if (!input || !listbox || !status || !empty || !triggers.length) return;

  let activeIndex = -1;
  let optionId = 0;

  const options = () => [...listbox.querySelectorAll('[data-destination-option]:not([hidden])')];
  const assignOptionIds = () => {
    listbox.querySelectorAll('[data-destination-option]').forEach((option) => {
      if (!option.id) option.id = `destination-option-${optionId += 1}`;
    });
  };

  const setActive = (index) => {
    const visible = options();
    activeIndex = visible.length && index >= 0 ? (index + visible.length) % visible.length : -1;
    listbox.querySelectorAll('[data-destination-option]').forEach((option) => {
      const active = option === visible[activeIndex];
      option.classList.toggle('is-active', active);
      option.setAttribute('aria-selected', String(active));
    });
    if (activeIndex >= 0) {
      input.setAttribute('aria-activedescendant', visible[activeIndex].id);
      visible[activeIndex].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const filter = () => {
    assignOptionIds();
    const query = normalizeSearch(input.value);
    listbox.querySelectorAll('[data-destination-option]').forEach((option) => {
      const searchable = normalizeSearch(`${option.dataset.destinationOption} ${option.dataset.destinationSearch || ''}`);
      option.hidden = Boolean(query) && !searchable.includes(query);
    });
    listbox.querySelectorAll('.home-destination-group').forEach((group) => {
      const hasVisibleOption = Boolean(group.querySelector('[data-destination-option]:not([hidden])'));
      group.hidden = !hasVisibleOption;
    });
    const count = options().length;
    empty.hidden = count > 0;
    status.textContent = query
      ? count === 1
        ? 'اقتراح واحد مطابق'
        : count > 1
          ? `${count} اقتراحات مطابقة`
          : 'لا توجد اقتراحات مطابقة'
      : 'اكتب للبحث أو اختر من الوجهات الشائعة.';
    setActive(-1);
  };

  const select = (option) => {
    const value = option?.dataset.destinationOption;
    if (!value) return;
    const activeTrigger = document.querySelector('[aria-controls="destination-popover"][aria-expanded="true"]') || triggers[0];
    input.value = value;
    document.querySelectorAll('[data-destination-summary]').forEach((target) => {
      target.textContent = value;
    });
    input.setAttribute('aria-expanded', 'false');
    closeAllPopovers();
    activeTrigger.focus();
    updateMobileSummary();
  };

  listbox.addEventListener('click', (event) => {
    const option = event.target.closest('[data-destination-option]');
    if (option) select(option);
  });
  input.addEventListener('input', filter);
  input.addEventListener('focus', () => {
    input.setAttribute('aria-expanded', 'true');
    filter();
  });
  input.addEventListener('blur', () => input.setAttribute('aria-expanded', 'false'));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const visible = options();
      if (event.key === 'ArrowDown') setActive(activeIndex < 0 ? 0 : activeIndex + 1);
      else setActive(activeIndex < 0 ? visible.length - 1 : activeIndex - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      select(options()[activeIndex]);
    } else if (event.key === 'Escape') {
      input.setAttribute('aria-expanded', 'false');
    }
  });
  document.querySelector('[data-destination-show-all]')?.addEventListener('click', () => {
    input.value = '';
    filter();
    input.focus();
  });

  renderRecentDestinations();
  filter();
}

function initStickyDiscoveryHeader() {
  const header = document.querySelector('[data-sticky-header]');
  const navigation = header?.querySelector('[data-sticky-navigation]');
  const compactSearch = header?.querySelector('[data-sticky-search]');
  const menuToggle = header?.querySelector('[data-menu-toggle]');
  const form = document.querySelector('[data-discovery-form]');
  const sentinel = form?.querySelector('[data-sticky-search-sentinel]');
  const submit = compactSearch?.querySelector('[data-sticky-search-submit]');
  if (!header || !navigation || !compactSearch || !menuToggle || !form || !sentinel || !submit) return;

  const desktopQuery = window.matchMedia('(min-width: 48rem)');
  const popovers = [...form.querySelectorAll('[data-popover]')];
  const compactTriggers = [...compactSearch.querySelectorAll('[data-popover-target]')];
  let observerWantsCompact = false;
  let compact = false;
  let fallbackFrame = 0;

  const menuIsOpen = () => menuToggle.getAttribute('aria-expanded') === 'true';
  const openHeaderPopover = () => form.querySelector('[data-popover-anchor="header"]:not([hidden])');

  const syncAccess = () => {
    const navigationAvailable = !compact || menuIsOpen();
    navigation.toggleAttribute('inert', !navigationAvailable);
    if (navigationAvailable) navigation.removeAttribute('aria-hidden');
    else navigation.setAttribute('aria-hidden', 'true');

    compactSearch.toggleAttribute('inert', !compact);
    compactSearch.setAttribute('aria-hidden', String(!compact));
  };

  const setCompact = (nextCompact) => {
    if (compact === nextCompact) {
      syncAccess();
      return;
    }
    compact = nextCompact;
    header.classList.toggle('is-compact', compact);
    syncAccess();
  };

  const syncState = () => {
    const navigationHasFocus = navigation.contains(document.activeElement);
    const formPopoverIsOpen = Boolean(form.querySelector('[data-popover]:not([hidden]):not([data-popover-anchor="header"])'));
    const keepInteractiveSurface = compact && Boolean(openHeaderPopover() || menuIsOpen());
    const nextCompact = desktopQuery.matches
      && (observerWantsCompact || keepInteractiveSurface)
      && !formPopoverIsOpen
      && !(navigationHasFocus && !menuIsOpen());
    setCompact(nextCompact);
  };

  const positionHeaderPopover = (popover, trigger) => {
    if (!popover || popover.hidden || !desktopQuery.matches) return;
    const viewportPadding = 16;
    const headerRect = header.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const availableWidth = Math.max(0, window.innerWidth - (viewportPadding * 2));
    const width = Math.min(popoverRect.width, availableWidth);
    const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
    let left = popover.classList.contains('home-search__popover--dates')
      ? (window.innerWidth - width) / 2
      : rtl
        ? triggerRect.right - width
        : triggerRect.left;
    left = Math.min(window.innerWidth - width - viewportPadding, Math.max(viewportPadding, left));
    popover.style.setProperty('--home-header-popover-left', `${Math.round(left)}px`);
    popover.style.setProperty('--home-header-popover-top', `${Math.round(headerRect.bottom + 8)}px`);
  };

  compactTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const popover = document.getElementById(trigger.dataset.popoverTarget);
      positionHeaderPopover(popover, trigger);
    });
  });

  submit.addEventListener('click', () => {
    closeAllPopovers();
    if (typeof form.requestSubmit === 'function') form.requestSubmit();
    else form.querySelector('[type="submit"]')?.click();
  });

  const observeSentinel = () => {
    if ('IntersectionObserver' in window) {
      const topMargin = Math.ceil(header.getBoundingClientRect().height);
      const observer = new IntersectionObserver(([entry]) => {
        observerWantsCompact = !entry.isIntersecting && entry.boundingClientRect.top < topMargin;
        syncState();
      }, { rootMargin: `-${topMargin}px 0px 0px 0px`, threshold: 0 });
      observer.observe(sentinel);
      return;
    }

    const checkPosition = () => {
      fallbackFrame = 0;
      observerWantsCompact = sentinel.getBoundingClientRect().top <= header.getBoundingClientRect().bottom;
      syncState();
    };
    const requestCheck = () => {
      if (!fallbackFrame) fallbackFrame = window.requestAnimationFrame(checkPosition);
    };
    window.addEventListener('scroll', requestCheck, { passive: true });
    window.addEventListener('resize', requestCheck, { passive: true });
    checkPosition();
  };

  new MutationObserver(syncState).observe(menuToggle, { attributes: true, attributeFilter: ['aria-expanded'] });
  popovers.forEach((popover) => {
    new MutationObserver(syncState).observe(popover, { attributes: true, attributeFilter: ['hidden', 'data-popover-anchor'] });
  });

  document.addEventListener('focusin', syncState);
  window.addEventListener('resize', () => {
    const popover = openHeaderPopover();
    if (popover?.activePopoverTrigger) positionHeaderPopover(popover, popover.activePopoverTrigger);
  }, { passive: true });

  const handleBreakpointChange = () => {
    if (!desktopQuery.matches) {
      const popover = openHeaderPopover();
      const focusedInsidePopover = popover?.contains(document.activeElement);
      closeAllPopovers();
      if (focusedInsidePopover) form.querySelector('[data-popover-target="destination-popover"]')?.focus();
    }
    syncState();
  };
  if (typeof desktopQuery.addEventListener === 'function') desktopQuery.addEventListener('change', handleBreakpointChange);
  else desktopQuery.addListener(handleBreakpointChange);

  syncAccess();
  observeSentinel();
}

function initMobileSearchSummary() {
  const summary = document.querySelector('[data-mobile-search-summary]');
  const button = summary?.querySelector('[data-scroll-to-search]');
  const form = document.querySelector('[data-discovery-form]');
  const footer = document.querySelector('.home-footer');
  if (!summary || !button || !form || !footer) return () => {};

  const destinationTarget = summary.querySelector('[data-mobile-summary-destination]');
  const datesTarget = summary.querySelector('[data-mobile-summary-dates]');
  const guestsTarget = summary.querySelector('[data-mobile-summary-guests]');
  const input = form.querySelector('[data-destination-input]');
  let formVisible = true;
  let footerVisible = false;

  const update = () => {
    const destination = input?.value?.trim();
    const dates = document.querySelector('[data-date-summary="home-dates"]')?.textContent?.trim();
    const guests = document.querySelector('[data-guest-summary="home-guests"]')?.textContent?.trim();
    destinationTarget.textContent = destination || 'كل الوجهات';
    datesTarget.textContent = dates && !dates.includes('اختيارية') ? dates : 'أي وقت';
    guestsTarget.textContent = guests || '2 بالغين';
  };

  const syncVisibility = () => {
    const mobile = window.matchMedia('(max-width: 47.99rem)').matches;
    const visible = mobile && !formVisible && !footerVisible;
    summary.classList.toggle('is-visible', visible);
    summary.setAttribute('aria-hidden', String(!visible));
    button.tabIndex = visible ? 0 : -1;
  };

  summary.hidden = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      formVisible = entry.isIntersecting;
      syncVisibility();
    }, { threshold: .1 }).observe(form);
    new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting;
      syncVisibility();
    }, { threshold: .01 }).observe(footer);
  } else {
    const checkPosition = () => {
      const formRect = form.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      formVisible = formRect.bottom > 0 && formRect.top < window.innerHeight;
      footerVisible = footerRect.top < window.innerHeight && footerRect.bottom > 0;
      syncVisibility();
    };
    window.addEventListener('scroll', checkPosition, { passive: true });
    checkPosition();
  }

  const sourceTargets = document.querySelectorAll('[data-destination-summary], [data-date-summary="home-dates"], [data-guest-summary="home-guests"]');
  new MutationObserver(update).observe(form, { childList: true, characterData: true, subtree: true });
  input?.addEventListener('input', update);
  window.addEventListener('resize', syncVisibility, { passive: true });
  button.addEventListener('click', () => {
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => form.querySelector('[data-popover-target="destination-popover"]')?.focus(), 450);
  });
  if (sourceTargets.length) update();
  return update;
}

function setRegionState(region, state) {
  if (!region || !VALID_REGION_STATES.has(state)) return;
  region.dataset.state = state;
  region.setAttribute('aria-busy', String(state === 'loading'));
  region.querySelectorAll('[data-region-state]').forEach((panel) => {
    panel.hidden = panel.dataset.regionState !== state;
  });
}

function preferredRegionState() {
  if (!navigator.onLine) return 'offline';
  const previewState = new URLSearchParams(window.location.search).get('homeState');
  return VALID_REGION_STATES.has(previewState) ? previewState : 'ready';
}

function reorderRecommendations() {
  const list = document.querySelector('[data-recommendation-list]');
  if (!list || currentConsent() !== 'allow') return;
  const destination = recentDestinations()[0];
  if (!destination) return;

  const query = normalizeSearch(destination);
  const matching = [...list.children].find((item) => normalizeSearch(item.dataset.affinity || '').includes(query));
  if (matching) list.prepend(matching);
}

function updatePersonalization() {
  const region = document.querySelector('[data-dynamic-region="recommendations"]');
  setRegionState(region, preferredRegionState());
  reorderRecommendations();

  renderRecentDestinations();
  renderRecentlyViewed();
}

function initPersonalization() {
  document.querySelectorAll('[data-consent-reset]').forEach((button) => {
    button.addEventListener('click', () => {
      clearBehaviorHistory();
      renderRecentDestinations();
      renderRecentlyViewed();
      reorderRecommendations();
      showToast('تم مسح سجل التفضيلات من هذا المتصفح.');
    });
  });

  document.querySelectorAll('[data-track-property]').forEach((card) => {
    card.querySelector('.home-property-card__image')?.addEventListener('click', () => recordProperty(card));
  });

  updatePersonalization();
}

function initDynamicStates() {
  const region = document.querySelector('[data-dynamic-region="recommendations"]');
  const banner = document.querySelector('[data-connectivity]');
  const bannerRetry = document.querySelector('[data-connectivity-retry]');
  if (!region || !banner) return;

  const updateConnectivity = () => {
    banner.hidden = navigator.onLine;
    setRegionState(region, preferredRegionState());
  };

  const retry = () => {
    if (!navigator.onLine) {
      setRegionState(region, 'offline');
      showToast('لا يزال الاتصال غير متاح.');
      return;
    }
    setRegionState(region, 'loading');
    window.setTimeout(() => setRegionState(region, 'ready'), 650);
  };

  bannerRetry?.addEventListener('click', retry);
  region.querySelectorAll('[data-region-retry]').forEach((button) => button.addEventListener('click', retry));
  window.addEventListener('online', updateConnectivity);
  window.addEventListener('offline', updateConnectivity);
  updateConnectivity();
}

initStickyDiscoveryHeader();
const updateMobileSummary = initMobileSearchSummary();
initRailControls();
initStoryViewer();
initDestinationAutocomplete(updateMobileSummary);
initRangeCalendars(updateMobileSummary);
initPersonalization();
initDynamicStates();

document.querySelectorAll('.home-destination-card').forEach((link) => {
  link.addEventListener('click', () => recordDestination(link.querySelector('.home-destination-card__content strong')?.textContent));
});

const form = document.querySelector('[data-discovery-form]');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const destination = data.get('destination') || 'كل الوجهات';
  recordDestination(destination);
  const params = new URLSearchParams({ destination });
  ['start', 'end', 'adults', 'children', 'infants'].forEach((key) => {
    const value = data.get(key);
    if (value) params.set(key, value);
  });
  window.location.href = `02-search-map-results.html?${params.toString()}`;
});
