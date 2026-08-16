import {
  initMobileCalendar,
  initMobileCore,
  showMobileToast,
  toIsoDate
} from '../mobile-core.js';

initMobileCore();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isRtl = () => document.documentElement.dir === 'rtl';

function initProfileMotion() {
  const stickyHeader = document.querySelector('[data-profile-sticky]');
  const hero = document.querySelector('[data-profile-hero]');

  const setStickyVisibility = (visible) => {
    if (!stickyHeader) return;
    stickyHeader.classList.toggle('is-visible', visible);
    stickyHeader.toggleAttribute('inert', !visible);
    stickyHeader.setAttribute('aria-hidden', String(!visible));
  };

  if (stickyHeader && hero && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      setStickyVisibility(!entry.isIntersecting);
    }, { rootMargin: '-72px 0px 0px', threshold: 0 });
    heroObserver.observe(hero);
  }

  const revealItems = [...document.querySelectorAll('.profile-reveal')];
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('has-profile-motion');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

function initAboutSection() {
  const toggle = document.querySelector('[data-toggle-about]');
  const more = document.querySelector('[data-about-more]');
  if (!toggle || !more) return;

  toggle.addEventListener('click', () => {
    const expanded = more.hidden;
    more.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.firstChild.textContent = expanded ? 'عرض أقل ' : 'عرض المزيد ';
    const icon = toggle.querySelector('i');
    icon?.classList.toggle('bi-chevron-left', !expanded);
    icon?.classList.toggle('bi-chevron-up', expanded);
  });
}

function initShareActions() {
  document.querySelectorAll('[data-share]').forEach((button) => {
    button.addEventListener('click', async () => {
      const shareData = {
        title: 'فيلا أماليا',
        text: 'شاهد تفاصيل فيلا أماليا في عمّان',
        url: window.location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
          return;
        }
        await navigator.clipboard.writeText(window.location.href);
        showMobileToast('تم نسخ رابط الإقامة.');
      } catch (error) {
        if (error?.name !== 'AbortError') showMobileToast('تعذرت المشاركة الآن. يمكنك نسخ الرابط من شريط العنوان.');
      }
    });
  });
}

const galleryItems = [
  {
    small: '../web/assets/images/hero-villa-640.webp',
    large: '../web/assets/images/hero-villa-1280.webp',
    title: 'الواجهة والمسبح',
    alt: 'فيلا أماليا ومسبحها المطل على الطبيعة'
  },
  {
    small: '../web/assets/images/villa-olive-640.webp',
    large: '../web/assets/images/villa-olive-1280.webp',
    title: 'الجلسة الخارجية',
    alt: 'الجلسة الخارجية المحاطة بالمساحات الخضراء'
  },
  {
    small: '../web/assets/images/villa-stone-640.webp',
    large: '../web/assets/images/villa-stone-1280.webp',
    title: 'المساحات الداخلية',
    alt: 'المساحات الداخلية ذات التشطيبات الحجرية الدافئة'
  },
  {
    small: '../web/assets/images/villa-summer-640.webp',
    large: '../web/assets/images/villa-summer-1280.webp',
    title: 'الإطلالة وقت الغروب',
    alt: 'إطلالة فيلا أماليا الهادئة وقت الغروب'
  }
];

