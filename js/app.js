// ============================================
// App - Main Entry Point
// ============================================

import { initNavbar } from './navbar.js';
import { MusicPlayer } from './music-player.js';
import { initAnimations } from './animations.js';
import { WorldMap } from './world-map.js';
import { ChampionGrid } from './champion-grid.js';
import { ChampionDetail } from './champion-detail.js';
import { RegionPanel } from './region-panel.js';
import { initShopPopups, Modal } from './modal.js';
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
      initHomePage();
      break;
    case 'champions':
      new ChampionGrid();
      break;
    case 'champion-detail':
      new ChampionDetail();
      break;
    case 'world-map':
      initWorldMapPage();
      break;
    case 'region':
      initRegionPage();
      break;
    case 'shops':
      initShopsPage();
      break;
    case 'wanted':
      new WantedPage();
      break;
  }
});

function initHomePage() {
  // Create floating particles
  const particlesContainer = document.querySelector('.hero__particles');
  if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'hero__particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${6 + Math.random() * 6}s`;
      particlesContainer.appendChild(particle);
    }
  }
}

function initWorldMapPage() {
  new WorldMap();
  new RegionPanel();
}

async function initRegionPage() {
  const params = new URLSearchParams(window.location.search);
  const regionId = params.get('id');

  if (!regionId) return;

  try {
    const response = await fetch('data/champions.json');
    const data = await response.json();
    const region = data.regions.find(r => r.id === regionId);

    if (!region) {
      console.error('Region not found:', regionId);
      return;
    }

    renderRegionPage(region, data);
  } catch (error) {
    console.error('Error loading region data:', error);
  }
}

function renderRegionPage(region, data) {
  document.title = `${region.name} - One Pipis`;

  // Hero
  const heroBg = document.querySelector('.region-hero__bg');
  if (heroBg) heroBg.src = region.heroImage || region.image;

  const heroName = document.querySelector('.region-hero__name');
  if (heroName) heroName.textContent = region.name;

  const heroTagline = document.querySelector('.region-hero__tagline');
  if (heroTagline) heroTagline.textContent = region.description;

  // Lore
  const loreText = document.querySelector('.region-lore__text');
  if (loreText) loreText.textContent = region.description;

  // Champions grid
  const championsGrid = document.querySelector('.region-champions__grid');
  if (championsGrid && region.champions) {
    const champions = region.champions
      .map(id => data.champions.find(c => c.id === id))
      .filter(Boolean);

    championsGrid.innerHTML = champions.map(champ => `
      <a href="champion.html?id=${champ.id}" class="champion-card">
        <img src="${champ.image}" alt="${champ.name}" class="champion-card__image" loading="lazy">
        <div class="champion-card__overlay">
          <div class="champion-card__name">${champ.name}</div>
          <div class="champion-card__title">${champ.title}</div>
        </div>
        <div class="champion-card__border"></div>
      </a>
    `).join('');

    // Animate cards
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    championsGrid.querySelectorAll('.champion-card').forEach(card => {
      observer.observe(card);
    });
  }

  // Locations grid
  const locationsGrid = document.querySelector('.region-locations__grid');
  if (locationsGrid && region.locations) {
    locationsGrid.innerHTML = region.locations.map(loc => `
      <div class="location-card" data-image="${loc.image}" data-name="${loc.name}">
        <img src="${loc.image}" alt="${loc.name}" class="location-card__image" loading="lazy">
        <div class="location-card__overlay">
          <div class="location-card__name">${loc.name}</div>
        </div>
      </div>
    `).join('');

    // Add click events to open image modal
    const locationModal = new Modal();
    locationsGrid.querySelectorAll('.location-card').forEach(card => {
      card.addEventListener('click', () => {
        const image = card.dataset.image;
        const name = card.dataset.name;
        locationModal.open(`
          <img src="${image}" alt="${name}" style="max-width: 100%; max-height: 80vh; border-radius: 8px; object-fit: contain;">
        `, {
          title: name,
          className: 'modal--image'
        });
      });
    });
  }
}

function initShopsPage() {
  initShopPopups();
}
