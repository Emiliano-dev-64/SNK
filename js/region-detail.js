// ============================================
// Region Detail Page
// ============================================

import { getUrlParam } from './utils.js';
import { Modal } from './modal.js';

export class RegionDetail {
  constructor() {
    this.regionId = getUrlParam('id');
    if (!this.regionId) return;
    this.init();
  }

  async init() {
    try {
      const response = await fetch('data/champions.json');
      const data = await response.json();
      const region = data.regions.find(r => r.id === this.regionId);

      if (!region) {
        console.error('Region not found:', this.regionId);
        return;
      }

      this.region = region;
      this.data = data;
      this.render(region, data);
    } catch (error) {
      console.error('Error loading region data:', error);
    }
  }

  render(region, data) {
    document.title = `${region.name} - One Pipis`;

    // Hero
    const heroBg = document.querySelector('.region-hero__bg');
    if (heroBg) {
      heroBg.src = region.heroImage || region.image;
      heroBg.alt = `Fondo de ${region.name}`;
    }

    const heroName = document.querySelector('.region-hero__name');
    if (heroName) heroName.textContent = region.name;

    const heroTagline = document.querySelector('.region-hero__tagline');
    if (heroTagline) heroTagline.textContent = region.title;

    // Lore
    const loreSection = document.querySelector('.region-lore');
    const loreText = document.querySelector('.region-lore__text');
    if (loreText) {
      loreText.innerHTML = region.lore
        .split('\n\n')
        .map(p => `<p>${p}</p>`)
        .join('');
    }
    if (loreSection && !region.lore) loreSection.style.display = 'none';

    // Champions
    const championsSection = document.querySelector('.region-champions');
    const championsGrid = document.querySelector('.region-champions__grid');
    if (championsGrid && region.champions && region.champions.length > 0) {
      const champions = region.champions
        .map(id => data.champions.find(c => c.id === id))
        .filter(Boolean);

      championsGrid.innerHTML = champions.map(champ => `
        <a href="champion.html?id=${champ.id}" class="champion-card">
          <img src="${champ.image}" alt="${champ.name}" class="champion-card__image" loading="lazy">
          <div class="champion-card__overlay">
            <div class="champion-card__name">${champ.name}</div>
            <div class="champion-card__title">${champ.title}</div>
          </div>
          <div class="champion-card__border"></div>
        </a>
      `).join('');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      championsGrid.querySelectorAll('.champion-card').forEach(card => {
        observer.observe(card);
      });
    } else if (championsSection) {
      championsSection.style.display = 'none';
    }

    // Locations
    const locationsSection = document.querySelector('.region-locations');
    const locationsGrid = document.querySelector('.region-locations__grid');
    if (locationsGrid && region.locations && region.locations.length > 0) {
      locationsGrid.innerHTML = region.locations.map(loc => `
        <div class="location-card" data-image="${loc.image}" data-name="${loc.name}">
          <img src="${loc.image}" alt="${loc.name}" class="location-card__image" loading="lazy">
          <div class="location-card__overlay">
            <div class="location-card__name">${loc.name}</div>
          </div>
        </div>
      `).join('');

      const locationModal = new Modal();
      locationsGrid.querySelectorAll('.location-card').forEach(card => {
        card.addEventListener('click', () => {
          const image = card.dataset.image;
          const name = card.dataset.name;
          locationModal.open(`
            <img src="${image}" alt="${name}" style="max-width: 100%; max-height: 80vh; border-radius: 8px; object-fit: contain;">
          `, {
            title: name,
            className: 'modal--image'
          });
        });
      });
    } else if (locationsSection) {
      locationsSection.style.display = 'none';
    }

    // Gallery
    const gallerySection = document.querySelector('.region-gallery');
    const galleryGrid = document.querySelector('.region-gallery__grid');
    if (gallerySection && galleryGrid && region.gallery && region.gallery.length > 0) {
      galleryGrid.innerHTML = region.gallery
        .map((item, i) => {
          const src = typeof item === 'string' ? item : item.src;
          const caption = typeof item === 'string' ? '' : (item.caption || '');
          return `
          <div class="region-gallery__item" data-index="${i}" role="button" tabindex="0">
            <img src="${src}" alt="${caption || 'Galería ' + (i + 1)}" loading="lazy">
            ${caption ? `<div class="region-gallery__caption">${caption}</div>` : ''}
          </div>`;
        }).join('');

      this.initLightbox(galleryGrid);
    } else if (gallerySection) {
      gallerySection.style.display = 'none';
    }
  }

  initLightbox(grid) {
    const items = grid.querySelectorAll('.region-gallery__item');
    if (items.length === 0) return;

    this.lightboxImages = this.region.gallery;
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
      const openLightbox = () => {
        this.lightboxIndex = parseInt(item.dataset.index);
        this.openLightbox();
      };
      item.addEventListener('click', openLightbox);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox();
        }
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

  navigateLightbox(direction) {
    this.lightboxIndex += direction;
    if (this.lightboxIndex < 0) this.lightboxIndex = this.lightboxImages.length - 1;
    if (this.lightboxIndex >= this.lightboxImages.length) this.lightboxIndex = 0;
    this.updateLightboxImage();
  }

  updateLightboxImage() {
    const lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;
    const item = this.lightboxImages[this.lightboxIndex];
    const src = typeof item === 'string' ? item : item.src;
    const caption = typeof item === 'string' ? '' : (item.caption || '');
    lightbox.querySelector('.lightbox__img').src = src;
    lightbox.querySelector('.lightbox__img').alt = caption || '';
    lightbox.querySelector('.lightbox__counter').textContent =
      `${this.lightboxIndex + 1} / ${this.lightboxImages.length}`;
  }
}
