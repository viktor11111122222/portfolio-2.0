/* ============================================================
   VICA PORTFOLIO — INTERACTIVE SYSTEMS
   ============================================================ */

'use strict';

/* ── UTIL ───────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));

/* ═══════════════════════════════════════════════════════════
   1. LOADING SCREEN — HACKING TERMINAL
═══════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader   = $('#loader');
  const fill     = $('#loaderFill');
  const pct      = $('#loaderPct');
  const terminal = $('#loaderTerminal');

  const messages = [
    'ACCESSING MAINFRAME',
    'INITIALIZING NEURAL ENGINE',
    'LOADING VISUAL ASSETS',
    'ESTABLISHING SECURE CONNECTION',
    'BYPASSING FIREWALL PROTOCOLS',
    'COMPILING CORE MODULES',
    'INJECTING CSS SEQUENCES',
    'RENDERING PARTICLE SYSTEMS',
    'ALL SYSTEMS ONLINE',
  ];

  let currentProgress = 0;
  let targetProgress  = 0;
  let msgIdx          = 0;
  document.body.style.overflow = 'hidden';

  // Smooth progress bar tick
  (function tickProgress() {
    if (currentProgress < targetProgress) {
      currentProgress = Math.min(currentProgress + 1.4, targetProgress);
      fill.style.width = currentProgress + '%';
      pct.textContent  = Math.floor(currentProgress) + '%';
    }
    if (currentProgress < 100) requestAnimationFrame(tickProgress);
  })();

  function addTerminalLine(text, isLast) {
    const line = document.createElement('div');
    line.className = 'lterm-line';

    const pre = document.createElement('span');
    pre.className   = 'lterm-pre';
    pre.textContent = '> ';

    const txt = document.createElement('span');
    txt.className = 'lterm-txt';

    const ok = document.createElement('span');
    ok.className   = isLast ? 'lterm-ready' : 'lterm-ok';
    ok.textContent = isLast ? '[ READY ]' : '[ OK ]';
    ok.style.opacity = '0';

    line.appendChild(pre);
    line.appendChild(txt);
    line.appendChild(ok);
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;

    // Typewriter — rAF based, 4 chars per frame (~240 chars/s at 60fps)
    const full = text + (isLast ? '' : '...');
    const glitchChars = '▓▒░█▄▌▐▀#@&%!?';
    let i = 0;
    let glitching = false;

    function tick() {
      if (glitching) {
        // show glitch char for one frame then move on
        glitching = false;
        txt.textContent = full.slice(0, i);
        requestAnimationFrame(tick);
        return;
      }

      // advance 2 chars per frame (~120 chars/s at 60fps)
      const end = Math.min(i + 2, full.length);
      // occasional glitch on first char of batch
      if (Math.random() > 0.85 && i < full.length - 1) {
        txt.textContent = full.slice(0, i) + glitchChars[randInt(0, glitchChars.length)];
        glitching = true;
        requestAnimationFrame(tick);
        return;
      }
      i = end;
      txt.textContent = full.slice(0, i);

      if (i < full.length) {
        requestAnimationFrame(tick);
      } else {
        ok.style.opacity = '1';
        if (isLast) {
          setTimeout(hideLoader, 350);
        } else {
          scheduleNext();
        }
      }
    }
    requestAnimationFrame(tick);
  }

  function hideLoader() {
    if (loader.classList.contains('hidden')) return;
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    animateHeroStats();
  }

  function scheduleNext() {
    setTimeout(() => {
      msgIdx++;
      if (msgIdx >= messages.length) return;
      targetProgress = ((msgIdx + 1) / messages.length) * 100;
      addTerminalLine(messages[msgIdx], msgIdx === messages.length - 1);
    }, 30);
  }

  // Safety cap — max 3500ms in case of very slow device
  setTimeout(hideLoader, 3500);

  // Kick off first message
  setTimeout(() => {
    targetProgress = (1 / messages.length) * 100;
    addTerminalLine(messages[0], false);
  }, 50);

  // ── Hex background for loader ──────────────────────────────
  (function loaderHex() {
    const cvs = $('#loaderHexCanvas');
    const ctx  = cvs.getContext('2d');
    const R = 36, BASE_A = 0.04, HOVER_R = R * 5, LF = 0.08;
    let W, H, hexes, alive = true;
    const mouse = { x: -9999, y: -9999 };

    function hexPath(cx, cy) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        i === 0
          ? ctx.moveTo(cx + R * Math.cos(a), cy + R * Math.sin(a))
          : ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
      }
      ctx.closePath();
    }

    function buildGrid() {
      hexes = [];
      const colW = R * Math.sqrt(3), rowH = R * 1.5;
      const cols = Math.ceil(W / colW) + 2, rows = Math.ceil(H / rowH) + 2;
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const offset = col % 2 !== 0 ? rowH * 0.5 : 0;
          hexes.push({ cx: col * colW + colW * 0.5, cy: row * rowH + offset + R, b: 0 });
        }
      }
    }

    function resize() {
      W = cvs.width  = window.innerWidth;
      H = cvs.height = window.innerHeight;
      buildGrid();
    }

    function draw() {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);
      hexes.forEach(h => {
        const dx = mouse.x - h.cx, dy = mouse.y - h.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const raw = dist < HOVER_R ? Math.pow(1 - dist / HOVER_R, 1.8) : 0;
        h.b = lerp(h.b, raw, LF);
        hexPath(h.cx, h.cy);
        if (h.b > 0.01) {
          ctx.shadowColor = 'rgba(0,229,255,1)';
          ctx.shadowBlur  = 14 * h.b;
          ctx.fillStyle   = `rgba(0,229,255,${h.b * 0.07})`;
          ctx.fill();
        }
        ctx.strokeStyle = `rgba(0,229,255,${BASE_A + h.b * 0.38})`;
        ctx.lineWidth   = 0.8 + h.b * 0.6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(draw);
    }

    loader.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    loader.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('resize', resize);

    // Stop animating once loader hides (performance)
    new MutationObserver(() => {
      if (loader.classList.contains('hidden')) alive = false;
    }).observe(loader, { attributes: true, attributeFilter: ['class'] });

    resize();
    draw();
  })();
})();

/* ═══════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
═══════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot   = $('#cursorDot');
  const ring  = $('#cursorRing');

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  }, { passive: true });

  function updateRing() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(updateRing);
  }
  updateRing();

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  // Hover state for interactive elements
  const hoverEls = 'a, button, .skill-card, .proj-card, .tech-item, .soc-btn';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) document.body.classList.add('hovering');
    if (e.target.closest('input, textarea')) document.body.classList.add('cursor-on-input');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) document.body.classList.remove('hovering');
    if (e.target.closest('input, textarea')) document.body.classList.remove('cursor-on-input');
  });
})();

/* ═══════════════════════════════════════════════════════════
   3. NAVIGATION
═══════════════════════════════════════════════════════════ */
(function initNav() {
  const toggle  = $('#navToggle');
  const links   = $('#navLinks');
  const navLinkEls = $$('.nav-link');

  const navBg = $('#navBg');

  window.addEventListener('scroll', () => {
    // Fill div grows left→right over first 220px of scroll
    const t = Math.min(window.scrollY / 220, 1);
    navBg.style.width = (t * 100).toFixed(2) + '%';
    navBg.classList.toggle('filled', t >= 1);

    // Active link highlighting
    const sections = $$('section[id]');
    let currentId = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) currentId = sec.id;
    });
    navLinkEls.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + currentId);
    });
  }, { passive: true });

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    const spans = $$('span', toggle);
    if (links.classList.contains('open')) {
      spans[0].style.transform = 'translateY(6px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close nav on link click
  navLinkEls.forEach(l => l.addEventListener('click', () => {
    links.classList.remove('open');
    const spans = $$('span', toggle);
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }));
})();

