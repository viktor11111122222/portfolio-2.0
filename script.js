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

    // Typewriter reveal with random "glitch" characters
    const full = text + (isLast ? '' : '...');
    const glitchChars = '▓▒░█▄▌▐▀#@&%!?';
    let i = 0;

    function typeNext() {
      if (i < full.length) {
        // Occasionally show a glitch char before the real one
        if (Math.random() > 0.88 && i < full.length - 1) {
          txt.textContent = full.slice(0, i) + glitchChars[randInt(0, glitchChars.length)];
          setTimeout(typeNext, 6);
        } else {
          txt.textContent = full.slice(0, ++i);
          setTimeout(typeNext, rand(2, 5));
        }
      } else {
        // Reveal [OK] / [READY]
        setTimeout(() => {
          ok.style.opacity = '1';
          if (isLast) {
            setTimeout(() => {
              loader.classList.add('hidden');
              document.body.style.overflow = '';
              animateHeroStats();
            }, 200);
          } else {
            scheduleNext();
          }
        }, 15);
      }
    }
    typeNext();
  }

  function scheduleNext() {
    setTimeout(() => {
      msgIdx++;
      if (msgIdx >= messages.length) return;
      targetProgress = ((msgIdx + 1) / messages.length) * 100;
      addTerminalLine(messages[msgIdx], msgIdx === messages.length - 1);
    }, rand(15, 35));
  }

  // Kick off first message
  setTimeout(() => {
    targetProgress = (1 / messages.length) * 100;
    addTerminalLine(messages[0], false);
  }, 80);

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
  const trail = $('#cursorTrail');

  let mx = 0, my = 0;
  let rx = 0, ry = 0;
  let tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function updateRing() {
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    tx = lerp(tx, mx, 0.08);
    ty = lerp(ty, my, 0.08);
    ring.style.left  = rx + 'px';
    ring.style.top   = ry + 'px';
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
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
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) document.body.classList.remove('hovering');
  });
})();

/* ═══════════════════════════════════════════════════════════
   3. NAVIGATION
═══════════════════════════════════════════════════════════ */
(function initNav() {
  const navbar  = $('#navbar');
  const toggle  = $('#navToggle');
  const links   = $('#navLinks');
  const navLinkEls = $$('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active link highlighting
    const sections = $$('section[id]');
    let currentId = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) currentId = sec.id;
    });
    navLinkEls.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + currentId);
    });
  });

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
  });
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
    });

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
   13. CONTACT FORM
