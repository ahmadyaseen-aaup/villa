import {
  closeMobileDialog,
  formatArabicDate,
  initMobileCore,
  showMobileToast
} from '../mobile-core.js';

initMobileCore();

const params = new URLSearchParams(window.location.search);
const destination = params.get('destination')?.trim();
const destinationTarget = document.querySelector('[data-results-destination]');
if (destination && destinationTarget) destinationTarget.textContent = destination.slice(0, 60);

const parseDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

const start = parseDate(params.get('start'));
const end = parseDate(params.get('end'));
const datesTarget = document.querySelector('[data-results-dates]');
if (start && datesTarget) datesTarget.textContent = end ? `${formatArabicDate(start)} — ${formatArabicDate(end)}` : formatArabicDate(start);
else if (datesTarget) datesTarget.textContent = 'أضف تواريخ اختيارية';

const resultsMap = document.querySelector('.mobile-results-map');
const liveMapElement = document.querySelector('[data-live-map]');
const mapStatus = document.querySelector('[data-map-status]');
const markers = [...document.querySelectorAll('[data-marker]')];
const results = [...document.querySelectorAll('[data-result]')];
const resultsSheet = document.querySelector('.mobile-results-sheet');
const resultsContainer = document.querySelector('[data-results-container]');
const panelResizer = document.querySelector('[data-results-resizer]');
const panelStatus = document.querySelector('[data-results-panel-status]');
const collapseButton = document.querySelector('[data-collapse-results]');
const viewButtons = [...document.querySelectorAll('[data-results-view]')];
const viewStatus = document.querySelector('[data-results-view-status]');
const viewStorageKey = 'customer-mobile-results-view';
const supportedViews = new Set(['list', 'grid']);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const panelStates = Object.freeze({
  map: { cards: 18, text: 'الخريطة موسعة وقائمة النتائج مصغرة' },
  balanced: { cards: 50, text: 'الخريطة وقائمة النتائج متوازنتان' },
  results: { cards: 70, text: 'قائمة النتائج موسعة والخريطة مصغرة' }
});
const orderedPanelStates = ['map', 'balanced', 'results'];

const leafletAsset = Object.freeze({
  source: 'assets/vendor/leaflet/leaflet.js',
  integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
});
const mapConfiguration = Object.freeze({
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  initialZoom: 10,
  minZoom: 7,
  maxZoom: 18
});

let activeResultId = results.find((result) => result.classList.contains('is-active'))?.dataset.result || results[0]?.dataset.result;
let currentPanelState = 'results';
let dragSession = null;
let leafletMap = null;
let mapMovementTimer = 0;
let mapResizeFrame = 0;
let viewportResizeTimer = 0;
const liveMarkers = new Map();

const readStoredView = () => {
  try {
    const view = window.localStorage.getItem(viewStorageKey);
    return supportedViews.has(view) ? view : 'list';
  } catch {
    return 'list';
  }
};

const writeStoredView = (view) => {
  try {
    window.localStorage.setItem(viewStorageKey, view);
  } catch {
    // Layout preference persistence is optional when storage is unavailable.
  }
};

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

const panelSizeFromTop = (top) => {
  const mapHeight = resultsMap?.clientHeight || 1;
  return 100 - ((top / mapHeight) * 100);
};

const panelTopFromSize = (size) => {
  const mapHeight = resultsMap?.clientHeight || 1;
  return mapHeight * (1 - (size / 100));
};

const updatePanelAccessibility = (size, text) => {
  const roundedSize = Math.round(size);
  panelResizer?.setAttribute('aria-valuenow', String(roundedSize));
  panelResizer?.setAttribute('aria-valuetext', text || `قائمة النتائج ${roundedSize}٪`);
};

