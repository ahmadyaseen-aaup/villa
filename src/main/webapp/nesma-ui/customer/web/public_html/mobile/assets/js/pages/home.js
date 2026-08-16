import {
  closeMobileDialog,
  initMobileCalendar,
  initMobileCore,
  openMobileDialog,
  toIsoDate
} from '../mobile-core.js';

initMobileCore();

const destinationInput = document.querySelector('[data-destination-input]');
const destinationSummary = document.querySelector('[data-destination-summary]');
const destinationSheet = document.getElementById('destination-sheet');
const datesSheet = document.getElementById('dates-sheet');
const guestsSheet = document.getElementById('guests-sheet');
const destinationButtons = [...document.querySelectorAll('[data-destination-value]')];
const destinationList = document.querySelector('[data-destination-list]');
const destinationEmpty = document.querySelector('[data-destination-empty]');
const recentDestinationSection = document.querySelector('[data-recent-destinations]');
const recentDestinationList = document.querySelector('[data-recent-destination-list]');
const recentDestinationStorageKey = 'customer-mobile-recent-destinations';
const viewedStoryStorageKey = 'customer-mobile-viewed-stories';
const calendarRoot = document.querySelector('[data-calendar="home-dates"]');
const applyDatesButton = document.querySelector('[data-apply-dates]');
const calendar = initMobileCalendar(document.querySelector('[data-calendar="home-dates"]'), {
  emptyLabel: 'التواريخ اختيارية'
});
let selectedDestination = '';

const readStoredList = (key) => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const writeStoredList = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in privacy modes; the interaction still works without persistence.
  }
};

const normalizeSearchText = (value) => value
  .normalize('NFKD')
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ة/g, 'ه')
  .trim()
  .toLocaleLowerCase('ar');

const updateDestinationSelection = (value) => {
  destinationButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.destinationValue === value));
  });
};

const renderRecentDestinations = () => {
  if (!recentDestinationSection || !recentDestinationList) return;
  const recentDestinations = readStoredList(recentDestinationStorageKey).slice(0, 3);
  recentDestinationList.replaceChildren();
  recentDestinations.forEach((destination) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = destination;
    button.addEventListener('click', () => selectDestination(destination));
    recentDestinationList.append(button);
  });
  recentDestinationSection.hidden = recentDestinations.length === 0;
};

const rememberDestination = (value) => {
  const recentDestinations = readStoredList(recentDestinationStorageKey)
    .filter((destination) => destination !== value);
  writeStoredList(recentDestinationStorageKey, [value, ...recentDestinations].slice(0, 3));
};

function selectDestination(value) {
  const destination = value.trim();
  if (!destination) return;
  selectedDestination = destination;
  if (destinationInput) destinationInput.value = destination;
  if (destinationSummary) destinationSummary.textContent = destination;
  updateDestinationSelection(destination);
  rememberDestination(destination);
  renderRecentDestinations();
  closeMobileDialog(destinationSheet);
}

destinationButtons.forEach((button) => {
  button.addEventListener('click', () => selectDestination(button.dataset.destinationValue));
});

destinationInput?.addEventListener('input', () => {
  const query = normalizeSearchText(destinationInput.value);
  let visibleCount = 0;
  destinationButtons.forEach((button) => {
    const matches = !query || normalizeSearchText(button.textContent).includes(query);
    button.hidden = !matches;
    if (matches) visibleCount += 1;
  });
  if (destinationList) destinationList.hidden = visibleCount === 0;
  if (destinationEmpty) destinationEmpty.hidden = !query || visibleCount > 0;
  if (recentDestinationSection) {
    recentDestinationSection.hidden = Boolean(query) || readStoredList(recentDestinationStorageKey).length === 0;
  }
});

destinationInput?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  const value = destinationInput.value.trim();
  if (value) selectDestination(value);
});

destinationSheet?.addEventListener('close', () => {
  if (destinationInput) destinationInput.value = '';
  destinationButtons.forEach((button) => { button.hidden = false; });
  if (destinationList) destinationList.hidden = false;
  if (destinationEmpty) destinationEmpty.hidden = true;
});

renderRecentDestinations();

