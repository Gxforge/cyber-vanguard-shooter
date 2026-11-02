// ============================================================================
// CYBER VANGUARD: PROTOCOLO NEÓN — 2D TACTICAL ARENA SHOOTER
// 100% Custom PNG Sprites & Raster UI Icons
// ============================================================================

(() => {
  'use strict';

  // --- ASSET MANIFEST ---
  const ASSET_PATHS = {
    arenaTile: 'assets/arena_tile.png',
    heroIdle: 'assets/hero_idle.png',
    heroWalk1: 'assets/hero_walk1.png',
    heroWalk2: 'assets/hero_walk2.png',
    heroShoot: 'assets/hero_shoot.png',
    heroDash: 'assets/hero_dash.png',
    grunt1: 'assets/enemy_grunt_1.png',
    grunt2: 'assets/enemy_grunt_2.png',
    drone1: 'assets/enemy_drone_1.png',
    drone2: 'assets/enemy_drone_2.png',
    gunner1: 'assets/enemy_gunner_1.png',
    gunner2: 'assets/enemy_gunner_2.png',
    tank1: 'assets/enemy_tank_1.png',
    tank2: 'assets/enemy_tank_2.png',
    boss1: 'assets/enemy_boss_1.png',
    boss2: 'assets/enemy_boss_2.png',
    allyTurret: 'assets/ally_turret.png',
    bulletRifle: 'assets/bullet_rifle.png',
    bulletShotgun: 'assets/bullet_shotgun.png',
    bulletMinigun: 'assets/bullet_minigun.png',
    bulletRailgun: 'assets/bullet_railgun.png',
    bulletEnemy: 'assets/bullet_enemy.png',
    bulletMissile: 'assets/bullet_boss_missile.png',
    pickupMedkit: 'assets/pickup_medkit.png',
    pickupShield: 'assets/pickup_shield.png',
    pickupCoin: 'assets/pickup_coin.png',
    pickupOverdrive: 'assets/pickup_overdrive.png',
    exp1: 'assets/explosion_1.png',
    exp2: 'assets/explosion_2.png',
    exp3: 'assets/explosion_3.png',
    exp4: 'assets/explosion_4.png',
    crosshair: 'assets/crosshair.png'
  };

  const IMAGES = {};
  let assetsLoaded = 0;
  const totalAssets = Object.keys(ASSET_PATHS).length;

  Object.entries(ASSET_PATHS).forEach(([key, src]) => {
    const img = new Image();
    img.onload = () => { assetsLoaded++; };
    img.src = src;
    IMAGES[key] = img;
  });

  // --- WEB AUDIO SYNTHESIZER ---
  class CyberAudio {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.bgmTimer = null;
      this.bgmStep = 0;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      const icon = document.getElementById('img-sound-icon');
      if (icon) {
        icon.src = this.enabled ? 'assets/icon_sound_on.png' : 'assets/icon_sound_off.png';
      }
      if (!this.enabled) {
        this.stopBGM();
      } else if (state.mode === 'playing') {
        this.startBGM();
      }
    }

    playTone(freqStart, freqEnd, duration, type = 'sawtooth', gainVal = 0.14) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    }

    playNoise(duration = 0.18, gainVal = 0.18, filterFreq = 900) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    }

    shoot(weaponIdx) {
      if (weaponIdx === 0) {
        this.playTone(720, 180, 0.09, 'sawtooth', 0.11);
      } else if (weaponIdx === 1) {
        this.playNoise(0.16, 0.22, 1200);
        this.playTone(260, 65, 0.14, 'square', 0.14);
      } else if (weaponIdx === 2) {
        this.playTone(520, 140, 0.06, 'square', 0.09);
      } else if (weaponIdx === 3) {
        this.playTone(1350, 110, 0.26, 'sawtooth', 0.18);
        this.playNoise(0.22, 0.16, 2400);
      }
    }

    explosion(big = false) {
      this.playNoise(big ? 0.45 : 0.22, big ? 0.28 : 0.16, big ? 650 : 950);
      this.playTone(big ? 140 : 210, 28, big ? 0.4 : 0.2, 'triangle', big ? 0.22 : 0.12);
    }

    pickup() {
      this.playTone(520, 1040, 0.12, 'sine', 0.14);
      setTimeout(() => this.playTone(780, 1560, 0.15, 'sine', 0.14), 70);
    }

    dash() {
      this.playTone(240, 880, 0.16, 'triangle', 0.15);
    }

    nuke() {
      this.playNoise(0.7, 0.34, 500);
      this.playTone(880, 35, 0.65, 'sawtooth', 0.25);
    }

    bossAlert() {
      this.playTone(180, 420, 0.45, 'sawtooth', 0.2);
      setTimeout(() => this.playTone(180, 420, 0.45, 'sawtooth', 0.2), 500);
    }

    startBGM() {
      this.stopBGM();
      if (!this.enabled) return;
      const bassNotes = [55, 55, 65.41, 55, 73.42, 65.41, 49, 55];
      this.bgmTimer = setInterval(() => {
        if (!this.enabled || state.mode !== 'playing') return;
        const note = bassNotes[this.bgmStep % bassNotes.length];
        this.playTone(note, note * 0.98, 0.16, 'triangle', 0.045);
        this.bgmStep++;
      }, 220);
    }

    stopBGM() {
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  }

  const audio = new CyberAudio();

  // --- WEAPON DEFINITIONS ---
  const WEAPON_DEFS = [
    {
      id: 0,
      name: 'Rifle de Pulso MK-I',
      shortName: 'PULSO MK-I',
      icon: 'assets/icon_weapon_rifle.png',
      bulletImg: 'bulletRifle',
      fireRate: 0.13,
      damage: 28,
      speed: 980,
      spread: 0.04,
      pellets: 1,
      magSize: 40,
      reloadTime: 1.05,
      pierce: 1,
      color: '#00f0ff',
      unlockCost: 0,
      upgradeBaseCost: 90,
      desc: 'Rifle de asalto de plasma equilibrado con alta cadencia y precisión táctica.'
    },
    {
      id: 1,
      name: 'Escopeta Iónica Doble',
      shortName: 'ESCOPETA ION',
      icon: 'assets/icon_weapon_shotgun.png',
      bulletImg: 'bulletShotgun',
      fireRate: 0.52,
      damage: 24,
      speed: 860,
      spread: 0.28,
      pellets: 7,
      magSize: 12,
      reloadTime: 1.35,
      pierce: 1,
      color: '#ff9900',
      unlockCost: 180,
      upgradeBaseCost: 140,
      desc: 'Dispara un abanico devastador de 7 proyectiles iónicos a corta y media distancia.'
    },
    {
      id: 2,
      name: 'Minigun del Vacío',
      shortName: 'MINIGUN VACÍO',
      icon: 'assets/icon_weapon_minigun.png',
      bulletImg: 'bulletMinigun',
      fireRate: 0.065,
      damage: 21,
      speed: 1040,
      spread: 0.11,
      pellets: 1,
      magSize: 90,
      reloadTime: 1.6,
      pierce: 1,
      color: '#d042ff',
      unlockCost: 380,
      upgradeBaseCost: 200,
      desc: 'Cañón rotatorio de materia oscura capaz de suprimir enjambres enteros.'
    },
    {
      id: 3,
      name: 'Hiper Railgun Dreadnought',
      shortName: 'HIPER RAILGUN',
      icon: 'assets/icon_weapon_railgun.png',
      bulletImg: 'bulletRailgun',
      fireRate: 0.68,
      damage: 145,
      speed: 1480,
      spread: 0.01,
      pellets: 1,
      magSize: 10,
      reloadTime: 1.5,
      pierce: 5,
      color: '#ff2864',
      unlockCost: 650,
      upgradeBaseCost: 280,
      desc: 'Lanza electromagnética hiper-veloz que atraviesa hasta 5 enemigos en línea.'
    }
  ];

  // --- ENEMY DEFINITIONS ---
  const ENEMY_TYPES = {
    grunt: {
      name: 'Araña Ciber',
      frames: ['grunt1', 'grunt2'],
      radius: 28,
      drawSize: 82,
      hp: 65,
      speed: 185,
      damage: 14,
      score: 35,
      credits: 12,
      ranged: false,
      color: '#ff3344'
    },
    drone: {
      name: 'Dron Rotor',
      frames: ['drone1', 'drone2'],
      radius: 25,
      drawSize: 78,
      hp: 48,
      speed: 245,
      damage: 12,
      score: 45,
      credits: 15,
      ranged: true,
      fireInterval: 2.2,
      bulletSpeed: 420,
      color: '#ff6622'
    },
    gunner: {
      name: 'Artillero Ion',
      frames: ['gunner1', 'gunner2'],
      radius: 32,
      drawSize: 94,
      hp: 135,
      speed: 130,
      damage: 18,
      score: 80,
      credits: 24,
      ranged: true,
      fireInterval: 1.55,
      bulletSpeed: 480,
      burst: 2,
      color: '#ff9900'
    },
    tank: {
      name: 'Goliath Mech',
      frames: ['tank1', 'tank2'],
      radius: 44,
      drawSize: 126,
      hp: 360,
      speed: 88,
      damage: 28,
      score: 180,
      credits: 50,
      ranged: true,
      fireInterval: 1.9,
      bulletSpeed: 430,
      spreadShot: 3,
      color: '#c840ff'
    },
    boss: {
      name: 'OVERLORD DREADNOUGHT',
      frames: ['boss1', 'boss2'],
      radius: 68,
      drawSize: 188,
      hp: 2400,
      speed: 74,
      damage: 38,
      score: 1200,
      credits: 260,
      ranged: true,
      fireInterval: 1.15,
      bulletSpeed: 500,
      isBoss: true,
      color: '#ff1e42'
    }
  };

  // --- DIFFICULTY SETTINGS ---
  const DIFFICULTIES = [
    { name: 'Cadete Espacial', hpMult: 0.8, dmgMult: 0.75, scoreMult: 1.0, creditMult: 1.25 },
    { name: 'Comando Vanguardia', hpMult: 1.0, dmgMult: 1.0, scoreMult: 1.5, creditMult: 1.0 },
    { name: 'Protocolo Aniquilación', hpMult: 1.35, dmgMult: 1.3, scoreMult: 2.5, creditMult: 1.2 }
  ];

  // --- GLOBAL GAME STATE ---
  const WORLD_W = 2400;
  const WORLD_H = 1800;

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const crosshairEl = document.getElementById('custom-crosshair');

  const state = {
    mode: 'menu', // 'menu' | 'playing' | 'paused' | 'shop' | 'gameover'
    difficulty: 1,
    wave: 1,
    score: 0,
    credits: 0,
    kills: 0,
    combo: 1,
    comboTimer: 0,
    overdriveTimer: 0,
    shakeTime: 0,
    shakeMag: 0,
    waveEnemiesRemaining: 0,
    waveSpawnQueue: [],
    spawnTimer: 0,
    betweenWaveTimer: 0,
    camera: { x: WORLD_W / 2, y: WORLD_H / 2 },
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, worldX: WORLD_W / 2, worldY: WORLD_H / 2, down: false },
    keys: {},
    touchMove: { active: false, dx: 0, dy: 0, id: null, startX: 0, startY: 0 },
    touchAim: { active: false, dx: 0, dy: 0, id: null, startX: 0, startY: 0 },
    pillars: [],
    player: null,
    weapons: [],
    bullets: [],
    enemyBullets: [],
    enemies: [],
    turrets: [],
    pickups: [],
    explosions: [],
    particles: [],
    floatingTexts: [],
    afterimages: [],
    shockwaves: []
  };

  // --- PERSISTENT RECORDS ---
  function loadRecords() {
    try {
      const raw = localStorage.getItem('cyber_vanguard_records_v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { bestScore: 0, bestWave: 1, totalKills: 0 };
  }

  function saveRecords(score, wave, killsAdded) {
    const rec = loadRecords();
    rec.bestScore = Math.max(rec.bestScore, Math.floor(score));
    rec.bestWave = Math.max(rec.bestWave, wave);
    rec.totalKills = (rec.totalKills || 0) + killsAdded;
    try {
      localStorage.setItem('cyber_vanguard_records_v1', JSON.stringify(rec));
    } catch (e) {}
    updateMenuRecordsUI();
  }

  function updateMenuRecordsUI() {
    const rec = loadRecords();
    document.getElementById('menu-best-score').textContent = rec.bestScore.toLocaleString();
    document.getElementById('menu-best-wave').textContent = rec.bestWave;
    document.getElementById('menu-total-kills').textContent = rec.totalKills.toLocaleString();
  }

  // --- RESIZE CANVAS ---
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // --- INITIALIZE NEW GAME ---
  function initGame() {
    state.wave = 1;
    state.score = 0;
    state.credits = 100;
    state.kills = 0;
    state.combo = 1;
    state.comboTimer = 0;
    state.overdriveTimer = 0;
    state.bullets = [];
    state.enemyBullets = [];
    state.enemies = [];
    state.turrets = [];
    state.pickups = [];
    state.explosions = [];
    state.particles = [];
    state.floatingTexts = [];
    state.afterimages = [];
    state.shockwaves = [];

    // Generate tactical arena pillars
    state.pillars = [
      { x: 700, y: 550, r: 58 },
      { x: 1700, y: 550, r: 58 },
      { x: 700, y: 1250, r: 58 },
      { x: 1700, y: 1250, r: 58 },
      { x: 1200, y: 450, r: 52 },
      { x: 1200, y: 1350, r: 52 }
    ];

    // Initialize weapons state
    state.weapons = WEAPON_DEFS.map((w, idx) => ({
      def: w,
      unlocked: idx === 0,
      level: 1,
      ammo: w.magSize,
      maxAmmo: w.magSize,
      reloading: false,
      reloadTimer: 0
    }));

    // Initialize player
    state.player = {
      x: WORLD_W / 2,
      y: WORLD_H / 2,
      radius: 28,
      hp: 120,
      maxHp: 120,
      shield: 100,
      maxShield: 100,
      shieldRegenDelay: 0,
      speed: 310,
      armorLevel: 1,
      speedLevel: 1,
      currentWeapon: 0,
      fireCooldown: 0,
      shootAnimTimer: 0,
      walkCycle: 0,
      facingLeft: false,
      aimAngle: 0,
      dashCooldown: 0,
      dashMaxCooldown: 2.2,
      dashTimer: 0,
      dashVx: 0,
      dashVy: 0,
      turretCharges: 1,
      turretCooldown: 0,
      nukeCharges: 1,
      nukeCooldown: 0,
      invulnTimer: 0
    };

    state.camera.x = state.player.x;
    state.camera.y = state.player.y;

    startWave(1);
    updateWeaponDockUI();
    updateHUD();
  }

  // --- WAVE SPAWNING SYSTEM ---
  function startWave(waveNum) {
    state.wave = waveNum;
    state.waveSpawnQueue = [];
    const isBossWave = (waveNum % 3 === 0);

    const baseCount = 8 + waveNum * 5;
    for (let i = 0; i < baseCount; i++) {
      const r = Math.random();
      if (waveNum >= 3 && r < 0.16) {
        state.waveSpawnQueue.push('tank');
      } else if (waveNum >= 2 && r < 0.42) {
        state.waveSpawnQueue.push('gunner');
      } else if (r < 0.68) {
        state.waveSpawnQueue.push('drone');
      } else {
        state.waveSpawnQueue.push('grunt');
      }
    }

    if (isBossWave) {
      state.waveSpawnQueue.unshift('boss');
      audio.bossAlert();
    }

    state.waveEnemiesRemaining = state.waveSpawnQueue.length;
    state.spawnTimer = 0.5;

    // Show announcement banner
    const banner = document.getElementById('wave-announce');
    const title = document.getElementById('announce-title');
    const sub = document.getElementById('announce-sub');
    title.textContent = isBossWave ? `ALERTA JEFE — OLEADA ${waveNum}` : `OLEADA ${waveNum}`;
    sub.textContent = isBossWave
      ? 'OVERLORD DREADNOUGHT DETECTADO EN EL SECTOR'
      : `${state.waveEnemiesRemaining} HOSTILES BIOMECÁNICOS EN CAMINO`;
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 2800);
  }

  function spawnEnemyFromQueue() {
    if (state.waveSpawnQueue.length === 0) return;
    const typeKey = state.waveSpawnQueue.shift();
    const def = ENEMY_TYPES[typeKey];
    const diff = DIFFICULTIES[state.difficulty];
    const waveScale = 1 + (state.wave - 1) * 0.18;

    // Spawn around player outside immediate view but inside arena
    let sx = state.player.x;
    let sy = state.player.y;
    for (let attempt = 0; attempt < 15; attempt++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 560 + Math.random() * 340;
      const cx = Math.max(90, Math.min(WORLD_W - 90, state.player.x + Math.cos(ang) * dist));
      const cy = Math.max(90, Math.min(WORLD_H - 90, state.player.y + Math.sin(ang) * dist));
      if (Math.hypot(cx - state.player.x, cy - state.player.y) > 420) {
        sx = cx;
        sy = cy;
        break;
      }
    }

    const maxHp = Math.round(def.hp * diff.hpMult * waveScale);
    state.enemies.push({
      typeKey,
      def,
      x: sx,
      y: sy,
      vx: 0,
      vy: 0,
      radius: def.radius,
      hp: maxHp,
      maxHp,
      speed: def.speed * (0.95 + Math.random() * 0.12),
      damage: Math.round(def.damage * diff.dmgMult * (1 + (state.wave - 1) * 0.08)),
      fireTimer: (def.fireInterval || 2.0) * (0.5 + Math.random() * 0.6),
      animTimer: Math.random() * 10,
      hitFlash: 0,
      bossPhase: 0
    });
  }

  // --- COMBAT & WEAPON ACTIONS ---
  function selectWeapon(idx) {
    if (idx < 0 || idx >= state.weapons.length) return;
    const w = state.weapons[idx];
    if (!w.unlocked) {
      addFloatingText(state.player.x, state.player.y - 45, 'ARMA BLOQUEADA [ARMERÍA B]', '#ffaa00');
      return;
    }
    state.player.currentWeapon = idx;
    updateWeaponDockUI();
    updateHUD();
  }

  function startReload() {
    const w = state.weapons[state.player.currentWeapon];
    if (w.reloading || w.ammo >= w.maxAmmo) return;
    w.reloading = true;
    w.reloadTimer = w.def.reloadTime * Math.pow(0.93, w.level - 1);
    addFloatingText(state.player.x, state.player.y - 45, 'RECARGANDO...', '#00f0ff');
  }

  function fireCurrentWeapon() {
    const p = state.player;
    const w = state.weapons[p.currentWeapon];
    if (w.reloading) return;
    if (w.ammo <= 0) {
      startReload();
      return;
    }

    const overdriveMult = state.overdriveTimer > 0 ? 1.65 : 1.0;
    const levelDmgMult = 1 + (w.level - 1) * 0.25;
    const fireInterval = w.def.fireRate / (overdriveMult * (1 + (w.level - 1) * 0.07));

    p.fireCooldown = fireInterval;
    p.shootAnimTimer = 0.12;
    if (state.overdriveTimer <= 0) {
      w.ammo--;
    }

    audio.shoot(p.currentWeapon);

    // Muzzle position offset toward aimAngle
    const muzzleDist = 36;
    const mx = p.x + Math.cos(p.aimAngle) * muzzleDist;
    const my = p.y + Math.sin(p.aimAngle) * muzzleDist;

    const pellets = w.def.pellets + (p.currentWeapon === 1 ? Math.floor((w.level - 1) / 2) : 0);
    for (let i = 0; i < pellets; i++) {
      const spreadOffset = (Math.random() - 0.5) * w.def.spread;
      const ang = p.aimAngle + spreadOffset;
      state.bullets.push({
        x: mx,
        y: my,
        vx: Math.cos(ang) * w.def.speed,
        vy: Math.sin(ang) * w.def.speed,
        angle: ang,
        radius: p.currentWeapon === 3 ? 12 : 8,
        damage: Math.round(w.def.damage * levelDmgMult * (state.overdriveTimer > 0 ? 1.35 : 1.0)),
        pierce: w.def.pierce + (p.currentWeapon === 3 ? Math.floor(w.level / 2) : 0),
        hitSet: new Set(),
        imgKey: w.def.bulletImg,
        color: w.def.color,
        life: 1.5
      });
    }

    // Muzzle spark particles
    for (let i = 0; i < 5; i++) {
      const sang = p.aimAngle + (Math.random() - 0.5) * 0.6;
      const spd = 140 + Math.random() * 220;
      state.particles.push({
        x: mx,
        y: my,
        vx: Math.cos(sang) * spd,
        vy: Math.sin(sang) * spd,
        size: 3 + Math.random() * 3,
        color: w.def.color,
        life: 0.16,
        maxLife: 0.16
      });
    }

    if (p.currentWeapon === 1 || p.currentWeapon === 3) {
      triggerShake(0.1, p.currentWeapon === 3 ? 7 : 4);
    }

    if (w.ammo <= 0) {
      startReload();
    }
    updateHUD();
  }

  // --- ACTIVE SKILLS: DASH, TURRET, NOVA EMP ---
  function triggerDash() {
    const p = state.player;
    if (p.dashCooldown > 0 || p.dashTimer > 0) return;

    let dx = 0;
    let dy = 0;
    if (state.keys['KeyW'] || state.keys['ArrowUp']) dy -= 1;
    if (state.keys['KeyS'] || state.keys['ArrowDown']) dy += 1;
    if (state.keys['KeyA'] || state.keys['ArrowLeft']) dx -= 1;
    if (state.keys['KeyD'] || state.keys['ArrowRight']) dx += 1;
    if (state.touchMove.active) {
      dx = state.touchMove.dx;
      dy = state.touchMove.dy;
    }

    let ang = p.aimAngle;
    if (Math.hypot(dx, dy) > 0.1) {
      ang = Math.atan2(dy, dx);
    }

    p.dashTimer = 0.22;
    p.dashCooldown = p.dashMaxCooldown * Math.pow(0.9, p.speedLevel - 1);
    p.dashVx = Math.cos(ang) * 920;
    p.dashVy = Math.sin(ang) * 920;
    p.invulnTimer = 0.28;
    audio.dash();
  }

  function deployTurret() {
    const p = state.player;
    if (p.turretCharges <= 0 || p.turretCooldown > 0) return;
    p.turretCharges--;
    p.turretCooldown = 1.0;

    state.turrets.push({
      x: p.x + Math.cos(p.aimAngle) * 55,
      y: p.y + Math.sin(p.aimAngle) * 55,
      angle: p.aimAngle,
      fireTimer: 0.2,
      life: 18.0,
      maxLife: 18.0
    });
    audio.pickup();
    addFloatingText(p.x, p.y - 50, 'TORRETA CENTINELA ACTIVA', '#00ffaa');
    updateHUD();
  }

  function triggerPlasmaNova() {
    const p = state.player;
    if (p.nukeCharges <= 0 || p.nukeCooldown > 0) return;
    p.nukeCharges--;
    p.nukeCooldown = 1.5;

    audio.nuke();
    triggerShake(0.45, 16);

    // Clear all enemy projectiles
    state.enemyBullets = [];

    // Shockwave visual ring
    state.shockwaves.push({
      x: p.x,
      y: p.y,
      radius: 20,
      maxRadius: 720,
      color: '#ff2a85',
      alpha: 1.0
    });

    // Damage all enemies within range
    const novaDamage = 260 + state.wave * 35;
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (dist < 760) {
        damageEnemy(e, novaDamage, p.x, p.y);
      }
    }

    addFloatingText(p.x, p.y - 60, 'NOVA DE PLASMA EMP', '#ff2a85');
    updateHUD();
  }

  // --- DAMAGE & LOOT ---
  function damageEnemy(e, dmg, srcX, srcY) {
    e.hp -= dmg;
    e.hitFlash = 0.1;

    // Knockback
    const ang = Math.atan2(e.y - srcY, e.x - srcX);
    const kb = e.def.isBoss ? 4 : 14;
    e.x += Math.cos(ang) * kb;
    e.y += Math.sin(ang) * kb;

    addFloatingText(e.x + (Math.random() - 0.5) * 24, e.y - e.radius, `-${dmg}`, '#ffffff');

    if (e.hp <= 0) {
      killEnemy(e);
    }
  }

  function killEnemy(e) {
    const idx = state.enemies.indexOf(e);
    if (idx === -1) return;
    state.enemies.splice(idx, 1);

    state.kills++;
    state.combo = Math.min(8, state.combo + 0.25);
    state.comboTimer = 4.0;

    const diff = DIFFICULTIES[state.difficulty];
    const pts = Math.round(e.def.score * diff.scoreMult * Math.floor(state.combo));
    const creds = Math.round(e.def.credits * diff.creditMult);
    state.score += pts;
    state.credits += creds;

    audio.explosion(e.def.isBoss);
    if (e.def.isBoss) {
      triggerShake(0.55, 18);
    }

    // Spawn PNG 4-frame explosion
    state.explosions.push({
      x: e.x,
      y: e.y,
      size: e.def.isBoss ? 220 : e.def.drawSize * 1.15,
      timer: 0,
      duration: 0.36
    });

    // Drop pickups
    const dropRoll = Math.random();
    if (e.def.isBoss) {
      for (let k = 0; k < 5; k++) {
        spawnPickup(e.x + (Math.random() - 0.5) * 90, e.y + (Math.random() - 0.5) * 90, k % 2 === 0 ? 'coin' : 'overdrive');
      }
      spawnPickup(e.x, e.y, 'medkit');
    } else if (dropRoll < 0.11) {
      spawnPickup(e.x, e.y, 'medkit');
    } else if (dropRoll < 0.22) {
      spawnPickup(e.x, e.y, 'shield');
    } else if (dropRoll < 0.28) {
      spawnPickup(e.x, e.y, 'overdrive');
    } else if (dropRoll < 0.55) {
      spawnPickup(e.x, e.y, 'coin');
    }

    saveRecords(state.score, state.wave, 1);
    updateHUD();
  }

  function spawnPickup(x, y, type) {
    const imgMap = {
      medkit: 'pickupMedkit',
      shield: 'pickupShield',
      coin: 'pickupCoin',
      overdrive: 'pickupOverdrive'
    };
    state.pickups.push({
      x: Math.max(70, Math.min(WORLD_W - 70, x)),
      y: Math.max(70, Math.min(WORLD_H - 70, y)),
      type,
      imgKey: imgMap[type],
      radius: 24,
      bobTimer: Math.random() * 6,
      life: 16.0
    });
  }

  function damagePlayer(dmg) {
    const p = state.player;
    if (p.invulnTimer > 0) return;

    p.invulnTimer = 0.35;
    p.shieldRegenDelay = 3.5;
    triggerShake(0.2, 9);

    if (p.shield > 0) {
      const absorbed = Math.min(p.shield, dmg);
      p.shield -= absorbed;
      const rem = dmg - absorbed;
      if (rem > 0) p.hp -= rem;
      addFloatingText(p.x, p.y - 40, `-${dmg} ESCUDO`, '#00f0ff');
    } else {
      p.hp -= dmg;
      addFloatingText(p.x, p.y - 40, `-${dmg} BLINDAJE`, '#ff2846');
    }

    audio.explosion(false);
    updateHUD();

    if (p.hp <= 0) {
      p.hp = 0;
      triggerGameOver();
    }
  }

  function triggerShake(duration, magnitude) {
    state.shakeTime = Math.max(state.shakeTime, duration);
    state.shakeMag = Math.max(state.shakeMag, magnitude);
  }

  function addFloatingText(x, y, text, color = '#ffffff') {
    state.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 0.85,
      maxLife: 0.85
    });
  }

  // --- UPDATE LOOP ---
  let lastTime = performance.now();

  function update(dt) {
    if (state.mode !== 'playing') return;

    const p = state.player;

    // Timers
    if (state.shakeTime > 0) state.shakeTime = Math.max(0, state.shakeTime - dt);
    if (state.overdriveTimer > 0) state.overdriveTimer = Math.max(0, state.overdriveTimer - dt);
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 1;
    }

    if (p.fireCooldown > 0) p.fireCooldown -= dt;
    if (p.shootAnimTimer > 0) p.shootAnimTimer -= dt;
    if (p.dashCooldown > 0) p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    if (p.turretCooldown > 0) p.turretCooldown = Math.max(0, p.turretCooldown - dt);
    if (p.nukeCooldown > 0) p.nukeCooldown = Math.max(0, p.nukeCooldown - dt);
    if (p.invulnTimer > 0) p.invulnTimer -= dt;

    // Shield regeneration
    if (p.shieldRegenDelay > 0) {
      p.shieldRegenDelay -= dt;
    } else if (p.shield < p.maxShield) {
      p.shield = Math.min(p.maxShield, p.shield + (14 + p.armorLevel * 3) * dt);
    }

    // Active Weapon Reload
    const activeW = state.weapons[p.currentWeapon];
    if (activeW.reloading) {
      activeW.reloadTimer -= dt;
      if (activeW.reloadTimer <= 0) {
        activeW.reloading = false;
        activeW.ammo = activeW.maxAmmo;
        addFloatingText(p.x, p.y - 45, 'MUNICIÓN LISTA', '#00ffaa');
      }
    }

    // Player Movement
    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      p.x += p.dashVx * dt;
      p.y += p.dashVy * dt;
      state.afterimages.push({
        x: p.x,
        y: p.y,
        facingLeft: p.facingLeft,
        alpha: 0.65
      });
    } else {
      let mx = 0;
      let my = 0;
      if (state.keys['KeyW'] || state.keys['ArrowUp']) my -= 1;
      if (state.keys['KeyS'] || state.keys['ArrowDown']) my += 1;
      if (state.keys['KeyA'] || state.keys['ArrowLeft']) mx -= 1;
      if (state.keys['KeyD'] || state.keys['ArrowRight']) mx += 1;

      if (state.touchMove.active) {
        mx = state.touchMove.dx;
        my = state.touchMove.dy;
      }

      const len = Math.hypot(mx, my);
      if (len > 0.01) {
        const normX = mx / Math.max(1, len);
        const normY = my / Math.max(1, len);
        const curSpeed = p.speed * (1 + (p.speedLevel - 1) * 0.1);
        p.x += normX * curSpeed * dt;
        p.y += normY * curSpeed * dt;
        p.walkCycle += dt * 11;
      } else {
        p.walkCycle = 0;
      }
    }

    // Arena Bounds & Pillar Collision for Player
    p.x = Math.max(55, Math.min(WORLD_W - 55, p.x));
    p.y = Math.max(55, Math.min(WORLD_H - 55, p.y));
    for (const pil of state.pillars) {
      const dx = p.x - pil.x;
      const dy = p.y - pil.y;
      const d = Math.hypot(dx, dy);
      const minD = p.radius + pil.r;
      if (d < minD && d > 0.001) {
        p.x = pil.x + (dx / d) * minD;
        p.y = pil.y + (dy / d) * minD;
      }
    }

    // Camera Smooth Follow
    state.camera.x += (p.x - state.camera.x) * Math.min(1, dt * 8);
    state.camera.y += (p.y - state.camera.y) * Math.min(1, dt * 8);

    // Aiming angle
    if (state.touchAim.active) {
      p.aimAngle = Math.atan2(state.touchAim.dy, state.touchAim.dx);
    } else {
      state.mouse.worldX = state.camera.x - canvas.width / 2 + state.mouse.x;
      state.mouse.worldY = state.camera.y - canvas.height / 2 + state.mouse.y;
      p.aimAngle = Math.atan2(state.mouse.worldY - p.y, state.mouse.worldX - p.x);
    }
    p.facingLeft = Math.cos(p.aimAngle) < -0.05;

    // Firing
    if ((state.mouse.down || state.touchAim.active) && p.fireCooldown <= 0) {
      fireCurrentWeapon();
    }

    // Update Ally Turrets
    for (let i = state.turrets.length - 1; i >= 0; i--) {
      const t = state.turrets[i];
      t.life -= dt;
      if (t.life <= 0) {
        state.turrets.splice(i, 1);
        continue;
      }
      t.fireTimer -= dt;
      if (t.fireTimer <= 0 && state.enemies.length > 0) {
        // Find nearest enemy
        let best = null;
        let bestDist = 640;
        for (const e of state.enemies) {
          const d = Math.hypot(e.x - t.x, e.y - t.y);
          if (d < bestDist) {
            bestDist = d;
            best = e;
          }
        }
        if (best) {
          t.angle = Math.atan2(best.y - t.y, best.x - t.x);
          t.fireTimer = 0.28;
          state.bullets.push({
            x: t.x + Math.cos(t.angle) * 28,
            y: t.y + Math.sin(t.angle) * 28,
            vx: Math.cos(t.angle) * 900,
            vy: Math.sin(t.angle) * 900,
            angle: t.angle,
            radius: 7,
            damage: 24 + state.wave * 4,
            pierce: 1,
            hitSet: new Set(),
            imgKey: 'bulletRifle',
            color: '#00ffaa',
            life: 1.2
          });
        }
      }
    }

    // Update Player Bullets
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      if (b.life <= 0 || b.x < 20 || b.x > WORLD_W - 20 || b.y < 20 || b.y > WORLD_H - 20) {
        state.bullets.splice(i, 1);
        continue;
      }

      // Check pillar hit
      let hitPillar = false;
      for (const pil of state.pillars) {
        if (Math.hypot(b.x - pil.x, b.y - pil.y) < pil.r + 4) {
          hitPillar = true;
          break;
        }
      }
      if (hitPillar) {
        state.bullets.splice(i, 1);
        continue;
      }

      // Check enemy hit
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        if (b.hitSet.has(e)) continue;
        if (Math.hypot(b.x - e.x, b.y - e.y) < b.radius + e.radius) {
          b.hitSet.add(e);
          damageEnemy(e, b.damage, b.x - b.vx * 0.02, b.y - b.vy * 0.02);
          b.pierce--;
          if (b.pierce <= 0) {
            state.bullets.splice(i, 1);
            break;
          }
        }
      }
    }

    // Update Enemy Bullets
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const eb = state.enemyBullets[i];
      if (eb.homing && state.player) {
        const desired = Math.atan2(p.y - eb.y, p.x - eb.x);
        let diffAng = desired - eb.angle;
        while (diffAng > Math.PI) diffAng -= Math.PI * 2;
        while (diffAng < -Math.PI) diffAng += Math.PI * 2;
        eb.angle += Math.sign(diffAng) * Math.min(Math.abs(diffAng), dt * 2.1);
        const spd = Math.hypot(eb.vx, eb.vy);
        eb.vx = Math.cos(eb.angle) * spd;
        eb.vy = Math.sin(eb.angle) * spd;
      }

      eb.x += eb.vx * dt;
      eb.y += eb.vy * dt;
      eb.life -= dt;

      if (eb.life <= 0 || eb.x < 20 || eb.x > WORLD_W - 20 || eb.y < 20 || eb.y > WORLD_H - 20) {
        state.enemyBullets.splice(i, 1);
        continue;
      }

      // Pillar block
      let blocked = false;
      for (const pil of state.pillars) {
        if (Math.hypot(eb.x - pil.x, eb.y - pil.y) < pil.r) {
          blocked = true;
          break;
        }
      }
      if (blocked) {
        state.enemyBullets.splice(i, 1);
        continue;
      }

      if (Math.hypot(eb.x - p.x, eb.y - p.y) < eb.radius + p.radius - 4) {
        damagePlayer(eb.damage);
        state.enemyBullets.splice(i, 1);
      }
    }

    // Spawn Enemies from Queue
    if (state.waveSpawnQueue.length > 0) {
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0 && state.enemies.length < 28) {
        spawnEnemyFromQueue();
        state.spawnTimer = Math.max(0.28, 1.15 - state.wave * 0.06);
      }
    } else if (state.enemies.length === 0) {
      // Next wave!
      state.betweenWaveTimer += dt;
      if (state.betweenWaveTimer >= 2.2) {
        state.betweenWaveTimer = 0;
        // Bonus credits & charge refill on wave clear
        state.credits += 45 + state.wave * 15;
        if (state.wave % 2 === 0) p.turretCharges++;
        if (state.wave % 3 === 0) p.nukeCharges++;
        startWave(state.wave + 1);
      }
    }

    // Update Enemies
    for (let i = 0; i < state.enemies.length; i++) {
      const e = state.enemies[i];
      e.animTimer += dt * 7;
      if (e.hitFlash > 0) e.hitFlash -= dt;

      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.hypot(dx, dy);
      const ang = Math.atan2(dy, dx);

      // Ranged enemies stop slightly at range or strafe
      let moveFactor = 1.0;
      if (e.def.ranged && !e.def.isBoss && dist < 240 && dist > 140) {
        moveFactor = 0.35;
      }

      e.x += Math.cos(ang) * e.speed * moveFactor * dt;
      e.y += Math.sin(ang) * e.speed * moveFactor * dt;

      // Soft separation between enemies
      for (let j = i + 1; j < state.enemies.length; j++) {
        const o = state.enemies[j];
        const sdx = e.x - o.x;
        const sdy = e.y - o.y;
        const sd = Math.hypot(sdx, sdy);
        const minSep = (e.radius + o.radius) * 0.85;
        if (sd < minSep && sd > 0.01) {
          const push = (minSep - sd) * 0.5;
          const nx = sdx / sd;
          const ny = sdy / sd;
          e.x += nx * push;
          e.y += ny * push;
          o.x -= nx * push;
          o.y -= ny * push;
        }
      }

      // Pillar collision for enemies
      for (const pil of state.pillars) {
        const pdx = e.x - pil.x;
        const pdy = e.y - pil.y;
        const pd = Math.hypot(pdx, pdy);
        const minD = e.radius + pil.r;
        if (pd < minD && pd > 0.01) {
          e.x = pil.x + (pdx / pd) * minD;
          e.y = pil.y + (pdy / pd) * minD;
        }
      }

      // Melee contact damage
      if (dist < e.radius + p.radius - 4) {
        damagePlayer(e.damage);
      }

      // Ranged attack
      if (e.def.ranged && dist < 740) {
        e.fireTimer -= dt;
        if (e.fireTimer <= 0) {
          e.fireTimer = e.def.fireInterval;
          if (e.def.isBoss) {
            // Boss alternating attacks: Missile Salvo vs Radial Plasma Ring
            e.bossPhase = (e.bossPhase + 1) % 2;
            if (e.bossPhase === 0) {
              for (let m = -2; m <= 2; m++) {
                const mang = ang + m * 0.24;
                state.enemyBullets.push({
                  x: e.x + Math.cos(mang) * 50,
                  y: e.y + Math.sin(mang) * 50,
                  vx: Math.cos(mang) * 390,
                  vy: Math.sin(mang) * 390,
                  angle: mang,
                  radius: 12,
                  damage: e.damage,
                  imgKey: 'bulletMissile',
                  homing: Math.abs(m) === 2,
                  life: 3.4
                });
              }
            } else {
              const count = 12;
              for (let k = 0; k < count; k++) {
                const kang = (Math.PI * 2 * k) / count + e.animTimer * 0.2;
                state.enemyBullets.push({
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(kang) * 440,
                  vy: Math.sin(kang) * 440,
                  angle: kang,
                  radius: 10,
                  damage: Math.round(e.damage * 0.8),
                  imgKey: 'bulletEnemy',
                  life: 2.8
                });
              }
            }
          } else {
            const count = e.def.spreadShot || 1;
            for (let s = 0; s < count; s++) {
              const sang = ang + (s - (count - 1) / 2) * 0.22;
              state.enemyBullets.push({
                x: e.x + Math.cos(sang) * 24,
                y: e.y + Math.sin(sang) * 24,
                vx: Math.cos(sang) * e.def.bulletSpeed,
                vy: Math.sin(sang) * e.def.bulletSpeed,
                angle: sang,
                radius: 9,
                damage: e.damage,
                imgKey: 'bulletEnemy',
                life: 2.4
              });
            }
          }
        }
      }
    }

    // Update Pickups
    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const pk = state.pickups[i];
      pk.bobTimer += dt * 4;
      pk.life -= dt;
      if (pk.life <= 0) {
        state.pickups.splice(i, 1);
        continue;
      }

      // Magnet pull when close
      const d = Math.hypot(p.x - pk.x, p.y - pk.y);
      if (d < 160) {
        pk.x += ((p.x - pk.x) / Math.max(1, d)) * 340 * dt;
        pk.y += ((p.y - pk.y) / Math.max(1, d)) * 340 * dt;
      }

      if (d < p.radius + pk.radius) {
        audio.pickup();
        if (pk.type === 'medkit') {
          p.hp = Math.min(p.maxHp, p.hp + 40);
          addFloatingText(p.x, p.y - 45, '+40 SALUD', '#ff2a55');
        } else if (pk.type === 'shield') {
          p.shield = Math.min(p.maxShield, p.shield + 50);
          addFloatingText(p.x, p.y - 45, '+50 ESCUDO', '#00f0ff');
        } else if (pk.type === 'coin') {
          state.credits += 45;
          state.score += 120;
          addFloatingText(p.x, p.y - 45, '+45 CRÉDITOS', '#ffaa00');
        } else if (pk.type === 'overdrive') {
          state.overdriveTimer = 7.0;
          addFloatingText(p.x, p.y - 45, 'SOBRECARGA DE PLASMA (7s)', '#d042ff');
        }
        state.pickups.splice(i, 1);
        updateHUD();
      }
    }

    // Update Explosions, Particles, Shockwaves, Afterimages, Floating Texts
    for (let i = state.explosions.length - 1; i >= 0; i--) {
      state.explosions[i].timer += dt;
      if (state.explosions[i].timer >= state.explosions[i].duration) {
        state.explosions.splice(i, 1);
      }
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }

    for (let i = state.shockwaves.length - 1; i >= 0; i--) {
      const sw = state.shockwaves[i];
      sw.radius += 1400 * dt;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
      if (sw.radius >= sw.maxRadius) state.shockwaves.splice(i, 1);
    }

    for (let i = state.afterimages.length - 1; i >= 0; i--) {
      state.afterimages[i].alpha -= dt * 2.8;
      if (state.afterimages[i].alpha <= 0) state.afterimages.splice(i, 1);
    }

    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y -= 42 * dt;
      ft.life -= dt;
      if (ft.life <= 0) state.floatingTexts.splice(i, 1);
    }

    updateHUD();
  }

  // --- RENDER LOOP ---
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state.player) return;

    ctx.save();

    // Camera transform with screen shake
    let shakeX = 0;
    let shakeY = 0;
    if (state.shakeTime > 0) {
      shakeX = (Math.random() - 0.5) * state.shakeMag * 2;
      shakeY = (Math.random() - 0.5) * state.shakeMag * 2;
    }

    const camLeft = state.camera.x - canvas.width / 2 + shakeX;
    const camTop = state.camera.y - canvas.height / 2 + shakeY;
    ctx.translate(-camLeft, -camTop);

    // 1. Tiled Arena Floor (using arena_tile.png)
    const tileImg = IMAGES.arenaTile;
    if (tileImg && tileImg.complete && tileImg.naturalWidth > 0) {
      const tw = 512;
      const th = 512;
      const startX = Math.max(0, Math.floor(camLeft / tw) * tw);
      const startY = Math.max(0, Math.floor(camTop / th) * th);
      const endX = Math.min(WORLD_W, camLeft + canvas.width + tw);
      const endY = Math.min(WORLD_H, camTop + canvas.height + th);
      for (let y = startY; y < endY; y += th) {
        for (let x = startX; x < endX; x += tw) {
          ctx.drawImage(tileImg, x, y, tw, th);
        }
      }
    } else {
      ctx.fillStyle = '#0c1422';
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    }

    // 2. Arena Neon Laser Perimeter Border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, WORLD_W - 40, WORLD_H - 40);
    ctx.strokeStyle = 'rgba(255, 42, 133, 0.45)';
    ctx.lineWidth = 14;
    ctx.strokeRect(14, 14, WORLD_W - 28, WORLD_H - 28);

    // 3. Tactical Arena Cover Pillars
    for (const pil of state.pillars) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pil.x, pil.y, pil.r + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.16)';
      ctx.fill();

      const grad = ctx.createRadialGradient(pil.x - 12, pil.y - 12, 8, pil.x, pil.y, pil.r);
      grad.addColorStop(0, '#2a4060');
      grad.addColorStop(0.75, '#121f36');
      grad.addColorStop(1, '#08101e');
      ctx.beginPath();
      ctx.arc(pil.x, pil.y, pil.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00f0ff';
      ctx.stroke();
      ctx.restore();
    }

    // 4. Pickups
    for (const pk of state.pickups) {
      const img = IMAGES[pk.imgKey];
      const bob = Math.sin(pk.bobTimer) * 5;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(pk.x, pk.y + 18, 18, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.fill();
      if (img && img.complete) {
        ctx.drawImage(img, pk.x - 26, pk.y - 26 + bob, 52, 52);
      }
      ctx.restore();
    }

    // 5. Dash Afterimages
    for (const ai of state.afterimages) {
      const dashImg = IMAGES.heroDash;
      if (dashImg && dashImg.complete) {
        ctx.save();
        ctx.globalAlpha = ai.alpha * 0.65;
        ctx.translate(ai.x, ai.y);
        if (ai.facingLeft) ctx.scale(-1, 1);
        ctx.drawImage(dashImg, -48, -48, 96, 96);
        ctx.restore();
      }
    }

    // 6. Deployable Ally Turrets
    for (const t of state.turrets) {
      const tImg = IMAGES.allyTurret;
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 170, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (tImg && tImg.complete) {
        if (Math.cos(t.angle) < 0) ctx.scale(-1, 1);
        ctx.drawImage(tImg, -40, -40, 80, 80);
      }
      // Turret timer bar
      ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(t.x - 24, t.y - 46, 48, 5);
      ctx.fillStyle = '#00ffaa';
      ctx.fillRect(t.x - 24, t.y - 46, 48 * (t.life / t.maxLife), 5);
    }

    // 7. Enemies
    for (const e of state.enemies) {
      const frameIdx = Math.floor(e.animTimer) % 2;
      const imgKey = e.def.frames[frameIdx];
      const img = IMAGES[imgKey];
      const sz = e.def.drawSize;

      ctx.save();
      // Ground shadow
      ctx.beginPath();
      ctx.ellipse(e.x, e.y + e.radius * 0.78, e.radius * 0.9, e.radius * 0.42, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
      ctx.fill();

      ctx.translate(e.x, e.y);
      if (state.player.x < e.x) {
        ctx.scale(-1, 1);
      }
      if (e.hitFlash > 0) {
        ctx.filter = 'brightness(2.2) contrast(1.4)';
      }
      if (img && img.complete) {
        ctx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
      }
      ctx.restore();

      // Enemy Health Bar
      if (e.hp < e.maxHp && !e.def.isBoss) {
        const bw = e.radius * 1.8;
        const bx = e.x - bw / 2;
        const by = e.y - e.radius - 16;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(bx, by, bw, 6);
        ctx.fillStyle = e.def.color;
        ctx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), 6);
      }
    }

    // 8. Player Character Sprite
    const p = state.player;
    ctx.save();
    // Player shadow & neon aura ring
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 30, 28, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.28)';
    ctx.fill();

    if (state.overdriveTimer > 0) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 44 + Math.sin(performance.now() * 0.015) * 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#d042ff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Select active hero sprite frame
    let heroKey = 'heroIdle';
    if (p.dashTimer > 0) {
      heroKey = 'heroDash';
    } else if (p.shootAnimTimer > 0) {
      heroKey = 'heroShoot';
    } else if (p.walkCycle > 0) {
      heroKey = (Math.floor(p.walkCycle) % 2 === 0) ? 'heroWalk1' : 'heroWalk2';
    }

    const heroImg = IMAGES[heroKey];
    ctx.translate(p.x, p.y);
    if (p.facingLeft) {
      ctx.scale(-1, 1);
    }
    if (p.invulnTimer > 0 && Math.floor(p.invulnTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.65;
    }
    if (heroImg && heroImg.complete) {
      ctx.drawImage(heroImg, -50, -50, 100, 100);
    }
    ctx.restore();

    // Reload bar above player if reloading
    const curW = state.weapons[p.currentWeapon];
    if (curW && curW.reloading) {
      const totalR = curW.def.reloadTime * Math.pow(0.93, curW.level - 1);
      const prog = 1 - (curW.reloadTimer / totalR);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(p.x - 28, p.y - 54, 56, 7);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(p.x - 28, p.y - 54, 56 * prog, 7);
    }

    // 9. Player & Enemy Projectiles (PNG Sprites rotated along trajectory)
    for (const b of state.bullets) {
      const bImg = IMAGES[b.imgKey];
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      if (bImg && bImg.complete) {
        ctx.drawImage(bImg, -22, -22, 44, 44);
      }
      ctx.restore();
    }

    for (const eb of state.enemyBullets) {
      const ebImg = IMAGES[eb.imgKey];
      ctx.save();
      ctx.translate(eb.x, eb.y);
      ctx.rotate(eb.angle);
      if (ebImg && ebImg.complete) {
        ctx.drawImage(ebImg, -20, -20, 40, 40);
      }
      ctx.restore();
    }

    // 10. 4-Frame PNG Explosions
    for (const ex of state.explosions) {
      const idx = Math.min(4, Math.max(1, Math.ceil((ex.timer / ex.duration) * 4)));
      const exImg = IMAGES[`exp${idx}`];
      if (exImg && exImg.complete) {
        ctx.drawImage(exImg, ex.x - ex.size / 2, ex.y - ex.size / 2, ex.size, ex.size);
      }
    }

    // 11. Shockwaves & Particles
    for (const sw of state.shockwaves) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.restore();
    }

    for (const pt of state.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 12. Floating Combat Texts
    ctx.font = '900 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    for (const ft of state.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();

    // 13. Mini-Map Radar (Bottom-Top-Right HUD overlay on Canvas)
    if (state.mode === 'playing') {
      drawMiniMap();
    }
  }

  function drawMiniMap() {
    const mapW = 148;
    const mapH = 110;
    const mx = canvas.width - mapW - 18;
    const my = 76;

    ctx.save();
    ctx.fillStyle = 'rgba(6, 14, 28, 0.82)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.fillRect(mx, my, mapW, mapH);
    ctx.strokeRect(mx, my, mapW, mapH);

    const scaleX = mapW / WORLD_W;
    const scaleY = mapH / WORLD_H;

    // Pickups on radar
    ctx.fillStyle = '#ffaa00';
    for (const pk of state.pickups) {
      ctx.fillRect(mx + pk.x * scaleX - 1.5, my + pk.y * scaleY - 1.5, 3, 3);
    }

    // Enemies on radar
    for (const e of state.enemies) {
      ctx.fillStyle = e.def.isBoss ? '#ff1e42' : '#ff5533';
      const r = e.def.isBoss ? 4.5 : 2.5;
      ctx.beginPath();
      ctx.arc(mx + e.x * scaleX, my + e.y * scaleY, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player on radar
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(mx + state.player.x * scaleX, my + state.player.y * scaleY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- HUD & UI UPDATES ---
  function updateHUD() {
    const p = state.player;
    if (!p) return;

    document.getElementById('hud-hp-text').textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
    document.getElementById('hud-hp-bar').style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;

    document.getElementById('hud-shield-text').textContent = `${Math.floor(p.shield)} / ${p.maxShield}`;
    document.getElementById('hud-shield-bar').style.width = `${Math.max(0, (p.shield / p.maxShield) * 100)}%`;

    document.getElementById('hud-credits').textContent = state.credits.toLocaleString();

    const curW = state.weapons[p.currentWeapon];
    document.getElementById('hud-ammo').textContent = curW.reloading
      ? 'RECARGANDO'
      : `${curW.ammo} / ${curW.maxAmmo}`;

    document.getElementById('hud-wave').textContent = state.wave;
    document.getElementById('hud-kills').textContent = state.kills;
    document.getElementById('hud-score').textContent = state.score.toLocaleString();

    const comboBanner = document.getElementById('combo-banner');
    if (state.combo >= 2 || state.overdriveTimer > 0) {
      comboBanner.classList.remove('hidden');
      document.getElementById('hud-combo').textContent = `x${Math.floor(state.combo)}`;
    } else {
      comboBanner.classList.add('hidden');
    }

    // Active skills cooldowns
    const dashPct = (p.dashCooldown / p.dashMaxCooldown) * 100;
    document.getElementById('cd-dash').style.height = `${Math.min(100, dashPct)}%`;
    document.getElementById('turret-count-label').textContent = `TORRETA (${p.turretCharges})`;
    document.getElementById('nuke-count-label').textContent = `NOVA (${p.nukeCharges})`;

    // Boss HUD bar
    const boss = state.enemies.find(e => e.def.isBoss);
    const bossHud = document.getElementById('boss-hud');
    if (boss) {
      bossHud.classList.remove('hidden');
      document.getElementById('boss-hp-text').textContent = `${Math.max(0, Math.ceil(boss.hp))} / ${boss.maxHp}`;
      document.getElementById('boss-hp-bar').style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
    } else {
      bossHud.classList.add('hidden');
    }
  }

  function updateWeaponDockUI() {
    const p = state.player;
    document.querySelectorAll('.weapon-slot').forEach(btn => {
      const idx = Number(btn.dataset.weapon);
      const w = state.weapons[idx];
      btn.classList.toggle('active', idx === p.currentWeapon);
      btn.classList.toggle('locked', !w.unlocked);
      const lvlEl = document.getElementById(`wslot-${idx}-lvl`);
      if (lvlEl) {
        lvlEl.textContent = w.unlocked ? `NV. ${w.level}` : `${w.def.unlockCost} CR`;
      }
    });
  }

  // --- ARMORY SHOP MODAL ---
  function renderShopModal() {
    const p = state.player;
    document.getElementById('shop-credits-val').textContent = state.credits.toLocaleString();
    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = '';

    // 1. Weapons Unlock / Upgrade Cards
    state.weapons.forEach((w, idx) => {
      const isMax = w.unlocked && w.level >= 5;
      const cost = !w.unlocked
        ? w.def.unlockCost
        : Math.round(w.def.upgradeBaseCost * Math.pow(1.55, w.level - 1));

      const card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML = `
        <div>
          <div class="shop-card-top">
            <img src="${w.def.icon}" alt="${w.def.name}" draggable="false" />
            <div class="shop-card-info">
              <h4>${w.def.name}</h4>
              <small>${w.unlocked ? `NIVEL ${w.level} / 5` : 'ARMA BLOQUEADA'}</small>
            </div>
          </div>
          <p class="shop-card-desc">${w.def.desc}</p>
        </div>
        <button class="shop-buy-btn" ${isMax || state.credits < cost ? 'disabled' : ''}>
          <img src="assets/icon_coin.png" alt="Créditos" draggable="false" />
          <span>${isMax ? 'NIVEL MÁXIMO' : (!w.unlocked ? `DESBLOQUEAR (${cost})` : `MEJORAR NV.${w.level + 1} (${cost})`)}</span>
        </button>
      `;
      card.querySelector('.shop-buy-btn').addEventListener('click', () => {
        if (state.credits < cost || isMax) return;
        state.credits -= cost;
        if (!w.unlocked) {
          w.unlocked = true;
          p.currentWeapon = idx;
        } else {
          w.level++;
          w.maxAmmo = Math.round(w.def.magSize * (1 + (w.level - 1) * 0.15));
          w.ammo = w.maxAmmo;
        }
        audio.pickup();
        updateWeaponDockUI();
        updateHUD();
        renderShopModal();
      });
      grid.appendChild(card);
    });

    // 2. Exoskeleton & Tactical Systems Upgrades
    const utilityUpgrades = [
      {
        title: 'Blindaje & Escudo Vital',
        sub: `NIVEL ${p.armorLevel} (+25 HP / +25 Escudo + Curación)`,
        desc: 'Refuerza el exoesqueleto de titanio, amplía el escudo iónico y repara el blindaje.',
        icon: 'assets/icon_shield.png',
        cost: 110 * p.armorLevel,
        action: () => {
          p.armorLevel++;
          p.maxHp += 25;
          p.hp = p.maxHp;
          p.maxShield += 25;
          p.shield = p.maxShield;
        }
      },
      {
        title: 'Propulsores de Velocidad',
        sub: `NIVEL ${p.speedLevel} (+10% Velocidad y Recarga Dash)`,
        desc: 'Optimiza las turbinas del jetpack para esquivar proyectiles con mayor agilidad.',
        icon: 'assets/icon_dash.png',
        cost: 120 * p.speedLevel,
        action: () => {
          p.speedLevel++;
        }
      },
      {
        title: 'Torreta Centinela Extra',
        sub: `DISPONIBLES: ${p.turretCharges}`,
        desc: 'Adquiere una torreta automática desplegable con [Tecla E] que apoya con fuego de plasma.',
        icon: 'assets/icon_turret.png',
        cost: 130,
        action: () => {
          p.turretCharges++;
        }
      },
      {
        title: 'Carga Nova EMP [Tecla Q]',
        sub: `DISPONIBLES: ${p.nukeCharges}`,
        desc: 'Recarga el núcleo de detonación electromagnética para arrasar la pantalla.',
        icon: 'assets/icon_nuke.png',
        cost: 160,
        action: () => {
          p.nukeCharges++;
        }
      }
    ];

    utilityUpgrades.forEach(u => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML = `
        <div>
          <div class="shop-card-top">
            <img src="${u.icon}" alt="${u.title}" draggable="false" />
            <div class="shop-card-info">
              <h4>${u.title}</h4>
              <small>${u.sub}</small>
            </div>
          </div>
          <p class="shop-card-desc">${u.desc}</p>
        </div>
        <button class="shop-buy-btn" ${state.credits < u.cost ? 'disabled' : ''}>
          <img src="assets/icon_coin.png" alt="Créditos" draggable="false" />
          <span>ADQUIRIR (${u.cost})</span>
        </button>
      `;
      card.querySelector('.shop-buy-btn').addEventListener('click', () => {
        if (state.credits < u.cost) return;
        state.credits -= u.cost;
        u.action();
        audio.pickup();
        updateHUD();
        renderShopModal();
      });
      grid.appendChild(card);
    });
  }

  // --- SCREEN TRANSITIONS ---
  function openShop() {
    if (state.mode !== 'playing' && state.mode !== 'paused') return;
    state.mode = 'shop';
    document.getElementById('pause-modal').classList.add('hidden');
    document.getElementById('shop-modal').classList.remove('hidden');
    renderShopModal();
  }

  function closeShop() {
    document.getElementById('shop-modal').classList.add('hidden');
    state.mode = 'playing';
  }

  function togglePause() {
    if (state.mode === 'playing') {
      state.mode = 'paused';
      document.getElementById('pause-modal').classList.remove('hidden');
    } else if (state.mode === 'paused') {
      state.mode = 'playing';
      document.getElementById('pause-modal').classList.add('hidden');
    }
  }

  function triggerGameOver() {
    state.mode = 'gameover';
    audio.stopBGM();
    saveRecords(state.score, state.wave, 0);

    document.getElementById('go-score').textContent = state.score.toLocaleString();
    document.getElementById('go-wave').textContent = state.wave;
    document.getElementById('go-kills').textContent = state.kills;
    document.getElementById('gameover-modal').classList.remove('hidden');
  }

  function startNewGameSession() {
    audio.init();
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('gameover-modal').classList.add('hidden');
    document.getElementById('pause-modal').classList.add('hidden');
    document.getElementById('shop-modal').classList.add('hidden');
    document.getElementById('hud-layer').classList.remove('hidden');

    initGame();
    state.mode = 'playing';
    audio.startBGM();
  }

  function returnToMainMenu() {
    state.mode = 'menu';
    audio.stopBGM();
    document.getElementById('hud-layer').classList.add('hidden');
    document.getElementById('pause-modal').classList.add('hidden');
    document.getElementById('shop-modal').classList.add('hidden');
    document.getElementById('gameover-modal').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
    updateMenuRecordsUI();
  }

  // --- INPUT LISTENERS ---
  window.addEventListener('mousemove', e => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
    crosshairEl.style.left = `${e.clientX}px`;
    crosshairEl.style.top = `${e.clientY}px`;
  });

  canvas.addEventListener('mousedown', e => {
    if (e.button === 0) {
      state.mouse.down = true;
      crosshairEl.style.transform = 'translate(-50%, -50%) scale(0.84)';
    }
  });

  window.addEventListener('mouseup', e => {
    if (e.button === 0) {
      state.mouse.down = false;
      crosshairEl.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  });

  window.addEventListener('keydown', e => {
    state.keys[e.code] = true;

    if (state.mode === 'playing') {
      if (e.code === 'Digit1') selectWeapon(0);
      if (e.code === 'Digit2') selectWeapon(1);
      if (e.code === 'Digit3') selectWeapon(2);
      if (e.code === 'Digit4') selectWeapon(3);
      if (e.code === 'KeyR') startReload();
      if (e.code === 'Space' || e.code === 'ShiftLeft') {
        e.preventDefault();
        triggerDash();
      }
      if (e.code === 'KeyE') deployTurret();
      if (e.code === 'KeyQ') triggerPlasmaNova();
      if (e.code === 'KeyB') openShop();
      if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
    } else if (state.mode === 'shop') {
      if (e.code === 'KeyB' || e.code === 'Escape') closeShop();
    } else if (state.mode === 'paused') {
      if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
    }

    if (e.code === 'KeyM') audio.toggle();
    if (e.code === 'KeyF') toggleFullscreen();
  });

  window.addEventListener('keyup', e => {
    state.keys[e.code] = false;
  });

  // --- MOBILE TWIN-STICK TOUCH HANDLERS ---
  function setupJoystick(zoneId, knobId, targetState) {
    const zone = document.getElementById(zoneId);
    const knob = document.getElementById(knobId);
    if (!zone || !knob) return;

    const maxDist = 42;

    zone.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.changedTouches[0];
      const rect = zone.getBoundingClientRect();
      targetState.active = true;
      targetState.id = t.identifier;
      targetState.startX = rect.left + rect.width / 2;
      targetState.startY = rect.top + rect.height / 2;
    }, { passive: false });

    zone.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === targetState.id) {
          const dx = t.clientX - targetState.startX;
          const dy = t.clientY - targetState.startY;
          const dist = Math.min(maxDist, Math.hypot(dx, dy));
          const ang = Math.atan2(dy, dx);
          const kx = Math.cos(ang) * dist;
          const ky = Math.sin(ang) * dist;
          knob.style.transform = `translate(${kx}px, ${ky}px)`;
          targetState.dx = kx / maxDist;
          targetState.dy = ky / maxDist;
        }
      }
    }, { passive: false });

    const endTouch = e => {
      for (const t of e.changedTouches) {
        if (t.identifier === targetState.id) {
          targetState.active = false;
          targetState.dx = 0;
          targetState.dy = 0;
          knob.style.transform = 'translate(0px, 0px)';
        }
      }
    };
    zone.addEventListener('touchend', endTouch);
    zone.addEventListener('touchcancel', endTouch);
  }

  setupJoystick('joy-left', 'joy-left-knob', state.touchMove);
  setupJoystick('joy-right', 'joy-right-knob', state.touchAim);

  // --- UI BUTTON BINDINGS ---
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  document.querySelectorAll('.diff-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.difficulty = Number(btn.dataset.diff);
    });
  });

  document.querySelectorAll('.weapon-slot').forEach(btn => {
    btn.addEventListener('click', () => selectWeapon(Number(btn.dataset.weapon)));
  });

  document.getElementById('btn-start-game').addEventListener('click', startNewGameSession);
  document.getElementById('btn-open-shop').addEventListener('click', openShop);
  document.getElementById('btn-close-shop').addEventListener('click', closeShop);
  document.getElementById('btn-toggle-sound').addEventListener('click', () => audio.toggle());
  document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
  document.getElementById('btn-pause').addEventListener('click', togglePause);
  document.getElementById('btn-resume').addEventListener('click', togglePause);
  document.getElementById('btn-pause-shop').addEventListener('click', openShop);
  document.getElementById('btn-quit-menu').addEventListener('click', returnToMainMenu);
  document.getElementById('btn-retry').addEventListener('click', startNewGameSession);
  document.getElementById('btn-gameover-menu').addEventListener('click', returnToMainMenu);

  document.getElementById('skill-dash').addEventListener('click', triggerDash);
  document.getElementById('skill-turret').addEventListener('click', deployTurret);
  document.getElementById('skill-nuke').addEventListener('click', triggerPlasmaNova);

  // --- MAIN ANIMATION FRAME ---
  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  updateMenuRecordsUI();
  initGame();
  state.mode = 'menu';
  requestAnimationFrame(loop);
})();
