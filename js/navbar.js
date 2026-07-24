// ============================================
// Navbar Component
// ============================================

export function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.querySelector('.navbar__mobile-menu');
  
  if (!navbar || navbar._initialized) return;
  navbar._initialized = true;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('.navbar__mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    mobileMenu.querySelectorAll('.navbar__mobile-submenu-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const submenu = toggle.closest('.navbar__mobile-submenu');
        submenu.classList.toggle('open');
      });
    });
  }

  updateNavbarActiveLinks();
}

export function updateNavbarActiveLinks() {
  document.querySelectorAll('.navbar__link, .navbar__mobile-link, .navbar__mobile-submenu-link').forEach(link => {
    link.classList.remove('active');
  });

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentSearch = window.location.search;

  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('?')[0];
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  document.querySelectorAll('.navbar__mobile-link, .navbar__mobile-submenu-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('?')[0];
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });
}
