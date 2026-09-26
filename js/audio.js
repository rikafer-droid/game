/* SFX procedural via Web Audio — sem arquivos. */
(function () {
  'use strict';
  var ctx = null, muted = false;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      return true;
    } catch (e) { return false; }
  }

  function laser() {
    if (muted || !ensure()) return;
    try {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(1400, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.12);
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.13);
    } catch (e) {}
  }

  function noiseBurst(dur, f0, f1, vol) {
    var len = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource(); src.buffer = buf;
    var flt = ctx.createBiquadFilter(); flt.type = 'lowpass';
    flt.frequency.setValueAtTime(f0, ctx.currentTime);
    flt.frequency.exponentialRampToValueAtTime(Math.max(60, f1), ctx.currentTime + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(flt); flt.connect(g); g.connect(ctx.destination);
    src.start();
  }

  function explosion() { // "crushing"
    if (muted || !ensure()) return;
    try {
      noiseBurst(0.32, 3800, 150, 0.35);
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(160, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.32);
    } catch (e) {}
  }

  function playerHit() {
    if (muted || !ensure()) return;
    try {
      noiseBurst(0.6, 2500, 80, 0.4);
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(400, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.55);
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  }

  function levelClear() {
    if (muted || !ensure()) return;
    try {
      var notes = [523, 659, 784, 1046];
      for (var i = 0; i < notes.length; i++) {
        (function (n, i) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'square'; o.frequency.value = n;
          var t = ctx.currentTime + i * 0.11;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          o.connect(g); g.connect(ctx.destination);
          o.start(t); o.stop(t + 0.12);
        })(notes[i], i);
      }
    } catch (e) {}
  }

  window.GameAudio = {
    unlock: ensure,
    laser: laser, explosion: explosion, playerHit: playerHit, levelClear: levelClear,
    toggle: function () { muted = !muted; return muted; },
    isMuted: function () { return muted; }
  };
})();
