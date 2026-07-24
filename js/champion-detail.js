// ============================================
// Champion Detail Page
// ============================================

import { getUrlParam } from './utils.js';
import { getChampions, getRegions, getFactions } from './data-cache.js';
import { championCard } from './templates.js';
import * as Lightbox from './lightbox.js';

export class ChampionDetail {
  constructor() {
    this.championId = getUrlParam('id');
    this.champion = null;
    this.data = null;

    if (!this.championId) return;
    this.init();
  }

  async init() {
    try {
      const [champions, regions, factions] = await Promise.all([
        getChampions(), getRegions(), getFactions()
      ]);
      this.data = { champions, regions, factions };
      this.champion = champions.find(c => c.id === this.championId);

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

    document.title = `${this.champion.name} - Shuen No Kokai`;

    // Hero
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

    // Portrait
    const portrait = container.querySelector('.champion-portrait');
    if (portrait && this.champion.image) {
      portrait.src = this.champion.image;
      portrait.alt = this.champion.name;
      this.initPortraitLightbox(portrait);
    }

    // Lore
    const loreText = container.querySelector('.champion-lore__text');
    if (loreText) {
      loreText.innerHTML = this.champion.lore
        .split('\n\n')
        .map(p => `<p>${p}</p>`)
        .join('');
    }

    this.renderBioPanel();
    this.renderCuriosities();
    this.renderOst();
    this.renderRelatedChampions();

    // Gallery
    const gallerySection = container.querySelector('.champion-gallery');
    const galleryGrid = container.querySelector('.champion-gallery__grid');
    if (gallerySection && galleryGrid && this.champion.gallery?.length > 0) {
      galleryGrid.innerHTML = this.champion.gallery
        .map((item, i) => {
          const src = typeof item === 'string' ? item : item.src;
          const caption = typeof item === 'string' ? '' : (item.caption || '');
          return `
          <div class="champion-gallery__item" data-index="${i}" role="button" tabindex="0">
            <img src="${src}" alt="${caption || 'Galería ' + (i + 1)}" loading="lazy">
            ${caption ? `<div class="champion-gallery__caption">${caption}</div>` : ''}
          </div>`;
        }).join('');

      Lightbox.bindToGrid(galleryGrid, this.champion.gallery, '.champion-gallery__item');
    } else if (gallerySection) {
      gallerySection.style.display = 'none';
    }
  }

  renderBioPanel() {
    const panel = document.querySelector('.champion-bio-panel');
    const fieldsContainer = document.querySelector('.champion-bio-panel__fields');
    if (!panel || !fieldsContainer || !this.champion) return;

    const regionMap = {};
    if (this.data?.regions) {
      this.data.regions.forEach(r => { regionMap[r.id] = { name: r.name, icon: r.icon || r.image }; });
    }

    const factionMap = {};
    if (this.data?.factions) {
      this.data.factions.forEach(f => { factionMap[f.id] = { name: f.name, icon: f.icon || f.image }; });
    }

    const fields = [
      { key: 'race', label: 'Raza' },
      { key: 'age', label: 'Edad' },
      { key: 'birthplace', label: 'Lugar de nacimiento' }
    ];

    if (this.champion.region && regionMap[this.champion.region]) {
      fields.push({ key: 'region', label: 'Región' });
    }

    if (this.champion.faction && factionMap[this.champion.faction]) {
      fields.push({ key: 'faction', label: 'Facción' });
    }

    const activeFields = fields.filter(f => this.champion[f.key]);

    if (activeFields.length === 0) {
      panel.style.display = 'none';
      return;
    }

    fieldsContainer.innerHTML = activeFields.map(field => {
      let valueHtml;
      if (field.key === 'region') {
        const region = regionMap[this.champion.region];
        valueHtml = `
          <a href="region.html?id=${this.champion.region}" class="champion-bio-panel__value champion-bio-panel__value--link">
            <img src="${region.icon}" alt="${region.name}" class="champion-bio-panel__region-img" loading="lazy">
            ${region.name}
          </a>`;
      } else if (field.key === 'faction') {
        const faction = factionMap[this.champion.faction];
        valueHtml = `
          <a href="faction.html?id=${this.champion.faction}" class="champion-bio-panel__value champion-bio-panel__value--link">
            <img src="${faction.icon}" alt="${faction.name}" class="champion-bio-panel__region-img" loading="lazy">
            ${faction.name}
          </a>`;
      } else {
        valueHtml = `<span class="champion-bio-panel__value">${this.champion[field.key]}</span>`;
      }
      return `
      <div class="champion-bio-panel__item">
        <span class="champion-bio-panel__label">${field.label}</span>
        ${valueHtml}
      </div>`;
    }).join('');

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

  renderOst() {
    const section = document.querySelector('.champion-ost');
    const list = document.querySelector('.champion-ost__list');
    if (!section || !list || !this.champion) return;

    const tracks = this.champion.music;
    if (!tracks || tracks.length === 0) {
      section.style.display = 'none';
      return;
    }

    list.innerHTML = tracks.map(track => `
      <div class="champion-ost__item">
        <button class="champion-ost__play" data-file="${track.file}" data-name="${track.name}" aria-label="Reproducir ${track.name}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
        <span class="champion-ost__name">${track.name}</span>
      </div>
    `).join('');

    section.style.display = 'block';

    list.querySelectorAll('.champion-ost__play').forEach(btn => {
      btn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('music:play', {
          detail: { file: btn.dataset.file, name: btn.dataset.name }
        }));
      });
    });

