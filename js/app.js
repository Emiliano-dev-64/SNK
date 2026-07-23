// ============================================
// App - Main Entry Point
// ============================================

import { initNavbar } from './navbar.js';
import { MusicPlayer } from './music-player.js';
import { initAnimations, initParticles } from './animations.js';
import { WorldMap } from './world-map.js';
import { ChampionGrid } from './champion-grid.js';
import { ChampionDetail } from './champion-detail.js';
import { RegionPanel } from './region-panel.js';
import { RegionDetail } from './region-detail.js';
import { FactionDetail } from './faction-detail.js';
import { initShopPopups } from './modal.js';
import { WantedPage } from './wanted.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize common components
  initNavbar();
  initAnimations();

  // Initialize music player (available on all pages)
  new MusicPlayer();

  // Page-specific initialization
  const page = document.body.dataset.page;

  switch (page) {
    case 'home':
      initParticles();
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
  }
});