const revealLiveMarker = (resultId, { animate = true } = {}) => {
  if (!leafletMap || !resultsMap || !resultsSheet) return;
  const marker = liveMarkers.get(resultId);
  if (!marker) return;
  const mapWidth = resultsMap.clientWidth;
  const mapHeight = resultsMap.clientHeight;
  const sheetTop = resultsSheet.offsetTop;
  const markerPoint = leafletMap.latLngToContainerPoint(marker.getLatLng());
  const targetX = mapWidth / 2;
  const targetY = clamp(sheetTop - 10, 170, Math.min(350, mapHeight - 60));
  const offsetX = markerPoint.x - targetX;
  const offsetY = markerPoint.y - targetY;
  if (Math.abs(offsetX) < 1 && Math.abs(offsetY) < 1) return;
  leafletMap.panBy([offsetX, offsetY], {
    animate: animate && !reducedMotion.matches,
    duration: .28
  });
};

const scheduleMapResize = () => {
  if (!leafletMap || mapResizeFrame) return;
  mapResizeFrame = window.requestAnimationFrame(() => {
    mapResizeFrame = 0;
    leafletMap.invalidateSize({ animate: false, pan: false });
  });
};

const setPanelState = (state, { announce = true, revealMarker = true } = {}) => {
  const definition = panelStates[state];
  if (!definition || !resultsMap || !resultsSheet) return;
  currentPanelState = state;
  resultsMap.style.setProperty('--results-sheet-top', `${100 - definition.cards}%`);
  resultsSheet.dataset.panelState = state;
  updatePanelAccessibility(definition.cards, definition.text);
  if (collapseButton) {
    collapseButton.setAttribute('aria-label', state === 'map' ? 'توسيع قائمة النتائج' : 'توسيع الخريطة');
  }
  if (announce && panelStatus) panelStatus.textContent = definition.text;
  scheduleMapResize();
  if (revealMarker && activeResultId) {
    window.setTimeout(() => revealLiveMarker(activeResultId), reducedMotion.matches ? 0 : 270);
  }
};

const setPanelTopDuringDrag = (top) => {
  if (!resultsMap) return;
  const minimumTop = panelTopFromSize(panelStates.results.cards);
  const maximumTop = panelTopFromSize(panelStates.map.cards);
  const clampedTop = clamp(top, minimumTop, maximumTop);
  resultsMap.style.setProperty('--results-sheet-top', `${clampedTop}px`);
  updatePanelAccessibility(panelSizeFromTop(clampedTop));
  scheduleMapResize();
};

const closestPanelState = (top, velocity = 0) => {
  const projectedTop = top + clamp(velocity * 140, -90, 90);
  const projectedSize = panelSizeFromTop(projectedTop);
  return orderedPanelStates.reduce((closest, state) => {
    const distance = Math.abs(panelStates[state].cards - projectedSize);
    return distance < closest.distance ? { state, distance } : closest;
  }, { state: currentPanelState, distance: Number.POSITIVE_INFINITY }).state;
};

const selectResult = (resultId, { scroll = false, panMap = false } = {}) => {
  const result = results.find((card) => card.dataset.result === resultId);
  if (!result) return false;
  activeResultId = resultId;
  results.forEach((card) => card.classList.toggle('is-active', card === result));
  markers.forEach((marker) => marker.classList.toggle('is-active', marker.dataset.marker === resultId));
  liveMarkers.forEach((marker, markerId) => {
    marker.getElement()?.classList.toggle('is-active', markerId === resultId);
  });
  if (scroll) {
    window.requestAnimationFrame(() => {
      result.scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    });
  }
  if (panMap) revealLiveMarker(resultId);
  return true;
};

const setResultsView = (view, { announce = true, persist = true, animate = true } = {}) => {
  if (!resultsContainer || !supportedViews.has(view)) return;
  const changed = resultsContainer.dataset.view !== view;
  if (changed && animate && !reducedMotion.matches) resultsContainer.classList.add('is-view-changing');
  resultsContainer.dataset.view = view;
  viewButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.resultsView === view));
  });
  if (persist) writeStoredView(view);
  if (announce && viewStatus) {
    viewStatus.textContent = view === 'grid' ? 'تم عرض النتائج كشبكة من عمودين.' : 'تم عرض النتائج كقائمة تفصيلية.';
  }
  if (changed) {
    window.requestAnimationFrame(() => {
      const activeResult = results.find((result) => result.dataset.result === activeResultId);
      activeResult?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      window.requestAnimationFrame(() => resultsContainer.classList.remove('is-view-changing'));
    });
  }
};

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
})[character]);

const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
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