/* ═══════════════════════════════════════════════════════════
   4. MAIN PARTICLE CANVAS (HERO BG)
═══════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#particleCanvas');
  const ctx    = canvas.getContext('2d');
  const COLORS = ['#00e5ff', '#bf00ff', '#ff0064', '#00ff9f'];
  const COUNT  = 80;

  let W, H, particles = [];
  let mouse = { x: null, y: null };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); init(); });

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Particle {
    constructor() { this.reset(true); }
    reset(randomY = false) {
      this.x  = rand(0, W);
      this.y  = randomY ? rand(0, H) : H + 10;
      this.vx = rand(-0.3, 0.3);
      this.vy = rand(-0.6, -0.15);
      this.r  = rand(0.8, 2.2);
      this.a  = rand(0.2, 0.7);
      this.c  = COLORS[randInt(0, COLORS.length)];
      this.life = 0;
      this.maxLife = rand(200, 400);
    }
    update() {
      this.life++;
      if (this.life > this.maxLife) { this.reset(); return; }

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const d  = Math.hypot(dx, dy);
        if (d < 120) {
          this.vx -= (dx / d) * 0.04;
          this.vy -= (dy / d) * 0.04;
        }
      }

      this.vx *= 0.99;
      this.vy *= 0.99;
      this.x  += this.vx;
      this.y  += this.vy;

      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;

      const t = this.life / this.maxLife;
      this.alpha = this.a * (1 - Math.pow(t - 0.5, 2) * 4);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.c;
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function init() {
    particles = Array.from({ length: COUNT }, () => new Particle());
  }
  init();

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          const alpha = (1 - d / 120) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = a.c;
          ctx.globalAlpha = alpha;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ═══════════════════════════════════════════════════════════
   5. PERSON CANVAS (local particles around photo)
═══════════════════════════════════════════════════════════ */
(function initPersonCanvas() {
  const canvas = $('#personCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const COLORS = ['#00e5ff', '#bf00ff', '#ff0064'];
  const particles = [];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width  || 440;
    canvas.height = rect.height || 520;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 40; i++) {
    const angle = rand(0, Math.PI * 2);
    const radiusBase = rand(130, 220);
    particles.push({
      angle,
      radius:  radiusBase,
      speed:   rand(0.003, 0.012) * (Math.random() > 0.5 ? 1 : -1),
      r:       rand(0.5, 1.8),
      a:       rand(0.3, 0.9),
      c:       COLORS[randInt(0, COLORS.length)],
      offset:  rand(0, Math.PI * 2),
      wobble:  rand(0.002, 0.008),
      wAmp:    rand(5, 25)
    });
  }

  function animate() {
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const t = Date.now() * 0.001;
    particles.forEach(p => {
      p.angle += p.speed;
      const wobble = Math.sin(t * p.wobble * 100 + p.offset) * p.wAmp;
      const r      = p.radius + wobble;
      const x      = cx + Math.cos(p.angle) * r;
      const y      = cy + Math.sin(p.angle) * r * 0.55; // flatten to oval

      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a * (0.5 + 0.5 * Math.sin(t * 2 + p.offset));
      ctx.fill();
      ctx.globalAlpha = 1;

      // Trail glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.r * 4);
      gradient.addColorStop(0, p.c + '60');
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();
})();

/* ═══════════════════════════════════════════════════════════
   6. TYPEWRITER EFFECT
═══════════════════════════════════════════════════════════ */
(function initTypewriter() {
  const el = $('#typewriter');
  if (!el) return;

  const lines = [
    'Building next-gen web experiences',
    'Frontend & App Developer',
    'React · React Native · JavaScript',
    'Pixel-perfect UI on every screen',
    'Open to new opportunities'
  ];

  let lineIdx  = 0;
  let charIdx  = 0;
  let deleting = false;
  let paused   = false;

  function type() {
    const line = lines[lineIdx];

    if (paused) { paused = false; setTimeout(type, 1800); return; }

    if (!deleting) {
      el.textContent = line.slice(0, ++charIdx);
      if (charIdx === line.length) { deleting = true; paused = true; }
      setTimeout(type, 60 + rand(-20, 20));
    } else {
      el.textContent = line.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        lineIdx  = (lineIdx + 1) % lines.length;
        setTimeout(type, 400);
      } else {
        setTimeout(type, 30);
      }
    }
  }
  setTimeout(type, 1500);
})();

/* ═══════════════════════════════════════════════════════════
   7. CODE RAIN (project card thumbnails)
═══════════════════════════════════════════════════════════ */
(function initCodeRain() {
  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]#@&%!?';
  const COLORS = ['#00e5ff', '#bf00ff', '#00ff9f', '#ff0064'];

  $$('.code-rain-canvas').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    let W, H, cols, drops;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width  = rect.width  || 280;
      H = canvas.height = rect.height || 180;
      const fontSize = 12;
      cols  = Math.floor(W / fontSize);
      drops = Array.from({ length: cols }, () => randInt(-H / fontSize, 0));
    }
    resize();

    const fontSize = 12;

    function draw() {
      ctx.fillStyle = 'rgba(3,3,8,0.07)';
      ctx.fillRect(0, 0, W, H);

      drops.forEach((y, i) => {
        const char  = CHARS[randInt(0, CHARS.length)];
        const color = COLORS[randInt(0, COLORS.length)];
        ctx.font         = `${fontSize}px 'Share Tech Mono', monospace`;
        ctx.fillStyle    = color;
        ctx.globalAlpha  = 0.5 + Math.random() * 0.5;
        ctx.fillText(char, i * fontSize, y * fontSize);
        ctx.globalAlpha  = 1;

        // Bright head
        if (Math.random() > 0.95) {
          ctx.fillStyle   = '#ffffff';
          ctx.globalAlpha = 0.8;
          ctx.fillText(char, i * fontSize, y * fontSize);
          ctx.globalAlpha = 1;
        }

        drops[i] = y * fontSize > H && Math.random() > 0.975 ? 0 : y + 1;
      });
    }

    setInterval(draw, 50);
  });
})();