═══════════════════════════════════════════════════════════ */
(function initForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type=submit]');
    const text = btn.querySelector('.btn-text');
    text.textContent = 'TRANSMITTING...';
    btn.disabled = true;

    setTimeout(() => {
      text.textContent = '✓ MESSAGE SENT';
      btn.style.borderColor = '#00ff9f';
      btn.style.color       = '#00ff9f';

      setTimeout(() => {
        text.textContent = 'TRANSMIT MESSAGE';
        btn.disabled      = false;
        btn.style.borderColor = '';
        btn.style.color       = '';
        form.reset();
      }, 3000);
    }, 1500);
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
  let lastScroll = 0;
  const heroGrid = $('.hero-grid');
  if (!heroGrid) return;

  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    const d = s - lastScroll;
    lastScroll = s;

    const speed = clamp(Math.abs(d) * 0.1, 0, 1);
    heroGrid.style.opacity = clamp(1 - s / window.innerHeight, 0, 1);
  });
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
  });

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

  function drawSkillPolygon(progress) {
    // Filled area
    ctx.beginPath();
    for (let i = 0; i < SIDES; i++) {
      const p = pt(i, skills[i].value * progress);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0,   'rgba(0,229,255,0.30)');
    grad.addColorStop(0.5, 'rgba(191,0,255,0.18)');
    grad.addColorStop(1,   'rgba(255,0,100,0.06)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Glowing stroke
    ctx.shadowBlur   = 18;
    ctx.shadowColor  = '#00e5ff';
    ctx.strokeStyle  = '#00e5ff';
    ctx.lineWidth    = 1.8;
    ctx.stroke();
    ctx.shadowBlur   = 0;
  }

  function drawDots(progress) {
    skills.forEach((sk, i) => {
      const p = pt(i, sk.value * progress);
      // Dot glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
      g.addColorStop(0,   sk.color + 'aa');
      g.addColorStop(1,   'transparent');
      ctx.fillStyle  = g;
      ctx.fill();
      // Solid dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle   = sk.color;
      ctx.shadowBlur  = 12;
      ctx.shadowColor = sk.color;
      ctx.fill();
      ctx.shadowBlur  = 0;
    });
  }

  function drawLabels(progress) {
    if (progress < 0.6) return;
    const alpha = clamp((progress - 0.6) / 0.4, 0, 1);
    ctx.globalAlpha = alpha;

    skills.forEach((sk, i) => {
      const lp = pt(i, 1.28);
      // Skill name
      ctx.fillStyle = sk.color;
      ctx.font      = `bold ${10 * DPR / DPR}px "Share Tech Mono"`;
      ctx.textAlign = 'center';
      ctx.shadowBlur  = 8;
      ctx.shadowColor = sk.color;
      ctx.fillText(sk.label, lp.x, lp.y - 3);
      ctx.shadowBlur  = 0;
      // Percentage
      ctx.fillStyle = 'rgba(200,214,246,0.55)';
      ctx.font      = `${9 * DPR / DPR}px "Share Tech Mono"`;
      ctx.fillText(sk.pct, lp.x, lp.y + 11);
    });

    ctx.globalAlpha = 1;
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

  function drawFrame(p) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    drawGrid();
    drawSkillPolygon(p);
    drawDots(p);
    drawLabels(p);
    drawCenter();
  }

  let progress  = 0;
  let triggered = false;
  let pulseT    = 0;

  function animate() {
    progress += 0.018;
    drawFrame(Math.min(progress, 1));
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Subtle breathing glow after finish
      (function pulse() {
        pulseT += 0.015;
        // Redraw center with a pulsing glow
        ctx.clearRect(cx - 30, cy - 30, 60, 60);
        ctx.fillStyle = `rgba(0,229,255,${0.04 + Math.sin(pulseT) * 0.03})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle  = `rgba(0,229,255,${0.4 + Math.sin(pulseT) * 0.15})`;
        ctx.font       = `bold ${10 * DPR / DPR}px "Orbitron"`;
        ctx.textAlign  = 'center';
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
  const BASE_A = 0.035;    // barely-visible base stroke alpha
  const HOVER_R = R * 5.5; // mouse influence radius
  const LERP_F  = 0.07;    // smoothing factor

  let W, H, hexes, mouse = { clientX: -9999, clientY: -9999 };

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

      hexPath(h.cx, h.cy);

      if (b > 0.01) {
        ctx.shadowColor = 'rgba(0,229,255,1)';
        ctx.shadowBlur  = 14 * b;
        ctx.fillStyle   = `rgba(0,229,255,${b * 0.07})`;
        ctx.fill();
      }

      ctx.strokeStyle = `rgba(0,229,255,${BASE_A + b * 0.38})`;
      ctx.lineWidth   = 0.8 + b * 0.6;
      ctx.stroke();

      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', e => {
    // Keep viewport coords — scrollY added live in draw() each frame
    mouse.clientX = e.clientX;
    mouse.clientY = e.clientY;
  });

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

console.log('%c[VICA PORTFOLIO] %cSYSTEM ONLINE', 'color:#00e5ff;font-family:monospace;font-weight:bold', 'color:#00ff9f;font-family:monospace');
console.log('%cBuilt with ❤ and code', 'color:#bf00ff;font-family:monospace;font-size:11px');