function initGalleryViewer() {
  const dialog = document.getElementById('gallery-viewer');
  const stage = dialog?.querySelector('[data-gallery-stage]');
  const image = dialog?.querySelector('[data-gallery-image]');
  const hero = document.querySelector('[data-profile-hero]');
  const heroSurface = hero?.querySelector('[data-gallery-hero-surface]');
  const heroPicture = hero?.querySelector('[data-gallery-hero-picture]');
  const heroSource = hero?.querySelector('[data-gallery-hero-source]');
  const heroImage = hero?.querySelector('[data-gallery-hero-image]');
  const title = dialog?.querySelector('[data-gallery-title]');
  const caption = dialog?.querySelector('[data-gallery-caption]');
  const position = dialog?.querySelector('[data-gallery-position]');
  const status = dialog?.querySelector('[data-gallery-status]');
  const heroStatus = document.querySelector('[data-gallery-hero-status]');
  const heroPosition = document.querySelector('[data-gallery-hero-position]');
  const heroDots = [...document.querySelectorAll('.mobile-profile-gallery__dots i')];
  const thumbnails = [...(dialog?.querySelectorAll('[data-gallery-select]') || [])];
  if (!dialog || !stage || !image || !hero || !heroSurface || !heroPicture || !heroImage || !title || !position) return;

  let activeIndex = 0;
  let suppressHeroClick = false;

  const preloadAdjacent = () => {
    const indexes = [
      (activeIndex + 1) % galleryItems.length,
      (activeIndex - 1 + galleryItems.length) % galleryItems.length
    ];
    indexes.forEach((index) => {
      const preload = new Image();
      preload.src = galleryItems[index].large;
    });
  };

  const render = (index, { animate = true, announce = true, direction = 'next' } = {}) => {
    activeIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[activeIndex];
    image.src = item.large;
    image.srcset = `${item.small} 640w, ${item.large} 1280w`;
    image.alt = item.alt;
    heroImage.src = item.large;
    heroImage.srcset = `${item.small} 640w, ${item.large} 1280w`;
    heroImage.alt = item.alt;
    if (heroSource) heroSource.srcset = `${item.small} 640w, ${item.large} 1280w`;
    title.textContent = item.title;
    if (caption) caption.textContent = item.title;
    const positionText = `${activeIndex + 1} / ${galleryItems.length}`;
    position.textContent = positionText;
    if (heroPosition) heroPosition.textContent = positionText;
    heroSurface.setAttribute('aria-label', `عرض ${item.title}، الصورة ${activeIndex + 1} من ${galleryItems.length}، في معرض الإقامة`);
    thumbnails.forEach((thumbnail, thumbnailIndex) => {
      thumbnail.setAttribute('aria-pressed', String(thumbnailIndex === activeIndex));
    });
    heroDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('bi-circle-fill', dotIndex === activeIndex);
      dot.classList.toggle('bi-circle', dotIndex !== activeIndex);
    });
    if (animate && !reducedMotion.matches) {
      stage.classList.remove('is-moving-next', 'is-moving-previous');
      hero.classList.remove('is-moving-next', 'is-moving-previous');
      window.requestAnimationFrame(() => {
        const movementClass = direction === 'previous' ? 'is-moving-previous' : 'is-moving-next';
        stage.classList.add(movementClass);
        hero.classList.add(movementClass);
      });
    }
    if (announce && status) status.textContent = `${item.title}، الصورة ${activeIndex + 1} من ${galleryItems.length}`;
    if (announce && heroStatus && !dialog.open) heroStatus.textContent = `${item.title}، الصورة ${activeIndex + 1} من ${galleryItems.length}`;
    thumbnails[activeIndex]?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
    preloadAdjacent();
  };

  const step = (amount) => render(activeIndex + amount, { direction: amount < 0 ? 'previous' : 'next' });

  const getLogicalSwipeStep = (distance) => {
    const physicalStep = distance > 0 ? -1 : 1;
    return isRtl() ? -physicalStep : physicalStep;
  };

  const bindHorizontalSwipe = (surface, onSwipe, { ignoreButtons = false, onGestureStart, onGestureEnd } = {}) => {
    let pointer = null;

    surface.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !event.isPrimary || (ignoreButtons && event.target.closest('button'))) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      try {
        surface.setPointerCapture?.(event.pointerId);
      } catch {
        // The gesture remains usable when pointer capture is unavailable.
      }
      onGestureStart?.();
    });

    surface.addEventListener('pointerup', (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const distanceX = event.clientX - pointer.x;
      const distanceY = event.clientY - pointer.y;
      pointer = null;
      onGestureEnd?.();
      if (Math.abs(distanceX) < 44 || Math.abs(distanceX) <= Math.abs(distanceY) * 1.15) return;
      event.preventDefault();
      onSwipe(getLogicalSwipeStep(distanceX));
    });

    surface.addEventListener('pointercancel', () => {
      pointer = null;
      onGestureEnd?.();
    });
  };

  dialog.querySelector('[data-gallery-previous]')?.addEventListener('click', () => step(-1));
  dialog.querySelector('[data-gallery-next]')?.addEventListener('click', () => step(1));
  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', () => {
      const index = Number(thumbnail.dataset.gallerySelect);
      const forwardDistance = (index - activeIndex + galleryItems.length) % galleryItems.length;
      render(index, { direction: forwardDistance > galleryItems.length / 2 ? 'previous' : 'next' });
    });
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(isRtl() ? -1 : 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(isRtl() ? 1 : -1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      render(0, { direction: 'previous' });
    }
    if (event.key === 'End') {
      event.preventDefault();
      render(galleryItems.length - 1, { direction: 'next' });
    }
  });

  bindHorizontalSwipe(stage, step, { ignoreButtons: true });
  bindHorizontalSwipe(heroSurface, (amount) => {
    suppressHeroClick = true;
    window.setTimeout(() => {
      suppressHeroClick = false;
    }, 400);
    step(amount);
  }, {
    onGestureStart: () => hero.classList.add('is-dragging'),
    onGestureEnd: () => hero.classList.remove('is-dragging')
  });

  heroSurface.addEventListener('click', (event) => {
    if (!suppressHeroClick) return;
    suppressHeroClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, { capture: true });

  heroSurface.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(isRtl() ? -1 : 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(isRtl() ? 1 : -1);
    }
  });

  image.addEventListener('animationend', () => stage.classList.remove('is-moving-next', 'is-moving-previous'));
  heroPicture.addEventListener('animationend', () => hero.classList.remove('is-moving-next', 'is-moving-previous'));
  dialog.addEventListener('close', () => {
    stage.classList.remove('is-moving-next', 'is-moving-previous');
    hero.classList.remove('is-moving-next', 'is-moving-previous');
  });
  render(0, { animate: false, announce: false });
}

