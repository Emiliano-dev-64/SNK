// ============================================
// TV Navigation - D-Pad / Remote Control Support
// ============================================

const TV_SELECTORS = [
  'a[href]:not([tabindex="-1"])',
  'button:not([tabindex="-1"]):not([disabled])',
  'input:not([tabindex="-1"]):not([disabled])',
  'select:not([tabindex="-1"]):not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '.champion-card',
  '.shop-card',
  '.wanted-poster',
  '.galeria-card',
  '.galeria-image-card',
  '.region-champion',
  '.music-player__track',
  '.hotspot',
  '.filter-tag'
];

const FOCUSABLE_SELECTOR = TV_SELECTORS.join(', ');

function isTVBrowser() {
  const ua = (navigator.userAgent || '').toLowerCase();
  const tvKeywords = [
    'smarttv', 'smart-tv', 'web0s', 'tizen',
    'hbbtv', 'oppo', 'viera', 'netcast',
    'roku', 'firetv', 'fire tv', 'aosp',
    'apple tv', 'appletv', 'chromecast',
    'googletv', 'google tv', 'android tv'
  ];
  if (tvKeywords.some(k => ua.includes(k))) return true;
  if (navigator.userAgentData) {
    const brands = navigator.userAgentData.brands || [];
    if (brands.some(b => b.brand.toLowerCase().includes('tv'))) return true;
  }
  return false;
}

function isManualTVOverride() {
  return new URLSearchParams(window.location.search).has('tv');
}

function hasNoMouse() {
  return !window.matchMedia('(pointer: fine)').matches;
}

function isLandscapeUltra() {
  const ratio = window.screen.width / window.screen.height;
  return ratio >= 2;
}

function shouldEnableTVMode() {
  if (isManualTVOverride()) return true;
  if (isTVBrowser()) return true;
  if (hasNoMouse() && isTVBrowser()) return true;
  return false;
}

function getFocusableElements(root = document) {
  const elements = Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR));
  return elements.filter(el => {
    if (el.offsetParent === null && !el.closest('.modal-backdrop, .portrait-lightbox, .galeria-viewer')) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (parseFloat(style.opacity) === 0) return false;
    return true;
  });
}

function getRect(el) {
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    bottom: r.bottom,
    left: r.left,
    right: r.right,
    cx: r.left + r.width / 2,
    cy: r.top + r.height / 2,
    width: r.width,
    height: r.height
  };
}

function findBestElement(current, elements, direction) {
  const currentRect = getRect(current);
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const threshold = Math.max(vw, vh) * 0.5;

  let best = null;
  let bestScore = Infinity;

  for (const el of elements) {
    if (el === current) continue;
    const r = getRect(el);
    let score = Infinity;

    switch (direction) {
      case 'down': {
        if (r.cy <= currentRect.cy) continue;
        const dy = r.cy - currentRect.cy;
        const dx = Math.abs(r.cx - currentRect.cx);
        if (dy > threshold) continue;
        score = dy + dx * 1.5;
        break;
      }
      case 'up': {
        if (r.cy >= currentRect.cy) continue;
        const dy = currentRect.cy - r.cy;
        const dx = Math.abs(r.cx - currentRect.cx);
        if (dy > threshold) continue;
        score = dy + dx * 1.5;
        break;
      }
      case 'right': {
        if (r.cx <= currentRect.cx) continue;
        const dx = r.cx - currentRect.cx;
        const dy = Math.abs(r.cy - currentRect.cy);
        if (dx > threshold) continue;
        score = dx + dy * 2;
        break;
      }
      case 'left': {
        if (r.cx >= currentRect.cx) continue;
        const dx = currentRect.cx - r.cx;
        const dy = Math.abs(r.cy - currentRect.cy);
        if (dx > threshold) continue;
        score = dx + dy * 2;
        break;
      }
    }

    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }

  return best;
}

function smoothScrollIntoView(el) {
  const rect = el.getBoundingClientRect();
  const padding = 80;
  const isVisible = (
    rect.top >= padding &&
    rect.bottom <= window.innerHeight - padding &&
    rect.left >= padding &&
    rect.right <= window.innerWidth - padding
  );
  if (!isVisible) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }
}

