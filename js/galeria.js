// ============================================
// Galería - Categories & Image Viewer
// ============================================

class Galeria {
  constructor() {
    this.data = null;
    this.viewer = null;
    this.currentImages = [];
    this.currentIndex = 0;

    const grid = document.getElementById('galeriaGrid');
    if (grid) {
      this.initCategories();
    }

    const imagesGrid = document.getElementById('galeriaImagesGrid');
    if (imagesGrid) {
      this.initCategoryPage();
    }
  }

  async loadData() {
    try {
      const response = await fetch('data/galeria.json');
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.error('Error loading galeria data:', error);
      return null;
    }
  }

  // ---- Categories Page (galeria.html) ----
  async initCategories() {
    await this.loadData();
    if (!this.data) return;

    const grid = document.getElementById('galeriaGrid');
    grid.innerHTML = this.data.categories.map((cat, i) => {
      const isEmpty = cat.images.length === 0;
      const stagger = i < 4 ? ` stagger-${i}` : '';
      return `
        <a href="galeria-categoria.html?cat=${cat.id}" class="galeria-card fade-in-up${stagger}${isEmpty ? ' galeria-card--empty' : ''}">
          ${cat.image
            ? `<img src="${cat.image}" alt="${cat.name}" class="galeria-card__image" loading="lazy">`
            : `<div class="galeria-card__image galeria-card__image--placeholder"></div>`
          }
          <div class="galeria-card__info">
            <div class="galeria-card__name">${cat.name}</div>
            <div class="galeria-card__description">${cat.description}</div>
            <div class="galeria-card__count">${cat.images.length} imagen${cat.images.length !== 1 ? 'es' : ''}</div>
          </div>
        </a>
      `;
    }).join('');

    // Re-trigger animations
    requestAnimationFrame(() => {
      grid.querySelectorAll('.fade-in-up').forEach(el => el.classList.add('visible'));
    });
  }

  // ---- Category Page (galeria-categoria.html) ----
  async initCategoryPage() {
    await this.loadData();
    if (!this.data) return;

    const params = new URLSearchParams(window.location.search);
    const catId = params.get('cat');

    if (!catId) {
      window.location.href = 'galeria.html';
      return;
    }

    const category = this.data.categories.find(c => c.id === catId);
    if (!category) {
      window.location.href = 'galeria.html';
      return;
    }

    // Update page title
    document.title = `${category.name} - Galería - One Pipis`;

    // Set header
    document.getElementById('categoryTitle').textContent = category.name;
    document.getElementById('categoryDescription').textContent = category.description;

    const grid = document.getElementById('galeriaImagesGrid');
    const empty = document.getElementById('galeriaEmpty');
    const count = document.getElementById('galeriaCount');

    if (category.images.length === 0) {
      grid.style.display = 'none';
      count.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    count.textContent = `${category.images.length} imagen${category.images.length !== 1 ? 'es' : ''}`;

    this.currentImages = category.images;

    grid.innerHTML = category.images.map((img, i) => `
      <div class="galeria-image-card fade-in-up" data-index="${i}">
        <img src="${img.src}" alt="${img.name}" class="galeria-image-card__img" loading="lazy">
        <div class="galeria-image-card__overlay">
          <div class="galeria-image-card__name">${img.name}</div>
        </div>
      </div>
    `).join('');

    // Bind click events
    grid.querySelectorAll('.galeria-image-card').forEach(card => {
      card.addEventListener('click', () => {
        this.openViewer(parseInt(card.dataset.index));
      });
    });

    // Create viewer
    this.createViewer();

    // Trigger animations
    requestAnimationFrame(() => {
      grid.querySelectorAll('.fade-in-up').forEach(el => el.classList.add('visible'));
    });
  }

  // ---- Fullscreen Viewer ----
  createViewer() {
    this.viewer = document.createElement('div');
    this.viewer.className = 'galeria-viewer';
    this.viewer.innerHTML = `
      <button class="galeria-viewer__close" aria-label="Cerrar">&times;</button>
      <button class="galeria-viewer__nav galeria-viewer__nav--prev" aria-label="Anterior">‹</button>
      <img class="galeria-viewer__img" src="" alt="">
      <button class="galeria-viewer__nav galeria-viewer__nav--next" aria-label="Siguiente">›</button>
      <div class="galeria-viewer__name"></div>
    `;
    document.body.appendChild(this.viewer);

    // Events
    this.viewer.querySelector('.galeria-viewer__close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeViewer();
    });

    this.viewer.addEventListener('click', (e) => {
      if (e.target === this.viewer) this.closeViewer();
    });

    this.viewer.querySelector('.galeria-viewer__nav--prev').addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigateViewer(-1);
    });

    this.viewer.querySelector('.galeria-viewer__nav--next').addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigateViewer(1);
    });

    document.addEventListener('keydown', (e) => {
      if (!this.viewer.classList.contains('active')) return;
      if (e.key === 'Escape') this.closeViewer();
      if (e.key === 'ArrowLeft') this.navigateViewer(-1);
      if (e.key === 'ArrowRight') this.navigateViewer(1);
    });
  }

  openViewer(index) {
    if (!this.viewer || this.currentImages.length === 0) return;

    this.currentIndex = index;
    const img = this.currentImages[index];

    this.viewer.querySelector('.galeria-viewer__img').src = img.src;
    this.viewer.querySelector('.galeria-viewer__img').alt = img.name;
    this.viewer.querySelector('.galeria-viewer__name').textContent = img.name;

    // Show/hide nav buttons
    const prevBtn = this.viewer.querySelector('.galeria-viewer__nav--prev');
    const nextBtn = this.viewer.querySelector('.galeria-viewer__nav--next');
    prevBtn.style.display = this.currentImages.length > 1 ? 'flex' : 'none';
    nextBtn.style.display = this.currentImages.length > 1 ? 'flex' : 'none';

    this.viewer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeViewer() {
    if (!this.viewer) return;
    this.viewer.classList.remove('active');
    document.body.style.overflow = '';
  }

  navigateViewer(dir) {
    this.currentIndex = (this.currentIndex + dir + this.currentImages.length) % this.currentImages.length;
    const img = this.currentImages[this.currentIndex];

    this.viewer.querySelector('.galeria-viewer__img').src = img.src;
    this.viewer.querySelector('.galeria-viewer__img').alt = img.name;
    this.viewer.querySelector('.galeria-viewer__name').textContent = img.name;
  }
}

// Initialize
new Galeria();