const syncDateApplyAction = (dates = calendar?.getDates() || {}) => {
  if (!applyDatesButton) return;
  applyDatesButton.disabled = !dates.start;
  applyDatesButton.textContent = dates.start && !dates.end ? 'تطبيق تاريخ واحد' : 'تطبيق التواريخ';
};

calendarRoot?.addEventListener('datechange', (event) => syncDateApplyAction(event.detail));
syncDateApplyAction();

applyDatesButton?.addEventListener('click', () => closeMobileDialog(datesSheet));

document.querySelector('[data-clear-dates]')?.addEventListener('click', () => {
  calendar?.clear();
  closeMobileDialog(datesSheet);
});

document.querySelector('[data-home-search]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const dates = calendar?.getDates() || {};
  const params = new URLSearchParams();
  const destination = selectedDestination || destinationInput?.value.trim();
  if (destination) params.set('destination', destination);
  if (dates.start) params.set('start', toIsoDate(dates.start));
  if (dates.end) params.set('end', toIsoDate(dates.end));
  ['adults', 'children', 'infants'].forEach((type) => {
    const input = guestsSheet?.querySelector(`[data-guest-value="${type}"]`);
    if (input) params.set(type, input.value);
  });
  window.location.href = `02-search-map-results.html${params.size ? `?${params.toString()}` : ''}`;
});

