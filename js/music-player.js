// ============================================
// Music Player Component - Expandable Panel
// ============================================

const PLAYLIST = [
  { name: "Intro Record Keeper", file: "music/ostintro.mp3", category: "epica" },
  { name: "Entrada Epica", file: "music/ostEntradaEpica.mp3", category: "epica" },
  { name: "Preparación pelea", file: "music/ostfight3.mp3", category: "pelea" },
  { name: "Intro Record Keeper 2", file: "music/ostfight5.mp3", category: "epica" },
  { name: "Persecución", file: "music/ostPersecucion.mp3", category: "tension" },
  { name: "Situación Crítica", file: "music/ostSituacionCritica.mp3", category: "tension" },
  { name: "Entrada Boss", file: "music/ostEntradaBoss.mp3", category: "pelea" },
  { name: "Música de tensión", file: "music/osttenso1.mp3", category: "tension" },
  { name: "¡Apareció la Marina!", file: "music/ostmarina.mp3", category: "tension" },
  { name: "Escape Chistoso", file: "music/ostEscapeChistoso.mp3", category: "tension" },
  { name: "Confuso", file: "music/ostconfuso.mp3", category: "ambiental" },
  { name: "SE VIENE", file: "music/ostisladestruida.mp3", category: "tension" },
  { name: "Musica Triste", file: "music/osttriste.mp3", category: "triste" },
  { name: "Musica Chill", file: "music/ostpueblo1.mp3", category: "ambiental" },
  { name: "Pueblo Alegre", file: "music/ostpueblo3.mp3", category: "ambiental" },
  { name: "Victoria", file: "music/ostpueblo4.mp3", category: "epica" },
  { name: "Tienda", file: "music/osttienda.mp3", category: "ambiental" },
  { name: "Musica Chill 2", file: "music/ostvictoria.mp3", category: "ambiental" },
  { name: "Empieza el viaje", file: "music/ostnav3.mp3", category: "ambiental" },
  { name: "Navegando", file: "music/ostnav4.mp3", category: "ambiental" },
  { name: "Pelea Intensa", file: "music/ostPeleaIntensa.mp3", category: "pelea" },
  { name: "Pelea Casual", file: "music/ostPeleaCasual.mp3", category: "pelea" },
  { name: "Pelea", file: "music/ostPelea.mp3", category: "pelea" },
  { name: "Splinter Nos Salva", file: "music/ostSplinterNosSalva.mp3", category: "epica" },
  { name: "Entrada Boss 2", file: "music/ostEntradaBoss2.mp3", category: "pelea" },
  { name: "Ventaja", file: "music/ostVentaja.mp3", category: "pelea" },
  { name: "Charla NPC cool", file: "music/ostNPC.mp3", category: "ambiental" },
  { name: "Emboscada", file: "music/ostEmboscada.mp3", category: "epica" },
  { name: "PeleaImportante", file: "music/ostPeleaImportante.mp3", category: "epica" },
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
    this.volumeBtn = this.player.querySelector('.music-player__btn--volume');
    this.volumeSlider = this.player.querySelector('.music-player__volume-slider');
    this.progressBar = this.player.querySelector('.music-player__progress');
    this.progressFill = this.player.querySelector('.music-player__progress-fill');
    this.timeCurrent = this.player.querySelector('.music-player__time-current');
    this.timeTotal = this.player.querySelector('.music-player__time-total');

    this.allTracks = [...PLAYLIST];
    this.currentTrack = null;
    this.isPlaying = false;
    this.isRepeating = false;
    this.activeFilter = 'all';
    this.volume = 1;
    this.previousVolume = 1;

    this.init();
    this.restoreState();
  }

  init() {
    if (!this.audio) return;

    this.renderTrackList();
    this.bindEvents();
    this.bindMusicEvents();
    this.bindVolumeEvents();
    this.bindProgressEvents();
    this.updateVolumeIcon();

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

  bindVolumeEvents() {
    if (this.volumeBtn) {
      this.volumeBtn.addEventListener('click', () => this.toggleMute());
    }

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', () => {
        this.setVolume(parseFloat(this.volumeSlider.value));
      });
    }
  }

  bindProgressEvents() {
    if (this.progressBar) {
      this.progressBar.addEventListener('click', (e) => this.seekTo(e));
    }

    if (this.audio) {
      this.audio.addEventListener('timeupdate', () => this.updateProgress());
      this.audio.addEventListener('loadedmetadata', () => this.updateProgress());
    }
  }

  seekTo(e) {
    if (!this.audio || !this.audio.duration) return;
    const rect = this.progressBar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.audio.currentTime = ratio * this.audio.duration;
    this.updateProgress();
    this.saveState();
  }

  updateProgress() {
    if (!this.audio) return;
    const current = this.audio.currentTime || 0;
    const duration = this.audio.duration || 0;
    const pct = duration > 0 ? (current / duration) * 100 : 0;

    if (this.progressFill) this.progressFill.style.width = pct + '%';
    if (this.timeCurrent) this.timeCurrent.textContent = this.formatTime(current);
    if (this.timeTotal) this.timeTotal.textContent = this.formatTime(duration);
  }

  formatTime(sec) {
    if (!sec || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.audio) this.audio.volume = this.volume;
    if (this.volume > 0) this.previousVolume = this.volume;
    this.saveState();
    this.updateVolumeIcon();
  }

  toggleMute() {
    if (this.volume > 0) {
      this.previousVolume = this.volume;
      this.setVolume(0);
    } else {
      this.setVolume(this.previousVolume || 1);
    }
  }

  updateVolumeIcon() {
    if (!this.volumeBtn) return;
    let svg;
    if (this.volume < 0.01) {
      svg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
    } else if (this.volume < 0.5) {
      svg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
    } else {
      svg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
    }
    this.volumeBtn.innerHTML = svg;
    this.volumeBtn.setAttribute('aria-label', this.volume < 0.01 ? 'Activar sonido' : 'Silenciar');
  }

  saveState() {
    const state = {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      isRepeating: this.isRepeating,
      currentTime: this.audio ? this.audio.currentTime : 0,
      volume: this.volume
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

      if (state.volume !== undefined) {
        this.volume = state.volume;
        this.previousVolume = state.volume > 0 ? state.volume : 1;
        if (this.audio) this.audio.volume = this.volume;
        if (this.volumeSlider) this.volumeSlider.value = this.volume;
        this.updateVolumeIcon();
      }

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

    tracks.sort((a, b) => a.name.localeCompare(b.name));

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
      if (!this.allTracks.some(t => t.file === track.file)) {
        this.allTracks.push({ ...track, category: 'personaje' });
      }
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

    if (this.volumeSlider) this.volumeSlider.value = this.volume;
    this.updateVolumeIcon();
    this.updateProgress();

    this.renderTrackList();
  }
}
