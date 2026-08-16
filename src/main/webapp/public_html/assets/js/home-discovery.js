(() => {
  'use strict';

  const form = document.querySelector('[data-search-form]');
  const toast = document.querySelector('[data-toast]');
  const popovers = [...document.querySelectorAll('.search-popover')];
  let guestCount = 2;
  let toastTimer;

  const showToast = (message) => {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  };

  const closePopovers = (exceptId = '') => {
    popovers.forEach((popover) => {
      if (popover.id !== exceptId) popover.hidden = true;
    });
  };

  document.querySelectorAll('[data-popover-target]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.dataset.popoverTarget;
      const target = document.getElementById(targetId);
      const shouldOpen = target.hidden;
      closePopovers(targetId);
      target.hidden = !shouldOpen;
      if (shouldOpen) target.querySelector('input')?.focus();
    });
  });

  document.addEventListener('click', (event) => {
    if (!form.contains(event.target)) closePopovers();
  });

  document.querySelectorAll('[data-booking-type]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-booking-type]').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
    });
  });

  document.querySelectorAll('[data-destination]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector('[data-destination-value]').textContent = button.dataset.destination;
      document.getElementById('destination-input').value = button.dataset.destination;
      closePopovers();
    });
  });

  document.querySelector('[data-confirm-dates]').addEventListener('click', () => {
    const arrival = document.getElementById('arrival-date').value;
    const departure = document.getElementById('departure-date').value;
    if (!arrival || !departure) {
      showToast('يرجى اختيار تاريخ الوصول والمغادرة');
      return;
    }
    document.querySelector('[data-date-value]').textContent = `${arrival} - ${departure}`;
    closePopovers();
  });

  document.querySelectorAll('[data-guest-action]').forEach((button) => {
    button.addEventListener('click', () => {
      guestCount = button.dataset.guestAction === 'increase'
        ? Math.min(guestCount + 1, 20)
        : Math.max(guestCount - 1, 1);
      document.querySelector('[data-guest-count]').textContent = guestCount;
      document.querySelector('[data-guest-popover-count]').textContent = guestCount;
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedType = document.querySelector('[data-booking-type].selected').dataset.bookingType;
    showToast(`جاري البحث عن ${selectedType} تناسب ${guestCount} ضيوف`);
    document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.querySelectorAll('.favorite-button').forEach((button) => {
    button.addEventListener('click', () => {
      const active = button.classList.toggle('active');
      button.querySelector('i').className = `bi ${active ? 'bi-heart-fill' : 'bi-heart'}`;
      showToast(active ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة');
    });
  });

  document.querySelectorAll('[data-carousel-next], [data-carousel-previous]').forEach((button) => {
    button.addEventListener('click', () => {
      const trackId = button.dataset.carouselNext || button.dataset.carouselPrevious;
      const direction = button.hasAttribute('data-carousel-next') ? -1 : 1;
      document.getElementById(trackId).scrollBy({ left: direction * 360, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.city-card').forEach((button) => {
    button.addEventListener('click', () => {
      const city = button.textContent.trim();
      document.querySelector('[data-destination-value]').textContent = city;
      showToast(`تم اختيار ${city}`);
      window.scrollTo({ top: 250, behavior: 'smooth' });
    });
  });

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('main-navigation');
  menuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  navigation.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });

  document.querySelector('[data-login-button]').addEventListener('click', () => showToast('ستتوفر نافذة تسجيل الدخول في شاشة مستقلة'));
  document.querySelector('[data-favorites-button]').addEventListener('click', () => showToast('يمكنك حفظ الإقامات المفضلة من البطاقات'));
})();