const initializeInteractiveMap = async () => {
  if (!liveMapElement || !resultsMap || markers.length === 0) return;
  try {
    const L = await loadLeaflet();
    leafletMap = L.map(liveMapElement, {
      attributionControl: true,
      keyboard: true,
      minZoom: mapConfiguration.minZoom,
      maxZoom: mapConfiguration.maxZoom,
      preferCanvas: true,
      scrollWheelZoom: false,
      zoomControl: false
    });

    const tileLayer = L.tileLayer(mapConfiguration.tileUrl, {
      attribution: mapConfiguration.attribution,
      maxZoom: mapConfiguration.maxZoom,
      minZoom: mapConfiguration.minZoom
    });

    markers.forEach((fallbackMarker) => {
      const latitude = Number(fallbackMarker.dataset.lat);
      const longitude = Number(fallbackMarker.dataset.lng);
      const resultId = fallbackMarker.dataset.marker;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !resultId) return;
      const label = fallbackMarker.getAttribute('aria-label') || fallbackMarker.textContent.trim();
      const icon = L.divIcon({
        className: 'mobile-map-price-marker-shell',
        html: `<span class="mobile-map-price-marker">${escapeHtml(fallbackMarker.textContent.trim())}</span>`,
        iconAnchor: [34, 47],
        iconSize: [68, 47]
      });
      const liveMarker = L.marker([latitude, longitude], {
        alt: label,
        icon,
        keyboard: true,
        riseOnHover: true,
        title: label
      }).addTo(leafletMap);
      liveMarker.on('click', () => selectResult(resultId, { scroll: true }));
      liveMarker.on('add', () => {
        const element = liveMarker.getElement();
        if (!element) return;
        element.dataset.liveMarker = resultId;
        element.setAttribute('aria-label', label);
        element.setAttribute('role', 'button');
        element.classList.toggle('is-active', resultId === activeResultId);
        element.addEventListener('keydown', (event) => {
          if (event.key !== ' ' && event.key !== 'Enter') return;
          event.preventDefault();
          selectResult(resultId, { scroll: true });
        });
      });
      liveMarkers.set(resultId, liveMarker);
    });

    const activeMarker = liveMarkers.get(activeResultId) || liveMarkers.values().next().value;
    leafletMap.setView(activeMarker?.getLatLng() || [31.9539, 35.9106], mapConfiguration.initialZoom, { animate: false });

    let activated = false;
    const activateMap = () => {
      if (activated) return;
      activated = true;
      resultsMap.classList.add('is-interactive-map');
      document.querySelector('[data-map-fallback]')?.setAttribute('aria-hidden', 'true');
      markers.forEach((marker) => {
        marker.hidden = true;
        marker.setAttribute('aria-hidden', 'true');
        marker.tabIndex = -1;
      });
      if (mapStatus) mapStatus.textContent = 'تم تحميل الخريطة التفاعلية.';
      window.requestAnimationFrame(() => {
        scheduleMapResize();
        if (activeResultId) revealLiveMarker(activeResultId, { animate: false });
      });
    };
    tileLayer.once('load', activateMap);
    tileLayer.addTo(leafletMap);
    window.setTimeout(() => {
      if (!activated && mapStatus) mapStatus.textContent = 'تعذر تحميل الخريطة التفاعلية، يتم عرض الخريطة البديلة.';
    }, 8000);

    leafletMap.on('moveend', () => {
      window.clearTimeout(mapMovementTimer);
      mapMovementTimer = window.setTimeout(() => {
        if (mapStatus) mapStatus.textContent = 'تم تحديث نطاق الخريطة المعروض.';
      }, 350);
    });
  } catch {
    if (mapStatus) mapStatus.textContent = 'تعذر تحميل الخريطة التفاعلية، يتم عرض الخريطة البديلة.';
  }
};

markers.forEach((marker) => {
  marker.addEventListener('click', () => {
    if (!selectResult(marker.dataset.marker, { scroll: true })) {
      showMobileToast('سنعرض تفاصيل هذه الإقامة عند تحميل نتيجتها.');
    }
  });
});