/* ═══════════════════════════════════════════════════════════
   8. SCROLL ANIMATIONS (Intersection Observer)
═══════════════════════════════════════════════════════════ */
(function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Skill bars
        $$('.sb-fill', entry.target).forEach(bar => {
          const w = bar.getAttribute('data-w');
          if (w) setTimeout(() => { bar.style.width = w + '%'; }, 200);
        });
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  $$('[data-aos]').forEach(el => observer.observe(el));

  // Skill cards specifically
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.sb-fill', entry.target).forEach(bar => {
          const w = bar.getAttribute('data-w');
          if (w) setTimeout(() => { bar.style.width = w + '%'; }, 400);
        });
      }
    });
  }, { threshold: 0.3 });
  $$('.skill-card').forEach(c => skillObs.observe(c));
})();

/* ═══════════════════════════════════════════════════════════
   9. HERO STAT COUNTERS
═══════════════════════════════════════════════════════════ */
function animateHeroStats() {
  $$('.stat-number').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'));
    let current  = 0;
    const step   = target / 40;
    const id = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(id); }
      el.textContent = Math.floor(current);
    }, 40);
  });
}

/* ═══════════════════════════════════════════════════════════
   10. MOUSE PARALLAX (hero section)
═══════════════════════════════════════════════════════════ */
(function initParallax() {
  const heroLeft  = $('#heroLeft');
  const heroRight = $('#heroRight');
  let tx = 0, ty = 0;
  let cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    const hw = window.innerWidth  / 2;
    const hh = window.innerHeight / 2;
    tx = (e.clientX - hw) / hw;
    ty = (e.clientY - hh) / hh;
  });

  function updateParallax() {
    cx = lerp(cx, tx, 0.06);
    cy = lerp(cy, ty, 0.06);

    if (heroLeft)  heroLeft.style.transform  = `translate(${cx * -8}px, ${cy * -8}px)`;
    if (heroRight) heroRight.style.transform = `translate(${cx * 12}px, ${cy * 10}px)`;

    requestAnimationFrame(updateParallax);
  }
  updateParallax();

  // Section parallax on scroll
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    $$('.hero-glow').forEach((el, i) => {
      const speed = [0.3, 0.2, 0.15][i] || 0.1;
      el.style.transform = `translate${i === 0 ? 'Y' : 'Y'}(${scrollY * speed}px)`;
    });

    const bgTexts = $$('.section-bg-text');
    bgTexts.forEach(el => {
      const rect  = el.getBoundingClientRect();
      const ratio = rect.top / window.innerHeight;
      el.style.transform = `translate(-50%, calc(-50% + ${ratio * 40}px))`;
    });
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════
   11. 3D CARD TILT
═══════════════════════════════════════════════════════════ */
(function initTilt() {
  const TILT = 8; // max degrees

  $$('.proj-card, .skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform = `
        perspective(600px)
        rotateX(${-y * TILT}deg)
        rotateY(${x  * TILT}deg)
        translateZ(8px)
        translateY(-4px)
      `;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   12. RANDOM GLITCH TRIGGER
═══════════════════════════════════════════════════════════ */
(function initGlitch() {
  const els = $$('.glitch');

  function triggerRandom() {
    const el = els[randInt(0, els.length)];
    if (!el) return;

    el.style.animation = 'none';
    void el.offsetWidth; // reflow
    el.style.animation = '';

    // Artificial glitch
    let i = 0;
    const ticks = randInt(3, 8);
    const glitchTick = setInterval(() => {
      const offsetX = rand(-4, 4) + 'px';
      const offsetY = rand(-2, 2) + 'px';
      el.style.textShadow = `${offsetX} ${offsetY} 0 #ff0064, ${'-' + offsetX} ${'-' + offsetY} 0 #00e5ff`;
      if (++i >= ticks) {
        clearInterval(glitchTick);
        el.style.textShadow = '';
      }
    }, 60);

    setTimeout(triggerRandom, rand(2000, 6000));
  }
  triggerRandom();
})();

/* ═══════════════════════════════════════════════════════════
   13. CONTACT FORM — EmailJS
   ─────────────────────────────────────────────────────────
   Popuni ova tri stringa sa EmailJS dashboard-a:
   emailjs.com → Account → API Keys → Public Key
   emailjs.com → Email Services → Service ID
   emailjs.com → Email Templates → Template ID
═══════════════════════════════════════════════════════════ */
(function initForm() {
  const EMAILJS_PUBLIC_KEY  = '4FrHcttWWMAg0A32b';   // ← ovdje
  const EMAILJS_SERVICE_ID  = 'service_sq22ile';   // ← ovdje
  const EMAILJS_TEMPLATE_ID = 'template_301bchb';  // ← ovdje

  const form = $('#contactForm');
  if (!form) return;

  // Inicijaliziraj EmailJS sa public key-em
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type=submit]');
    const text = btn.querySelector('.btn-text');

    // Provjeri da li je EmailJS učitan
    if (typeof emailjs === 'undefined') {
      text.textContent = '✗ SDK NOT LOADED';
      btn.style.borderColor = 'var(--pink)';
      btn.style.color       = 'var(--pink)';
      setTimeout(() => {
        text.textContent      = 'TRANSMIT MESSAGE';
        btn.style.borderColor = '';
        btn.style.color       = '';
      }, 3000);
      return;
    }

    // Popuni {{time}} sa trenutnim datumom i vremenom
    $('#ftime').value = new Date().toLocaleString('sr-RS', {
      dateStyle: 'medium', timeStyle: 'short'
    });

    text.textContent = 'TRANSMITTING...';
    btn.disabled     = true;

    emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
      .then(() => {
        // Uspješno slanje
        text.textContent      = '✓ MESSAGE SENT';
        btn.style.borderColor = '#00ff9f';
        btn.style.color       = '#00ff9f';
        form.reset();
        setTimeout(() => {
          text.textContent      = 'TRANSMIT MESSAGE';
          btn.disabled          = false;
          btn.style.borderColor = '';
          btn.style.color       = '';
        }, 3000);
      })
      .catch(() => {
        // Greška pri slanju
        text.textContent      = '✗ TRANSMISSION FAILED';
        btn.style.borderColor = 'var(--pink)';
        btn.style.color       = 'var(--pink)';
        btn.disabled          = false;
        setTimeout(() => {
          text.textContent      = 'TRANSMIT MESSAGE';
          btn.style.borderColor = '';
          btn.style.color       = '';
        }, 3000);
      });
  });
})();

