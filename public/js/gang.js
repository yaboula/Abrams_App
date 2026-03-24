/* ============================================
   GANG MATRIX — HOLOGRAPHIC TERMINAL ENGINE
   Abrams RP — Cybertech / Valorant UI
   ============================================ */

(function () {
  'use strict';

  // ══════════════════════════════════════
  // STATE
  // ══════════════════════════════════════
  const STATE = {
    nodes: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
    currentNode: null,
    modalData: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} },
    completedCount: 0
  };

  const NODE_CONFIG = {
    1: { title: 'OPERADOR OOC', template: buildModal1 },
    2: { title: 'IDENTIDAD & LORE IC', template: buildModal2 },
    3: { title: 'LOGÍSTICA & ECONOMÍA', template: buildModal3 },
    4: { title: 'MAPA TÁCTICO', template: buildModal4 },
    5: { title: 'ESCUADRA / ROSTER', template: buildModal5 },
    6: { title: 'DIPLOMACIA & NORMAS', template: buildModal6 }
  };

  // ══════════════════════════════════════
  // DOM REFS
  // ══════════════════════════════════════
  const $ = id => document.getElementById(id);
  const $overlay = $('modalOverlay');
  const $modalTitle = $('modalTitle');
  const $modalBody = $('modalBody');
  const $modalClose = $('modalClose');
  const $btnSave = $('btnSave');
  const $btnTransmit = $('btnTransmit');
  const $headerCounter = $('headerCounter');
  const $successOverlay = $('successOverlay');
  const $holoCore = $('holoCore');
  const $holoStatus = $('holoStatus');
  const $holoHub = $('holoHub');
  const $beamLayer = $('beamLayer');
  const $climaxContainer = $('climaxContainer');
  const $scene = $('scene');
  const $canvas = $('particleCanvas');

  // ══════════════════════════════════════
  // INIT
  // ══════════════════════════════════════
  function init() {
    positionOrbitalPlates();
    initDataCables();
    initParticles();
    initLevitation();
    initTilt();
    bindPlateClicks();
    bindModal();
    animateEntrance();
  }

  // ══════════════════════════════════════
  // ORBITAL PLATE POSITIONING
  // ══════════════════════════════════════
  function positionOrbitalPlates() {
    const plates = document.querySelectorAll('.orbital-plate');
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = vw / 2;
    const cy = vh / 2;

    // Wide orbit — 3 plates on the left, 3 on the right
    const radiusX = Math.min(vw * 0.42, 650);
    const radiusY = Math.min(vh * 0.35, 320);
    
    // Angles (0 is bottom, 90 is right, -90 is left, +/-180 is top)
    // Left side: -130 (Top-L), -90 (Mid-L), -50 (Bot-L)
    // Right side: 130 (Top-R), 90 (Mid-R), 50 (Bot-R)
    const angles = [-130, -90, -50, 50, 90, 130];

    plates.forEach((plate, i) => {
      const angleDeg = angles[i];
      const angleRad = (angleDeg * Math.PI) / 180;

      const x = cx + radiusX * Math.sin(angleRad) - plate.offsetWidth / 2;
      const y = cy + radiusY * Math.cos(angleRad) - plate.offsetHeight / 2;

      plate.style.left = `${x}px`;
      plate.style.top = `${y}px`;
      plate._baseX = x;
      plate._baseY = y;
      plate._angle = angleDeg;
    });

    // Reposition on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        positionOrbitalPlates();
      }, 100);
    });
  }

  // ══════════════════════════════════════
  // DATA CABLES (Visual connections)
  // ══════════════════════════════════════
  let dataCablesInitialized = false;

  function initDataCables() {
    const $cableLayer = document.getElementById('cableLayer');
    if (!$cableLayer) return;
    $cableLayer.innerHTML = '<defs><filter id="cableGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    $cableLayer.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);

    document.querySelectorAll('.orbital-plate').forEach(plate => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.classList.add('data-cable');
      line.id = `cable-${plate.dataset.node}`;
      if (STATE.nodes[parseInt(plate.dataset.node)]) {
        line.classList.add('active');
      }
      $cableLayer.appendChild(line);
    });
    
    dataCablesInitialized = true;
    updateDataCables();
  }

  function updateDataCables() {
    if (!dataCablesInitialized) return;
    
    // Update viewBox on resize mapping
    const $cableLayer = document.getElementById('cableLayer');
    if ($cableLayer) {
      $cableLayer.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    }

    const $innerCore = document.querySelector('.holo-inner-core');
    let hubCx, hubCy;

    if ($innerCore) {
      const coreRect = $innerCore.getBoundingClientRect();
      hubCx = coreRect.left + coreRect.width / 2;
      hubCy = coreRect.top + coreRect.height / 2;
    } else {
      const hubRect = $holoHub.getBoundingClientRect();
      hubCx = hubRect.left + hubRect.width / 2;
      hubCy = hubRect.top + hubRect.height / 2;
    }

    document.querySelectorAll('.orbital-plate').forEach(plate => {
      const rect = plate.getBoundingClientRect();
      const px = rect.left + rect.width / 2;
      const py = rect.top;

      const line = document.getElementById(`cable-${plate.dataset.node}`);
      if (line) {
        line.setAttribute('x1', px);
        line.setAttribute('y1', py);
        line.setAttribute('x2', hubCx);
        line.setAttribute('y2', hubCy);
      }
    });
  }

  function activateCable(nodeId) {
    const cable = document.getElementById(`cable-${nodeId}`);
    if (cable) cable.classList.add('active');
  }

  // ══════════════════════════════════════
  // PARTICLE SYSTEM (Floating Embers)
  // ══════════════════════════════════════
  function initParticles() {
    const ctx = $canvas.getContext('2d');
    let w, h;
    const particles = [];
    const PARTICLE_COUNT = 40;

    function resize() {
      w = $canvas.width = window.innerWidth;
      h = $canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.4 + 0.15), // float upward
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        flicker: Math.random() * Math.PI * 2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.flicker += 0.02;

        // Wrap around
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.flicker));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 57, 70, ${alpha})`;
        ctx.fill();

        // Subtle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 57, 70, ${alpha * 0.15})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ══════════════════════════════════════
  // LEVITATION ANIMATION
  // ══════════════════════════════════════
  function initLevitation() {
    if (typeof gsap === 'undefined') return;

    document.querySelectorAll('.orbital-plate').forEach((plate, i) => {
      gsap.to(plate, {
        y: '+=8',
        duration: 2.5 + i * 0.3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.15
      });
    });

    // Make cables follow plates dynamically
    gsap.ticker.add(() => {
      updateDataCables();
    });
  }

  // ══════════════════════════════════════
  // 3D TILT ON HOVER
  // ══════════════════════════════════════
  function initTilt() {
    document.querySelectorAll('.orbital-plate').forEach(plate => {
      plate.addEventListener('mousemove', (e) => {
        const rect = plate.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        if (typeof gsap !== 'undefined') {
          gsap.to(plate, {
            rotateY: px * 18,
            rotateX: -py * 12,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });

      plate.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(plate, {
            rotateY: 0, rotateX: 0,
            duration: 0.5, ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });
    });
  }

  // ══════════════════════════════════════
  // PLATE CLICKS + MODAL
  // ══════════════════════════════════════
  function bindPlateClicks() {
    document.querySelectorAll('.orbital-plate').forEach(plate => {
      plate.addEventListener('click', () => {
        const nodeId = parseInt(plate.dataset.node);
        openModal(nodeId);
      });
    });
  }

  function bindModal() {
    $modalClose.addEventListener('click', closeModal);
    $overlay.addEventListener('click', (e) => {
      if (e.target === $overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $overlay.classList.contains('active')) closeModal();
    });
    $btnSave.addEventListener('click', handleSave);
    $btnTransmit.addEventListener('click', handleTransmit);
  }

  function openModal(nodeId) {
    STATE.currentNode = nodeId;
    const config = NODE_CONFIG[nodeId];
    $modalTitle.textContent = config.title;
    $modalBody.innerHTML = '';
    $modalBody.appendChild(config.template(nodeId));

    requestAnimationFrame(() => {
      $overlay.classList.add('active');
    });
  }

  function closeModal() {
    $overlay.classList.remove('active');
    STATE.currentNode = null;
  }

  // ══════════════════════════════════════
  // SAVE HANDLER
  // ══════════════════════════════════════
  function handleSave() {
    const nodeId = STATE.currentNode;
    if (!nodeId) return;
    if (!validateModal(nodeId)) return;
    collectModalData(nodeId);

    STATE.nodes[nodeId] = true;
    STATE.completedCount = Object.values(STATE.nodes).filter(Boolean).length;

    updatePlateUI(nodeId);
    updateHeader();
    activateCable(nodeId);
    fireEnergyBeam(nodeId);
    evolveHologram();
    closeModal();

    if (STATE.completedCount === 6) {
      setTimeout(triggerClimax, 1200);
    }
  }

  // ══════════════════════════════════════
  // PLATE UI UPDATE
  // ══════════════════════════════════════
  function updatePlateUI(nodeId) {
    const plate = $(`node-${nodeId}`);
    const status = $(`status-${nodeId}`);
    plate.classList.add('verified');
    status.querySelector('.ps-icon').textContent = '✓';
    status.querySelector('.ps-text').textContent = 'VERIFICADO';

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(plate, { scale: 0.95 }, {
        scale: 1, duration: 0.5, ease: 'back.out(1.7)'
      });
    }
  }

  function updateHeader() {
    $headerCounter.textContent = `${STATE.completedCount} / 6`;
    const progress = (STATE.completedCount / 6) * 100;
    
    const $hudProgressBar = document.getElementById('hudProgressBar');
    if ($hudProgressBar) {
      $hudProgressBar.style.width = `${progress}%`;
    }
    
    const $holoStatusFill = document.getElementById('holoStatusFill');
    if ($holoStatusFill) {
      $holoStatusFill.style.width = `${progress}%`;
    }
  }

  // ══════════════════════════════════════
  // ENERGY BEAM
  // ══════════════════════════════════════
  function fireEnergyBeam(nodeId) {
    const plate = $(`node-${nodeId}`);
    const plateRect = plate.getBoundingClientRect();
    
    const $innerCore = document.querySelector('.holo-inner-core');
    const targetRect = $innerCore ? $innerCore.getBoundingClientRect() : $holoHub.getBoundingClientRect();

    const x1 = plateRect.left + plateRect.width / 2;
    const y1 = plateRect.top; // Update beam start to match cable (top center)
    const x2 = targetRect.left + targetRect.width / 2;
    const y2 = targetRect.top + targetRect.height / 2;

    // Scale to viewBox
    const svgRect = $beamLayer.getBoundingClientRect();
    const sx1 = (x1 / svgRect.width) * 1920;
    const sy1 = (y1 / svgRect.height) * 1080;
    const sx2 = (x2 / svgRect.width) * 1920;
    const sy2 = (y2 / svgRect.height) * 1080;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', sx1);
    line.setAttribute('y1', sy1);
    line.setAttribute('x2', sx2);
    line.setAttribute('y2', sy2);
    line.classList.add('energy-beam');
    $beamLayer.appendChild(line);

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(line,
        { strokeDashoffset: 800 },
        {
          strokeDashoffset: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            // Flash hologram core
            gsap.fromTo($holoCore.querySelector('.holo-inner-core'),
              { scale: 1.5, boxShadow: '0 0 60px #E63946, 0 0 120px rgba(230,57,70,0.6)' },
              { scale: 1, boxShadow: '0 0 20px #E63946, 0 0 40px rgba(230,57,70,0.3)', duration: 0.5, ease: 'power2.out' }
            );
            // Fade beam
            gsap.to(line, { opacity: 0, duration: 0.8, delay: 0.3, onComplete: () => line.remove() });
          }
        }
      );
    }
  }

  // ══════════════════════════════════════
  // HOLOGRAM EVOLUTION
  // ══════════════════════════════════════
  function evolveHologram() {
    const count = STATE.completedCount;

    // Power up classes
    $holoCore.className = 'holo-core';
    if (count >= 1) $holoCore.classList.add(`power-${Math.min(count, 5)}`);

    // Status text
    const statusTexts = {
      0: '[ ESTADO: DOSSIER EN BLANCO ]',
      1: '[ ESTADO: RECOPILANDO DATOS ]',
      2: '[ ESTADO: DATOS PARCIALES ]',
      3: '[ ESTADO: ANALIZANDO ECONOMÍA ]',
      4: '[ ESTADO: MAPEANDO TERRITORIO ]',
      5: '[ ESTADO: ESCUADRA REGISTRADA ]',
      6: '[ ESTADO: DOSSIER COMPLETO ]'
    };
    $holoStatus.textContent = statusTexts[count] || statusTexts[0];

    // Activate evolution overlays
    if (count >= 3) $('holoEvoGrid').classList.add('active');
    if (count >= 5) {
      const nodesContainer = $('holoEvoNodes');
      nodesContainer.classList.add('active');
      // Add orbiting light dots
      nodesContainer.innerHTML = '';
      for (let i = 0; i < Math.min(count, 6); i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
          position: absolute; width: 4px; height: 4px;
          background: #E63946; border-radius: 50%;
          box-shadow: 0 0 8px #E63946;
          top: 50%; left: 50%;
          animation: orbitDot ${3 + i * 0.5}s linear infinite;
          transform-origin: ${30 + i * 8}px 0;
        `;
        nodesContainer.appendChild(dot);
      }
    }

    // Speed up rotation
    if (typeof gsap !== 'undefined' && count >= 3) {
      const rings = $holoCore.querySelectorAll('.holo-ring');
      rings.forEach(ring => {
        ring.style.animationDuration = `${Math.max(3, 8 - count)}s`;
      });
    }
  }

  // ══════════════════════════════════════
  // CLIMAX SEQUENCE
  // ══════════════════════════════════════
  function triggerClimax() {
    if (typeof gsap === 'undefined') {
      $climaxContainer.classList.add('active');
      $btnTransmit.disabled = false;
      return;
    }

    const tl = gsap.timeline();

    // 1. All plates pulse
    tl.to('.orbital-plate.verified', {
      boxShadow: '0 0 40px rgba(230,57,70,0.4), 0 0 80px rgba(230,57,70,0.2)',
      duration: 0.3,
      stagger: 0.08,
      yoyo: true,
      repeat: 2
    });

    // 2. Hologram overload flash
    tl.to($holoCore, {
      scale: 1.5,
      duration: 0.3,
      ease: 'power2.in'
    }, '+=0.2');

    tl.to($holoCore, {
      opacity: 0,
      scale: 2,
      duration: 0.4,
      ease: 'power2.out'
    });

    // 3. Hide hologram + plates
    tl.to([$holoHub, '.orbital-plate'], {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    });

    // 4. Materialize TRANSMIT button
    tl.add(() => {
      $climaxContainer.classList.add('active');
      $btnTransmit.disabled = false;
      $('hudStatusText').textContent = 'DOSSIER COMPLETO';
    });

    tl.fromTo($btnTransmit,
      { opacity: 0, scale: 0.5, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
    );
  }

  // ══════════════════════════════════════
  // ENTRANCE ANIMATION
  // ══════════════════════════════════════
  function animateEntrance() {
    if (typeof gsap === 'undefined') return;

    gsap.fromTo('.hud-header',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'all' }
    );

    gsap.fromTo('.holo-hub',
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power3.out', delay: 0.1, clearProps: 'opacity,scale' }
    );

    gsap.fromTo('.orbital-plate',
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1, scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.4)',
        delay: 0.3,
        clearProps: 'opacity,scale',
        onComplete: () => {
          document.querySelectorAll('.orbital-plate').forEach(p => {
            p.style.opacity = '1';
          });
        }
      }
    );
  }

  // ══════════════════════════════════════
  // MODAL TEMPLATES (Preserved)
  // ══════════════════════════════════════

  function buildModal1() {
    const frag = document.createElement('div');
    frag.innerHTML = `
      <div class="modal-section">
        <div class="modal-section-label">DATOS FUERA DE PERSONAJE</div>
        <div class="gang-form-grid">
          <div class="gang-input-group">
            <label class="gang-label">Nombre / Alias OOC</label>
            <input class="gang-input" type="text" id="m1-name" placeholder="Tu nombre real o alias" required>
          </div>
          <div class="gang-input-group">
            <label class="gang-label">Edad OOC</label>
            <input class="gang-input" type="number" id="m1-age" placeholder="18+" min="1" max="99" required>
          </div>
          <div class="gang-input-group">
            <label class="gang-label">Discord Tag</label>
            <input class="gang-input" type="text" id="m1-discord" placeholder="usuario#0000" required>
          </div>
        </div>
        <div class="gang-input-group">
          <label class="gang-label">Experiencia en Roleplay</label>
          <textarea class="gang-textarea" id="m1-experience" placeholder="Describe tu experiencia previa en servidores de RP..." required></textarea>
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-label">HISTORIAL DE SANCIONES</div>
        <div class="sanctions-toggle-wrapper" id="sanctionsWrapper">
          <div class="sanctions-toggle" id="sanctionsToggle">
            <div class="sanctions-toggle-thumb"></div>
          </div>
          <span class="sanctions-toggle-label" id="sanctionsLabel">HISTORIAL LIMPIO</span>
        </div>
        <div class="sanctions-reveal" id="sanctionsReveal">
          <div class="gang-input-group">
            <label class="gang-label">Justificación de la Sanción</label>
            <textarea class="gang-textarea" id="m1-sanction-detail" placeholder="Explica las sanciones recibidas y qué aprendiste..."></textarea>
          </div>
        </div>
      </div>
    `;
    setTimeout(() => {
      const toggle = document.getElementById('sanctionsToggle');
      const wrapper = document.getElementById('sanctionsWrapper');
      const reveal = document.getElementById('sanctionsReveal');
      const label = document.getElementById('sanctionsLabel');
      wrapper.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const active = toggle.classList.contains('active');
        reveal.classList.toggle('visible', active);
        label.textContent = active ? 'SANCIONADO' : 'HISTORIAL LIMPIO';
      });
    }, 50);
    return frag;
  }

  function buildModal2() {
    const frag = document.createElement('div');
    const svgCrosshair = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`;
    const svgBriefcase = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
    const svgSkull = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9h0"/><path d="M15 9h0"/><path d="M12 21v-4"/><path d="M16 21v-4c0-1.5-1.5-2-1.5-2H9.5C8 15 6.5 15.5 6.5 17v4"/><circle cx="12" cy="10" r="8"/></svg>`;
    const svgMotorcycle = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>`;
    const svgNetwork = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;
    const svgHexagon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>`;

    const types = [
      { icon: svgCrosshair, label: 'Pandilla' }, { icon: svgBriefcase, label: 'Mafia' },
      { icon: svgSkull, label: 'Cártel' }, { icon: svgMotorcycle, label: 'MC' },
      { icon: svgNetwork, label: 'Red Criminal' }, { icon: svgHexagon, label: 'Otro' }
    ];

    frag.innerHTML = `
      <div class="modal-section">
        <div class="modal-section-label">IDENTIDAD DE LA ORGANIZACIÓN</div>
        <div class="gang-form-grid">
          <div class="gang-input-group">
            <label class="gang-label">Nombre de la Organización</label>
            <input class="gang-input" type="text" id="m2-org-name" placeholder="Nombre IC de tu organización" required>
          </div>
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-label">TIPOLOGÍA CRIMINAL</div>
        <div class="holo-grid" id="holoGrid">
          ${types.map(t => `<div class="holo-card" data-type="${t.label}"><div class="holo-card-icon" style="width:28px;height:28px;margin:0 auto 8px auto;">${t.icon}</div><div class="holo-card-label">${t.label}</div></div>`).join('')}
        </div>
      </div>
      <div class="modal-section">
        <div class="gang-form-grid">
          <div class="gang-input-group">
            <label class="gang-label">Objetivos a Corto Plazo</label>
            <textarea class="gang-textarea" id="m2-goals-short" placeholder="¿Qué busca lograr en las primeras semanas?" required></textarea>
          </div>
          <div class="gang-input-group">
            <label class="gang-label">Objetivos a Largo Plazo</label>
            <textarea class="gang-textarea" id="m2-goals-long" placeholder="Visión a largo plazo de la organización..." required></textarea>
          </div>
        </div>
      </div>
      <div class="modal-section">
        <div class="gang-input-group">
          <label class="gang-label">Vestimenta y Rasgos Identificativos</label>
          <textarea class="gang-textarea" id="m2-appearance" placeholder="Colores, tatuajes obligatorios, tipos de vehículos, estilo de ropa..." required></textarea>
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-label">MANIFIESTO REDACTADO</div>
        <p style="font-size:11px;color:var(--color-text-dim);margin-bottom:10px;letter-spacing:0.5px">
          Escribe la historia y lore de tu organización. El escáner detectará palabras clave estructurales.
        </p>
        <div class="manifesto-container">
          <div class="manifesto-backdrop" id="manifestoBackdrop"></div>
          <textarea class="manifesto-textarea" id="m2-lore" placeholder="Escribe aquí el lore de tu organización..."></textarea>
        </div>
      </div>
    `;

    setTimeout(() => {
      // Setup Type selections
      const grid = document.getElementById('holoGrid');
      if (grid) {
        grid.querySelectorAll('.holo-card').forEach(card => {
          card.addEventListener('click', () => {
            grid.querySelectorAll('.holo-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
          });
        });
      }

      // Lore Scanner overlay system
      const textarea = document.getElementById('m2-lore');
      const backdrop = document.getElementById('manifestoBackdrop');
      
      if (textarea && backdrop) {
        const keywordsRegex = /\b(mafia|sangre|drogas|armas|territorio|dinero|c[aá]rtel|muerte|pandilla|banda|ilegal)\b/gi;
        
        textarea.addEventListener('input', () => {
          // Replace angled brackets to prevent HTML injection in the backdrop
          let text = textarea.value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          
          // Apply Keyword Highlighting
          let highlightedText = text.replace(keywordsRegex, '<span class="keyword-glow">$&</span>');
          
          // To ensure proper line height mirroring on empty lines ending with \n
          if (text.endsWith("\\n")) {
              highlightedText += " ";
          }
          
          backdrop.innerHTML = highlightedText;
        });

        // Sync scrolling perfectly
        textarea.addEventListener('scroll', () => {
          backdrop.scrollTop = textarea.scrollTop;
          backdrop.scrollLeft = textarea.scrollLeft;
        });
      }
    }, 50);
    return frag;
  }

  function buildModal3() {
    const frag = document.createElement('div');
    const sliders = [
      { id: 'drugs', label: 'Narcotráfico' }, { id: 'weapons', label: 'Tráfico de Armas' },
      { id: 'extortion', label: 'Extorsión' }, { id: 'robbery', label: 'Robos' },
      { id: 'laundering', label: 'Blanqueo de Capitales' }
    ];
    frag.innerHTML = `
      <div class="modal-section">
        <div class="modal-section-label">DISTRIBUCIÓN DE RECURSOS</div>
        <div class="points-display">
          <span class="points-label">Puntos Disponibles</span>
          <span class="points-value" id="pointsValue">100</span>
        </div>
        ${sliders.map(s => `
          <div class="slider-group">
            <div class="slider-header">
              <span class="slider-label">${s.label}</span>
              <span class="slider-value" id="val-${s.id}">0</span>
            </div>
            <input class="gang-slider" type="range" min="0" max="100" value="0" id="slider-${s.id}">
          </div>
        `).join('')}
      </div>
      <div class="modal-section">
        <div class="gang-input-group">
          <label class="gang-label">Negocio Tapadera / Actividad Legal</label>
          <textarea class="gang-textarea" id="m3-front" placeholder="Describe tu fachada legal para blanquear ingresos..." required></textarea>
        </div>
      </div>
    `;
    setTimeout(() => {
      const els = {}, vals = {};
      const ids = ['drugs','weapons','extortion','robbery','laundering'];
      const pv = document.getElementById('pointsValue');
      ids.forEach(id => { els[id] = document.getElementById(`slider-${id}`); vals[id] = document.getElementById(`val-${id}`); });
      function upd() {
        const total = ids.reduce((s,id) => s + parseInt(els[id].value), 0);
        pv.textContent = 100 - total;
        pv.classList.toggle('depleted', 100 - total <= 0);
        ids.forEach(id => {
          vals[id].textContent = els[id].value;
          const pct = els[id].value;
          els[id].style.background = `linear-gradient(90deg, var(--color-accent) ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
        });
      }
      ids.forEach(id => {
        els[id].addEventListener('input', () => {
          const cv = parseInt(els[id].value);
          const others = ids.filter(s => s !== id);
          const ot = others.reduce((s,s2) => s + parseInt(els[s2].value), 0);
          if (cv + ot > 100) {
            const excess = cv + ot - 100;
            const ov = others.map(s => ({ id: s, val: parseInt(els[s].value) }));
            const os = ov.reduce((s,o) => s + o.val, 0);
            if (os > 0) {
              let rd = 0;
              ov.forEach(o => { const r = Math.round((o.val/os)*excess); const nv = Math.max(0,o.val-r); els[o.id].value = nv; rd += o.val - nv; });
              if (rd < excess) { for (const o of ov) { const d = excess-rd; if(d<=0) break; const c = parseInt(els[o.id].value); const r = Math.min(c,d); els[o.id].value = c-r; rd += r; } }
            } else { els[id].value = 100; }
          }
          upd();
        });
      });
      upd();
    }, 50);
    return frag;
  }

  function buildModal4() {
    const frag = document.createElement('div');
    frag.innerHTML = `
      <div class="modal-section" style="margin-bottom: 0;">
        <div class="modal-section-label">SELECCIÓN DE TERRITORIO</div>
        
        <div class="map-zone-mode" id="mapZoneContainer">
          <div class="map-hud-overlay"></div>
          <!-- Zonas Clicables (Top a Bottom) -->
          <div class="map-zone" data-zone="Norte (Paleto, Chiliad)" style="top: 0%; left: 0%; width: 100%; height: 26%;"></div>
          <div class="map-zone" data-zone="Condado de Blaine (Sandy, Senora)" style="top: 26%; left: 0%; width: 100%; height: 22%;"></div>
          <div class="map-zone" data-zone="Vinewood y Rockford Hills" style="top: 48%; left: 0%; width: 100%; height: 16%;"></div>
          <div class="map-zone" data-zone="Oeste (Vespucci, Del Perro)" style="top: 64%; left: 0%; width: 45%; height: 16%;"></div>
          <div class="map-zone" data-zone="Sur y Centro (Davis, Downtown)" style="top: 64%; left: 45%; width: 55%; height: 16%;"></div>
          <div class="map-zone" data-zone="Este y Espejo (Mirror Park, East LS)" style="top: 50%; left: 65%; width: 35%; height: 14%;"></div>
          <div class="map-zone" data-zone="Puerto Sur (Elysian y Terminal)" style="top: 80%; left: 0%; width: 100%; height: 20%;"></div>
        </div>

        <div class="gang-form-grid" style="grid-template-columns: 1fr; margin-top: 16px;">
          <div class="gang-input-group">
            <label class="gang-label">Zona Principal (Selecciona en el mapa)</label>
            <input class="gang-input terminal" type="text" id="m4-zone-name" placeholder="[ ZONA NO SELECCIONADA ]" readonly required style="pointer-events: none;">
          </div>
          <div class="gang-input-group">
            <label class="gang-label">Ubicación Estratégica / Detalles (Opcional)</label>
            <textarea class="gang-textarea" id="m4-zone-details" placeholder="Describe calles, bloques o edificios específicos de tu HQ..."></textarea>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const container = document.getElementById('mapZoneContainer');
      const inputZone = document.getElementById('m4-zone-name');
      if (!container) return;

      const zones = container.querySelectorAll('.map-zone');
      zones.forEach(zone => {
        zone.addEventListener('click', () => {
          zones.forEach(z => z.classList.remove('active'));
          zone.classList.add('active');
          inputZone.value = `[ ZONA: ${zone.dataset.zone.toUpperCase()} ]`;
          
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(inputZone, { color: '#fff', backgroundColor: 'rgba(255,255,255,0.2)' }, { color: 'var(--color-accent)', backgroundColor: 'transparent', duration: 0.5 });
          }
        });
      });
    }, 50);

    return frag;
  }

  function buildModal5() {
    const frag = document.createElement('div');
    frag.innerHTML = `
      <div class="modal-section">
        <div class="gang-input-group">
          <label class="gang-label">Horario Operativo Principal (Zona Horaria)</label>
          <input class="gang-input" type="text" id="m5-timezone" placeholder="Ej: CET (20:00 - 02:00)" required>
        </div>
      </div>
      <div class="modal-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div class="modal-section-label" style="margin-bottom: 0;">MIEMBROS DEL ESCUADRÓN</div>
          <button class="btn-add-operative" id="btnAddOperative" type="button" style="width: auto; padding: 6px 12px; margin: 0; font-size: 10px;"><span>+</span> AÑADIR OPERATIVO</button>
        </div>
        <div class="roster-container" id="rosterContainer">
          <div class="roster-card" data-roster-id="1">
            <div class="roster-card-header"><span class="roster-card-tag">LÍDER — #1</span></div>
            <div class="gang-form-grid">
              <div class="gang-input-group"><label class="gang-label">Nombre IC</label><input class="gang-input roster-name" type="text" placeholder="Nombre en personaje" required></div>
              <div class="gang-input-group"><label class="gang-label">Discord OOC</label><input class="gang-input roster-discord" type="text" placeholder="usuario#0000" required></div>
            </div>
            <div class="gang-input-group" style="margin-top: 15px;"><label class="gang-label">Rango</label><input class="gang-input roster-rank" type="text" value="Líder" readonly></div>
          </div>
        </div>
      </div>
    `;
    setTimeout(() => {
      const container = document.getElementById('rosterContainer');
      const btnAdd = document.getElementById('btnAddOperative');
      let rc = 1;
      if (!btnAdd) return;
      btnAdd.addEventListener('click', () => {
        rc++;
        const card = document.createElement('div');
        card.className = 'roster-card'; card.dataset.rosterId = rc;
        card.innerHTML = `
          <div class="roster-card-header"><span class="roster-card-tag">OPERATIVO — #${rc}</span><button class="roster-card-remove" type="button">✕</button></div>
          <div class="gang-form-grid">
            <div class="gang-input-group"><label class="gang-label">Nombre IC</label><input class="gang-input roster-name" type="text" placeholder="Nombre en personaje"></div>
            <div class="gang-input-group"><label class="gang-label">Discord OOC</label><input class="gang-input roster-discord" type="text" placeholder="usuario#0000"></div>
          </div>
          <div class="gang-input-group" style="margin-top: 15px;"><label class="gang-label">Rango</label><input class="gang-input roster-rank" type="text" placeholder="Soldado, Sicario, etc."></div>
        `;
        card.querySelector('.roster-card-remove').addEventListener('click', () => {
          if (typeof gsap !== 'undefined') gsap.to(card, { opacity:0, scale:0.9, height:0, duration:0.3, ease:'power2.in', onComplete:()=>card.remove() });
          else card.remove();
        });
        container.appendChild(card);
      });
    }, 50);
    return frag;
  }

  function buildModal6() {
    const frag = document.createElement('div');
    const rules = [
      'Tolerancia Cero: Cualquier comportamiento tóxico, metagaming, powergaming o failRP resultará en sanción inmediata.',
      'Economía Real: El sistema económico es realista. No se permiten métodos de farming abusivos ni exploits.',
      'No Ayudas Iniciales: Ningún miembro del staff proporcionará ventajas iniciales a organizaciones nuevas.',
      'Aceptación de CK: Todos los miembros aceptan la posibilidad de Character Kill bajo circunstancias válidas de RP.'
    ];
    frag.innerHTML = `
      <div class="modal-section">
        <div class="gang-input-group">
          <label class="gang-label">Postura de Alianzas</label>
          <textarea class="gang-textarea" id="m6-stance" placeholder="¿Sois aislacionistas, agresivos o buscáis alianzas? Explica tu postura diplomática..." required></textarea>
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-label">PROTOCOLO DE SEGURIDAD — MANTÉN PULSADO PARA DESBLOQUEAR</div>
        <div class="rules-list" id="rulesList">
          ${rules.map((r,i) => `
            <div class="rule-item">
              <span class="rule-text">${r}</span>
              <div class="seal-container" data-seal="${i}" id="seal-${i}">
                <svg class="seal-svg" viewBox="0 0 40 40"><circle class="seal-bg" cx="20" cy="20" r="18"/><circle class="seal-progress" cx="20" cy="20" r="18"/></svg>
                <span class="seal-icon">🔒</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    setTimeout(() => {
      const HD = 1500, circ = 2 * Math.PI * 18;
      document.querySelectorAll('.seal-container').forEach(seal => {
        if (seal.classList.contains('broken')) return;
        let af = null, st = 0;
        const pc = seal.querySelector('.seal-progress');
        pc.style.strokeDasharray = circ; pc.style.strokeDashoffset = circ;
        function start() {
          if (seal.classList.contains('broken')) return;
          st = Date.now();
          (function anim() {
            const p = Math.min((Date.now()-st)/HD, 1);
            pc.style.strokeDashoffset = circ * (1 - p);
            if (p >= 1) { seal.classList.add('broken'); seal.querySelector('.seal-icon').textContent = '🔓'; return; }
            af = requestAnimationFrame(anim);
          })();
        }
        function stop() { if (seal.classList.contains('broken')) return; cancelAnimationFrame(af); pc.style.strokeDashoffset = circ; }
        seal.addEventListener('mousedown', start); seal.addEventListener('mouseup', stop); seal.addEventListener('mouseleave', stop);
        seal.addEventListener('touchstart', e => { e.preventDefault(); start(); }); seal.addEventListener('touchend', stop); seal.addEventListener('touchcancel', stop);
      });
    }, 50);
    return frag;
  }

  // ══════════════════════════════════════
  // VALIDATION
  // ══════════════════════════════════════
  function validateModal(n) {
    switch(n) {
      case 1: return v1(); case 2: return v2(); case 3: return v3();
      case 4: return v4(); case 5: return v5(); case 6: return v6();
      default: return false;
    }
  }
  function val(id) { const e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function shake() { if (typeof gsap !== 'undefined') gsap.fromTo($btnSave, { x:-6 }, { x:0, duration:0.4, ease:'elastic.out(1,0.3)' }); }

  function v1() {
    if (!val('m1-name')||!val('m1-age')||!val('m1-discord')||!val('m1-experience')) { shake(); return false; }
    const t = document.getElementById('sanctionsToggle');
    if (t && t.classList.contains('active') && !val('m1-sanction-detail')) { shake(); return false; }
    return true;
  }
  function v2() {
    const s = document.querySelector('.holo-card.selected');
    const m = document.getElementById('manifestoEditor');
    if (!val('m2-org-name')||!s||!val('m2-goals-short')||!val('m2-goals-long')||!val('m2-appearance')||!(m&&m.innerText.trim())) { shake(); return false; }
    return true;
  }
  function v3() {
    const ids = ['drugs','weapons','extortion','robbery','laundering'];
    const total = ids.reduce((s,id) => { const e = document.getElementById(`slider-${id}`); return s + (e ? parseInt(e.value) : 0); }, 0);
    if (total !== 100 || !val('m3-front')) { shake(); return false; }
    return true;
  }
  function v4() { if (!val('m4-zone-name')) { shake(); return false; } return true; }
  function v5() {
    if (!val('m5-timezone')) { shake(); return false; }
    const lc = document.querySelector('.roster-card[data-roster-id="1"]');
    if (!lc||!lc.querySelector('.roster-name').value.trim()||!lc.querySelector('.roster-discord').value.trim()) { shake(); return false; }
    return true;
  }
  function v6() {
    if (!val('m6-stance')) { shake(); return false; }
    const seals = document.querySelectorAll('.seal-container');
    if (!Array.from(seals).every(s => s.classList.contains('broken'))) { shake(); return false; }
    return true;
  }

  // ══════════════════════════════════════
  // DATA COLLECTION
  // ══════════════════════════════════════
  function collectModalData(n) {
    switch(n) {
      case 1: STATE.modalData[1] = { name:val('m1-name'), age:val('m1-age'), discord:val('m1-discord'), experience:val('m1-experience'), sanctioned:document.getElementById('sanctionsToggle')?.classList.contains('active')||false, sanctionDetail:val('m1-sanction-detail')||'' }; break;
      case 2: { const s = document.querySelector('.holo-card.selected'); const e = document.getElementById('manifestoEditor'); STATE.modalData[2] = { orgName:val('m2-org-name'), type:s?s.dataset.type:'', goalsShort:val('m2-goals-short'), goalsLong:val('m2-goals-long'), appearance:val('m2-appearance'), lore:e?e.innerText.trim():'' }; break; }
      case 3: { const ids=['drugs','weapons','extortion','robbery','laundering']; const eco={}; ids.forEach(id=>{ const e=document.getElementById(`slider-${id}`); eco[id]=e?parseInt(e.value):0; }); eco.front=val('m3-front'); STATE.modalData[3]=eco; break; }
      case 4: STATE.modalData[4] = { zoneName:val('m4-zone-name'), details:val('m4-zone-details') }; break;
      case 5: { const cards=document.querySelectorAll('.roster-card'); const roster=[]; cards.forEach(c=>{ const n=c.querySelector('.roster-name')?.value.trim(); const d=c.querySelector('.roster-discord')?.value.trim(); const r=c.querySelector('.roster-rank')?.value.trim(); if(n) roster.push({name:n,discord:d,rank:r}); }); STATE.modalData[5]={timezone:val('m5-timezone'),roster}; break; }
      case 6: STATE.modalData[6] = { stance:val('m6-stance'), rulesAccepted:true }; break;
    }
  }

  function compileDossier() {
    return { ooc:STATE.modalData[1], ic:STATE.modalData[2], economy:STATE.modalData[3], territory:STATE.modalData[4], roster:STATE.modalData[5], diplomacy:STATE.modalData[6] };
  }

  // ══════════════════════════════════════
  // TRANSMIT
  // ══════════════════════════════════════
  async function handleTransmit() {
    if ($btnTransmit.disabled || $btnTransmit.classList.contains('loading')) return;
    const dossier = compileDossier();
    $btnTransmit.classList.add('loading');
    $('climaxText').textContent = 'ENCRIPTANDO Y TRANSMITIENDO...';
    try {
      const res = await fetch('/api/submit-gang', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(dossier) });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      showSuccess();
    } catch (err) {
      console.error('Transmission failed:', err);
      $btnTransmit.classList.remove('loading');
      $btnTransmit.classList.add('error');
      $('climaxText').textContent = 'TRANSMISIÓN INTERCEPTADA — REINTENTAR';
      setTimeout(() => $btnTransmit.classList.remove('error'), 2000);
    }
  }

  function showSuccess() {
    if (typeof gsap !== 'undefined') {
      gsap.to($scene, { opacity:0, scale:0.95, duration:0.6, ease:'power2.in', onComplete:() => $successOverlay.classList.add('active') });
    } else {
      $scene.style.opacity = '0';
      $successOverlay.classList.add('active');
    }
    setTimeout(() => { window.location.href = '/'; }, 4000);
  }

  // ── BOOT ──
  document.addEventListener('DOMContentLoaded', init);
})();
