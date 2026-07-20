// ============================================
// Music Player Component
// ============================================

const PLAYLIST = [
  { name: "Intro Record Keeper", file: "../music/ostintro.mp3" },
  { name: "Música de pelea 1", file: "../music/ostfight1.mp3" },
  { name: "Música de pelea 2", file: "../music/ostfight2.mp3" },
  { name: "Música de pelea 3", file: "../music/ostfight3.mp3" },
  { name: "Música de pelea 4", file: "../music/ostfight4.mp3" },
  { name: "Música de pelea 5", file: "../music/ostfight5.mp3" },
  { name: "Música de pelea 6", file: "../music/ostfight6.mp3" },
  { name: "Música de pelea 7", file: "../music/ostfight7.mp3" },
  { name: "Música de pelea 8", file: "../music/ostfight8.mp3" },
  { name: "Música de pelea 9", file: "../music/ostfight9.mp3" },
  { name: "Música de pelea 10", file: "../music/ostfight10.mp3" },
  { name: "Música de Boss", file: "../music/ostbossfight.mp3" },
  { name: "Música de Boss 2", file: "../music/ostbossfight2.mp3" },
  { name: "Música de tensión 1", file: "../music/osttenso1.mp3" },
  { name: "Música de tensión 2", file: "../music/osttenso2.mp3" },
  { name: "Música de tensión 3", file: "../music/osttenso3.mp3" },
  { name: "Apareció la Marina!", file: "../music/ostmarina.mp3" },
  { name: "Escape", file: "../music/ostescape.mp3" },
  { name: "Confuso", file: "../music/ostconfuso.mp3" },
  { name: "Isla destruida", file: "../music/ostisladestruida.mp3" },
  { name: "Tristeza", file: "../music/osttriste.mp3" },
  { name: "Pueblo 1", file: "../music/ostpueblo1.mp3" },
  { name: "Pueblo 2", file: "../music/ostpueblo2.mp3" },
  { name: "Pueblo 3", file: "../music/ostpueblo3.mp3" },
  { name: "Pueblo 4", file: "../music/ostpueblo4.mp3" },
  { name: "Pueblo 5", file: "../music/ostpueblo5.mp3" },
  { name: "Pueblo 6", file: "../music/ostpueblo6.mp3" },
  { name: "Despidiendo la Isla", file: "../music/ostisladespedida.mp3" },
  { name: "Tienda", file: "../music/osttienda.mp3" },
  { name: "Victoria", file: "../music/ostvictoria.mp3" },
  { name: "Navegando 1", file: "../music/ostnav1.mp3" },
  { name: "Navegando 2", file: "../music/ostnav2.mp3" },
  { name: "Navegando 3", file: "../music/ostnav3.mp3" },
  { name: "Navegando 4", file: "../music/ostnav4.mp3" }
];

export class MusicPlayer {
  constructor() {
    this.player = document.querySelector('.music-player');
    if (!this.player) return;

    this.audio = this.player.querySelector('.music-player__audio');
    this.select = this.player.querySelector('.music-player__select');
    this.playBtn = this.player.querySelector('.music-player__btn--play');
    this.prevBtn = this.player.querySelector('.music-player__btn--prev');
    this.nextBtn = this.player.querySelector('.music-player__btn--next');
    this.repeatBtn = this.player.querySelector('.music-player__btn--repeat');
    this.toggleBtn = this.player.querySelector('.music-player__toggle');

    this.currentIndex = 0;
    this.isPlaying = false;
    this.isRepeating = false;

    this.init();
  }

  init() {
    if (!this.audio) return;

    this.populateSelect();
    this.bindEvents();
  }

  populateSelect() {
    if (!this.select) return;
    
    this.select.innerHTML = '';
    PLAYLIST.forEach((track, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = track.name;
      this.select.appendChild(option);
    });
  }

  bindEvents() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    if (this.repeatBtn) {
      this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
    }

    if (this.select) {
      this.select.addEventListener('change', (e) => {
        this.currentIndex = parseInt(e.target.value);
        this.loadAndPlay();
      });
    }

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        this.player.classList.toggle('minimized');
      });
    }

    if (this.audio) {
      this.audio.addEventListener('ended', () => {
        if (!this.isRepeating) {
          this.next();
        }
      });
    }
  }

  loadAndPlay() {
    if (!this.audio || !PLAYLIST[this.currentIndex]) return;

    this.audio.src = PLAYLIST[this.currentIndex].file;
    this.audio.play().catch(() => {
      // Autoplay blocked by browser
    });
    this.isPlaying = true;
    this.updateUI();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      this.loadAndPlay();
    }
    this.updateUI();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % PLAYLIST.length;
    this.loadAndPlay();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    this.loadAndPlay();
  }

  toggleRepeat() {
    this.isRepeating = !this.isRepeating;
    if (this.audio) {
      this.audio.loop = this.isRepeating;
    }
    this.updateUI();
  }

  updateUI() {
    if (this.playBtn) {
      this.playBtn.innerHTML = this.isPlaying ? '⏸' : '▶';
    }
    if (this.repeatBtn) {
      this.repeatBtn.classList.toggle('active', this.isRepeating);
    }
    if (this.select) {
      this.select.value = this.currentIndex;
    }
  }
}
