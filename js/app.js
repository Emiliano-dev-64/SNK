// ============================================
// App - Main Entry Point (SPA)
// ============================================

import { initNavbar, updateNavbarActiveLinks } from './navbar.js';
import { MusicPlayer } from './music-player.js';
import { initAnimations, initParticles, observeCards } from './animations.js';
import { WorldMap } from './world-map.js';
import { ChampionGrid } from './champion-grid.js';
import { ChampionDetail } from './champion-detail.js';
import { RegionPanel } from './region-panel.js';
import { RegionDetail } from './region-detail.js';
import { FactionDetail } from './faction-detail.js';
import { initShopPopups } from './modal.js';
import { WantedPage } from './wanted.js';
import { Galeria } from './galeria.js';
import { Router } from './router.js';
import { getChampions } from './data-cache.js';
import { championCard } from './templates.js';

const STAGGER = ['', 'stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5'];

async function renderHomeChampions() {
  const grid = document.querySelector('#homeChampionsGrid');
  if (!grid) return;

  try {
    const champions = await getChampions();
    grid.innerHTML = champions.slice(0, 6).map((c, i) =>
      championCard(c, { stagger: `fade-in-up ${STAGGER[i] || ''}`.trim() })
    ).join('');
  } catch (err) {
    console.error('Error loading champions for home:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.__isSPA = true;
  initNavbar();
  initAnimations();

  window.__musicPlayer = new MusicPlayer();

  const router = new Router((page) => {
    initAnimations();
    updateNavbarActiveLinks();

    switch (page) {
      case 'home':
        initParticles();
        renderHomeChampions().then(() => initAnimations());
        break;
      case 'champions':
        new ChampionGrid();
        break;
      case 'champion-detail':
        new ChampionDetail();
        break;
      case 'world-map':
        new WorldMap();
        new RegionPanel();
        break;
      case 'region':
        new RegionDetail();
        break;
      case 'faction':
        new FactionDetail();
        break;
      case 'shops':
        initShopPopups();
        break;
      case 'wanted':
        new WantedPage();
        break;
      case 'galeria':
      case 'galeria-categoria':
        new Galeria();
        break;
    }
  });

  router.handleInitialRoute();
  renderHomeChampions().then(() => initAnimations());
});
