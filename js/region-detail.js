// ============================================
// Region Detail Page
// ============================================

import { getUrlParam } from './utils.js';
import { Modal } from './modal.js';
import { getRegions, getChampions } from './data-cache.js';
import { championCard } from './templates.js';
import * as Lightbox from './lightbox.js';
import { observeCards } from './animations.js';

export class RegionDetail {
  constructor() {
    this.regionId = getUrlParam('id');
    if (!this.regionId) return;
    this.init();
  }

  async init() {
    try {
      const [regions, champions] = await Promise.all([getRegions(), getChampions()]);
      const region = regions.find(r => r.id === this.regionId);

      if (!region) {
        console.error('Region not found:', this.regionId);
        return;
      }

      this.region = region;
      this.champions = champions;
      this.render(region, champions);
    } catch (error) {
      console.error('Error loading region data:', error);
    }
  }

  render(region, champions) {
    document.title = `${region.name} - Shuen No Kokai`;

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
    if (championsGrid && region.champions?.length > 0) {
      const regionChamps = region.champions
        .map(id => champions.find(c => c.id === id))
        .filter(Boolean);

      championsGrid.innerHTML = regionChamps.map(c => championCard(c)).join('');
      observeCards(championsGrid);
    } else if (championsSection) {
      championsSection.style.display = 'none';
    }

    // Locations
    const locationsSection = document.querySelector('.region-locations');
    const locationsGrid = document.querySelector('.region-locations__grid');
    if (locationsGrid && region.locations?.length > 0) {
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
          locationModal.open(`
            <img src="${card.dataset.image}" alt="${card.dataset.name}" style="max-width: 100%; max-height: 80vh; border-radius: 8px; object-fit: contain;">
          `, {
            title: card.dataset.name,
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
    if (gallerySection && galleryGrid && region.gallery?.length > 0) {
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

      Lightbox.bindToGrid(galleryGrid, region.gallery, '.region-gallery__item');
    } else if (gallerySection) {
      gallerySection.style.display = 'none';
    }
  }
}