/* ═══════════════════════════════════════════════════════════
   14. SMOOTH SCROLL
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    window.scrollTo({
      top: target.offsetTop - navH,
      behavior: 'smooth'
    });
  });
});

/* ═══════════════════════════════════════════════════════════
   15. TECH ORBIT — counter-rotation to keep labels readable
═══════════════════════════════════════════════════════════ */
(function initTechOrbit() {
  const items = $$('.tech-item');
  items.forEach((item, i) => {
    const count    = items.length;
    const angle    = (i / count) * 360;
    const duration = 20;
    // CSS handles the animation; we just stagger so they start spread out
    item.style.animationDelay = `calc(${i} * -${duration / count}s)`;
  });
})();

/* ═══════════════════════════════════════════════════════════
   16. AMBIENT CANVAS GLOW INTERACTION
═══════════════════════════════════════════════════════════ */
(function initAmbientGlow() {
  const glows = $$('.hero-glow');
  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;

    if (glows[0]) {
      glows[0].style.filter = `blur(${70 + mx * 30}px)`;
      glows[0].style.opacity = 0.8 + mx * 0.2;
    }
    if (glows[1]) {
      glows[1].style.filter = `blur(${70 + my * 30}px)`;
      glows[1].style.opacity = 0.8 + my * 0.2;
    }
  });
})();

/* ═══════════════════════════════════════════════════════════
   17. SECTION ENTRANCE STAGGER
═══════════════════════════════════════════════════════════ */
(function initSectionEntrance() {
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = $$('.proj-card, .skill-card', entry.target);
        cards.forEach((card, i) => {
          card.style.transitionDelay = `${i * 0.1}s`;
        });
      }
    });
  }, { threshold: 0.1 });

  $$('.section').forEach(s => sectionObs.observe(s));
})();

/* ═══════════════════════════════════════════════════════════
   18. DYNAMIC BACKGROUND — Subtle hex pattern shift on scroll
═══════════════════════════════════════════════════════════ */
(function initBgDynamic() {
  const heroGrid = $('.hero-grid');
  if (!heroGrid) return;

  const BASE_TILT = 25;

  window.addEventListener('scroll', () => {
    const s     = window.scrollY;
    const vh    = window.innerHeight;
    const tilt  = BASE_TILT + s * 0.012;          // grid tilts more as you scroll
    const rot   = s * 0.018;                       // slow Z rotation
    const opacity = clamp(1 - s / vh, 0, 1);

    heroGrid.style.transform = `perspective(600px) rotateX(${tilt}deg) rotateZ(${rot}deg) scaleY(2)`;
    heroGrid.style.opacity   = opacity;
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════
   31. SECTION NEON FADE — dims sections scrolled past
═══════════════════════════════════════════════════════════ */
(function initSectionFade() {
  const sections = $$('section.section');

  function update() {
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      // Section fully above viewport → dim it
      if (rect.bottom < -80) {
        sec.classList.add('section--past');
      } else {
        sec.classList.remove('section--past');
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ═══════════════════════════════════════════════════════════
   19. PERSON IMAGE HOVER EFFECT
═══════════════════════════════════════════════════════════ */
(function initPersonHover() {
  const universe = $('.person-universe');
  if (!universe) return;

  universe.addEventListener('mousemove', e => {
    const rect = universe.getBoundingClientRect();
    const x    = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const y    = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);

    universe.style.transform = `
      perspective(800px)
      rotateY(${x * 6}deg)
      rotateX(${-y * 4}deg)
    `;
  }, { passive: true });

  universe.addEventListener('mouseleave', () => {
    universe.style.transform   = '';
    universe.style.transition  = 'transform 0.6s ease';
    setTimeout(() => { universe.style.transition = ''; }, 600);
  });
})();

/* ═══════════════════════════════════════════════════════════
   20. PERFORMANCE: Reduce animations when tab is not visible
═══════════════════════════════════════════════════════════ */
document.addEventListener('visibilitychange', () => {
  document.body.style.animationPlayState = document.hidden ? 'paused' : 'running';
});

/* ═══════════════════════════════════════════════════════════
   21. PROJECTS BACKGROUND — CIRCUIT BOARD
═══════════════════════════════════════════════════════════ */
(function initProjectsBg() {
  const canvas = $('#projBgCanvas');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  const COLS = 14, ROWS = 9;
  const COLORS = ['#00e5ff', '#bf00ff', '#ff0064', '#00ff9f'];
  let W, H, nodes, edges, pulses;

  function build() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;

    // Grid nodes with slight random offset for organic feel
    nodes = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        nodes.push({
          x: (c / (COLS - 1)) * W + rand(-15, 15),
          y: (r / (ROWS - 1)) * H + rand(-15, 15),
        });
      }
    }

    // Edges: horizontal + vertical + occasional diagonal
    edges = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        if (c < COLS - 1) edges.push([i, i + 1]);           // right
        if (r < ROWS - 1) edges.push([i, i + COLS]);        // down
        if (c < COLS - 1 && r < ROWS - 1 && Math.random() > 0.75)
          edges.push([i, i + COLS + 1]);                     // diagonal
      }
    }

    pulses = [];
  }

  function spawnPulse() {
    if (!edges.length) return;
    const edge  = edges[randInt(0, edges.length)];
    const color = COLORS[randInt(0, COLORS.length)];
    pulses.push({ edge, t: 0, speed: rand(0.004, 0.016), color, size: rand(2, 4) });
  }

  const spawnId = setInterval(spawnPulse, 120);

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw edges
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.strokeStyle = 'rgba(0,229,255,0.04)';
      ctx.lineWidth   = 1;
      ctx.stroke();
    });

    // Draw nodes (small dots at intersections)
    nodes.forEach((n, ni) => {
      if (ni % 4 !== 0) return; // only every 4th for performance
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,255,0.15)';
      ctx.fill();
    });

    // Draw pulses (electrons traveling on edges)
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += p.speed;
      if (p.t > 1) { pulses.splice(i, 1); continue; }

      const na = nodes[p.edge[0]], nb = nodes[p.edge[1]];
      const x  = na.x + (nb.x - na.x) * p.t;
      const y  = na.y + (nb.y - na.y) * p.t;

      // Glow halo
      const grad = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4);
      grad.addColorStop(0,   p.color + '99');
      grad.addColorStop(1,   'transparent');
      ctx.beginPath();
      ctx.arc(x, y, p.size * 4, 0, Math.PI * 2);
      ctx.fillStyle  = grad;
      ctx.fill();

      // Solid core
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle   = p.color;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // Short tail
      const tailX = na.x + (nb.x - na.x) * Math.max(0, p.t - 0.12);
      const tailY = na.y + (nb.y - na.y) * Math.max(0, p.t - 0.12);
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = p.color + '55';
      ctx.lineWidth   = 1;
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  // Start only when section enters viewport
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { build(); draw(); obs.disconnect(); }
  }, { threshold: 0.1 });
  obs.observe(canvas.parentElement);

  window.addEventListener('resize', build);
})();

