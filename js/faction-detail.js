// ============================================
// Faction Detail Page
// ============================================

import { getUrlParam } from './utils.js';
import { getFactions, getChampions } from './data-cache.js';
import { championCard } from './templates.js';
import * as Lightbox from './lightbox.js';
import { observeCards } from './animations.js';

export class FactionDetail {
  constructor() {
    this.factionId = getUrlParam('id');
    if (!this.factionId) return;
    this.init();
  }

  async init() {
    try {
      const [factions, champions] = await Promise.all([getFactions(), getChampions()]);
      const faction = factions.find(f => f.id === this.factionId);

      if (!faction) {
        console.error('Faction not found:', this.factionId);
        return;
      }

      this.faction = faction;
      this.champions = champions;
      this.render(faction, champions);
    } catch (error) {
      console.error('Error loading faction data:', error);
    }
  }

  render(faction, champions) {
    document.title = `${faction.name} - Shuen No Kokai`;

    // Hero
    const heroBg = document.querySelector('.region-hero__bg');
    if (heroBg) {
      heroBg.src = faction.heroImage || faction.image;
      heroBg.alt = `Fondo de ${faction.name}`;
    }

    const heroName = document.querySelector('.region-hero__name');
    if (heroName) heroName.textContent = faction.name;

    const heroTagline = document.querySelector('.region-hero__tagline');
    if (heroTagline) heroTagline.textContent = faction.title;

    // Lore
    const loreSection = document.querySelector('.region-lore');
    const loreText = document.querySelector('.region-lore__text');
    if (loreText) {
      loreText.innerHTML = faction.lore
        .split('\n\n')
        .map(p => `<p>${p}</p>`)
        .join('');
    }
    if (loreSection && !faction.lore) loreSection.style.display = 'none';

    // Champions
    const championsSection = document.querySelector('.region-champions');
    const championsGrid = document.querySelector('.region-champions__grid');
    if (championsGrid && faction.champions?.length > 0) {
      const factionChamps = faction.champions
        .map(id => champions.find(c => c.id === id))
        .filter(Boolean);

      championsGrid.innerHTML = factionChamps.map(c => championCard(c)).join('');
      observeCards(championsGrid);
    } else if (championsSection) {
      championsSection.style.display = 'none';
    }

    // Gallery
    const gallerySection = document.querySelector('.region-gallery');
    const galleryGrid = document.querySelector('.region-gallery__grid');
    if (gallerySection && galleryGrid && faction.gallery?.length > 0) {
      galleryGrid.innerHTML = faction.gallery
        .map((item, i) => {
          const src = typeof item === 'string' ? item : item.src;
          const caption = typeof item === 'string' ? '' : (item.caption || '');
          return `
          <div class="region-gallery__item" data-index="${i}" role="button" tabindex="0">
            <img src="${src}" alt="${caption || 'Galería ' + (i + 1)}" loading="lazy">
            ${caption ? `<div class="region-gallery__caption">${caption}</div>` : ''}
          </div>`;
        }).join('');

      Lightbox.bindToGrid(galleryGrid, faction.gallery, '.region-gallery__item');
    } else if (gallerySection) {
      gallerySection.style.display = 'none';
    }
  }
}