function initStoryViewer() {
  const triggers = [...document.querySelectorAll('[data-story]')];
  const viewer = document.getElementById('story-viewer');
  if (!viewer || !triggers.length) return;

  const currentImage = viewer.querySelector('[data-story-viewer-image]');
  const incomingImage = viewer.querySelector('[data-story-viewer-buffer]');
  const title = viewer.querySelector('[data-story-viewer-title]');
  const location = viewer.querySelector('[data-story-viewer-location]');
  const position = viewer.querySelector('[data-story-viewer-position]');
  const status = viewer.querySelector('[data-story-viewer-status]');
  const progress = viewer.querySelector('[data-story-progress]');
  const swipeSurface = viewer.querySelector('[data-story-swipe-surface]');
  const caption = viewer.querySelector('.mobile-story-viewer__caption');
  const propertyLink = viewer.querySelector('[data-story-viewer-link]');
  const playbackButton = viewer.querySelector('[data-story-toggle-playback]');
  const previousButton = viewer.querySelector('[data-story-previous]');
  const nextButton = viewer.querySelector('[data-story-next]');
  if (!currentImage || !incomingImage || !title || !location || !position || !status || !progress || !swipeSurface || !caption || !propertyLink || !playbackButton || !previousButton || !nextButton) return;

  const stories = triggers.map((trigger) => ({
    id: String(trigger.dataset.storyId || ''),
    title: String(trigger.dataset.storyTitle || ''),
    location: String(trigger.dataset.storyLocation || ''),
    href: String(trigger.dataset.storyHref || '03-villa-profile.html'),
    slides: String(trigger.dataset.storySlides || '')
      .split(',')
      .map((source) => source.trim())
      .filter(Boolean)
  })).filter((story) => story.id && story.title && story.slides.length);
  if (!stories.length) return;

  const slideDuration = 5500;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const numberFormatter = new Intl.NumberFormat(document.documentElement.lang || 'ar', { useGrouping: false });
  const viewedStories = new Set(readStoredList(viewedStoryStorageKey));
  let storyIndex = 0;
  let slideIndex = 0;
  let progressFills = [];
  let progressFrame = 0;
  let startedAt = 0;
  let elapsed = 0;
  let transitionToken = 0;
  let isTransitioning = false;
  let manuallyPaused = false;
  let visibilityPaused = document.hidden;
  let holdPaused = false;
  let pointerGesture = null;

  const isOpen = () => viewer.hasAttribute('open');
  const isRtl = () => getComputedStyle(viewer).direction === 'rtl';
  const isPlaybackPaused = () => manuallyPaused || visibilityPaused || holdPaused;
  const isPlaybackBlocked = () => isPlaybackPaused() || isTransitioning;
  const formatNumber = (value) => numberFormatter.format(value);

  const cancelMediaAnimations = () => {
    currentImage.getAnimations().forEach((animation) => animation.cancel());
    incomingImage.getAnimations().forEach((animation) => animation.cancel());
    caption.getAnimations().forEach((animation) => animation.cancel());
  };

  const stopProgress = (captureElapsed = false) => {
    if (captureElapsed && progressFrame) {
      elapsed = Math.min(slideDuration, Math.max(0, performance.now() - startedAt));
    }
    window.cancelAnimationFrame(progressFrame);
    progressFrame = 0;
  };

  const setProgress = (amount) => {
    progressFills.forEach((fill, index) => {
      const value = index < slideIndex ? 1 : index === slideIndex ? amount : 0;
      fill.style.transform = `scaleX(${Math.max(0, Math.min(1, value))})`;
    });
  };

  const syncPlaybackControl = () => {
    const paused = isPlaybackPaused();
    playbackButton.setAttribute('aria-pressed', String(paused));
    playbackButton.setAttribute('aria-label', paused ? 'متابعة تشغيل القصة' : 'إيقاف القصة مؤقتاً');
    playbackButton.querySelector('i').className = `bi ${paused ? 'bi-play-fill' : 'bi-pause-fill'}`;
  };

  const renderProgress = () => {
    const story = stories[storyIndex];
    const segments = story.slides.map(() => {
      const track = document.createElement('span');
      const fill = document.createElement('i');
      track.append(fill);
      return track;
    });
    progress.style.setProperty('--story-count', String(segments.length));
    progress.replaceChildren(...segments);
    progressFills = segments.map((segment) => segment.firstElementChild);
    setProgress(elapsed / slideDuration);
  };

  const markViewed = (story) => {
    viewedStories.add(story.id);
    writeStoredList(viewedStoryStorageKey, [...viewedStories]);
    triggers.forEach((trigger) => {
      trigger.classList.toggle('is-viewed', viewedStories.has(trigger.dataset.storyId));
    });
  };

  const syncState = () => {
    const story = stories[storyIndex];
    const storyPosition = `${formatNumber(storyIndex + 1)} من ${formatNumber(stories.length)}`;
    const slidePosition = `${formatNumber(slideIndex + 1)} من ${formatNumber(story.slides.length)}`;
    title.textContent = story.title;
    location.textContent = story.location;
    position.textContent = `القصة ${storyPosition} · الصورة ${slidePosition}`;
    propertyLink.href = story.href;
    previousButton.disabled = storyIndex === 0 && slideIndex === 0;
    previousButton.setAttribute('aria-label', slideIndex > 0 ? 'الصورة السابقة' : 'القصة السابقة');
    const isLastSlide = slideIndex === story.slides.length - 1;
    const isLastStory = storyIndex === stories.length - 1;
    nextButton.setAttribute('aria-label', isLastStory && isLastSlide ? 'إنهاء القصص' : isLastSlide ? 'القصة التالية' : 'الصورة التالية');
    status.textContent = `${story.title}، ${story.location}. القصة ${storyPosition}، الصورة ${slidePosition}. محتوى ممول.`;
    renderProgress();
    markViewed(story);
    syncPlaybackControl();
  };

  const preloadNext = () => {
    const story = stories[storyIndex];
    const source = story.slides[slideIndex + 1] || stories[storyIndex + 1]?.slides[0];
    if (!source) return;
    const image = new Image();
    image.decoding = 'async';
    image.src = source;
  };

  const resolveTarget = (direction) => {
    const story = stories[storyIndex];
    if (direction > 0 && slideIndex < story.slides.length - 1) {
      return { story: storyIndex, slide: slideIndex + 1, storyChanged: false };
    }
    if (direction < 0 && slideIndex > 0) {
      return { story: storyIndex, slide: slideIndex - 1, storyChanged: false };
    }
    if (direction > 0 && storyIndex < stories.length - 1) {
      return { story: storyIndex + 1, slide: 0, storyChanged: true };
    }
    if (direction < 0 && storyIndex > 0) {
      return { story: storyIndex - 1, slide: stories[storyIndex - 1].slides.length - 1, storyChanged: true };
    }
    return null;
  };

  const waitForImage = async (image) => {
    if (image.complete && image.naturalWidth > 0) return;
    const loadPromise = typeof image.decode === 'function'
      ? image.decode().catch(() => undefined)
      : new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    await Promise.race([
      loadPromise,
      new Promise((resolve) => window.setTimeout(resolve, 1600))
    ]);
  };

  const playAnimation = (element, keyframes, options) => {
    if (reducedMotion.matches || typeof element.animate !== 'function') return Promise.resolve();
    const animation = element.animate(keyframes, { ...options, fill: 'both' });
    return animation.finished.catch(() => undefined);
  };

  const runMediaTransition = async (direction, storyChanged) => {
    if (reducedMotion.matches) return;
    if (!storyChanged) {
      await Promise.all([
        playAnimation(currentImage, [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(1.025)' }
        ], { duration: 180, easing: 'ease-out' }),
        playAnimation(incomingImage, [
          { opacity: 0, transform: 'scale(.985)' },
          { opacity: 1, transform: 'scale(1)' }
        ], { duration: 180, easing: 'ease-out' })
      ]);
      return;
    }

    const inlineDirection = isRtl() ? -1 : 1;
    const travel = inlineDirection * (direction > 0 ? 1 : -1);
    await Promise.all([
      playAnimation(currentImage, [
        { opacity: 1, transform: 'translateX(0) scale(1)' },
        { opacity: .25, transform: `translateX(${-18 * travel}%) scale(.985)` }
      ], { duration: 340, easing: 'cubic-bezier(.32,.72,0,1)' }),
      playAnimation(incomingImage, [
        { opacity: .3, transform: `translateX(${28 * travel}%) scale(.985)` },
        { opacity: 1, transform: 'translateX(0) scale(1)' }
      ], { duration: 340, easing: 'cubic-bezier(.32,.72,0,1)' })
    ]);
  };

  const tick = (timestamp) => {
    progressFrame = 0;
    if (!isOpen() || isPlaybackBlocked()) return;
    elapsed = Math.min(slideDuration, Math.max(0, timestamp - startedAt));
    setProgress(elapsed / slideDuration);
    if (elapsed >= slideDuration) {
      navigate(1);
      return;
    }
    progressFrame = window.requestAnimationFrame(tick);
  };

  const startProgress = () => {
    stopProgress();
    syncPlaybackControl();
    if (!isOpen() || isPlaybackBlocked()) return;
    startedAt = performance.now() - elapsed;
    progressFrame = window.requestAnimationFrame(tick);
  };

  const transitionTo = async (target, direction) => {
    if (isTransitioning || !isOpen()) return;
    isTransitioning = true;
    stopProgress();
    elapsed = 0;
    const token = transitionToken += 1;
    const nextStory = stories[target.story];
    const nextSource = nextStory.slides[target.slide];
    incomingImage.hidden = false;
    incomingImage.src = nextSource;
    incomingImage.alt = `${nextStory.title}، الصورة ${formatNumber(target.slide + 1)} من ${formatNumber(nextStory.slides.length)}`;
    await waitForImage(incomingImage);
    if (token !== transitionToken || !isOpen()) return;
    await runMediaTransition(direction, target.storyChanged);
    if (token !== transitionToken || !isOpen()) return;

    storyIndex = target.story;
    slideIndex = target.slide;
    currentImage.src = nextSource;
    currentImage.alt = incomingImage.alt;
    cancelMediaAnimations();
    incomingImage.hidden = true;
    incomingImage.removeAttribute('src');
    incomingImage.alt = '';
    syncState();
    if (target.storyChanged && !reducedMotion.matches) {
      const travel = (isRtl() ? -1 : 1) * (direction > 0 ? 1 : -1);
      playAnimation(caption, [
        { opacity: 0, transform: `translateX(${8 * travel}%)` },
        { opacity: 1, transform: 'translateX(0)' }
      ], { duration: 220, easing: 'ease-out' });
    }
    isTransitioning = false;
    startProgress();
    preloadNext();
  };

  function navigate(direction) {
    if (isTransitioning) return;
    const target = resolveTarget(direction);
    if (!target) {
      if (direction > 0) closeMobileDialog(viewer);
      return;
    }
    transitionTo(target, direction);
  }

  const setManualPaused = (paused) => {
    if (manuallyPaused === paused) return;
    if (paused) stopProgress(true);
    manuallyPaused = paused;
    if (isPlaybackBlocked()) stopProgress();
    else startProgress();
    syncPlaybackControl();
  };

  const finishHold = (resume) => {
    if (!holdPaused) return;
    holdPaused = false;
    syncPlaybackControl();
    if (resume) startProgress();
  };

  const openViewer = async (index, returnFocusTarget) => {
    if (!stories[index]) return;
    transitionToken += 1;
    cancelMediaAnimations();
    stopProgress();
    storyIndex = index;
    slideIndex = 0;
    elapsed = 0;
    manuallyPaused = false;
    visibilityPaused = document.hidden;
    holdPaused = false;
    isTransitioning = true;
    const story = stories[storyIndex];
    currentImage.src = story.slides[0];
    currentImage.alt = `${story.title}، الصورة ${formatNumber(1)} من ${formatNumber(story.slides.length)}`;
    incomingImage.hidden = true;
    syncState();
    viewer.returnFocusTarget = returnFocusTarget;
    openMobileDialog(viewer);
    viewer.querySelector('[data-dialog-close]')?.focus({ preventScroll: true });
    const token = transitionToken;
    await waitForImage(currentImage);
    if (token !== transitionToken || !isOpen()) return;
    isTransitioning = false;
    startProgress();
    preloadNext();
  };

  triggers.forEach((trigger) => {
    trigger.classList.toggle('is-viewed', viewedStories.has(trigger.dataset.storyId));
    trigger.addEventListener('click', () => {
      const index = stories.findIndex((story) => story.id === trigger.dataset.storyId);
      openViewer(index, trigger);
    });
  });

  const viewAllStoriesButton = document.querySelector('[data-story-view-all]');
  viewAllStoriesButton?.addEventListener('click', () => openViewer(0, viewAllStoriesButton));
  playbackButton.addEventListener('click', () => setManualPaused(!manuallyPaused));
  previousButton.addEventListener('click', () => navigate(-1));
  nextButton.addEventListener('click', () => navigate(1));

  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const moveNext = event.key === (isRtl() ? 'ArrowLeft' : 'ArrowRight');
      navigate(moveNext ? 1 : -1);
    } else if (event.key === ' ' && !event.target.closest('button, a')) {
      event.preventDefault();
      setManualPaused(!manuallyPaused);
    }
  });

  swipeSurface.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.target.closest('button, a')) return;
    pointerGesture = { x: event.clientX, y: event.clientY, startedAt: performance.now() };
    if (!holdPaused) {
      stopProgress(true);
      holdPaused = true;
      syncPlaybackControl();
    }
    swipeSurface.setPointerCapture?.(event.pointerId);
  });

  swipeSurface.addEventListener('pointerup', (event) => {
    if (!pointerGesture) return;
    const deltaX = event.clientX - pointerGesture.x;
    const deltaY = event.clientY - pointerGesture.y;
    const duration = performance.now() - pointerGesture.startedAt;
    pointerGesture = null;
    const isSwipe = Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
    if (isSwipe) {
      finishHold(false);
      const moveNext = isRtl() ? deltaX > 0 : deltaX < 0;
      navigate(moveNext ? 1 : -1);
      return;
    }

    const isTap = duration < 320 && Math.abs(deltaX) < 14 && Math.abs(deltaY) < 14;
    if (isTap) {
      finishHold(false);
      const bounds = swipeSurface.getBoundingClientRect();
      const tappedInlineEnd = isRtl() ? event.clientX < bounds.left + bounds.width / 2 : event.clientX > bounds.left + bounds.width / 2;
      navigate(tappedInlineEnd ? 1 : -1);
      return;
    }
    finishHold(true);
  });

  swipeSurface.addEventListener('pointercancel', () => {
    pointerGesture = null;
    finishHold(true);
  });

  document.addEventListener('visibilitychange', () => {
    if (!isOpen()) return;
    if (document.hidden) stopProgress(true);
    visibilityPaused = document.hidden;
    if (isPlaybackBlocked()) stopProgress();
    else startProgress();
    syncPlaybackControl();
  });

  viewer.addEventListener('close', () => {
    transitionToken += 1;
    stopProgress();
    cancelMediaAnimations();
    incomingImage.hidden = true;
    incomingImage.removeAttribute('src');
    incomingImage.alt = '';
    pointerGesture = null;
    holdPaused = false;
    manuallyPaused = false;
    isTransitioning = false;
    elapsed = 0;
  });
}

initStoryViewer();
