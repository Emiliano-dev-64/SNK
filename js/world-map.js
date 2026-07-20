// ============================================
// World Map - Interactive Map (Runaterra Style)
// ============================================

import { clamp, throttle } from './utils.js';

export class WorldMap {
  constructor(containerSelector = '#mapaContainer') {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.zoomEl = this.container.querySelector('#mapaZoom');
    this.image = this.container.querySelector('#mapaBase');
    this.tooltip = document.querySelector('.region-tooltip');
    this.zoomInBtn = document.querySelector('#zoomIn');
    this.zoomOutBtn = document.querySelector('#zoomOut');
    this.zoomResetBtn = document.querySelector('#zoomReset');
    this.zoomLevelEl = document.querySelector('#zoomLevel');

    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.minScale = 0.5;
    this.maxScale = 4;

    this.init();
  }

  init() {
    this.bindEvents();
    this.clampAndApply();
  }

  bindEvents() {
    // Zoom with scroll wheel
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      this.zoom(delta, e.clientX, e.clientY);
    }, { passive: false });

    // Pan with mouse drag
    this.container.addEventListener('mousedown', (e) => {
      if (e.target.closest('.hotspot')) return;
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', throttle((e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.clampAndApply();
    }, 16));

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.container.style.cursor = 'grab';
    });

    // Touch events for mobile
    let lastTouchDistance = 0;
    let lastTouchX = 0;
    let lastTouchY = 0;

    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        lastTouchDistance = this.getTouchDistance(e.touches);
      } else if (e.touches.length === 1) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.panX;
        this.startY = e.touches[0].clientY - this.panY;
      }
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const newDistance = this.getTouchDistance(e.touches);
        const delta = (newDistance - lastTouchDistance) * 0.005;
        this.zoom(delta);
        lastTouchDistance = newDistance;
      } else if (e.touches.length === 1 && this.isDragging) {
        this.panX = e.touches[0].clientX - this.startX;
        this.panY = e.touches[0].clientY - this.startY;
        this.clampAndApply();
      }
    }, { passive: false });

    this.container.addEventListener('touchend', () => {
      this.isDragging = false;
      lastTouchDistance = 0;
    });

    // Zoom controls
    if (this.zoomInBtn) {
      this.zoomInBtn.addEventListener('click', () => this.zoom(0.3));
    }
    if (this.zoomOutBtn) {
      this.zoomOutBtn.addEventListener('click', () => this.zoom(-0.3));
    }
    if (this.zoomResetBtn) {
      this.zoomResetBtn.addEventListener('click', () => this.resetZoom());
    }

    // Hotspot tooltips
    this.container.querySelectorAll('.hotspot').forEach(hotspot => {
      hotspot.addEventListener('mouseenter', (e) => this.showTooltip(e));
      hotspot.addEventListener('mousemove', (e) => this.moveTooltip(e));
      hotspot.addEventListener('mouseleave', () => this.hideTooltip());
    });
  }

  zoom(delta, clientX, clientY) {
    const prevScale = this.scale;
    this.scale = clamp(this.scale + delta, this.minScale, this.maxScale);

    if (clientX !== undefined && clientY !== undefined) {
      const rect = this.container.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      this.panX -= (mx / prevScale) * (this.scale - prevScale);
      this.panY -= (my / prevScale) * (this.scale - prevScale);
    }

    this.clampAndApply();
    this.updateZoomLevel();
  }

  resetZoom() {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.clampAndApply();
    this.updateZoomLevel();
  }

  clampAndApply() {
    if (!this.image || !this.container) return;

    const baseW = this.image.clientWidth;
    const baseH = this.image.clientHeight;
    const iw = baseW * this.scale;
    const ih = baseH * this.scale;
    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;

    if (iw <= cw) {
      this.panX = (cw - iw) / 2;
    } else {
      this.panX = clamp(this.panX, cw - iw, 0);
    }

    if (ih <= ch) {
      this.panY = (ch - ih) / 2;
    } else {
      this.panY = clamp(this.panY, ch - ih, 0);
    }

    if (this.zoomEl) {
      this.zoomEl.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    }
  }

  updateZoomLevel() {
    if (this.zoomLevelEl) {
      this.zoomLevelEl.textContent = `${Math.round(this.scale * 100)}%`;
    }
  }

  showTooltip(e) {
    if (!this.tooltip) return;
    const name = e.currentTarget.dataset.name;
    this.tooltip.textContent = name;
    this.tooltip.classList.add('visible');
    this.moveTooltip(e);
  }

  moveTooltip(e) {
    if (!this.tooltip) return;
    this.tooltip.style.left = `${e.clientX + 15}px`;
    this.tooltip.style.top = `${e.clientY + 15}px`;
  }

  hideTooltip() {
    if (!this.tooltip) return;
    this.tooltip.classList.remove('visible');
  }

  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
