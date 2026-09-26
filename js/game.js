/* Megamania-like — lógica principal. Sem módulos (funciona em file://). */
(function () {
  'use strict';

  var W = 480, H = 640;
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  var elScore = document.getElementById('score');
  var elHi = document.getElementById('hi');
  var elLevel = document.getElementById('level');
  var elLives = document.getElementById('lives');
  var elEnemy = document.getElementById('enemy-name');
  var elEnergy = document.getElementById('energy-fill');
  var overlay = document.getElementById('overlay');
  var ovTitle = document.getElementById('ov-title');
  var ovSub = document.getElementById('ov-sub');
  var btnStart = document.getElementById('btn-start');
  var btnMute = document.getElementById('btn-mute');

  var LEVELS = [
    { name: 'HAMBÚRGUERES', type: 0, score: 100 },
    { name: 'BOLACHAS',     type: 1, score: 150 },
    { name: 'FERROS',       type: 2, score: 200 },
    { name: 'GRAVATAS',     type: 3, score: 250 },
    { name: 'DIAMANTES',    type: 4, score: 300 }
  ];
  function levelCfg(lv) { return LEVELS[(lv - 1) % LEVELS.length]; }

  var COLS = 6, ROWS = 3, SPX = 56, SPY = 44;
  var ENEMY_W = 32, ENEMY_H = 24;
  var PLAYER_W = 36, PLAYER_H = 26;
  var PB_SPEED = 640, EB_BASE = 165;
  var PLAYER_SPEED = 330, FIRE_CD = 0.17;
  var ENERGY_MAX = 100, ENERGY_DRAIN = 3.0;
  var PB_MAX = 24, EB_MAX = 6, PART_MAX = 140;

  var G = {
    state: 'menu', score: 0, hi: 0, lives: 3, level: 1,
    energy: ENERGY_MAX, time: 0, fireCd: 0, invuln: 0,
    stateT: 0, bannerT: 0, shake: 0
  };
  try { G.hi = parseInt(localStorage.getItem('megamania_hi') || '0', 10) || 0; } catch (e) {}

  var player = { x: W / 2, y: H - 84, alive: true };
  var form = { x: 0, y: 0, dir: 1, speed: 30 };
  var zigAmp = 26, zigFreq = 1.7, fireInterval = 1.0, fireT = 1.2;
  var enemies = [], pbullets = [], ebullets = [], parts = [], stars = [];

  var i;
  for (i = 0; i < PB_MAX; i++) pbullets.push({ x: 0, y: 0, on: false });
  for (i = 0; i < EB_MAX; i++) ebullets.push({ x: 0, y: 0, vy: 0, on: false });
  for (i = 0; i < PART_MAX; i++) parts.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, c: '#fff', s: 2, on: false });
  for (i = 0; i < 80; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, v: 20 + Math.random() * 70, s: Math.random() < 0.3 ? 2 : 1 });

  // ---- Input (ação, não tecla) ----
  var keys = {};
  var touchLeft = false, touchRight = false, touchFire = false;
  var dragging = false, dragX = W / 2;

  window.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown'].indexOf(k === ' ' ? ' ' : k) >= 0) e.preventDefault();
    keys[k] = true;
    window.GameAudio.unlock();
    if ((k === 'enter' || k === ' ') && (G.state === 'menu' || G.state === 'gameover')) startGame();
  });
  window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });

  function bindHold(el, set) {
    var on = function (e) { e.preventDefault(); window.GameAudio.unlock(); set(true); };
    var off = function (e) { e.preventDefault(); set(false); };
    el.addEventListener('touchstart', on, { passive: false });
    el.addEventListener('touchend', off, { passive: false });
    el.addEventListener('touchcancel', off, { passive: false });
    el.addEventListener('mousedown', on);
    el.addEventListener('mouseup', off);
    el.addEventListener('mouseleave', function () { set(false); });
  }
  bindHold(document.getElementById('btn-left'), function (v) { touchLeft = v; });
  bindHold(document.getElementById('btn-right'), function (v) { touchRight = v; });
  bindHold(document.getElementById('btn-fire'), function (v) { touchFire = v; });

  canvas.addEventListener('pointerdown', function (e) {
    window.GameAudio.unlock();
    dragging = true;
    dragX = pointerToGameX(e);
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', function (e) { if (dragging) dragX = pointerToGameX(e); });
  canvas.addEventListener('pointerup', function () { dragging = false; });
  canvas.addEventListener('pointercancel', function () { dragging = false; });
  function pointerToGameX(e) {
    var r = canvas.getBoundingClientRect();
    return (e.clientX - r.left) / r.width * W;
  }

  btnStart.addEventListener('click', function () { window.GameAudio.unlock(); startGame(); });
  btnMute.addEventListener('click', function () {
    window.GameAudio.unlock();
    var m = window.GameAudio.toggle();
    btnMute.textContent = m ? '🔇 SOM: OFF' : '🔊 SOM: ON';
  });
  document.addEventListener('visibilitychange', function () { lastT = 0; });

  // ---- Fluxo ----
  function showMenu(title, sub, btn) {
    ovTitle.innerHTML = title;
    ovSub.innerHTML = sub;
    btnStart.textContent = btn;
    overlay.classList.remove('hidden');
  }
  function hideOverlay() { overlay.classList.add('hidden'); }

  function startGame() {
    G.score = 0; G.lives = 3; G.level = 1;
    hideOverlay();
    startLevel(1);
  }

  function startLevel(lv) {
    var cfg = levelCfg(lv);
    G.state = 'playing';
    G.energy = ENERGY_MAX;
    G.invuln = 1.5;
    G.bannerT = 2.0;
    form.x = 0; form.y = 0; form.dir = 1;
    form.speed = 26 + lv * 9;
    zigAmp = Math.min(44, 24 + lv * 2.5);
    zigFreq = 1.5 + lv * 0.16;
    fireInterval = Math.max(0.34, 1.15 - lv * 0.09);
    fireT = 1.0;
    enemies = [];
    var gridW = (COLS - 1) * SPX;
    var x0 = (W - gridW) / 2;
    for (var r = 0; r < ROWS; r++)
      for (var c = 0; c < COLS; c++)
        enemies.push({ c: c, r: r, bx: x0 + c * SPX, by: 92 + r * SPY, x: 0, y: 0, type: cfg.type, score: cfg.score, alive: true });
    positionEnemies();
    for (var k = 0; k < EB_MAX; k++) ebullets[k].on = false;
    updateHUD();
  }

  function positionEnemies() {
    for (var k = 0; k < enemies.length; k++) {
      var e = enemies[k];
      e.x = e.bx + form.x + Math.sin(G.time * zigFreq + e.r * 0.9 + e.c * 0.45) * zigAmp;
      e.y = e.by + form.y + Math.cos(G.time * zigFreq * 0.7 + e.c * 0.8) * 6;
    }
  }

  function aliveCount() {
    var n = 0;
    for (var k = 0; k < enemies.length; k++) if (enemies[k].alive) n++;
    return n;
  }

  function killPlayer(reason) {
    if (G.state !== 'playing' || G.invuln > 0) return;
    explode(player.x, player.y, ['#ffffff', '#00e5ff', '#ff3355', '#ffe600'], 34);
    window.GameAudio.playerHit();
    G.shake = 0.35;
    G.lives--;
    updateHUD();
    if (G.lives <= 0) { gameOver(); return; }
    G.state = 'dying';
    G.stateT = 1.4;
    G.energy = ENERGY_MAX;
    for (var k = 0; k < EB_MAX; k++) ebullets[k].on = false;
  }

  function gameOver() {
    G.state = 'gameover';
    if (G.score > G.hi) {
      G.hi = G.score;
      try { localStorage.setItem('megamania_hi', String(G.hi)); } catch (e) {}
    }
    updateHUD();
    showMenu('GAME<br>OVER', 'SCORE ' + pad(G.score) + '<br>RECORDE ' + pad(G.hi), '↻ JOGAR DE NOVO');
  }

  function levelClear() {
    G.state = 'clear';
    G.stateT = 2.2;
    G.score += 500 * G.level;
    G.energy = ENERGY_MAX;
    window.GameAudio.levelClear();
    updateHUD();
  }

  // ---- FX ----
  function explode(x, y, colors, n) {
    var made = 0;
    for (var k = 0; k < PART_MAX && made < n; k++) {
      var p = parts[k];
      if (p.on) continue;
      var a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 220;
      p.on = true; p.x = x; p.y = y;
      p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp - 60;
      p.max = p.life = 0.35 + Math.random() * 0.45;
      p.c = colors[(Math.random() * colors.length) | 0];
      p.s = 2 + ((Math.random() * 3) | 0);
      made++;
    }
  }

  function pad(n) {
    n = Math.max(0, Math.floor(n));
    var s = String(n);
    while (s.length < 6) s = '0' + s;
    return s;
  }

  function updateHUD() {
    elScore.textContent = pad(G.score);
    elHi.textContent = pad(G.hi);
    elLevel.textContent = G.level;
    elEnemy.textContent = levelCfg(G.level).name;
    var h = '';
    for (var k = 0; k < Math.max(0, G.lives); k++) h += '♥';
    elLives.textContent = h || '—';
  }

  // ---- Colisão AABB precisa (hitbox 70%) ----
  function overlap(ax, ay, aw, ah, bx, by, bw, bh) {
    var ai = 0.15; // encolhe 15% de cada lado
    var ax1 = ax - aw / 2 + aw * ai, ax2 = ax + aw / 2 - aw * ai;
    var ay1 = ay - ah / 2 + ah * ai, ay2 = ay + ah / 2 - ah * ai;
    var bx1 = bx - bw / 2 + bw * ai, bx2 = bx + bw / 2 - bw * ai;
    var by1 = by - bh / 2 + bh * ai, by2 = by + bh / 2 - bh * ai;
    return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
  }

  function fireBullet() {
    for (var k = 0; k < PB_MAX; k++) {
      var b = pbullets[k];
      if (b.on) continue;
      b.on = true; b.x = player.x; b.y = player.y - 20;
      window.GameAudio.laser();
      return;
    }
  }

  function enemyFire() {
    var active = 0, k;
    for (k = 0; k < EB_MAX; k++) if (ebullets[k].on) active++;
    var maxOn = G.level >= 4 ? 2 : 1; // poucos projéteis, um de cada vez
    if (active >= maxOn) return;
    var cands = [];
    for (k = 0; k < enemies.length; k++) if (enemies[k].alive) cands.push(enemies[k]);
    if (!cands.length) return;
    // prefere os mais baixos (ameaça real)
    cands.sort(function (a, b) { return b.y - a.y; });
    var src = cands[(Math.random() * Math.min(6, cands.length)) | 0];
    for (k = 0; k < EB_MAX; k++) {
      var b = ebullets[k];
      if (b.on) continue;
      b.on = true; b.x = src.x; b.y = src.y + 14;
      b.vy = EB_BASE + G.level * 16;
      return;
    }
  }

  // ---- Update ----
  function update(dt) {
    G.time += dt;
    var s;
    for (s = 0; s < stars.length; s++) {
      stars[s].y += stars[s].v * dt;
      if (stars[s].y > H) { stars[s].y = -2; stars[s].x = Math.random() * W; }
    }
    for (s = 0; s < PART_MAX; s++) {
      var p = parts[s];
      if (!p.on) continue;
      p.life -= dt;
      if (p.life <= 0) { p.on = false; continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt;
    }
    if (G.bannerT > 0) G.bannerT -= dt;
    if (G.shake > 0) G.shake -= dt;
    if (G.invuln > 0) G.invuln -= dt;

    if (G.state === 'dying') {
      G.stateT -= dt;
      updateBullets(dt, false);
      if (G.stateT <= 0) { G.state = 'playing'; G.invuln = 2.5; }
      return;
    }
    if (G.state === 'clear') {
      G.stateT -= dt;
      updateBullets(dt, false);
      if (G.stateT <= 0) { G.level++; startLevel(G.level); }
      return;
    }
    if (G.state !== 'playing') return;

    // Energia drena sempre
    G.energy -= ENERGY_DRAIN * dt;
    if (G.energy <= 0) { G.energy = 0; killPlayer('fuel'); return; }
    elEnergy.style.width = (G.energy / ENERGY_MAX * 100).toFixed(1) + '%';
    elEnergy.classList.toggle('low', G.energy < 25);

    // Movimento player (só X)
    var dir = 0;
    if (keys['arrowleft'] || keys['a']) dir -= 1;
    if (keys['arrowright'] || keys['d']) dir += 1;
    if (touchLeft) dir -= 1;
    if (touchRight) dir += 1;
    player.x += dir * PLAYER_SPEED * dt;
    if (dragging) {
      var d = dragX - player.x;
      player.x += d * Math.min(1, dt * 14); // arrasto fluido
    }
    player.x = Math.max(24, Math.min(W - 24, player.x));

    // Tiro (rápido + auto-fire p/ mobile)
    G.fireCd -= dt;
    var wantFire = keys[' '] || keys['j'] || keys['k'] || touchFire || true;
    if (wantFire && G.fireCd <= 0) { fireBullet(); G.fireCd = FIRE_CD; }

    // Formação: lateral + desce em fileiras devagar + zigue-zague individual
    form.x += form.dir * form.speed * dt;
    if (form.x > 42) { form.x = 42; form.dir = -1; form.y += 13; }
    if (form.x < -42) { form.x = -42; form.dir = 1; form.y += 13; }
    positionEnemies();

    // Tiro inimigo escasso
    fireT -= dt;
    if (fireT <= 0) { enemyFire(); fireT = fireInterval * (0.7 + Math.random() * 0.6); }

    updateBullets(dt, true);

    // Inimigo encostou na nave ou invadiu a linha
    for (var k = 0; k < enemies.length; k++) {
      var e = enemies[k];
      if (!e.alive) continue;
      if (e.y > player.y - 18) { killPlayer('invade'); form.y = Math.max(0, form.y - 60); return; }
      if (overlap(e.x, e.y, ENEMY_W, ENEMY_H, player.x, player.y, PLAYER_W, PLAYER_H)) { killPlayer('ram'); return; }
    }

    if (aliveCount() === 0) levelClear();
  }

  function updateBullets(dt, collide) {
    var k, b, e;
    for (k = 0; k < PB_MAX; k++) {
      b = pbullets[k];
      if (!b.on) continue;
      b.y -= PB_SPEED * dt;
      if (b.y < -20) { b.on = false; continue; }
      if (!collide) continue;
      for (var j = 0; j < enemies.length; j++) {
        e = enemies[j];
        if (!e.alive) continue;
        if (overlap(b.x, b.y, 5, 14, e.x, e.y, ENEMY_W, ENEMY_H)) {
          e.alive = false; b.on = false;
          G.score += e.score;
          explode(e.x, e.y, ['#ffffff', '#ffe600', '#ff8c00', '#ff3355'], 14);
          window.GameAudio.explosion();
          if (G.score > G.hi) { G.hi = G.score; elHi.textContent = pad(G.hi); }
          elScore.textContent = pad(G.score);
          break;
        }
      }
    }
    for (k = 0; k < EB_MAX; k++) {
      b = ebullets[k];
      if (!b.on) continue;
      b.y += b.vy * dt;
      if (b.y > H + 20) { b.on = false; continue; }
      if (collide && G.invuln <= 0 && overlap(b.x, b.y, 7, 12, player.x, player.y, PLAYER_W, PLAYER_H)) {
        b.on = false;
        killPlayer('shot');
        return;
      }
    }
  }

  // ---- Render ----
  function render() {
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    if (G.shake > 0) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);

    var s;
    ctx.fillStyle = '#fff';
    for (s = 0; s < stars.length; s++) ctx.fillRect(stars[s].x | 0, stars[s].y | 0, stars[s].s, stars[s].s);

    // Balas player (rápidas, vibrantes)
    for (s = 0; s < PB_MAX; s++) {
      var b = pbullets[s];
      if (!b.on) continue;
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(b.x - 2, b.y - 7, 4, 14);
      ctx.fillStyle = '#fff';
      ctx.fillRect(b.x - 1, b.y - 7, 2, 14);
    }
    // Balas inimigas
    for (s = 0; s < EB_MAX; s++) {
      var eb = ebullets[s];
      if (!eb.on) continue;
      ctx.fillStyle = '#ff3355';
      ctx.fillRect(eb.x - 3, eb.y - 6, 6, 12);
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(eb.x - 1, eb.y - 6, 2, 12);
    }

    // Inimigos
    for (s = 0; s < enemies.length; s++) {
      var e = enemies[s];
      if (!e.alive) continue;
      window.SPRITES.drawEnemy(ctx, e.type, e.x - 16, e.y - 12, G.time + e.c * 0.3);
    }

    // Partículas
    for (s = 0; s < PART_MAX; s++) {
      var p = parts[s];
      if (!p.on) continue;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalAlpha = 1;

    // Player (pisca no invencível)
    if (G.state === 'playing' || G.state === 'clear' || (G.state === 'dying' && false)) {
      var blink = G.invuln > 0 && (Math.floor(G.time * 12) % 2 === 0);
      if (!blink) window.SPRITES.drawPlayer(ctx, player.x, player.y - 13, G.time);
    } else if (G.state === 'dying') {
      // nave destruída: não desenha
    }

    // Banner de fase
    if (G.bannerT > 0 && (G.state === 'playing')) {
      var cfg = levelCfg(G.level);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe600';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText('FASE ' + G.level, W / 2, H / 2 - 30);
      ctx.fillStyle = '#00e5ff';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText(cfg.name, W / 2, H / 2);
    }
    ctx.restore();
  }

  // ---- Loop (dt clampado = timestep estável) ----
  var lastT = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    if (!lastT) lastT = t;
    var dt = (t - lastT) / 1000;
    lastT = t;
    if (dt > 0.033) dt = 0.033;
    if (dt < 0) dt = 0;
    update(dt);
    render();
  }

  elEnergy.style.width = '100%';
  updateHUD();
  showMenu('MEGA<br>MANIA', 'HAMBÚRGUERES DO ESPAÇO ATACAM!<br><br>SOBREVIVA À ENERGIA', '▶ INICIAR');
  requestAnimationFrame(loop);
})();