function setupTVNavigation() {
  if (!shouldEnableTVMode()) return;

  document.body.classList.add('tv-mode');
  if (isLandscapeUltra()) {
    document.body.classList.add('landscape-ultra');
  }

  document.documentElement.style.scrollBehavior = 'smooth';

  document.addEventListener('keydown', (e) => {
    const key = e.key;
    const isDpad = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
    const isAction = ['Enter', ' '].includes(key);
    const isBack = ['Escape', 'Backspace'].includes(key);

    if (!isDpad && !isAction && !isBack) return;

    if (isAction) {
      const active = document.activeElement;
      if (active && (active.tagName === 'A' || active.tagName === 'BUTTON')) {
        return;
      }
    }

    if (isBack) {
      handleTVBack(e);
      return;
    }

    if (!isDpad) return;
    e.preventDefault();

    const active = document.activeElement;
    if (!active || active === document.body) {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
        smoothScrollIntoView(focusable[0]);
      }
      return;
    }

    if (active.classList.contains('hotspot')) {
      return;
    }

    const direction = key.replace('Arrow', '').toLowerCase();
    const focusable = getFocusableElements();
    const best = findBestElement(active, focusable, direction);

    if (best) {
      best.focus();
      smoothScrollIntoView(best);
    }
  }, { capture: true });

  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (el && el.closest) {
      smoothScrollIntoView(el);
    }
  });

  setupModalFocusTrapping();
  setupBackButton();
  addFocusScrollHint();
}

function handleTVBack(e) {
  const galeriaViewer = document.querySelector('.galeria-viewer.active');
  if (galeriaViewer) {
    e.preventDefault();
    galeriaViewer.querySelector('.galeria-viewer__close')?.click();
    return;
  }

  const lightbox = document.querySelector('.portrait-lightbox.active, .lightbox.active');
  if (lightbox) {
    e.preventDefault();
    lightbox.querySelector('.portrait-lightbox__close, .lightbox__close')?.click();
    return;
  }

  const modal = document.querySelector('.modal-backdrop.active');
  if (modal) {
    e.preventDefault();
    modal.querySelector('.modal__close')?.click();
    return;
  }

  const mobileMenu = document.querySelector('.navbar__mobile-menu.active');
  if (mobileMenu) {
    e.preventDefault();
    document.querySelector('.navbar__hamburger')?.click();
    return;
  }

  const regionPanel = document.querySelector('.region-panel.active');
  if (regionPanel) {
    e.preventDefault();
    regionPanel.querySelector('.region-panel__close')?.click();
    return;
  }

  const musicExpanded = document.querySelector('.music-player.expanded');
  if (musicExpanded) {
    e.preventDefault();
    musicExpanded.querySelector('.music-player__close')?.click();
    return;
  }
}

function setupModalFocusTrapping() {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        const modal = node.closest('.modal-backdrop, .portrait-lightbox, .galeria-viewer');
        if (!modal) continue;
        trapFocusInModal(modal);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function trapFocusInModal(modal) {
  const handler = (e) => {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements(modal);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  modal.addEventListener('keydown', handler);

  setTimeout(() => {
    const focusable = getFocusableElements(modal);
    if (focusable.length > 0) focusable[0].focus();
  }, 100);

  const closeObserver = new MutationObserver(() => {
    if (modal.offsetParent === null || !modal.isConnected) {
      closeObserver.disconnect();
      modal.removeEventListener('keydown', handler);
    }
  });
  closeObserver.observe(modal, { attributes: true, attributeFilter: ['class'] });
}

function setupBackButton() {
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
        smoothScrollIntoView(focusable[0]);
      }
    }, 100);
  });
}

function addFocusScrollHint() {
  const hint = document.createElement('div');
  hint.className = 'tv-focus-scroll-hint';
  hint.innerHTML = 'Use las flechas para navegar · Enter para seleccionar · Escape para volver';
  document.body.appendChild(hint);

  let hideTimer;
  let shown = false;

  function showHint() {
    if (shown) return;
    shown = true;
    hint.classList.add('visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      hint.classList.remove('visible');
      shown = false;
    }, 4000);
  }

  document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      showHint();
    }
  }, { once: true });
}

export { setupTVNavigation, isTVBrowser, isManualTVOverride };
