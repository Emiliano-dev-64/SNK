// ============================================
// Templates - Shared HTML templates (DRY)
// ============================================

export function championCard(champion, opts = {}) {
  const { stagger, link = true } = opts;
  const cls = stagger ? `champion-card fade-in-up ${stagger}` : 'champion-card fade-in-up';
  const href = link ? `champion.html?id=${champion.id}` : '#';
  const onerror = `this.src='img/champions/perfilMaximo.png'`;

  return `
    <a href="${href}" class="${cls}" data-id="${champion.id}">
      <img src="${champion.image}" alt="${champion.name}" class="champion-card__image" loading="lazy" onerror="${onerror}">
      <div class="champion-card__overlay">
        <div class="champion-card__name">${champion.name}</div>
        <div class="champion-card__title">${champion.title}</div>
      </div>
      <div class="champion-card__border"></div>
    </a>`;
}

export function championCardMini(champion) {
  return `
    <a href="champion.html?id=${champion.id}" class="region-champion">
      <img src="${champion.icon}" alt="${champion.name}" class="region-champion__icon"
           loading="lazy" onerror="this.src='img/champions/perfilMaximo.png'">
      <span class="region-champion__name">${champion.name}</span>
    </a>`;
}

const CLOSE_SVG = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>';
const PREV_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
const NEXT_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';

export function lightboxHTML() {
  return `
    <button class="lightbox__close" aria-label="Cerrar">${CLOSE_SVG}</button>
    <button class="lightbox__prev" aria-label="Anterior">${PREV_SVG}</button>
    <button class="lightbox__next" aria-label="Siguiente">${NEXT_SVG}</button>
    <div class="lightbox__content">
      <img class="lightbox__img" src="" alt="">
      <div class="lightbox__caption"></div>
      <div class="lightbox__counter"></div>
    </div>`;
}
