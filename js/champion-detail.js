// ============================================
// Champion Detail Page
// ============================================

import { getUrlParam } from './utils.js';

export class ChampionDetail {
  constructor() {
    this.championId = getUrlParam('id');
    this.data = null;

    if (!this.championId) return;
    this.init();
  }

  async init() {
    try {
      const response = await fetch('data/champions.json');
      this.data = await response.json();
      this.champion = this.data.champions.find(c => c.id === this.championId);
      
      if (!this.champion) {
        console.error('Champion not found:', this.championId);
        return;
      }

      this.render();
      this.renderNavigation();
    } catch (error) {
      console.error('Error loading champion data:', error);
    }
  }

  render() {
    const container = document.querySelector('.champion-detail');
    if (!container || !this.champion) return;

    // Set page title
    document.title = `${this.champion.name} - One Pipis`;

    // Render hero
    const hero = container.querySelector('.champion-hero');
    if (hero) {
      hero.querySelector('.champion-hero__bg').src = this.champion.background;
      hero.querySelector('.champion-hero__bg').alt = this.champion.name;
      hero.querySelector('.champion-hero__name').textContent = this.champion.name;
      hero.querySelector('.champion-hero__tagline').textContent = this.champion.title;
      
      if (this.champion.titleImage) {
        const titleImg = hero.querySelector('.champion-hero__title-img');
        if (titleImg) {
          titleImg.src = this.champion.titleImage;
          titleImg.alt = this.champion.title;
        }
      }
    }

    // Render lore
    const loreText = container.querySelector('.champion-lore__text');
    if (loreText) {
      loreText.innerHTML = this.champion.lore
        .split('\n\n')
        .map(p => `<p>${p}</p>`)
        .join('');
    }

    // Render bio panel
    this.renderBioPanel();

    // Render curiosities
    this.renderCuriosities();

    // Render related champions
    this.renderRelatedChampions();

    // Render gallery
    const gallerySection = container.querySelector('.champion-gallery');
    const galleryGrid = container.querySelector('.champion-gallery__grid');
    if (gallerySection && galleryGrid && this.champion.gallery && this.champion.gallery.length > 0) {
      galleryGrid.innerHTML = this.champion.gallery
        .map((item, i) => {
          const src = typeof item === 'string' ? item : item.src;
          const caption = typeof item === 'string' ? '' : (item.caption || '');
          return `
          <div class="champion-gallery__item" data-index="${i}">
            <img src="${src}" alt="${caption || 'Galería ' + (i + 1)}" loading="lazy">
            ${caption ? `<div class="champion-gallery__caption">${caption}</div>` : ''}
          </div>`;
        }).join('');

      this.initLightbox(galleryGrid);
    } else if (gallerySection) {
      gallerySection.style.display = 'none';
    }
  }

