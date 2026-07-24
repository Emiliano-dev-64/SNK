// ============================================
// Animations - Intersection Observer
// ============================================

export function initAnimations() {
  // Observe elements with animation classes
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  const animatedElements = document.querySelectorAll(
    '.fade-in-up, .fade-in, .scale-in, .slide-in-left, .slide-in-right, .video-section, .champions-preview, .world-preview, .section--ambient'
  );

  animatedElements.forEach(el => observer.observe(el));

  // Hero parallax effect
  initParallax();
}

export function initParticles() {
  const particlesContainer = document.querySelector('.hero__particles');
  if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'hero__particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${6 + Math.random() * 6}s`;
      particlesContainer.appendChild(particle);
    }
  }
}

/**
 * Observe cards/elements and add .visible when they enter viewport.
 * Reusable by any component that renders fade-in-up elements.
 */
export function observeCards(container, selector = '.fade-in-up, .champion-card, .wanted-poster') {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  container.querySelectorAll(selector).forEach(el => observer.observe(el));
  return observer;
}

function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax');
  const ambientSections = document.querySelectorAll(
    '.video-section, .champions-preview, .world-preview'
  );

  if (parallaxElements.length === 0 && ambientSections.length === 0) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.5;
      const yPos = -(scrollY * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });

    ambientSections.forEach(el => {
      const rect = el.getBoundingClientRect();
      const offset = (rect.top / window.innerHeight) * 30;
      el.style.setProperty('--ambient-offset', `${offset}px`);
    });
  }, { passive: true });
}
