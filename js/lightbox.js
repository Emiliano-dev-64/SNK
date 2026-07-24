// ============================================
// Lightbox - Shared image lightbox component
// ============================================

import { lightboxHTML } from './templates.js';

let lightboxEl = null;
let keyHandler = null;

function ensureLightbox() {
  if (lightboxEl && document.body.contains(lightboxEl)) return lightboxEl;

  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';
  lightboxEl.innerHTML = lightboxHTML();
  document.body.appendChild(lightboxEl);

  lightboxEl.querySelector('.lightbox__close').addEventListener('click', () => close());
  lightboxEl.querySelector('.lightbox__prev').addEventListener('click', () => navigate(-1));
  lightboxEl.querySelector('.lightbox__next').addEventListener('click', () => navigate(1));
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) close();
  });

  return lightboxEl;
}

export function open(images, index = 0) {
  const lb = ensureLightbox();
  if (!images || images.length === 0) return;

  lb._images = images;
  lb._index = index;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
  updateImage();

  if (!keyHandler) {
    keyHandler = (e) => {
      if (!lightboxEl || !lightboxEl.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    document.addEventListener('keydown', keyHandler);
  }
}

export function close() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove('active');
  document.body.style.overflow = '';
}

export function navigate(dir) {
  if (!lightboxEl || !lightboxEl._images) return;
  const imgs = lightboxEl._images;
  lightboxEl._index = (lightboxEl._index + dir + imgs.length) % imgs.length;
  updateImage();
}

function updateImage() {
  if (!lightboxEl || !lightboxEl._images) return;
  const item = lightboxEl._images[lightboxEl._index];
  const src = typeof item === 'string' ? item : item.src;
  const caption = typeof item === 'string' ? '' : (item.caption || '');

  const img = lightboxEl.querySelector('.lightbox__img');
  const capEl = lightboxEl.querySelector('.lightbox__caption');
  const counter = lightboxEl.querySelector('.lightbox__counter');

  img.src = src;
  img.alt = caption || `Galería ${lightboxEl._index + 1}`;
  capEl.textContent = caption;
  capEl.style.display = caption ? 'block' : 'none';
  counter.textContent = `${lightboxEl._index + 1} / ${lightboxEl._images.length}`;
}

export function bindToGrid(grid, images, itemSelector = '.champion-gallery__item, .region-gallery__item') {
  grid.querySelectorAll(itemSelector).forEach(item => {
    const openAt = () => open(images, parseInt(item.dataset.index));
    item.addEventListener('click', openAt);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAt();
      }
    });
  });
}