/* ═══════════════════════════════════════════════════════════
   22. HEXAGONAL RADAR CHART
═══════════════════════════════════════════════════════════ */
(function initRadarChart() {
  const canvas = $('#radarChart');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  const DPR  = window.devicePixelRatio || 1;
  const SIZE = 420;

  canvas.width        = SIZE * DPR;
  canvas.height       = SIZE * DPR;
  canvas.style.width  = SIZE + 'px';
  canvas.style.height = SIZE + 'px';
  ctx.scale(DPR, DPR);

  const cx     = SIZE / 2;
  const cy     = SIZE / 2;
  const maxR   = SIZE / 2 - 68;
  const SIDES  = 6;
  const START  = -Math.PI / 2; // top

  const skills = [
    { label: 'HTML/CSS',      pct: '97%', value: 0.97, color: '#00e5ff' },
    { label: 'JavaScript',    pct: '93%', value: 0.93, color: '#ffcc00' },
    { label: 'React',         pct: '90%', value: 0.90, color: '#61dafb' },
    { label: 'React Native',  pct: '88%', value: 0.88, color: '#bf00ff' },
    { label: 'UI / UX',       pct: '90%', value: 0.90, color: '#ff0064' },
    { label: 'Tools',         pct: '85%', value: 0.85, color: '#00ff9f' },
  ];

  function pt(i, ratio) {
    const a = START + (i / SIDES) * Math.PI * 2;
    return { x: cx + Math.cos(a) * maxR * ratio, y: cy + Math.sin(a) * maxR * ratio };
  }

  function drawGrid() {
    // Concentric hexagons
    [0.25, 0.5, 0.75, 1].forEach((r, ri) => {
      ctx.beginPath();
      for (let i = 0; i < SIDES; i++) {
        const p = pt(i, r);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0,229,255,${0.04 + ri * 0.05})`;
      ctx.lineWidth   = 1;
      ctx.stroke();

      // Grid percentage markers (on the top axis only)
      if (ri < 3) {
        const lp = pt(0, r);
        ctx.fillStyle  = 'rgba(0,229,255,0.25)';
        ctx.font       = `${9 * DPR / DPR}px "Share Tech Mono"`;
        ctx.textAlign  = 'center';
        ctx.fillText(`${Math.round(r * 100)}%`, lp.x, lp.y - 6);
      }
    });

    // Axis lines
    for (let i = 0; i < SIDES; i++) {
      const p = pt(i, 1);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = 'rgba(0,229,255,0.07)';
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
  }

  // Center label
  function drawCenter() {
    ctx.fillStyle = 'rgba(0,229,255,0.06)';
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle  = 'rgba(0,229,255,0.5)';
    ctx.font       = `bold ${10 * DPR / DPR}px "Orbitron"`;
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VICA', cx, cy);
    ctx.textBaseline = 'alphabetic';
  }

  // ── Easing helpers ──────────────────────────────────────
  function easeOutBack(t) {
    const c = 2.5;
    return 1 + c * Math.pow(t - 1, 3) + (c - 1) * Math.pow(t - 1, 2);
  }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // ── Scan beam that sweeps 360° ───────────────────────────
  function drawScanBeam(scanProg) {
    if (scanProg <= 0 || scanProg >= 1) return;
    const angle = START + scanProg * Math.PI * 2;

    // Swept "sonar" wedge (trailing arc fill)
    const wedgeSpan = Math.PI * 0.55;
    const wedgeStart = angle - wedgeSpan;

    // Draw trailing glow arc manually as a filled sector
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxR * 1.05, wedgeStart, angle);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,229,255,0.04)';
    ctx.fill();
    ctx.restore();

    // Leading beam line
    const ex = cx + Math.cos(angle) * (maxR + 24);
    const ey = cy + Math.sin(angle) * (maxR + 24);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = 'rgba(0,229,255,0.95)';
    ctx.lineWidth   = 1.5;
    ctx.shadowBlur  = 28;
    ctx.shadowColor = '#00e5ff';
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // Tip spark
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fillStyle  = '#ffffff';
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#00e5ff';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ── Per-vertex progress (activates as scan passes it) ───
  function vertexT(i, scanProg) {
    const activateAt = (i / SIDES) * 0.9;   // spread across 90% of scan
    const dur        = 0.28;
    return clamp((scanProg - activateAt) / dur, 0, 1);
  }

  // ── Staggered polygon ────────────────────────────────────
  function drawPolygonStagger(scanProg) {
    const ratios = skills.map((sk, i) => sk.value * easeOutBack(vertexT(i, scanProg)));

    ctx.beginPath();
    for (let i = 0; i < SIDES; i++) {
      const p = pt(i, ratios[i]);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0,   'rgba(0,229,255,0.28)');
    grad.addColorStop(0.5, 'rgba(191,0,255,0.16)');
    grad.addColorStop(1,   'rgba(255,0,100,0.05)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowBlur  = 18;
    ctx.shadowColor = '#00e5ff';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth   = 1.8;
    ctx.stroke();
    ctx.shadowBlur  = 0;
  }

  // ── Staggered dots with flash ring ──────────────────────
  function drawDotsStagger(scanProg) {
    skills.forEach((sk, i) => {
      const vt = vertexT(i, scanProg);
      if (vt <= 0) return;
      const ratio = easeOutBack(vt);
      const p     = pt(i, sk.value * ratio);

      // Glow halo
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
      g.addColorStop(0, sk.color + 'bb');
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // Solid dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle   = sk.color;
      ctx.shadowBlur  = 14;
      ctx.shadowColor = sk.color;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // Flash ring that expands & fades on activation
      if (vt < 0.45) {
        const fAlpha = (1 - vt / 0.45) * 0.9;
        const fR     = 4 + (1 - vt / 0.45) * 18;
        ctx.beginPath();
        ctx.arc(p.x, p.y, fR, 0, Math.PI * 2);
        const hex = Math.round(fAlpha * 255).toString(16).padStart(2, '0');
        ctx.strokeStyle = sk.color + hex;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }
    });
  }

  // ── Grid fade-in with glitch flicker ────────────────────
  function drawGridFade(p) {
    const flicker = p < 0.12
      ? (Math.random() > 0.35 ? 1 : 0.15)
      : 1;
    ctx.globalAlpha = Math.min(p / 0.08, 1) * flicker;
    drawGrid();
    ctx.globalAlpha = 1;
  }

  // ── Labels with per-char glitch entry ───────────────────
  function drawLabelsGlitch(p) {
    if (p <= 0) return;
    const alpha = easeInOutCubic(clamp(p, 0, 1));
    ctx.globalAlpha = alpha;
    skills.forEach((sk, i) => {
      const lp = pt(i, 1.28);
      ctx.fillStyle    = sk.color;
      ctx.font         = `bold ${10 * DPR / DPR}px "Share Tech Mono"`;
      ctx.textAlign    = 'center';
      ctx.shadowBlur   = 8;
      ctx.shadowColor  = sk.color;
      ctx.fillText(sk.label, lp.x, lp.y - 3);
      ctx.shadowBlur   = 0;
      ctx.fillStyle    = 'rgba(200,214,246,0.55)';
      ctx.font         = `${9 * DPR / DPR}px "Share Tech Mono"`;
      ctx.fillText(sk.pct, lp.x, lp.y + 11);
    });
    ctx.globalAlpha = 1;
  }

  let progress  = 0;
  let triggered = false;
  let pulseT    = 0;

  // Show grid immediately (empty, no polygon)
  ctx.clearRect(0, 0, SIZE, SIZE);
  drawGrid();
  drawCenter();

  function animate() {
    progress += 0.011;                       // ~1.5s total at 60fps
    const p        = Math.min(progress, 1);
    const scanProg = clamp(p / 0.68, 0, 1); // scan finishes at p=0.68
    const labelP   = clamp((p - 0.72) / 0.28, 0, 1);

    ctx.clearRect(0, 0, SIZE, SIZE);
    drawGridFade(p);
    drawScanBeam(scanProg);
    drawPolygonStagger(scanProg);
    drawDotsStagger(scanProg);
    drawLabelsGlitch(labelP);
    drawCenter();

    if (p < 1) {
      requestAnimationFrame(animate);
    } else {
      (function pulse() {
        pulseT += 0.015;
        ctx.clearRect(cx - 30, cy - 30, 60, 60);
        ctx.fillStyle = `rgba(0,229,255,${0.04 + Math.sin(pulseT) * 0.03})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle    = `rgba(0,229,255,${0.4 + Math.sin(pulseT) * 0.15})`;
        ctx.font         = `bold ${10 * DPR / DPR}px "Orbitron"`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VICA', cx, cy);
        ctx.textBaseline = 'alphabetic';
        requestAnimationFrame(pulse);
      })();
    }
  }

  // Only trigger when in viewport
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !triggered) {
        triggered = true;
        animate();
        obs.unobserve(canvas);
      }
    });
  }, { threshold: 0.3 });

  obs.observe(canvas);
})();

