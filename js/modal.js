// ============================================
// Modal Component
// ============================================

export class Modal {
  constructor() {
    this.backdrop = null;
    this.modal = null;
    this.isOpen = false;

    this.init();
  }

  init() {
    // Create modal structure if it doesn't exist
    if (!document.querySelector('.modal-backdrop')) {
      this.create();
    } else {
      this.backdrop = document.querySelector('.modal-backdrop');
      this.modal = this.backdrop.querySelector('.modal');
    }

    // Close on backdrop click
    if (this.backdrop) {
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) {
          this.close();
        }
      });
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close buttons
    document.querySelectorAll('.modal__close').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });
  }

  create() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.innerHTML = `
      <div class="modal">
        <button class="close-btn modal__close" aria-label="Cerrar"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg></button>
        <div class="modal__content"></div>
      </div>
    `;
    document.body.appendChild(this.backdrop);
    this.modal = this.backdrop.querySelector('.modal');

    this.backdrop.querySelector('.modal__close').addEventListener('click', () => this.close());
  }

  open(content, options = {}) {
    if (!this.backdrop) return;

    const modalContent = this.backdrop.querySelector('.modal__content');
    
    if (typeof content === 'string') {
      modalContent.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      modalContent.innerHTML = '';
      modalContent.appendChild(content);
    }

    if (options.title) {
      const title = document.createElement('h2');
      title.className = 'modal__title';
      title.textContent = options.title;
      modalContent.prepend(title);
    }

    if (options.className) {
      this.modal.className = `modal ${options.className}`;
    }

    this.backdrop.classList.add('active');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.backdrop) return;

    this.backdrop.classList.remove('active');
    this.isOpen = false;
    document.body.style.overflow = '';
    
    // Clear content after animation
    setTimeout(() => {
      const modalContent = this.backdrop.querySelector('.modal__content');
      if (modalContent) modalContent.innerHTML = '';
    }, 300);
  }
}

// Shop popup functionality
export function initShopPopups() {
  const modal = new Modal();

  document.querySelectorAll('.shop-card').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const openShop = () => {
      const shopId = card.dataset.shopId;
      const itemsImage = card.dataset.items;
      if (itemsImage) {
        modal.open(`
          <img src="${itemsImage}" alt="Lista de items">
        `, {
          className: 'modal--image'
        });
      }
    };
    card.addEventListener('click', openShop);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openShop();
      }
    });
  });
}
