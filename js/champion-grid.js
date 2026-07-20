// ============================================
// Champion Grid - Filtering & Rendering
// ============================================

export class ChampionGrid {
  constructor(containerSelector = '.champions-grid') {
    this.container = document.querySelector(containerSelector);
    this.searchInput = document.querySelector('#championSearch');
    this.filterTags = document.querySelectorAll('.filter-tag');
    this.data = null;
    this.activeFilter = 'all';

    if (!this.container) return;
    this.init();
  }

  async init() {
    try {
      const response = await fetch('data/champions.json');
      this.data = await response.json();
      this.render(this.data.champions);
      this.bindEvents();
      this.observeCards();
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
    if (!this.data) return;

    let filtered = this.data.champions;

    // Filter by region
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(c => 
        c.region && c.region.toLowerCase() === this.activeFilter.toLowerCase()
      );
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.region && c.region.toLowerCase().includes(q))
      );
    }

    this.render(filtered);
    this.observeCards();
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

    this.container.innerHTML = champions.map(champion => `
      <a href="champion.html?id=${champion.id}" class="champion-card" data-id="${champion.id}">
        <img 
          src="${champion.image}" 
          alt="${champion.name}" 
          class="champion-card__image"
          loading="lazy"
          onerror="this.src='img/champions/perfilMaximo.png'"
        >
        <div class="champion-card__overlay">
          <div class="champion-card__name">${champion.name}</div>
          <div class="champion-card__title">${champion.title}</div>
        </div>
        <div class="champion-card__border"></div>
      </a>
    `).join('');
  }

  observeCards() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    this.container.querySelectorAll('.champion-card').forEach(card => {
      observer.observe(card);
    });
  }
}
