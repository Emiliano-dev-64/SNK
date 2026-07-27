// ============================================
// SPA Router - Client-side navigation
// ============================================

export class Router {
  constructor(onNavigate) {
    this.onNavigate = onNavigate || (() => {});
    this.contentEl = document.querySelector('#main-content');
    this.isNavigating = false;
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      if (this.shouldSkip(link, e)) return;

      e.preventDefault();
      const url = new URL(link.href);
      this.navigate(url.pathname + url.search + url.hash);
    });

    window.addEventListener('popstate', () => {
      this.loadPage(window.location.pathname + window.location.search, false);
    });

    document.addEventListener('spa:navigate', (e) => {
      this.navigate(e.detail.url);
    });
  }

  handleInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    const route = params.get('_r');
    if (route) {
      const target = decodeURIComponent(route);
      history.replaceState({}, '', target);
      this.loadPage(target, false);
    }
  }

  shouldSkip(link, e) {
    const href = link.getAttribute('href');
    if (!href) return true;
    if (href.startsWith('#') || href.startsWith('javascript:')) return true;
    if (link.target === '_blank') return true;
    if (link.hasAttribute('download')) return true;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return true;
    if (link.dataset.spa === 'false') return true;

    try {
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return true;
    } catch {
      return true;
    }

    return false;
  }

  navigate(url) {
    if (this.isNavigating) return;
    if (url === window.location.pathname + window.location.search) return;
    this.loadPage(url, true);
  }

  async loadPage(url, pushState) {
    this.isNavigating = true;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const newMain = doc.querySelector('#main-content');
      const newPage = doc.body.dataset.page;
      const newBodyClass = doc.body.className || '';

      if (!newMain) throw new Error('No main content found');

      this.cleanup();

      const tvClasses = document.body.classList.contains('tv-mode')
        ? 'tv-mode' + (document.body.classList.contains('landscape-ultra') ? ' landscape-ultra' : '')
        : '';

      this.contentEl.innerHTML = newMain.innerHTML;
      this.contentEl.className = newMain.className;
      document.body.dataset.page = newPage;
      document.body.className = newBodyClass;

      if (tvClasses) {
        tvClasses.split(' ').forEach(c => { if (c) document.body.classList.add(c); });
      }

      document.title = doc.title;

      if (pushState) {
        history.pushState({}, '', url);
      }

      window.scrollTo(0, 0);
      document.body.style.overflow = '';

      this.onNavigate(newPage);

      if (document.body.classList.contains('tv-mode')) {
        setTimeout(() => {
          const first = document.querySelector(
            'a[href]:not([tabindex="-1"]), button:not([tabindex="-1"]):not([disabled]), [tabindex]:not([tabindex="-1"]), .champion-card'
          );
          if (first) {
            first.focus();
            first.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }

    } catch (err) {
      console.error('Router:', err);
      window.location.href = url;
    } finally {
      this.isNavigating = false;
    }
  }

  cleanup() {
    document.querySelectorAll('.lightbox, .portrait-lightbox, .galeria-viewer, .modal-backdrop').forEach(el => el.remove());
    document.body.style.overflow = '';
  }
}