const leafletAsset = Object.freeze({
  source: 'assets/vendor/leaflet/leaflet.js',
  integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
});

const mapConfiguration = Object.freeze({
  latitude: 31.9594,
  longitude: 35.9141,
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  zoom: 15,
  minZoom: 11,
  maxZoom: 18
});

const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${leafletAsset.source}"]`);
    if (existing) {
      existing.addEventListener('load', () => window.L ? resolve(window.L) : reject(new Error('Leaflet did not initialize.')), { once: true });
      existing.addEventListener('error', () => reject(new Error('Leaflet failed to load.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => reject(new Error('Leaflet load timed out.')), 8000);
    script.src = leafletAsset.source;
    script.integrity = leafletAsset.integrity;
    script.crossOrigin = 'anonymous';
    script.addEventListener('load', () => {
      window.clearTimeout(timeout);
      if (window.L) resolve(window.L);
      else reject(new Error('Leaflet did not initialize.'));
    }, { once: true });
    script.addEventListener('error', () => {
      window.clearTimeout(timeout);
      reject(new Error('Leaflet failed to load.'));
    }, { once: true });
    document.head.append(script);
  });
};

function initProfileMap() {
  const root = document.querySelector('[data-profile-map]');
  const canvas = root?.querySelector('[data-live-map]');
  const fallback = root?.querySelector('[data-map-fallback]');
  const status = document.querySelector('[data-map-status]');
  if (!root || !canvas) return;

  let started = false;
  const initialize = async () => {
    if (started) return;
    started = true;
    try {
      const L = await loadLeaflet();
      const map = L.map(canvas, {
        attributionControl: true,
        keyboard: true,
        minZoom: mapConfiguration.minZoom,
        maxZoom: mapConfiguration.maxZoom,
        scrollWheelZoom: false,
        zoomControl: true
      }).setView([mapConfiguration.latitude, mapConfiguration.longitude], mapConfiguration.zoom, { animate: false });
      const icon = L.divIcon({
        className: 'mobile-profile-map-marker-shell',
        html: '<span class="mobile-profile-map-marker"><i class="bi bi-house-heart" aria-hidden="true"></i></span>',
        iconAnchor: [22, 22],
        iconSize: [44, 44]
      });
      L.marker([mapConfiguration.latitude, mapConfiguration.longitude], {
        alt: 'موقع فيلا أماليا في جبل عمّان',
        icon,
        keyboard: true,
        title: 'فيلا أماليا'
      }).addTo(map);
      const tiles = L.tileLayer(mapConfiguration.tileUrl, {
        attribution: mapConfiguration.attribution,
        maxZoom: mapConfiguration.maxZoom,
        minZoom: mapConfiguration.minZoom
      });
      let activated = false;
      const activate = () => {
        if (activated) return;
        activated = true;
        root.classList.add('is-interactive');
        fallback?.setAttribute('aria-hidden', 'true');
        if (status) status.textContent = 'تم تحميل الخريطة التفاعلية لموقع الإقامة.';
        window.requestAnimationFrame(() => map.invalidateSize({ animate: false, pan: false }));
      };
      tiles.once('load', activate);
      tiles.addTo(map);
      window.setTimeout(() => {
        if (!activated && status) status.textContent = 'تعذر تحميل مربعات الخريطة، لذلك يتم عرض الخريطة البديلة.';
      }, 8000);
    } catch {
      if (status) status.textContent = 'تعذر تحميل الخريطة التفاعلية، لذلك يتم عرض الخريطة البديلة.';
    }
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      initialize();
    }, { rootMargin: '320px 0px' });
    observer.observe(root);
  } else {
    initialize();
  }
}