    if (window.__musicPlayer?.addTracks) {
      window.__musicPlayer.addTracks(tracks);
    }
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
      return;
    }

    list.innerHTML = related.map(c => `
      <a href="champion.html?id=${c.id}" class="champion-related__item">
        <img src="${c.icon}" alt="${c.name}" class="champion-related__item-img" loading="lazy">
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
        document.dispatchEvent(new CustomEvent('spa:navigate', {
          detail: { url: `champion.html?id=${prevChampion.id}` }
        }));
      });
      if (prevLabel) prevLabel.textContent = prevChampion.name;
    }

    if (nextBtn && nextChampion) {
      nextBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('spa:navigate', {
          detail: { url: `champion.html?id=${nextChampion.id}` }
        }));
      });
      if (nextLabel) nextLabel.textContent = nextChampion.name;
    }
  }

  initPortraitLightbox(portrait) {
    portrait.setAttribute('role', 'button');
    portrait.setAttribute('tabindex', '0');
    portrait.setAttribute('aria-label', `Ampliar imagen de ${this.champion.name}`);

    if (!document.querySelector('.portrait-lightbox')) {
      const lb = document.createElement('div');
      lb.className = 'portrait-lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-label', 'Imagen ampliada');
      lb.setAttribute('aria-modal', 'true');
      lb.innerHTML = `
        <button class="portrait-lightbox__close" aria-label="Cerrar imagen"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg></button>
        <img class="portrait-lightbox__img" src="" alt="">
      `;
      document.body.appendChild(lb);

      lb.querySelector('.portrait-lightbox__close').addEventListener('click', () => this.closePortraitLightbox());
      lb.addEventListener('click', (e) => {
        if (e.target === lb) this.closePortraitLightbox();
      });
    }

    const open = () => this.openPortraitLightbox();
    portrait.addEventListener('click', open);
    portrait.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  openPortraitLightbox() {
    const lb = document.querySelector('.portrait-lightbox');
    if (!lb || !this.champion) return;
    const img = lb.querySelector('.portrait-lightbox__img');
    img.src = this.champion.image;
    img.alt = this.champion.name;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.portrait-lightbox__close').focus();

    this._portraitLbKeyHandler = (e) => {
      if (e.key === 'Escape') this.closePortraitLightbox();
    };
    document.addEventListener('keydown', this._portraitLbKeyHandler);
  }

  closePortraitLightbox() {
    const lb = document.querySelector('.portrait-lightbox');
    if (!lb) return;
    lb.classList.remove('active');
    document.body.style.overflow = '';
    if (this._portraitLbKeyHandler) {
      document.removeEventListener('keydown', this._portraitLbKeyHandler);
      this._portraitLbKeyHandler = null;
    }
    const portrait = document.querySelector('.champion-portrait');
    if (portrait) portrait.focus();
  }
}