  initLightbox(grid) {
    const items = grid.querySelectorAll('.champion-gallery__item');
    if (items.length === 0) return;

    this.lightboxImages = this.champion.gallery;
    this.lightboxIndex = 0;

    if (!document.querySelector('.lightbox')) {
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <button class="lightbox__close" aria-label="Cerrar">&times;</button>
        <button class="lightbox__prev" aria-label="Anterior">&#10094;</button>
        <button class="lightbox__next" aria-label="Siguiente">&#10095;</button>
        <div class="lightbox__content">
          <img class="lightbox__img" src="" alt="">
          <div class="lightbox__caption"></div>
          <div class="lightbox__counter"></div>
        </div>
      `;
      document.body.appendChild(lightbox);

      lightbox.querySelector('.lightbox__close').addEventListener('click', () => this.closeLightbox());
      lightbox.querySelector('.lightbox__prev').addEventListener('click', () => this.navigateLightbox(-1));
      lightbox.querySelector('.lightbox__next').addEventListener('click', () => this.navigateLightbox(1));
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) this.closeLightbox();
      });
      document.addEventListener('keydown', (e) => {
        if (!document.querySelector('.lightbox.active')) return;
        if (e.key === 'Escape') this.closeLightbox();
        if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
        if (e.key === 'ArrowRight') this.navigateLightbox(1);
      });
    }

    items.forEach((item) => {
      item.addEventListener('click', () => {
        this.lightboxIndex = parseInt(item.dataset.index);
        this.openLightbox();
      });
    });
  }

  openLightbox() {
    const lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;
    this.updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  navigateLightbox(dir) {
    this.lightboxIndex = (this.lightboxIndex + dir + this.lightboxImages.length) % this.lightboxImages.length;
    this.updateLightboxImage();
  }

  updateLightboxImage() {
    const lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;
    const img = lightbox.querySelector('.lightbox__img');
    const caption = lightbox.querySelector('.lightbox__caption');
    const counter = lightbox.querySelector('.lightbox__counter');
    const item = this.lightboxImages[this.lightboxIndex];
    const src = typeof item === 'string' ? item : item.src;
    const text = typeof item === 'string' ? '' : (item.caption || '');
    img.src = src;
    img.alt = text || `Galería ${this.lightboxIndex + 1}`;
    caption.textContent = text;
    caption.style.display = text ? 'block' : 'none';
    counter.textContent = `${this.lightboxIndex + 1} / ${this.lightboxImages.length}`;
  }

  renderBioPanel() {
    const panel = document.querySelector('.champion-bio-panel');
    const fieldsContainer = document.querySelector('.champion-bio-panel__fields');
    if (!panel || !fieldsContainer || !this.champion) return;

    const fields = [
      { key: 'race', label: 'Raza' },
      { key: 'age', label: 'Edad' },
      { key: 'birthplace', label: 'Lugar de nacimiento' }
    ];

    const activeFields = fields.filter(f => this.champion[f.key]);

    if (activeFields.length === 0) {
      panel.style.display = 'none';
      return;
    }

    fieldsContainer.innerHTML = activeFields.map(field => `
      <div class="champion-bio-panel__item">
        <span class="champion-bio-panel__label">${field.label}</span>
        <span class="champion-bio-panel__value">${this.champion[field.key]}</span>
      </div>
    `).join('');

    panel.classList.add('active');
  }

  renderCuriosities() {
    const section = document.querySelector('.champion-curiosities');
    const list = document.querySelector('.champion-curiosities__list');
    if (!section || !list || !this.champion) return;

    const items = this.champion.curiosities;
    if (!items || items.length === 0) {
      section.style.display = 'none';
      return;
    }

    list.innerHTML = items.map(text => `
      <li class="champion-curiosities__item">${text}</li>
    `).join('');
  }

  renderRelatedChampions() {
    const list = document.querySelector('.champion-related__list');
    const section = document.querySelector('.champion-related');
    if (!list || !section || !this.data || !this.champion) return;

    const entries = this.champion.relatedChampions || [];
    const related = entries
      .map(e => {
        const c = this.data.champions.find(ch => ch.id === e.id);
        return c ? { ...c, relation: e.relation } : null;
      })
      .filter(Boolean);

    if (related.length === 0) {
      section.style.display = 'none';
      const topRow = document.querySelector('.champion-top-row');
      if (topRow) topRow.classList.add('champion-top-row--no-related');
      return;
    }

    list.innerHTML = related.map(c => `
      <a href="champion.html?id=${c.id}" class="champion-related__item">
        <img src="${c.icon}" alt="${c.name}" class="champion-related__item-img">
        <div>
          <div class="champion-related__item-name">${c.name}</div>
          <div class="champion-related__item-title">${c.relation}</div>
        </div>
      </a>
    `).join('');
  }

  renderNavigation() {
    if (!this.data) return;

    const champions = this.data.champions;
    const currentIndex = champions.findIndex(c => c.id === this.championId);
    
    const prevChampion = currentIndex > 0 ? champions[currentIndex - 1] : champions[champions.length - 1];
    const nextChampion = currentIndex < champions.length - 1 ? champions[currentIndex + 1] : champions[0];

    const prevBtn = document.querySelector('.champion-nav--prev .champion-nav__btn');
    const nextBtn = document.querySelector('.champion-nav--next .champion-nav__btn');
    const prevLabel = document.querySelector('.champion-nav--prev .champion-nav__label');
    const nextLabel = document.querySelector('.champion-nav--next .champion-nav__label');

    if (prevBtn && prevChampion) {
      prevBtn.addEventListener('click', () => {
        window.location.href = `champion.html?id=${prevChampion.id}`;
      });
      if (prevLabel) prevLabel.textContent = prevChampion.name;
    }

    if (nextBtn && nextChampion) {
      nextBtn.addEventListener('click', () => {
        window.location.href = `champion.html?id=${nextChampion.id}`;
      });
      if (nextLabel) nextLabel.textContent = nextChampion.name;
    }
  }
}