function initBookingExperience() {
  const calendar = initMobileCalendar(document.querySelector('[data-calendar="profile-dates"]'), { emptyLabel: 'اختر التاريخ من التقويم' });
  const pagePeriodButtons = [...document.querySelectorAll('[data-profile-periods] [data-period]')];
  const sheetPeriodButtons = [...document.querySelectorAll('[data-sheet-periods] [data-period]')];
  const allPeriodButtons = [...pagePeriodButtons, ...sheetPeriodButtons];
  const profilePrice = document.querySelector('[data-profile-price]');
  const profileUnit = document.querySelector('[data-profile-unit]');
  const sheetPrice = document.querySelector('[data-sheet-price]');
  const sheetCurrency = document.querySelector('[data-sheet-currency]');
  const formatter = new Intl.NumberFormat(document.documentElement.lang === 'ar' ? 'ar-JO-u-nu-latn' : document.documentElement.lang || 'en', { maximumFractionDigits: 0 });
  let selectedPeriod = pagePeriodButtons.find((button) => button.classList.contains('is-selected')) || pagePeriodButtons[0];

  const updateEstimate = () => {
    if (!selectedPeriod) return;
    const dates = calendar?.getDates() || {};
    const isOvernight = selectedPeriod.dataset.period === 'overnight';
    const hasCompleteDates = Boolean(dates.start && (!isOvernight || dates.end));
    const nights = isOvernight && dates.start && dates.end
      ? Math.max(1, Math.round((dates.end - dates.start) / 86400000))
      : 1;
    const unitPrice = Number(selectedPeriod.dataset.periodPrice || 0);
    if (profilePrice) profilePrice.textContent = formatter.format(unitPrice);
    if (profileUnit) profileUnit.textContent = selectedPeriod.dataset.periodUnit || (isOvernight ? 'ليلة' : 'فترة');
    if (sheetPrice) sheetPrice.textContent = hasCompleteDates ? formatter.format(unitPrice * nights) : '—';
    if (sheetCurrency) sheetCurrency.hidden = !hasCompleteDates;
  };

  const selectPeriod = (period) => {
    const source = allPeriodButtons.find((button) => button.dataset.period === period);
    if (!source) return;
    selectedPeriod = source;
    allPeriodButtons.forEach((button) => {
      const active = button.dataset.period === period;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    calendar?.setSingleDate(period !== 'overnight');
    updateEstimate();
  };

  allPeriodButtons.forEach((button) => button.addEventListener('click', () => selectPeriod(button.dataset.period)));
  document.querySelector('[data-calendar="profile-dates"]')?.addEventListener('datechange', updateEstimate);
  selectPeriod(selectedPeriod?.dataset.period || 'overnight');

  document.querySelector('[data-profile-booking-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const dates = calendar?.getDates() || {};
    const overnight = selectedPeriod?.dataset.period === 'overnight';
    if (!dates.start || (overnight && !dates.end)) {
      showMobileToast(overnight ? 'اختر تاريخ الوصول والمغادرة أولاً.' : 'اختر تاريخ الزيارة أولاً.');
      return;
    }

    const guestPicker = document.querySelector('[data-guest-picker="profile-guests"]');
    const params = new URLSearchParams({
      period: selectedPeriod?.dataset.periodLabel || 'إقامة ليلية',
      price: `${sheetPrice?.textContent || '0'} د.أ`,
      start: toIsoDate(dates.start),
      adults: guestPicker?.querySelector('[data-guest-value="adults"]')?.value || '2',
      children: guestPicker?.querySelector('[data-guest-value="children"]')?.value || '0',
      infants: guestPicker?.querySelector('[data-guest-value="infants"]')?.value || '0'
    });
    if (dates.end && overnight) params.set('end', toIsoDate(dates.end));
    window.location.href = `04-booking-request-review.html?${params.toString()}`;
  });
}

initProfileMotion();
initAboutSection();
initShareActions();
initGalleryViewer();
initProfileMap();
initBookingExperience();
