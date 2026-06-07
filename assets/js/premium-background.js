/**
 * Premium Background Ecosystem
 * GPU-friendly canvas + mouse glow · 60 FPS target
 */
(function () {
  'use strict';

  const canvas = document.getElementById('premium-bg-canvas');
  const mouseGlow = document.getElementById('mouse-glow');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (isTouch) {
    document.body.classList.add('no-mouse-glow');
  }

  const CONFIG = {
    nodeCount: isMobile ? 32 : 52,
    particleCount: isMobile ? 16 : 28,
    connectDistance: isMobile ? 100 : 130,
    mouseRadius: isMobile ? 140 : 200,
    maxDpr: isMobile ? 1.25 : 2,
    heroBoostRadius: isMobile ? 220 : 340
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let nodes = [];
  let particles = [];
  let heroCenter = { x: 0, y: 0 };
  let mouse = { x: -9999, y: -9999, active: false };
  let glowPos = { x: -9999, y: -9999 };
  let rafId = 0;
  let running = true;

  class NeuralNode {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = (Math.random() - 0.5) * 0.15;
      this.baseRadius = Math.random() * 1.2 + 0.6;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.active && !reducedMotion) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy) || 1;

        if (dist < CONFIG.mouseRadius) {
          const force = (1 - dist / CONFIG.mouseRadius) * 0.018;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }

      this.vx *= 0.995;
      this.vy *= 0.995;
    }

    draw(mouseProximity) {
      const alpha = 0.12 + mouseProximity * 0.18;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
      ctx.fill();
    }
  }

  class FloatParticle {
    constructor(biasHero) {
      const heroWeight = biasHero ? 0.72 : 0.28;
      if (Math.random() < heroWeight && heroCenter.x > 0) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * CONFIG.heroBoostRadius;
        this.x = heroCenter.x + Math.cos(angle) * radius;
        this.y = heroCenter.y + Math.sin(angle) * radius;
      } else {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }

      this.vx = (Math.random() - 0.5) * 0.22;
      this.vy = (Math.random() - 0.5) * 0.22;
      this.radius = Math.random() * 1.8 + 0.8;
      this.isCyan = Math.random() > 0.45;
      this.alpha = Math.random() * 0.35 + 0.25;
      this.pulse = Math.random() * Math.PI * 2;
    }

    update(time) {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.012;

      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;
    }

    draw(time) {
      const pulseAlpha = this.alpha + Math.sin(this.pulse) * 0.12;
      const color = this.isCyan
        ? `rgba(6, 182, 212, ${pulseAlpha})`
        : `rgba(124, 58, 237, ${pulseAlpha})`;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    updateHeroCenter();
  }

  function updateHeroCenter() {
    const hero = document.querySelector('.hero-right') || document.querySelector('#home');
    if (!hero) {
      heroCenter = { x: width * 0.75, y: height * 0.38 };
      return;
    }
    const rect = hero.getBoundingClientRect();
    heroCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function initSystems() {
    nodes = Array.from({ length: CONFIG.nodeCount }, () =>
      new NeuralNode(Math.random() * width, Math.random() * height)
    );

    particles = Array.from({ length: CONFIG.particleCount }, (_, i) =>
      new FloatParticle(i < CONFIG.particleCount * 0.65)
    );
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist > CONFIG.connectDistance) continue;

        let alpha = (1 - dist / CONFIG.connectDistance) * 0.08;

        if (mouse.active) {
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const mouseDist = Math.hypot(mouse.x - midX, mouse.y - midY);
          if (mouseDist < CONFIG.mouseRadius) {
            alpha += (1 - mouseDist / CONFIG.mouseRadius) * 0.14;
          }
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  function updateMouseGlow() {
    if (!mouseGlow || isTouch || reducedMotion) return;

    const targetX = mouse.active ? mouse.x : heroCenter.x;
    const targetY = mouse.active ? mouse.y : heroCenter.y;

    glowPos.x += (targetX - glowPos.x) * 0.08;
    glowPos.y += (targetY - glowPos.y) * 0.08;

    const heroDist = Math.hypot(glowPos.x - heroCenter.x, glowPos.y - heroCenter.y);
    const heroBoost = Math.max(0, 1 - heroDist / (CONFIG.heroBoostRadius * 1.2));
    const baseOpacity = mouse.active ? 0.55 : 0.25;
    const opacity = Math.min(1, baseOpacity + heroBoost * 0.45);

    mouseGlow.style.opacity = String(opacity);
    mouseGlow.style.transform = `translate3d(${glowPos.x}px, ${glowPos.y}px, 0)`;

    if (heroBoost > 0.2) {
      mouseGlow.style.width = `${420 + heroBoost * 120}px`;
      mouseGlow.style.height = `${420 + heroBoost * 120}px`;
      mouseGlow.style.margin = `${-(210 + heroBoost * 60)}px 0 0 ${-(210 + heroBoost * 60)}px`;
    }
  }

  function render(time) {
    if (!running) return;

    ctx.clearRect(0, 0, width, height);

    if (!reducedMotion) {
      drawConnections();

      nodes.forEach((node) => {
        node.update();
        let proximity = 0;
        if (mouse.active) {
          const dist = Math.hypot(mouse.x - node.x, mouse.y - node.y);
          if (dist < CONFIG.mouseRadius) {
            proximity = 1 - dist / CONFIG.mouseRadius;
          }
        }
        node.draw(proximity);
      });

      particles.forEach((particle) => {
        particle.update(time);
        particle.draw(time);
      });
    }

    updateMouseGlow();
    rafId = requestAnimationFrame(render);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function onMouseLeave() {
    mouse.active = false;
  }

  function onVisibilityChange() {
    running = !document.hidden;
    if (running) {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(render);
    }
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave);
  window.addEventListener('resize', () => {
    resize();
    initSystems();
  });
  window.addEventListener('scroll', updateHeroCenter, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  resize();
  initSystems();
  glowPos = { ...heroCenter };
  document.body.classList.add('bg-ready');
  rafId = requestAnimationFrame(render);
})();
