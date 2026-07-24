// ============================================
// Champion Grid - Filtering & Rendering
// ============================================

import { getChampions } from './data-cache.js';
import { championCard } from './templates.js';
import { observeCards } from './animations.js';

export class ChampionGrid {
  constructor(containerSelector = '.champions-grid') {
    this.container = document.querySelector(containerSelector);
    this.searchInput = document.querySelector('#championSearch');
    this.filterTags = document.querySelectorAll('.filter-tag');
    this.champions = null;
    this.activeFilter = 'all';

    if (!this.container) return;
    this.init();
  }

  async init() {
    try {
      this.champions = await getChampions();
      this.render(this.champions.sort((a, b) => a.name.localeCompare(b.name)));
      this.bindEvents();
    } catch (error) {
      console.error('Error loading champion data:', error);
    }
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.filterChampions(e.target.value);
      });
    }

    this.filterTags.forEach(tag => {
      tag.addEventListener('click', () => {
        this.filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        this.activeFilter = tag.dataset.filter;
        this.filterChampions(this.searchInput?.value || '');
      });
    });
  }

  filterChampions(query) {
    if (!this.champions) return;

    let filtered = this.champions;

    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(c =>
        (c.region && c.region.toLowerCase() === this.activeFilter.toLowerCase()) ||
        (c.faction && c.faction.toLowerCase() === this.activeFilter.toLowerCase())
      );
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.region && c.region.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => a.name.localeCompare(b.name));
    this.render(filtered);
  }

  render(champions) {
    if (!this.container) return;

    if (champions.length === 0) {
      this.container.innerHTML = `
        <div class="champions-empty">
          <div class="champions-empty__icon">🔍</div>
          <p>No se encontraron champions con esos criterios.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = champions.map(c => championCard(c)).join('');
    observeCards(this.container);
  }
}
