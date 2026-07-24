// ============================================
// Region Panel - Slide-in panel for Map
// ============================================

import { getRegions, getChampions } from './data-cache.js';
import { championCardMini } from './templates.js';

export class RegionPanel {
  constructor() {
    this.panel = document.querySelector('.region-panel');
    this.closeBtn = document.querySelector('.region-panel__close');
    this.backdrop = document.querySelector('.region-panel-backdrop');
    this.regions = null;
    this.champions = null;

    if (!this.panel) return;
    this.init();
  }

  async init() {
    try {
      const [regions, champions] = await Promise.all([getRegions(), getChampions()]);
      this.regions = regions;
      this.champions = champions;
    } catch (error) {
      console.error('Error loading data:', error);
    }

    this.bindEvents();
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    document.querySelectorAll('.hotspot[data-region]').forEach(hotspot => {
      hotspot.setAttribute('role', 'button');
      hotspot.setAttribute('tabindex', '0');
      const openRegion = () => this.open(hotspot.dataset.region);
      hotspot.addEventListener('click', openRegion);
      hotspot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openRegion();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.panel.classList.contains('active')) {
        this.close();
      }
    });
  }

  open(regionId) {
    if (!this.regions || !this.panel) return;

    const region = this.regions.find(r => r.id === regionId);
    if (!region) return;

    this.renderRegion(region);
    this.panel.classList.add('active');
    if (this.backdrop) this.backdrop.classList.add('active');
  }

  close() {
    if (this.panel) this.panel.classList.remove('active');
    if (this.backdrop) this.backdrop.classList.remove('active');
  }

  renderRegion(region) {
    const heroImg = this.panel.querySelector('.region-panel__hero-img');
    if (heroImg) {
      heroImg.src = region.image;
      heroImg.alt = region.name;
    }

    const name = this.panel.querySelector('.region-panel__hero-name');
    if (name) name.textContent = region.name;

    const desc = this.panel.querySelector('.region-panel__description');
    if (desc) desc.textContent = region.title;

    const championsContainer = this.panel.querySelector('.region-panel__champions');
    if (championsContainer && region.champions) {
      const regionChamps = region.champions
        .map(id => this.champions.find(c => c.id === id))
        .filter(Boolean);

      championsContainer.innerHTML = regionChamps.map(c => championCardMini(c)).join('');
    }

    const exploreBtn = this.panel.querySelector('.region-panel__explore-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('spa:navigate', {
          detail: { url: `region.html?id=${region.id}` }
        }));
      });
    }
  }
}
