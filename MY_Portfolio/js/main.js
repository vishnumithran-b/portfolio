/**
 * VISHNU MITHRAN B — PERSONAL PORTFOLIO
 * Main Interactive Logic
 */

let lenisInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initDynamicYear();
  initLenis();
  initScrollProgress();
  initNavigation();
  initHeroProfileTilt();
  initScrollReveals();
  initSkillsConstellation();
  initProjectsCDCases();
  initModals();
});

/* ==========================================================================
   1. DYNAMIC YEAR
   ========================================================================== */
function initDynamicYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ==========================================================================
   2. LENIS SMOOTH SCROLLING (Fluid Vertical Scroll Engine)
   ========================================================================== */
function initLenis() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof Lenis === 'undefined') {
    return;
  }

  try {
    lenisInstance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false, // Keep native touch scrolling on mobile
      autoRaf: false,
    });
    window.lenis = lenisInstance;

    function raf(time) {
      if (lenisInstance) {
        lenisInstance.raf(time);
      }
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Synchronize thin horizontal scroll progress bar directly with Lenis progress
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      lenisInstance.on('scroll', ({ progress }) => {
        progressBar.style.transform = `scaleX(${progress})`;
      });
    }
  } catch (err) {
    console.warn('Lenis initialization error, falling back to native scroll:', err);
  }
}

/* ==========================================================================
   3. SCROLL PROGRESS INDICATOR (Fallback when Lenis is inactive)
   ========================================================================== */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  if (!lenisInstance) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    }, { passive: true });
  }
}

/* ==========================================================================
   4. NAVIGATION, ANCHOR SMOOTH SCROLLING & ACTIVE SECTION HIGHLIGHT
   ========================================================================== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const navToggle = document.getElementById('nav-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const sections = document.querySelectorAll('section[id]');
  const navOffset = -74; // Account for fixed 64px navbar plus breathing room

  // Mobile menu toggle
  if (navToggle && mobileDrawer) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.innerHTML = isOpen ? `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ` : `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
    });
  }

  // Smooth scrolling for all internal anchors (Nav links, "EXPLORE MY WORK", "GET IN TOUCH", etc.)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      const targetEl = document.querySelector(hash);
      if (targetEl) {
        e.preventDefault();

        // Close mobile drawer if open
        if (mobileDrawer && mobileDrawer.classList.contains('open')) {
          mobileDrawer.classList.remove('open');
          if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        }

        // Lenis-driven smooth scroll
        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, {
            offset: navOffset,
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        } else {
          const targetTop = targetEl.getBoundingClientRect().top + window.scrollY + navOffset;
          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          });
        }

        if (history.pushState) {
          history.pushState(null, '', hash);
        }
      }
    });
  });

  // Handle direct hash on page load
  if (window.location.hash) {
    const initialTarget = document.querySelector(window.location.hash);
    if (initialTarget) {
      setTimeout(() => {
        if (lenisInstance) {
          lenisInstance.scrollTo(initialTarget, { offset: navOffset, immediate: true });
        } else {
          const targetTop = initialTarget.getBoundingClientRect().top + window.scrollY + navOffset;
          window.scrollTo({ top: targetTop });
        }
      }, 150);
    }
  }

  // Active section indicator via IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));
}

/* ==========================================================================
   5. INTERACTIVE PHYSICAL HANGING ID BADGE CHARM (Direct Dragging & Hangly Physics)
   ========================================================================== */
