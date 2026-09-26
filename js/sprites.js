/* Pixel-art 8-bit desenhada por código — sem assets externos. */
(function () {
  'use strict';

  function R(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(x | 0, y | 0, w, h);
  }

  // Nave do jogador: ~36x26. S = tamanho do "pixel".
  function drawPlayer(ctx, cx, y, t) {
    var S = 2;
    var x0 = Math.round(cx - 18);
    var f = Math.floor(t * 10) % 2; // chama tremula
    // Chama do motor (2 frames)
    if (f === 0) { R(ctx, x0 + 14, y + 22, 8, 8, '#ff8c00'); R(ctx, x0 + 16, y + 22, 4, 12, '#ffe600'); }
    else { R(ctx, x0 + 14, y + 22, 8, 6, '#ffe600'); R(ctx, x0 + 16, y + 22, 4, 8, '#ffffff'); }
    // Asas
    R(ctx, x0 + 0, y + 14, 36, 4, '#c8c8c8');
    R(ctx, x0 + 0, y + 14, 6, 8, '#ff3355');
    R(ctx, x0 + 30, y + 14, 6, 8, '#ff3355');
    R(ctx, x0 + 4, y + 10, 28, 6, '#ffffff');
    // Corpo
    R(ctx, x0 + 14, y + 0, 8, 18, '#ffffff');
    R(ctx, x0 + 12, y + 6, 12, 10, '#e8e8e8');
    // Cockpit
    R(ctx, x0 + 15, y + 4, 6, 8, '#00e5ff');
    R(ctx, x0 + 15, y + 4, 6, 2, '#bffaff');
    // Detalhe
    R(ctx, x0 + 16, y + 14, 4, 4, '#2323c8');
  }

  function drawHamburger(ctx, x, y, t) {
    var b = Math.sin(t * 6 + x * 0.05) > 0 ? 0 : 1;
    R(ctx, x + 2, y + 2 + b, 28, 6, '#e8a33d');   // pão topo
    R(ctx, x + 6, y + 0 + b, 20, 4, '#f5c86e');
    R(ctx, x + 8, y + 2 + b, 3, 2, '#fff'); R(ctx, x + 20, y + 2 + b, 3, 2, '#fff');
    R(ctx, x + 0, y + 8 + b, 32, 3, '#33ff57');   // alface
    R(ctx, x + 0, y + 11 + b, 32, 4, '#ffe600');  // queijo
    R(ctx, x + 2, y + 15 + b, 28, 5, '#7a3b12');  // carne
    R(ctx, x + 4, y + 20 + b, 24, 4, '#e8a33d');  // pão base
  }

  function drawCookie(ctx, x, y, t) {
    var bl = Math.floor(t * 4) % 2;
    R(ctx, x + 6, y + 0, 20, 4, '#d9a45b');
    R(ctx, x + 2, y + 4, 28, 16, '#d9a45b');
    R(ctx, x + 6, y + 20, 20, 4, '#d9a45b');
    R(ctx, x + 0, y + 8, 32, 8, '#e8bc7d');
    var chip = bl ? '#3a1e05' : '#5a2f08';
    R(ctx, x + 8, y + 8, 4, 4, chip); R(ctx, x + 20, y + 6, 4, 4, chip);
    R(ctx, x + 14, y + 13, 4, 4, '#3a1e05'); R(ctx, x + 22, y + 14, 4, 4, chip);
    R(ctx, x + 6, y + 14, 4, 4, chip);
  }

  function drawIron(ctx, x, y, t) {
    var b = Math.floor(t * 3) % 2;
    R(ctx, x + 8, y + 0, 16, 4, '#8888ff');       // alça
    R(ctx, x + 8, y + 4, 4, 6, '#8888ff'); R(ctx, x + 20, y + 4, 4, 6, '#8888ff');
    R(ctx, x + 2, y + 10, 28, 8, '#c8c8d8');      // corpo
    R(ctx, x + 2, y + 10, 10, 8, '#8a8aa8');
    R(ctx, x + 0, y + 18, 32, 5, b ? '#00e5ff' : '#0090ff'); // base quente
    R(ctx, x + 14, y + 12, 4, 4, '#ff3355');
  }

  function drawBowtie(ctx, x, y, t) {
    var w = Math.floor(t * 5) % 2 ? 0 : 1;
    var c = '#ff2e88';
    // asa esquerda
    R(ctx, x + 0, y + 2 - w, 12, 4, c); R(ctx, x + 0, y + 16 + w, 12, 4, c);
    R(ctx, x + 0, y + 6 - w, 12, 12, '#d61e6e');
    R(ctx, x + 2, y + 8, 4, 8, '#ff8ac2');
    // asa direita
    R(ctx, x + 20, y + 2 - w, 12, 4, c); R(ctx, x + 20, y + 16 + w, 12, 4, c);
    R(ctx, x + 20, y + 6 - w, 12, 12, '#d61e6e');
    R(ctx, x + 26, y + 8, 4, 8, '#ff8ac2');
    // nó
    R(ctx, x + 12, y + 7, 8, 10, '#ffe600');
    R(ctx, x + 14, y + 9, 4, 6, '#ff8c00');
  }

  function drawDiamond(ctx, x, y, t) {
    var tw = Math.floor(t * 6) % 2;
    R(ctx, x + 10, y + 0, 12, 4, '#7df9ff');
    R(ctx, x + 6, y + 4, 20, 5, '#00e5ff');
    R(ctx, x + 2, y + 9, 28, 4, '#19c2ff');
    R(ctx, x + 8, y + 13, 16, 4, '#0090ff');
    R(ctx, x + 13, y + 17, 6, 5, '#0055ff');
    R(ctx, x + 8, y + 5, 5, 3, '#ffffff');
    if (tw) { R(ctx, x + 28, y + 0, 3, 3, '#ffffff'); }
  }

  function drawEnemy(ctx, type, x, y, t) {
    x = Math.round(x); y = Math.round(y);
    switch (type) {
      case 0: drawHamburger(ctx, x, y, t); break;
      case 1: drawCookie(ctx, x, y, t); break;
      case 2: drawIron(ctx, x, y, t); break;
      case 3: drawBowtie(ctx, x, y, t); break;
      default: drawDiamond(ctx, x, y, t); break;
    }
  }

  window.SPRITES = { drawPlayer: drawPlayer, drawEnemy: drawEnemy };
})();
