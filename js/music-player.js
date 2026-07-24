// ============================================
// Music Player Component - Expandable Panel
// ============================================

const PLAYLIST = [
  { name: "Intro Record Keeper", file: "music/ostintro.mp3", category: "epica" },
  { name: "Música de pelea 1", file: "music/ostfight1.mp3", category: "pelea" },
  { name: "Música de pelea 2", file: "music/ostfight2.mp3", category: "pelea" },
  { name: "Música de pelea 3", file: "music/ostfight3.mp3", category: "pelea" },
  { name: "Música de pelea 4", file: "music/ostfight4.mp3", category: "pelea" },
  { name: "Música de pelea 5", file: "music/ostfight5.mp3", category: "pelea" },
  { name: "Música de pelea 6", file: "music/ostfight6.mp3", category: "pelea" },
  { name: "Música de pelea 7", file: "music/ostfight7.mp3", category: "pelea" },
  { name: "Música de pelea 8", file: "music/ostfight8.mp3", category: "pelea" },
  { name: "Música de pelea 9", file: "music/ostfight9.mp3", category: "pelea" },
  { name: "Música de pelea 10", file: "music/ostfight10.mp3", category: "pelea" },
  { name: "Música de Boss", file: "music/ostbossfight.mp3", category: "pelea" },
  { name: "Música de Boss 2", file: "music/ostbossfight2.mp3", category: "pelea" },
  { name: "Música de tensión 1", file: "music/osttenso1.mp3", category: "tension" },
  { name: "Música de tensión 2", file: "music/osttenso2.mp3", category: "tension" },
  { name: "Música de tensión 3", file: "music/osttenso3.mp3", category: "tension" },
  { name: "Apareció la Marina!", file: "music/ostmarina.mp3", category: "tension" },
  { name: "Escape", file: "music/ostescape.mp3", category: "tension" },
  { name: "Confuso", file: "music/ostconfuso.mp3", category: "tension" },
  { name: "Isla destruida", file: "music/ostisladestruida.mp3", category: "triste" },
  { name: "Tristeza", file: "music/osttriste.mp3", category: "triste" },
  { name: "Pueblo 1", file: "music/ostpueblo1.mp3", category: "ambiental" },
  { name: "Pueblo 2", file: "music/ostpueblo2.mp3", category: "ambiental" },
  { name: "Pueblo 3", file: "music/ostpueblo3.mp3", category: "ambiental" },
  { name: "Pueblo 4", file: "music/ostpueblo4.mp3", category: "ambiental" },
  { name: "Pueblo 5", file: "music/ostpueblo5.mp3", category: "ambiental" },
  { name: "Pueblo 6", file: "music/ostpueblo6.mp3", category: "ambiental" },
  { name: "Despidiendo la Isla", file: "music/ostisladespedida.mp3", category: "triste" },
  { name: "Tienda", file: "music/osttienda.mp3", category: "ambiental" },
  { name: "Victoria", file: "music/ostvictoria.mp3", category: "epica" },
  { name: "Navegando 1", file: "music/ostnav1.mp3", category: "ambiental" },
  { name: "Navegando 2", file: "music/ostnav2.mp3", category: "ambiental" },
  { name: "Navegando 3", file: "music/ostnav3.mp3", category: "ambiental" },
  { name: "Navegando 4", file: "music/ostnav4.mp3", category: "ambiental" },
  { name: "Tema de Máximo", file: "music/characters/maximoOST.mp3", category: "personaje" },
  { name: "Tema de Nacho", file: "music/characters/nachoOST.mp3", category: "personaje" },
  { name: "Tema de Splinter", file: "music/characters/geronimoOST.mp3", category: "personaje" },
  { name: "Tema de Caelis", file: "music/characters/caelisOST.mp3", category: "personaje" },
  { name: "Tema de Arthur", file: "music/characters/arthurOST.mp3", category: "personaje" }
];

const CATEGORIES = {
  all: "Todos",
  ambiental: "Ambiental",
  pelea: "Pelea",
  tension: "Tensión",
  triste: "Triste",
  epica: "Épica",
  personaje: "Personajes"
};

const STORAGE_KEY = 'musicPlayer_state';

export class MusicPlayer {
  constructor() {
    this.player = document.querySelector('.music-player');
    if (!this.player) return;

    this.audio = this.player.querySelector('.music-player__audio');
    this.tracklist = this.player.querySelector('.music-player__tracklist');
    this.searchInput = this.player.querySelector('.music-player__search input');
    this.expandBtn = this.player.querySelector('.music-player__expand');
    this.closeBtn = this.player.querySelector('.music-player__close');
    this.playBtn = this.player.querySelector('.music-player__btn--play');
    this.prevBtn = this.player.querySelector('.music-player__btn--prev');
    this.nextBtn = this.player.querySelector('.music-player__btn--next');
    this.repeatBtn = this.player.querySelector('.music-player__btn--repeat');
    this.nowName = this.player.querySelector('.music-player__now-name');

    this.allTracks = [...PLAYLIST];
    this.currentTrack = null;
    this.isPlaying = false;
    this.isRepeating = false;
    this.activeFilter = 'all';

    this.init();
    this.restoreState();
  }

  init() {
    if (!this.audio) return;

    this.renderTrackList();
    this.bindEvents();
    this.bindMusicEvents();

    window.addEventListener('beforeunload', () => {
      this.saveState();
    });
  }