function initHeroProfileTilt() {
  const container = document.getElementById('hero-card-container');
  const rig = document.getElementById('badge-rig-assembly') || document.getElementById('badge-hanging-assembly');
  const connector = document.getElementById('badge-hardware-connector');
  const cardStack = document.getElementById('badge-cards-stack');
  const card = document.getElementById('profile-id-card');
  const ropeMain = document.getElementById('rope-path-main');
  const ropeShadow = document.getElementById('rope-path-shadow');
  const ropeStitchLeft = document.getElementById('rope-stitch-left');
  const ropeStitchRight = document.getElementById('rope-stitch-right');

  if (!container || !rig || !card || !ropeMain) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Read tilt limits from CSS variables
  function getTiltLimits() {
    const cs = getComputedStyle(document.documentElement);
    return {
      maxTiltX: parseFloat(cs.getPropertyValue('--badge-tilt-max-x')) || 8.5,
      maxTiltY: parseFloat(cs.getPropertyValue('--badge-tilt-max-y')) || 8.5
    };
  }

  let limits = getTiltLimits();

  // Physics State: Position (x, y) on rig; Rotations (angle, tiltX, tiltY) on cardStack
  let x = 0;              // horizontal displacement (px)
  let y = 0;              // vertical displacement (px)
  let vx = 0;             // horizontal velocity (px/s)
  let vy = 0;             // vertical velocity (px/s)
  let angle = 0;          // pendulum swing angle (degrees)
  let angularVel = 0;     // angular velocity (deg/s)

  let tiltX = 0;          // 3D perspective X (degrees)
  let tiltY = 0;          // 3D perspective Y (degrees)
  let tiltVelX = 0;       // deg/s
  let tiltVelY = 0;       // deg/s
  let targetTiltX = 0;
  let targetTiltY = 0;

  let isDragging = false;
  let pointerId = null;
  let initialPointerX = 0;
  let initialPointerY = 0;
  let initialCardX = 0;
  let initialCardY = 0;
  let pointerHistory = [];

  let animFrameId = null;
  let lastFrameTime = performance.now();
  let idleTime = 0;

  // Tuned Damped Harmonic Pendulum Constants
  const SPRING_K = 72.0;         // Linear restoring spring
  const DAMPING = 4.6;          // Linear damping
  const ANGULAR_K = 88.0;       // Angle alignment spring
  const ANGULAR_DAMPING = 5.6;  // Angular damping
  const SPRING_TILT = 38.0;     // 3D tilt spring
  const DAMPING_TILT = 5.8;     // 3D tilt damping

  // Generous Hero-section drag boundaries (never prematurely clamp)
  const MAX_DRAG_X = 220;
  const MIN_DRAG_Y = -90;
  const MAX_DRAG_Y = 220;

  function getRestRopeLength() {
    const mt = parseFloat(getComputedStyle(rig).marginTop);
    return isNaN(mt) ? 37 : mt + 1;
  }

  // Update dynamic flexible curved SVG rope path
  function updateRopePath(curX, curY, curAngle) {
    const containerRect = container.getBoundingClientRect();
    const anchorX = containerRect.width / 2;
    const anchorY = 0;

    const restH = getRestRopeLength();
    const crimpX = anchorX + curX;
    const crimpY = restH + curY + 1.5;

    const rad = (curAngle * Math.PI) / 180;
    const dist = Math.hypot(crimpX - anchorX, crimpY - anchorY);
    const sag = Math.max(10, dist * 0.38);

    const p0x = anchorX;
    const p0y = anchorY;
    const p1x = anchorX;
    const p1y = anchorY + sag;
    const p2x = crimpX - Math.sin(rad) * sag;
    const p2y = crimpY - Math.cos(rad) * sag;
    const p3x = crimpX;
    const p3y = crimpY;

    const dMain = `M ${p0x.toFixed(1)},${p0y.toFixed(1)} C ${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)} ${p3x.toFixed(1)},${p3y.toFixed(1)}`;
    ropeMain.setAttribute('d', dMain);
    if (ropeShadow) ropeShadow.setAttribute('d', dMain);

    // Left & right fabric stitches
    const stitchOffset = 9.5;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const leftP0x = p0x - stitchOffset;
    const leftP1x = p1x - stitchOffset;
    const leftP2x = p2x - stitchOffset * cosA;
    const leftP2y = p2y + stitchOffset * sinA;
    const leftP3x = p3x - stitchOffset * cosA;
    const leftP3y = p3y + stitchOffset * sinA;

    const rightP0x = p0x + stitchOffset;
    const rightP1x = p1x + stitchOffset;
    const rightP2x = p2x + stitchOffset * cosA;
    const rightP2y = p2y - stitchOffset * sinA;
    const rightP3x = p3x + stitchOffset * cosA;
    const rightP3y = p3y - stitchOffset * sinA;

    if (ropeStitchLeft) {
      ropeStitchLeft.setAttribute('d', `M ${leftP0x.toFixed(1)},${p0y.toFixed(1)} C ${leftP1x.toFixed(1)},${p1y.toFixed(1)} ${leftP2x.toFixed(1)},${leftP2y.toFixed(1)} ${leftP3x.toFixed(1)},${leftP3y.toFixed(1)}`);
    }
    if (ropeStitchRight) {
      ropeStitchRight.setAttribute('d', `M ${rightP0x.toFixed(1)},${p0y.toFixed(1)} C ${rightP1x.toFixed(1)},${p1y.toFixed(1)} ${rightP2x.toFixed(1)},${rightP2y.toFixed(1)} ${rightP3x.toFixed(1)},${rightP3y.toFixed(1)}`);
    }
  }

  // Render separate position and rotation transforms
  function renderBadge() {
    // 1. Position transform on outer rig
    rig.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

    // 2. Rotation and 3D tilts on cards stack
    if (cardStack) {
      cardStack.style.transform = `rotate(${angle.toFixed(2)}deg) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
    }

    // 3. Subtle tangent alignment on connector
    if (connector) {
      connector.style.transform = `rotate(${(angle * 0.7).toFixed(2)}deg)`;
    }

    // 4. Update rope curve
    updateRopePath(x, y, angle);
  }

  // Direct Cursor Tracking Pointer Handlers
  function onPointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (isDragging) return;

    isDragging = true;
    pointerId = e.pointerId;
    rig.classList.add('is-dragging');
    try {
      rig.setPointerCapture(e.pointerId);
    } catch (_) {}

    initialPointerX = e.clientX;
    initialPointerY = e.clientY;
    initialCardX = x;
    initialCardY = y;

    vx = 0;
    vy = 0;
    angularVel = 0;
    targetTiltX = 0;
    targetTiltY = 0;
    pointerHistory = [{ x: e.clientX, y: e.clientY, time: performance.now() }];

    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) {
      handleHoverTilt(e);
      return;
    }
    if (e.pointerId !== pointerId) return;

    const dx = e.clientX - initialPointerX;
    const dy = e.clientY - initialPointerY;

    // Direct cursor tracking:
    // newX = initialCardX + (currentPointerX - initialPointerX)
    // newY = initialCardY + (currentPointerY - initialPointerY)
    let newX = initialCardX + dx;
    let newY = initialCardY + dy;

    // Apply boundaries with soft outer resistance
    if (newX < -MAX_DRAG_X) {
      newX = -MAX_DRAG_X - Math.pow(Math.abs(newX + MAX_DRAG_X), 0.75);
    } else if (newX > MAX_DRAG_X) {
      newX = MAX_DRAG_X + Math.pow(Math.abs(newX - MAX_DRAG_X), 0.75);
    }

    if (newY < MIN_DRAG_Y) {
      newY = MIN_DRAG_Y - Math.pow(Math.abs(newY - MIN_DRAG_Y), 0.75);
    } else if (newY > MAX_DRAG_Y) {
      newY = MAX_DRAG_Y + Math.pow(Math.abs(newY - MAX_DRAG_Y), 0.75);
    }

    x = newX;
    y = newY;

    // Cord angle naturally tilts in SAME direction as displacement
    const restH = getRestRopeLength();
    angle = Math.atan2(x, restH + Math.max(0, y) + 50) * (180 / Math.PI) * 0.45;

    // Subtle 3D tilt in direction of movement
    tiltX = Math.max(-6, Math.min(6, -dy * 0.03));
    tiltY = Math.max(-6, Math.min(6, dx * 0.03));

    // Record velocity history for natural release momentum
    const now = performance.now();
    pointerHistory.push({ x: e.clientX, y: e.clientY, time: now });
    while (pointerHistory.length > 5) pointerHistory.shift();

    idleTime = 0;

    // Render immediately on every pointermove
    renderBadge();

    e.preventDefault();
  }

  function onPointerUp(e) {
    if (!isDragging || (pointerId !== null && e.pointerId !== pointerId)) return;

    isDragging = false;
    rig.classList.remove('is-dragging');
    try {
      if (pointerId !== null && rig.hasPointerCapture(pointerId)) {
        rig.releasePointerCapture(pointerId);
      }
    } catch (_) {}
    pointerId = null;

    // Calculate release velocity from recent pointer movements
    const now = performance.now();
    const recent = pointerHistory.filter(p => now - p.time <= 120);
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = Math.max(0.015, (last.time - first.time) / 1000);
      vx = (last.x - first.x) / dt;
      vy = (last.y - first.y) / dt;
    } else {
      vx = 0;
      vy = 0;
    }

    vx = Math.max(-800, Math.min(800, vx));
    vy = Math.max(-600, Math.min(600, vy));

    // Angular velocity consistent with release velocity (SAME direction)
    angularVel = (vx / 100) * 14;
  }

  function onPointerCancel(e) {
    onPointerUp(e);
  }

  // Hover 3D tilt relative to card center when resting
  function handleHoverTilt(e) {
    const cardRect = card.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;
    const halfW = cardRect.width / 2;
    const halfH = cardRect.height / 2;

    const deltaX = e.clientX - cardCenterX;
    const deltaY = e.clientY - cardCenterY;

    const isInsideHoverZone =
      Math.abs(deltaX) <= halfW + 120 &&
      Math.abs(deltaY) <= halfH + 120;

    if (isInsideHoverZone) {
      const normX = Math.max(-1.25, Math.min(1.25, deltaX / halfW));
      const normY = Math.max(-1.25, Math.min(1.25, deltaY / halfH));

      // Upper area -> rotateX positive; Left area -> rotateY negative
      targetTiltX = -normY * limits.maxTiltX;
      targetTiltY = normX * limits.maxTiltY;

      if (e.pointerType === 'mouse') {
        const px = Math.round(((normX + 1) / 2) * 100);
        const py = Math.round(((normY + 1) / 2) * 100);
        card.style.setProperty('--mouse-x', `${Math.max(0, Math.min(100, px))}%`);
        card.style.setProperty('--mouse-y', `${Math.max(0, Math.min(100, py))}%`);
      }
    } else {
      targetTiltX = 0;
      targetTiltY = 0;
    }
  }

  document.documentElement.addEventListener('mouseleave', () => {
    targetTiltX = 0;
    targetTiltY = 0;
  });

  window.addEventListener('blur', () => {
    if (isDragging) onPointerUp({ pointerId });
    targetTiltX = 0;
    targetTiltY = 0;
  });

  window.addEventListener('resize', () => {
    limits = getTiltLimits();
    updateRopePath(x, y, angle);
  });

  // Attach pointer events to both rig and card
  rig.addEventListener('pointerdown', onPointerDown);
  card.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  rig.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp);
  rig.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerCancel);
  rig.addEventListener('pointercancel', onPointerCancel);

  // Gentle entrance swing on page load / refresh
  setTimeout(() => {
    if (prefersReducedMotion) return;
    if (!isDragging && Math.abs(x) < 2) {
      x = -16;
      angle = -3.8;
      vx = 40;
      angularVel = 14;
    }
  }, 400);

  // Physics animation loop
  function physicsLoop(now) {
    const dt = Math.min(0.033, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    const restH = getRestRopeLength();

    if (!isDragging) {
      if (prefersReducedMotion) {
        x += (0 - x) * 0.25;
        y += (0 - y) * 0.25;
        angle += (0 - angle) * 0.25;
        tiltX += (0 - tiltX) * 0.25;
        tiltY += (0 - tiltY) * 0.25;
        vx = 0;
        vy = 0;
        angularVel = 0;
      } else {
        // 2D Damped harmonic pendulum simulation
        const ax = -SPRING_K * x - DAMPING * vx;
        const targetY = (x * x) / (2 * 180);
        const ay = -SPRING_K * (y - targetY) - DAMPING * vy;

        vx += ax * dt;
        vy += ay * dt;
        x += vx * dt;
        y += vy * dt;

        // Angle dynamically aligns with rope displacement + inertial lag
        const targetAngle = Math.atan2(x, restH + Math.max(0, y) + 50) * (180 / Math.PI) * 0.65;
        const torque = -ANGULAR_K * (angle - targetAngle) - ANGULAR_DAMPING * angularVel;

        angularVel += torque * dt;
        angle += angularVel * dt;

        // Spring-damper for 3D tilts
        const diffX = tiltX - targetTiltX;
        tiltVelX += (-SPRING_TILT * diffX - DAMPING_TILT * tiltVelX) * dt;
        tiltX += tiltVelX * dt;

        const diffY = tiltY - targetTiltY;
        tiltVelY += (-SPRING_TILT * diffY - DAMPING_TILT * tiltVelY) * dt;
        tiltY += tiltVelY * dt;

        // Subtle organic idle breathing micro-sway when completely settled
        const motionEnergy = Math.hypot(vx, vy) + Math.abs(angularVel) + Math.abs(x) + Math.abs(angle);
        if (motionEnergy < 0.25 && targetTiltX === 0 && targetTiltY === 0) {
          idleTime += dt;
          const idleSway = Math.sin(idleTime * 1.5) * 0.35;
          const idleX = Math.sin(idleTime * 1.5) * 0.6;
          x = idleX;
          y = Math.abs(Math.cos(idleTime * 3.0)) * 0.2;
          angle = idleSway;
        } else {
          idleTime = 0;
        }
      }

      renderBadge();
    }

    animFrameId = requestAnimationFrame(physicsLoop);
  }

  // Handle tab visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      animFrameId = null;
    } else {
      lastFrameTime = performance.now();
      animFrameId = requestAnimationFrame(physicsLoop);
    }
  });

  // Initial draw and start physics loop
  renderBadge();
  animFrameId = requestAnimationFrame(physicsLoop);
}

/* ==========================================================================
   6. SUBTLE SCROLL-TRIGGERED REVEALS (IntersectionObserver One-Time Reveal)
   ========================================================================== */
function initScrollReveals() {
  document.documentElement.classList.add('js-loaded');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if (!revealElements.length) return;

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12,
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Unobserve to trigger once and avoid annoying re-animation during scroll
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   6. SKILLS CONSTELLATION (Java, Python, C++)
   ========================================================================== */
function initSkillsConstellation() {
  const nodes = document.querySelectorAll('.constellation-node');
  const infoCard = document.getElementById('skills-info-card');
  const lines = document.querySelectorAll('.constellation-line');
  if (!nodes.length || !infoCard) return;

  // Accurate Verified Language Data
  const skillsData = {
    python: {
      name: 'Python',
      role: 'Artificial Intelligence & Data Science Foundation',
      description: 'Used extensively for developing AI pipelines, machine learning experiments, and generative AI integrations. Applied in data manipulation, exploratory analysis, and building intelligent features for academic tools.',
      focusTitle: 'Verified Application Areas',
      tags: ['Data Analysis', 'Machine Learning', 'Generative AI APIs', 'NumPy & Pandas', 'AI Prototyping']
    },
    java: {
      name: 'Java',
      role: 'Object-Oriented Programming & Systems Design',
      description: 'Primary language for mastering core Data Structures & Algorithms (DSA), robust object-oriented architecture, and backend software engineering principles with strong typing and modular designs.',
      focusTitle: 'Verified Application Areas',
      tags: ['Data Structures & Algorithms', 'Object-Oriented Architecture', 'Design Patterns', 'Enterprise Logic', 'Memory Efficiency']
    },
    cpp: {
      name: 'C++',
      role: 'Computational Thinking & High-Performance Logic',
      description: 'Strengthens low-level computational understanding, memory management, and high-performance algorithmic execution. Key tool for competitive problem solving and academic computer science rigor.',
      focusTitle: 'Verified Application Areas',
      tags: ['Computational Thinking', 'Algorithmic Problem Solving', 'Pointers & References', 'STL Structures', 'Time Complexity']
    }
  };

  function selectLanguage(langKey) {
    // Update Node classes
    nodes.forEach(node => {
      const isSelected = node.dataset.lang === langKey;
      node.classList.toggle('active', isSelected);
      node.setAttribute('aria-selected', isSelected);
    });

    // Update connecting lines highlight
    lines.forEach(line => {
      const connects = line.dataset.connects || '';
      if (connects.includes(langKey)) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });

    // Update info panel with smooth fade
    const data = skillsData[langKey];
    if (!data) return;

    infoCard.style.opacity = '0';
    infoCard.style.transform = 'translateY(8px)';
    infoCard.style.transition = 'all 0.2s ease-out';

    setTimeout(() => {
      infoCard.innerHTML = `
        <div>
          <span class="skill-card-badge">${data.role}</span>
          <h3 class="skill-card-name">${data.name}</h3>
          <p class="skill-card-desc">${data.description}</p>
        </div>
        <div>
          <div class="skill-card-focus-title">${data.focusTitle}</div>
          <div class="skill-card-tags">
            ${data.tags.map(tag => `<span class="skill-tag">${tag}</span>`).join('')}
          </div>
        </div>
      `;
      infoCard.style.opacity = '1';
      infoCard.style.transform = 'translateY(0)';
    }, 200);
  }

  // Click & Touch events
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      selectLanguage(node.dataset.lang);
    });

    // Keyboard support (Enter & Space)
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectLanguage(node.dataset.lang);
      }
    });
  });

  // Default selection
  selectLanguage('python');
}

/* ==========================================================================
   7. CD ALBUM SHOWCASE & PROJECT DETAILS DRAWER
   ========================================================================== */
function initProjectsCDCases() {
  const cdCases = document.querySelectorAll('.cd-jewel-case-wrapper');
  const drawer = document.getElementById('project-drawer');
  const backdrop = document.getElementById('project-drawer-backdrop');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerContent = document.getElementById('drawer-dynamic-content');
  if (!cdCases.length || !drawer) return;

  // Verified Real Project Data
  const projectsData = {
    'studyease-ai': {
      name: 'StudyEase AI',
      category: 'AI-Augmented Cognitive Architecture',
      problem: 'Higher education and engineering students face severe academic alienation from dense, archaic textbook materials. Generic chatbots produce flat text dumps that lack pedagogical grounding and structured learning workflows.',
      overview: 'An intelligent multi-tier cognitive learning platform engineered to eliminate daily academic friction. Features an end-to-end 8-stage learning workflow from multi-format document ingestion down to adaptive diagnostic quizzes.',
      features: [
        'Multi-format lecture slide and textbook scan ingestion',
        'Topic taxonomy breakdown with estimated reading & mastery times',
        'Three-level conceptual deconstruction (Analogies to formal math)',
        'Three-dimensional spatial active-recall flashcards',
        'Adaptive diagnostic quizzes with weak-area remediation roadmap'
      ],
      tech: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Google Gemini AI API', 'Lucide React'],
      github: 'https://github.com/vishnumithran-b/StudyeasyAI',
      liveDemo: null
    },
    'openjudge-ai': {
      name: 'OpenJudge AI',
      category: 'Hackathon Judging & Evaluation Suite',
      problem: 'Hackathons and innovation competitions frequently suffer from subjective, delayed, and opaque evaluation processes where teams receive no granular scoring rubric or transparent feedback.',
      overview: 'A structured evaluation platform built specifically for innovation competitions. Organizers and judges can create transparent rubrics, score criteria (originality, technical feasibility, UI/UX, business impact), and publish real-time verified leaderboards.',
      features: [
        'Transparent criterion-based judging workflows',
        'Multi-judge scoring aggregation and outlier dampening',
        'Real-time innovation competition leaderboard',
        'Detailed scorecard breakdown for student teams',
        'Modern 3D interactive interface elements'
      ],
      tech: ['React', 'TypeScript', 'Vite', 'Three.js / R3F', 'Tailwind CSS', 'Framer Motion'],
      github: 'https://github.com/vishnumithran-b/Openjudge_AI',
      liveDemo: null
    },
    'auraslot': {
      name: 'AuraSlot',
      category: 'Interactive Appointment Booking Platform',
      problem: 'Small businesses and service providers require appointment scheduling tools without bloated subscriptions or complex backend setups that compromise customer data.',
      overview: 'A complete appointment booking web application featuring a sleek "Neon Night Glass" aesthetic with 100% client-side persistence and a full admin dashboard for schedule management.',
      features: [
        'Multi-step consultation booking flow with service picker',
        'Smart date logic locking out past dates and managing active slots',
        'Admin dashboard with status workflows (Pending, Confirmed, Completed)',
        'Local state persistence preserving all client interactions',
        'Toast notifications and responsive mobile-first glassmorphism layout'
      ],
      tech: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Lucide React', 'LocalStorage'],
      github: 'https://github.com/vishnumithran-b/AuraSlot',
      liveDemo: null
    },
    'internship-finder': {
      name: 'Internship-FINDER',
      category: 'Global Internship Discovery Platform',
      problem: 'College students struggle to identify and track authentic international internship openings spread across disparate regional portals with varying criteria and deadlines.',
      overview: 'Global Internship Finder is a dedicated web application created to help engineering and science students explore vetted internship opportunities across different countries with a clean, responsive search experience.',
      features: [
        'Search and filter internship opportunities across global destinations',
        'Clear criteria, eligibility, and deadline breakdowns',
        'Mobile-friendly layout optimized for fast discovery',
        'Structured categorization by industry, domain, and qualification'
      ],
      tech: ['HTML5', 'CSS3', 'TypeScript', 'Vite', 'Tailwind CSS'],
      github: 'https://github.com/vishnumithran-b/Internship-FINDER',
      liveDemo: null
    },
    'interest-explorer': {
      name: 'Interest-Explorer',
      category: 'Compound Interest Financial Modeling',
      problem: 'Financial growth through compound interest is hard to conceptualize intuitively without dynamic interactive visualization of principle, rate, and compounding intervals over time.',
      overview: 'An interactive financial web application that helps students and young adults clearly understand compounding mechanics through instant slider-driven calculations and dynamic growth trajectory curves.',
      features: [
        'Interactive real-time slider controls for starting principal and interest rate',
        'Selectable multi-year investment horizons with instant output',
        'Dynamic interactive growth chart visualizing principal vs. interest earned',
        'Clean, accessible and beginner-friendly financial education UI'
      ],
      tech: ['HTML5', 'CSS3', 'JavaScript', 'Chart.js'],
      github: 'https://github.com/vishnumithran-b/Interest-Explorer',
      liveDemo: null
    }
  };

  let lastActiveElement = null;

  function openProjectDrawer(projectId) {
    const project = projectsData[projectId];
    if (!project) return;

    lastActiveElement = document.activeElement;

    // Render Drawer Content
    drawerContent.innerHTML = `
      <div>
        <span class="drawer-tag">${project.category}</span>
        <h2 class="drawer-title" id="drawer-project-title" style="margin-top:0.5rem;">${project.name}</h2>
        <p class="drawer-summary">${project.overview}</p>
      </div>

      <div>
        <div class="drawer-section-title">The Challenge & Problem Addressed</div>
        <div class="drawer-problem-box">${project.problem}</div>
      </div>

      <div>
        <div class="drawer-section-title">Key Verified Features</div>
        <ul class="drawer-features-list">
          ${project.features.map(feat => `
            <li class="drawer-feature-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${feat}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div>
        <div class="drawer-section-title">Technologies Used</div>
        <div class="drawer-tech-tags">
          ${project.tech.map(t => `<span class="drawer-tech-tag">${t}</span>`).join('')}
        </div>
      </div>
    `;

    // Render footer buttons
    const drawerFooter = document.getElementById('drawer-footer-actions');
    if (drawerFooter) {
      drawerFooter.innerHTML = `
        <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex:1;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GITHUB REPOSITORY ↗
        </a>
        ${project.liveDemo ? `
          <a href="${project.liveDemo}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
            LIVE DEMO ↗
          </a>
        ` : ''}
      `;
    }

    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    setTimeout(() => {
      drawerCloseBtn.focus();
    }, 100);
  }

  function closeProjectDrawer() {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';

    if (lastActiveElement) {
      lastActiveElement.focus();
    }
  }

  // CD case click triggers
  cdCases.forEach(box => {
    box.addEventListener('click', () => {
      const id = box.dataset.project;
      openProjectDrawer(id);
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProjectDrawer(box.dataset.project);
      }
    });
  });

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeProjectDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeProjectDrawer);
  }

  // Global Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeProjectDrawer();
    }
  });
}

