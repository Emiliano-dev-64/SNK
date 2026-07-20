// ============================================
// Region Panel - Slide-in panel for Map
// ============================================

export class RegionPanel {
  constructor() {
    this.panel = document.querySelector('.region-panel');
    this.closeBtn = document.querySelector('.region-panel__close');
    this.backdrop = document.querySelector('.region-panel-backdrop');
    this.data = null;

    if (!this.panel) return;
    this.init();
  }

  async init() {
    try {
      const response = await fetch('data/champions.json');
      this.data = await response.json();
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

    // Open panel when clicking hotspots
    document.querySelectorAll('.hotspot[data-region]').forEach(hotspot => {
      hotspot.addEventListener('click', () => {
        const regionId = hotspot.dataset.region;
        this.open(regionId);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.panel.classList.contains('active')) {
        this.close();
      }
    });
  }

  open(regionId) {
    if (!this.data || !this.panel) return;

    const region = this.data.regions.find(r => r.id === regionId);
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
    // Hero image
    const heroImg = this.panel.querySelector('.region-panel__hero-img');
    if (heroImg) heroImg.src = region.image;

    // Region name
    const name = this.panel.querySelector('.region-panel__hero-name');
    if (name) name.textContent = region.name;

    // Description
    const desc = this.panel.querySelector('.region-panel__description');
    if (desc) desc.textContent = region.description;

    // Champions
    const championsContainer = this.panel.querySelector('.region-panel__champions');
    if (championsContainer && region.champions) {
      const champions = region.champions
        .map(id => this.data.champions.find(c => c.id === id))
        .filter(Boolean);

      championsContainer.innerHTML = champions.map(champ => `
        <a href="champion.html?id=${champ.id}" class="region-champion">
          <img src="${champ.icon}" alt="${champ.name}" class="region-champion__icon" 
               onerror="this.src='img/champions/perfilMaximo.png'">
          <span class="region-champion__name">${champ.name}</span>
        </a>
      `).join('');
    }

    // Explore button
    const exploreBtn = this.panel.querySelector('.region-panel__explore-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        window.location.href = `region.html?id=${region.id}`;
      });
    }
  }
}