  bindEvents() {
    if (this.expandBtn) {
      this.expandBtn.addEventListener('click', () => this.togglePanel());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.togglePanel());
    }

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

    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.filterTracks());
    }

    this.player.querySelectorAll('.music-player__filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.player.querySelectorAll('.music-player__filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this.filterTracks();
      });
    });

    if (this.audio) {
      this.audio.addEventListener('ended', () => {
        if (!this.isRepeating) {
          this.next();
        } else {
          this.saveState();
        }
      });
    }
  }

  bindMusicEvents() {
    document.addEventListener('music:play', (e) => {
      this.playSpecificTrack(e.detail.file, e.detail.name);
    });
  }

  saveState() {
    const state = {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      isRepeating: this.isRepeating,
      currentTime: this.audio ? this.audio.currentTime : 0
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  restoreState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);

      if (state.isRepeating) {
        this.isRepeating = true;
        if (this.audio) this.audio.loop = true;
      }

      if (state.currentTrack) {
        const track = this.allTracks.find(t => t.file === state.currentTrack.file);
        if (track) {
          this.currentTrack = track;
          this.audio.src = track.file;
          if (state.currentTime) this.audio.currentTime = state.currentTime;
          this.updateUI();
          if (state.isPlaying) {
            this.audio.play().then(() => {
              this.isPlaying = true;
              this.updateUI();
            }).catch(() => {});
          }
        }
      }
    } catch (e) {}
  }

  togglePanel() {
    this.player.classList.toggle('expanded');
  }

  renderTrackList() {
    if (!this.tracklist) return;

    const filtered = this.getFilteredTracks();

    if (filtered.length === 0) {
      this.tracklist.innerHTML = '<div class="music-player__empty">No se encontraron canciones</div>';
      return;
    }

    this.tracklist.innerHTML = filtered.map((track, i) => {
      const isActive = this.currentTrack && this.currentTrack.file === track.file;
      return `
        <div class="music-player__track ${isActive ? 'active' : ''}" data-file="${track.file}">
          <svg class="music-player__track-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <span class="music-player__track-name">${track.name}</span>
          <span class="music-player__track-category">${CATEGORIES[track.category] || track.category}</span>
        </div>
      `;
    }).join('');

    this.tracklist.querySelectorAll('.music-player__track').forEach(el => {
      el.addEventListener('click', () => {
        const file = el.dataset.file;
        const track = this.allTracks.find(t => t.file === file);
        if (track) {
          this.playTrack(track);
        }
      });
    });
  }

  getFilteredTracks() {
    let tracks = this.allTracks;

    if (this.activeFilter !== 'all') {
      tracks = tracks.filter(t => t.category === this.activeFilter);
    }

    if (this.searchInput && this.searchInput.value.trim()) {
      const query = this.searchInput.value.trim().toLowerCase();
      tracks = tracks.filter(t => t.name.toLowerCase().includes(query));
    }

    return tracks;
  }

  filterTracks() {
    this.renderTrackList();
  }

  playTrack(track) {
    if (!this.audio) return;
    this.audio.src = track.file;
    this.audio.play().catch(() => {});
    this.currentTrack = track;
    this.isPlaying = true;
    this.saveState();
    this.updateUI();
  }

  playSpecificTrack(file, name) {
    if (!this.audio) return;
    this.audio.src = file;
    this.audio.play().catch(() => {});
    this.currentTrack = { file, name, category: 'personaje' };
    this.isPlaying = true;
    this.saveState();
    this.updateUI();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      if (this.currentTrack) {
        this.audio.play().catch(() => {});
        this.isPlaying = true;
      } else if (this.allTracks.length > 0) {
        this.playTrack(this.allTracks[0]);
        return;
      }
    }
    this.saveState();
    this.updateUI();
  }

  next() {
    if (!this.currentTrack) {
      if (this.allTracks.length > 0) this.playTrack(this.allTracks[0]);
      return;
    }
    const tracks = this.getFilteredTracks();
    const idx = tracks.findIndex(t => t.file === this.currentTrack.file);
    const nextIdx = (idx + 1) % tracks.length;
    this.playTrack(tracks[nextIdx]);
  }

  prev() {
    if (!this.currentTrack) {
      if (this.allTracks.length > 0) this.playTrack(this.allTracks[this.allTracks.length - 1]);
      return;
    }
    const tracks = this.getFilteredTracks();
    const idx = tracks.findIndex(t => t.file === this.currentTrack.file);
    const prevIdx = (idx - 1 + tracks.length) % tracks.length;
    this.playTrack(tracks[prevIdx]);
  }

  toggleRepeat() {
    this.isRepeating = !this.isRepeating;
    if (this.audio) {
      this.audio.loop = this.isRepeating;
    }
    this.saveState();
    this.updateUI();
  }

  addTracks(tracks) {
    tracks.forEach(track => {
      this.allTracks.push({ ...track, category: 'personaje' });
    });
    this.renderTrackList();
  }

  updateUI() {
    if (this.playBtn) {
      this.playBtn.innerHTML = this.isPlaying
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      this.playBtn.setAttribute('aria-label', this.isPlaying ? 'Pausar' : 'Reproducir');
    }

    if (this.repeatBtn) {
      this.repeatBtn.classList.toggle('active', this.isRepeating);
    }

    if (this.nowName) {
      this.nowName.textContent = this.currentTrack ? this.currentTrack.name : '-';
    }

    this.renderTrackList();
  }
}