/* ==========================================================================
   8. MODALS (Resume & Certificates Native Dialogs)
   ========================================================================== */
function initModals() {
  const resumeModal = document.getElementById('resume-modal');
  const certModal = document.getElementById('cert-modal');
  const viewResumeBtn = document.getElementById('btn-view-resume');
  const closeResumeBtn = document.getElementById('close-resume-modal');
  const closeCertBtn = document.getElementById('close-cert-modal');
  const certIframe = document.getElementById('cert-iframe');
  const certModalTitle = document.getElementById('cert-modal-title');

  // Resume Modal
  if (viewResumeBtn && resumeModal) {
    viewResumeBtn.addEventListener('click', () => {
      if (typeof resumeModal.showModal === 'function') {
        resumeModal.showModal();
      } else {
        resumeModal.setAttribute('open', '');
      }
    });
  }

  if (closeResumeBtn && resumeModal) {
    closeResumeBtn.addEventListener('click', () => {
      resumeModal.close();
    });
  }

  // Close when clicking modal backdrop
  [resumeModal, certModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        modal.close();
      }
    });
  });

  // Certificate links open direct PDF in new tab natively.
  // Preserve modal close cleanup if cert-modal exists.
  if (closeCertBtn && certModal) {
    closeCertBtn.addEventListener('click', () => {
      certModal.close();
      if (certIframe) certIframe.src = '';
    });
  }
}
