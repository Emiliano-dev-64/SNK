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
    '.fade-in-up, .fade-in, .scale-in, .slide-in-left, .slide-in-right'
  );

  animatedElements.forEach(el => observer.observe(el));

  // Hero parallax effect
  initParallax();

  // Navbar scroll effect
  initScrollEffects();
}

function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax');
  
  if (parallaxElements.length === 0) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.5;
      const yPos = -(scrollY * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  }, { passive: true });
}

function initScrollEffects() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScrollY = 0;
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Add/remove scrolled class
    if (currentScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
}

// Stagger animation for grid items
export function staggerGridItems(container, delay = 100) {
  const items = container.querySelectorAll('.champion-card, .shop-card, .location-card');
  
  items.forEach((item, index) => {
    item.style.transitionDelay = `${index * delay}ms`;
  });
}