/* ── SUBTLE PARALLAX ── */
(function initParallax() {
  // Section ghost letters move at 15% of scroll speed
  const bgTexts  = $$('.section-bg-text');
  // About photo moves at 8%
  const aphWrap  = $('.about-photo-wrap');

  function onScroll() {
    const cy = window.scrollY + window.innerHeight * 0.5; // viewport center

    bgTexts.forEach(el => {
      const rect   = el.parentElement.getBoundingClientRect();
      const elMid  = window.scrollY + rect.top + rect.height * 0.5;
      const offset = (cy - elMid) * 0.15;
      el.style.setProperty('--py', offset.toFixed(2) + 'px');
    });

    if (aphWrap) {
      const rect   = aphWrap.getBoundingClientRect();
      const elMid  = window.scrollY + rect.top + rect.height * 0.5;
      const offset = (cy - elMid) * 0.08;
      aphWrap.style.transform = `translateY(${offset.toFixed(2)}px)`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── INTERACTIVE HEX BACKGROUND ── */
(function initHexBg() {
  const canvas = document.createElement('canvas');
  canvas.id = 'hexBgCanvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const R      = 38;       // hex radius (center to vertex)
  const BASE_A = 0.06;     // base stroke alpha
  const HOVER_R = R * 5.5; // mouse influence radius
  const LERP_F  = 0.07;    // smoothing factor

  let W, H, hexes, mouse = { clientX: -9999, clientY: -9999 }, heroBottom = 0;

  // Pointy-top hex: angle offsets start at -π/6
  function hexPath(cx, cy) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const px = cx + R * Math.cos(a);
      const py = cy + R * Math.sin(a);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function buildGrid() {
    hexes = [];
    // Pointy-top hex grid geometry
    const colW = R * Math.sqrt(3);
    const rowH  = R * 1.5;
    const cols  = Math.ceil(W / colW) + 2;
    const rows  = Math.ceil(H / rowH) + 2;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const offset = (col % 2 !== 0) ? rowH * 0.5 : 0;
        const cx = col * colW + colW * 0.5;
        const cy = row * rowH + offset + R;
        hexes.push({ cx, cy, brightness: 0 });
      }
    }
  }

  function resize() {
    W = window.innerWidth;
    // Stop canvas at footer so hexes don't bleed into it
    const footer = document.getElementById('footer');
    H = footer ? footer.offsetTop : Math.max(document.body.scrollHeight, window.innerHeight);
    canvas.width  = W;
    canvas.height = H;
    buildGrid();
    const hero = document.getElementById('hero');
    heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
  }

  function draw() {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    const pad = R + 4; // buffer so hex vertices don't bleed outside cleared area

    const docMouseX = mouse.clientX;
    const docMouseY = mouse.clientY + sy;

    ctx.clearRect(0, Math.max(0, sy - pad), W, vh + pad * 2);

    hexes.forEach(h => {
      if (h.cy + R < sy - pad || h.cy - R > sy + vh + pad) {
        h.brightness = 0;
        return;
      }

      const dx   = docMouseX - h.cx;
      const dy   = docMouseY - h.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const raw  = dist < HOVER_R
        ? Math.pow(1 - dist / HOVER_R, 1.8)
        : 0;

      h.brightness = lerp(h.brightness, raw, LERP_F);
      const b = h.brightness;

      // Fade hexagons inside hero's bottom ::after zone (220px) so hover
      // brightness matches the CSS gradient and there's no hard seam
      const HERO_FADE = 220;
      const vm = (heroBottom > 0 && h.cy >= heroBottom - HERO_FADE && h.cy <= heroBottom)
        ? 1 - (h.cy - (heroBottom - HERO_FADE)) / HERO_FADE
        : 1;
      const bv        = b * vm;
      const baseAlpha = BASE_A * vm;

      hexPath(h.cx, h.cy);

      if (bv > 0.01) {
        ctx.shadowColor = 'rgba(0,229,255,1)';
        ctx.shadowBlur  = 14 * bv;
        ctx.fillStyle   = `rgba(0,229,255,${bv * 0.07})`;
        ctx.fill();
      }

      ctx.strokeStyle = `rgba(0,229,255,${baseAlpha + bv * 0.38})`;
      ctx.lineWidth   = 0.8 + bv * 0.6;
      ctx.stroke();

      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', e => {
    // Keep viewport coords — scrollY added live in draw() each frame
    mouse.clientX = e.clientX;
    mouse.clientY = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.clientX = -9999;
    mouse.clientY = -9999;
  });

  let resizeTimer;
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
  window.addEventListener('resize', onResize);

  // Also watch for page height changes (images loading, sections appearing)
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(onResize).observe(document.body);
  }

  resize();
  draw();
})();

/* ═══════════════════════════════════════════════════════════
   23. SCROLL PROGRESS BAR
═══════════════════════════════════════════════════════════ */
(function initScrollProgress() {
  const bar = $('#scrollProgressBar');
  if (!bar) return;

  function update() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ═══════════════════════════════════════════════════════════
   24. 3D TILT — ABOUT PHOTO
═══════════════════════════════════════════════════════════ */
(function initAboutTilt() {
  const col = $('.about-visual-col');
  if (!col) return;

  const TILT = 12;

  col.addEventListener('mousemove', e => {
    const rect = col.getBoundingClientRect();
    const x    = (e.clientX - rect.left)  / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)   / rect.height - 0.5;

    col.style.transform = `
      perspective(900px)
      rotateX(${-y * TILT}deg)
      rotateY(${x  * TILT}deg)
    `;
  }, { passive: true });

  col.addEventListener('mouseleave', () => {
    col.style.transition  = 'transform 0.7s ease';
    col.style.transform   = '';
    setTimeout(() => { col.style.transition = ''; }, 700);
  });
})();

/* ═══════════════════════════════════════════════════════════
   25. NORTHERN LIGHTS + CLICK RIPPLE
═══════════════════════════════════════════════════════════ */
(function initNorthernLightsAndRipple() {
  // ── Northern lights blobs ──────────────────────────────
  const container = $('#northernLights');
  if (container) {
    const BLOBS = [
      { color: 'rgba(0,229,255,0.07)',  size: 520, bx: 15, by: 25, ox: 14, oy: 10, speed: 0.00028 },
      { color: 'rgba(191,0,255,0.05)', size: 640, bx: 72, by: 55, ox: 18, oy: 13, speed: 0.00022 },
      { color: 'rgba(0,255,159,0.045)',size: 460, bx: 48, by: 15, ox: 12, oy: 16, speed: 0.00035 },
      { color: 'rgba(255,0,100,0.04)', size: 580, bx: 28, by: 72, ox: 16, oy: 11, speed: 0.00019 },
      { color: 'rgba(0,229,255,0.05)', size: 500, bx: 80, by: 38, ox: 20, oy: 14, speed: 0.00031 },
    ];

    BLOBS.forEach(b => {
      const el = document.createElement('div');
      el.className = 'nl-blob';
      el.style.cssText = `
        width:${b.size}px; height:${b.size}px;
        background:${b.color};
        left:${b.bx}%; top:${b.by}%;
      `;
      container.appendChild(el);
      b.el = el;
      b.t  = Math.random() * Math.PI * 2;
    });

    (function animateBlobs() {
      BLOBS.forEach(b => {
        b.t += b.speed;
        const lx = b.bx + Math.sin(b.t)           * b.ox;
        const ly = b.by + Math.cos(b.t * 0.73)    * b.oy;
        b.el.style.left = lx + '%';
        b.el.style.top  = ly + '%';
      });
      requestAnimationFrame(animateBlobs);
    })();
  }

  // ── Click ripple ───────────────────────────────────────
  const RIPPLE_CYAN   = ['#00e5ff', '#00c8e0'];
  const RIPPLE_PURPLE = ['#bf00ff', '#9900cc'];

  document.addEventListener('click', e => {
    const x = e.clientX, y = e.clientY;
    const colors = document.body.classList.contains('hovering') ? RIPPLE_PURPLE : RIPPLE_CYAN;

    colors.forEach((color, i) => {
      const ripple  = document.createElement('div');
      ripple.className = 'click-ripple';
      const size    = 6 + i * 2;
      const dur     = 0.65 + i * 0.22;
      const delay   = i * 0.09;

      ripple.style.cssText = `
        left:${x}px; top:${y}px;
        width:${size}px; height:${size}px;
        border-color:${color};
        box-shadow: 0 0 6px ${color}66;
        animation: click-ripple-anim ${dur}s ease-out ${delay}s forwards;
      `;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), (dur + delay) * 1000 + 100);
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   26. FLOATING PARTICLES — SECTION DIVIDERS
═══════════════════════════════════════════════════════════ */
(function initDividerParticles() {
  const COLORS = ['#00e5ff', '#bf00ff', '#ff0064', '#00ff9f', '#ffcc00'];

  $$('.divider-particles').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    let W, H;
    const pts = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
      H = canvas.height = canvas.offsetHeight || 180;
    }

    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 28; i++) {
      pts.push({
        x:  Math.random() * (W || 1200),
        y:  Math.random() * (H || 180),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25,
        r:  rand(0.4, 1.6),
        a:  rand(0.25, 0.65),
        c:  COLORS[randInt(0, COLORS.length)],
        ph: rand(0, Math.PI * 2),
      });
    }

    let alive = false;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !alive) {
        alive = true;
        tick();
      }
    }, { rootMargin: '200px' });
    obs.observe(canvas);

    function tick() {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);
      const t = Date.now() * 0.001;

      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        const alpha = p.a * (0.5 + 0.5 * Math.sin(t * 1.4 + p.ph));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle   = p.c;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      requestAnimationFrame(tick);
    }
  });
})();

