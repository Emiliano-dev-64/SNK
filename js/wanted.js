// ============================================
// Wanted Page - Bounty Posters
// ============================================

import { Modal } from './modal.js';
import { getChampions } from './data-cache.js';
import { observeCards } from './animations.js';

export class WantedPage {
  constructor() {
    this.container = document.querySelector('.wanted-grid');
    this.modal = new Modal();

    if (!this.container) return;
    this.init();
  }

  async init() {
    try {
      const champions = await getChampions();
      const wantedChampions = champions.filter(c => c.wanted);
      this.render(wantedChampions);
    } catch (error) {
      console.error('Error loading wanted data:', error);
    }
  }

  render(champions) {
    if (!this.container) return;

    if (champions.length === 0) {
      this.container.innerHTML = `
        <div class="wanted-empty">
          <div class="wanted-empty__icon">🏴‍☠️</div>
          <p class="wanted-empty__text">No hay carteles de recompensa disponibles.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = champions.map(champion => {
      const rotation = (Math.random() * 6 - 3).toFixed(1);
      return `
        <div class="wanted-poster fade-in-up" data-id="${champion.id}" data-name="${champion.name}" style="transform: rotate(${rotation}deg);" role="button" tabindex="0">
          <div class="wanted-poster__nail"></div>
          <div class="wanted-poster__paper">
            <div class="wanted-poster__image-wrap">
              <img
                src="${champion.wanted}"
                alt="Recompensa de ${champion.name}"
                class="wanted-poster__image"
                loading="lazy"
              >
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.bindEvents();
    observeCards(this.container);
  }

  bindEvents() {
    this.container.querySelectorAll('.wanted-poster').forEach(poster => {
      const openPoster = () => {
        const id = poster.dataset.id;
        const img = poster.querySelector('.wanted-poster__image');
        const name = poster.dataset.name;
        this.openModal(id, img.src, name);
      };
      poster.addEventListener('click', openPoster);
      poster.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPoster();
        }
      });
    });
  }

  openModal(championId, imageUrl, championName) {
    this.modal.open(`
      <img src="${imageUrl}" alt="Recompensa de ${championName}" class="wanted-modal__image">
      <div class="wanted-modal__info">
        <a href="champion.html?id=${championId}" class="wanted-modal__btn">Ver Personaje</a>
      </div>
    `, {
      className: 'modal--wanted'
    });
  }
}