results.forEach((result) => {
  result.addEventListener('pointerdown', () => selectResult(result.dataset.result, { panMap: true }));
  result.addEventListener('focusin', () => selectResult(result.dataset.result, { panMap: true }));
});

viewButtons.forEach((button) => {
  button.addEventListener('click', () => setResultsView(button.dataset.resultsView));
});

panelResizer?.addEventListener('pointerdown', (event) => {
  if (!resultsMap || !resultsSheet || event.button !== 0 || !event.isPrimary) return;
  const now = performance.now();
  dragSession = {
    currentTop: resultsSheet.offsetTop,
    lastTime: now,
    lastY: event.clientY,
    pointerId: event.pointerId,
    startTop: resultsSheet.offsetTop,
    startY: event.clientY,
    velocity: 0
  };
  try {
    panelResizer.setPointerCapture(event.pointerId);
  } catch {
    // Pointer capture may be unavailable in older embedded web views.
  }
  resultsMap.classList.add('is-panel-dragging');
  event.preventDefault();
});

panelResizer?.addEventListener('pointermove', (event) => {
  if (!dragSession || event.pointerId !== dragSession.pointerId) return;
  const now = performance.now();
  const elapsed = Math.max(1, now - dragSession.lastTime);
  dragSession.velocity = (event.clientY - dragSession.lastY) / elapsed;
  dragSession.lastY = event.clientY;
  dragSession.lastTime = now;
  dragSession.currentTop = dragSession.startTop + (event.clientY - dragSession.startY);
  setPanelTopDuringDrag(dragSession.currentTop);
  event.preventDefault();
});

const finishPanelDrag = (event) => {
  if (!dragSession || event.pointerId !== dragSession.pointerId) return;
  const targetState = closestPanelState(dragSession.currentTop, dragSession.velocity);
  if (panelResizer?.hasPointerCapture(event.pointerId)) panelResizer.releasePointerCapture(event.pointerId);
  dragSession = null;
  resultsMap?.classList.remove('is-panel-dragging');
  setPanelState(targetState);
};

panelResizer?.addEventListener('pointerup', finishPanelDrag);
panelResizer?.addEventListener('pointercancel', finishPanelDrag);

panelResizer?.addEventListener('keydown', (event) => {
  const currentIndex = orderedPanelStates.indexOf(currentPanelState);
  let targetState = null;
  if (event.key === 'ArrowUp') targetState = orderedPanelStates[Math.min(currentIndex + 1, orderedPanelStates.length - 1)];
  else if (event.key === 'ArrowDown') targetState = orderedPanelStates[Math.max(currentIndex - 1, 0)];
  else if (event.key === 'PageUp' || event.key === 'End') targetState = 'results';
  else if (event.key === 'PageDown' || event.key === 'Home') targetState = 'map';
  if (!targetState) return;
  event.preventDefault();
  setPanelState(targetState);
});

collapseButton?.addEventListener('click', () => {
  setPanelState(currentPanelState === 'map' ? 'results' : 'map');
});

document.querySelector('[data-locate]')?.addEventListener('click', () => {
  showMobileToast('سنطلب إذن الموقع عند ربط الخريطة بخدمة تحديد الموقع.');
});

document.querySelectorAll('[data-filter-group] button').forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.closest('[data-filter-group]');
    group?.querySelectorAll('button').forEach((item) => item.setAttribute('aria-selected', String(item === button)));
  });
});

document.querySelectorAll('[data-apply-filters]').forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = button.closest('dialog');
    const trigger = dialog ? document.querySelector(`[data-dialog-open="${dialog.id}"]`) : null;
    trigger?.classList.add('is-active');
    closeMobileDialog(dialog);
    showMobileToast('تم تطبيق المرشحات على النتائج المعروضة.');
  });
});

window.addEventListener('resize', () => {
  window.clearTimeout(viewportResizeTimer);
  viewportResizeTimer = window.setTimeout(() => {
    scheduleMapResize();
    if (activeResultId) revealLiveMarker(activeResultId, { animate: false });
  }, 80);
}, { passive: true });

setPanelState('results', { announce: false, revealMarker: false });
setResultsView(readStoredView(), { announce: false, persist: false, animate: false });
if (activeResultId) selectResult(activeResultId);
initializeInteractiveMap();