/* ═══════════════════════════════════════════════════════════
   27. MORPHING TEXT
═══════════════════════════════════════════════════════════ */
(function initMorphingText() {
  const el = $('#morphingWord');
  if (!el) return;

  const words = ['DEVELOPER', 'DESIGNER', 'CREATOR', 'INNOVATOR', 'BUILDER'];
  let wordIdx  = 0;
  let busy     = false;

  function render(word) {
    el.innerHTML = word.split('').map(ch =>
      `<span class="morph-char">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
  }

  function morphTo(nextWord) {
    if (busy) return;
    busy = true;

    const chars = $$('.morph-char', el);
    // Exit current
    chars.forEach((ch, i) => {
      setTimeout(() => ch.classList.add('exit'), i * 32);
    });

    const exitTime = chars.length * 32 + 140;

    setTimeout(() => {
      render(nextWord);
      const newChars = $$('.morph-char', el);
      newChars.forEach(ch => ch.classList.add('enter'));

      // Force reflow then remove enter class staggered
      void el.offsetWidth;
      newChars.forEach((ch, i) => {
        setTimeout(() => ch.classList.remove('enter'), i * 38);
      });

      setTimeout(() => { busy = false; }, newChars.length * 38 + 200);
    }, exitTime);
  }

  render(words[0]);

  setInterval(() => {
    wordIdx = (wordIdx + 1) % words.length;
    morphTo(words[wordIdx]);
  }, 2600);
})();

/* ═══════════════════════════════════════════════════════════
   28. CURSOR TEXT SWAP
═══════════════════════════════════════════════════════════ */
(function initCursorText() {
  const label = $('#cursorLabel');
  if (!label) return;

  const rules = [
    { sel: 'input, textarea', text: 'TYPE' },
  ];

  document.addEventListener('mouseover', e => {
    for (const rule of rules) {
      if (e.target.closest(rule.sel)) {
        label.textContent = rule.text;
        document.body.classList.add('cursor-has-label');
        return;
      }
    }
    document.body.classList.remove('cursor-has-label');
    label.textContent = '';
  });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-has-label');
    label.textContent = '';
  });
})();

/* ═══════════════════════════════════════════════════════════
   29. SCROLL-TRIGGERED COUNTERS — SKILL CARDS
═══════════════════════════════════════════════════════════ */
(function initSkillCounters() {
  const pcts = $$('.scc-pct[data-count]');
  if (!pcts.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.getAttribute('data-count'));
      let   cur    = 0;
      const step   = target / 45;

      const id = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(id); }
        el.textContent = Math.floor(cur) + '%';
      }, 28);

      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  pcts.forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════════════════════
   30. STAGGER REVEAL
═══════════════════════════════════════════════════════════ */
(function initStaggerReveal() {
  const containers = $$('[data-stagger]');
  if (!containers.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const items = $$('.stagger-item', entry.target);
      items.forEach((item, i) => {
        setTimeout(() => item.classList.add('stagger-in'), i * 110 + 80);
      });

      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

  containers.forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════════════════════
   32. GLOBAL BACKGROUND PARTICLES — absolute canvas, full doc height
   Canvas scrolls with the page → browser handles sync, zero JS lag.
═══════════════════════════════════════════════════════════ */
(function initGlobalParticles() {
  const canvas = $('#bgParticleCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const COLORS = ['#00e5ff', '#bf00ff', '#00ff9f', '#ff0064', '#ffcc00'];

  let W, VH, docH;
  let mouseX = -9999, mouseY = -9999;

  function getDocH() {
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, window.innerHeight);
  }

  function resize() {
    W    = window.innerWidth;
    VH   = window.innerHeight;
    docH = getDocH();
    canvas.width        = W;
    canvas.height       = docH;
    canvas.style.width  = W + 'px';
    canvas.style.height = docH + 'px';
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  function mk() {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(0.1, 0.35);
    return {
      x:       rand(0, W),
      y:       rand(0, docH),   // page coordinates — full document
      vx:      Math.cos(angle) * speed,
      vy:      Math.sin(angle) * speed,
      r:       rand(1.2, 2.8),
      baseA:   rand(0.4, 0.7),
      alpha:   rand(0, 0.5),
      color:   COLORS[randInt(0, COLORS.length)],
      life:    randInt(0, 500),
      maxLife: rand(400, 900),
    };
  }

  function buildParticles() {
    const count = clamp(Math.round((docH / VH) * 55), 200, 600);
    return Array.from({ length: count }, mk);
  }

  let particles = buildParticles();
  window.addEventListener('load', () => { resize(); particles = buildParticles(); }, { passive: true });

  function loop() {
    const scrollY    = window.scrollY;
    const pageMouseY = mouseY + scrollY;  // viewport mouse → page coords

    // Clear only the visible band — not the whole 8000px canvas
    ctx.clearRect(0, scrollY - 4, W, VH + 8);

    const visible = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life++;
      if (p.life > p.maxLife) {
        const n = mk(); n.life = 0; n.alpha = 0;
        particles[i] = n;
        continue;
      }

      p.vx = p.vx * 0.998 + rand(-0.004, 0.004);
      p.vy = p.vy * 0.998 + rand(-0.004, 0.004);
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -4)    p.x = W + 4;
      if (p.x > W + 4) p.x = -4;
      if (p.y < 0)     p.y = docH;
      if (p.y > docH)  p.y = 0;

      // skip if outside visible band
      if (p.y < scrollY - 10 || p.y > scrollY + VH + 10) continue;

      // mouse repulsion — both in page coords
      const dx = mouseX - p.x, dy = pageMouseY - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 90 && dist > 0) {
        p.vx -= (dx / dist) * 0.015;
        p.vy -= (dy / dist) * 0.015;
      }

      const t = p.life / p.maxLife;
      p.alpha = p.baseA * Math.sin(t * Math.PI);

      // draw at page coordinates — canvas is absolute so browser handles scroll
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, p.color + '99');
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle   = g;
      ctx.globalAlpha = p.alpha * 0.5;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle   = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      visible.push(p);
    }

    // connection lines — only visible particles
    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        const a = visible[i], b = visible[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 85) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = a.color;
          ctx.globalAlpha = (1 - d / 85) * 0.12;
          ctx.lineWidth   = 0.4;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    requestAnimationFrame(loop);
  }
  loop();
})();

/* ═══════════════════════════════════════════════════════════
   33. LOADER PARTICLES
═══════════════════════════════════════════════════════════ */
(function initLoaderParticles() {
  const canvas = $('#loaderParticles');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const COLORS = ['#00e5ff', '#bf00ff', '#00ff9f', '#ff0064', '#ffcc00'];
  let W, H;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const particles = Array.from({ length: 100 }, () => ({
    x: rand(0, window.innerWidth), y: rand(0, window.innerHeight),
    vx: rand(-0.2, 0.2), vy: rand(-0.4, -0.08),
    r: rand(0.8, 2.0), baseA: rand(0.3, 0.55),
    alpha: 0, color: COLORS[randInt(0, COLORS.length)],
    life: randInt(0, 400), maxLife: rand(300, 600),
  }));

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.life++;
      if (p.life > p.maxLife) { p.life = 0; p.x = rand(0, W); p.y = H + 5; }
      p.vx *= 0.995; p.vy *= 0.995;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      const t = p.life / p.maxLife;
      p.alpha = p.baseA * Math.sin(t * Math.PI);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ── DISCORD CARD TOAST ── */
(function initDiscordToast() {
  const card  = $('#discordCard');
  const toast = $('#toastNotif');
  if (!card || !toast) return;

  let timer;

  function showToast() {
    toast.innerHTML = `
      <span class="toast-notif-title">// DISCORD</span>
      We don't have a Discord server yet —<br>but one is coming soon. Stay tuned!
    `;
    toast.classList.add('toast-notif--visible');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('toast-notif--visible'), 4000);
  }

  card.addEventListener('click', showToast);
})();

console.log('%c[VICA PORTFOLIO] %cSYSTEM ONLINE', 'color:#00e5ff;font-family:monospace;font-weight:bold', 'color:#00ff9f;font-family:monospace');
console.log('%cBuilt with ❤ and code', 'color:#bf00ff;font-family:monospace;font-size:11px');
