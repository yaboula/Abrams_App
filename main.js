/* ============================================
   FIVEM SPATIAL LANDING — MAIN LOGIC
   GSAP ScrollTrigger Camera System
   + Enhanced Visual Route Editor
   ============================================ */

(function () {
  'use strict';

  const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

  // ---- DOM REFS ----
  const world = document.getElementById('world');
  const hudX = document.getElementById('hud-x');
  const hudServerStatus = document.getElementById('server-status');
  const hudPlayerCount = document.getElementById('player-count');

  // i18n initialization
  let currentLang = 'es';

  function changeLanguage(lang) {
    if (!window.I18N || !window.I18N[lang]) return;
    currentLang = lang;
    
    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (window.I18N[lang][key]) {
        el.innerHTML = window.I18N[lang][key];
      }
    });

    // Update active state on language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Re-render HUD label for current section since it's dynamic
    if (typeof updateHUD === 'function') {
      try { updateHUD(currentSection); } catch(e) {}
    }
  }

  // Setup Lang Switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      changeLanguage(e.target.dataset.lang);
    });
  });
  const hudY = document.getElementById('hud-y');
  const hudPlayers = document.getElementById('hud-players');
  const hudSectionLabel = document.getElementById('hud-section-label');
  const hudScrollHint = document.getElementById('hud-scroll-hint');
  const hudCta = document.getElementById('hud-cta');
  const navDots = document.querySelectorAll('.nav-dot');
  const routeLine = document.getElementById('route-line');
  const routeBg = document.getElementById('route-bg');
  const gpsSVG = document.getElementById('gps-route');
  const sectionEls = document.querySelectorAll('.section');

  // ---- UTILITY ----
  function lerp(a, b, t) { return a + (b - a) * t; }
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function padNum(n, len) { return String(Math.abs(Math.round(n))).padStart(len, '0'); }

  // ---- APPLY CONFIG ----
  function applyConfig() {
    world.style.width = CONFIG.canvasWidth;
    world.style.height = CONFIG.canvasHeight;
    CONFIG.sections.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) { el.style.left = sec.x + '%'; el.style.top = sec.y + '%'; }
    });
    if (gpsSVG) gpsSVG.setAttribute('viewBox', CONFIG.gpsRoute.viewBox);
    updateGPSPath();
  }

  // ---- SMOOTH PATH WITH PER-POINT TENSION ----
  function buildSmoothPath(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0][0]},${points[0][1]}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const tPrev = prev[2] !== undefined ? prev[2] : 0.4;
      const tCurr = curr[2] !== undefined ? curr[2] : 0.4;

      // Use tension to compute control points
      const dx = curr[0] - prev[0];
      const dy = curr[1] - prev[1];

      const cpx1 = prev[0] + dx * tPrev;
      const cpy1 = prev[1] + dy * (0.1 * (1 - tPrev) + 0.0 * tPrev);
      const cpx2 = curr[0] - dx * tCurr;
      const cpy2 = curr[1] - dy * (0.1 * (1 - tCurr) + 0.0 * tCurr);

      d += ` C ${cpx1.toFixed(1)},${cpy1.toFixed(1)} ${cpx2.toFixed(1)},${cpy2.toFixed(1)} ${curr[0]},${curr[1]}`;
    }
    return d;
  }

  function updateGPSPath() {
    const pathD = buildSmoothPath(CONFIG.gpsRoute.points);
    if (routeLine) routeLine.setAttribute('d', pathD);
    if (routeBg) routeBg.setAttribute('d', pathD);
  }

  // ---- LIVE FIVEM PLAYER COUNT ----
  async function fetchLivePlayerCount() {
    if (!hudPlayers) return;

    if (!CONFIG.fivemCfxCode || CONFIG.fivemCfxCode === 'TU_CODIGO_CFX') {
      hudPlayers.textContent = `${CONFIG.fivemMaxPlayers}`;
      console.warn("FiveM CFX code not set in config.js. Displaying max capacity.");
      return;
    }

    try {
      // Official FiveM endpoint for querying server stats by CFX code (supports CORS)
      const res = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${CONFIG.fivemCfxCode}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      const currentPlayers = data?.Data?.clients || 0;
      const maxPlayers = data?.Data?.sv_maxclients || CONFIG.fivemMaxPlayers;
      
      hudPlayers.textContent = `${currentPlayers}`;
    } catch (err) {
      console.error("Failed to fetch live FiveM players:", err);
      // Fallback display if server is down or CFX API is unreachable
      hudPlayers.textContent = `--`;
    }
  }

  // Fetch immediately, then update every 60 seconds
  fetchLivePlayerCount();
  setInterval(fetchLivePlayerCount, 60000);

  // ---- GPS ROUTE SVG ANIMATION ----
  function initGPSRoute() {
    if (!routeLine) return 0;
    const length = routeLine.getTotalLength();
    routeLine.style.strokeDasharray = length;
    routeLine.style.strokeDashoffset = length;
    return length;
  }

  // ---- MOBILE FALLBACK ----
  function initMobile() {
    sectionEls.forEach(sec => {
      const inner = sec.querySelector('.section-inner');
      if (inner) inner.style.opacity = '1';
    });
    sectionEls.forEach(sec => {
      const inner = sec.querySelector('.section-inner');
      const cards = sec.querySelectorAll('.card');
      gsap.from(inner, {
        opacity: 0, y: 50, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 80%', toggleActions: 'play none none none' },
      });
      if (cards.length) {
        gsap.from(cards, {
          opacity: 0, y: 40, stagger: 0.12, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: sec, start: 'top 70%', toggleActions: 'play none none none' },
        });
      }
    });
    setInterval(() => {
      if (hudX) hudX.textContent = padNum(randomInt(-2000, 3000), 4);
      if (hudY) hudY.textContent = padNum(randomInt(-3000, 2000), 4);
    }, 800);
  }

  // ---- DESKTOP: LOCKED SPATIAL NAVIGATION ----
  function initDesktop() {
    gsap.registerPlugin(ScrollTrigger);
    const routeLength = initGPSRoute();
    let currentSection = 0;
    let isAnimating = false;

    // Lock native scrolling — presentation mode only
    document.body.style.overflow = 'hidden';

    function getWaypointsPx() {
      return CONFIG.sections.map(sec => ({
        x: (sec.x / 100) * world.offsetWidth,
        y: (sec.y / 100) * world.offsetHeight,
      }));
    }

    function getCameraTarget(wpPx) {
      return {
        x: -(wpPx.x - window.innerWidth * CONFIG.cameraOffsetX),
        y: -(wpPx.y - window.innerHeight * CONFIG.cameraOffsetY),
      };
    }

    const wpsPx = getWaypointsPx();

    // Prepare sections: hide all except the first one
    sectionEls.forEach((sec, i) => {
      const inner = sec.querySelector('.section-inner');
      const cards = sec.querySelectorAll('.card');
      if (i > 0) {
        gsap.set(inner, { opacity: 0, y: 60 });
        if (cards.length) gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });
      } else {
        gsap.set(inner, { opacity: 1, y: 0 });
        if (cards.length) gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
      }
    });

    const routeProxy = { progress: 0 };

    function goToSection(index, isFastHop = false) {
      if (isAnimating || index === currentSection || index < 0 || index >= CONFIG.sections.length) return;
      isAnimating = true;

      const oldSec = sectionEls[currentSection];
      const newSec = sectionEls[index];
      const oldInner = oldSec.querySelector('.section-inner');
      const oldCards = oldSec.querySelectorAll('.card');
      const newInner = newSec.querySelector('.section-inner');
      const newCards = newSec.querySelectorAll('.card');

      const travelTime = isFastHop ? 0.7 : 1.5;
      const fadeOutDur = isFastHop ? 0.3 : 0.4;
      const cardDur = isFastHop ? 0.4 : CONFIG.cardDuration;
      const staggerTime = isFastHop ? 0.05 : CONFIG.cardStagger;

      // Fade out old content
      gsap.to(oldInner, { opacity: 0, y: -60, duration: fadeOutDur, ease: "power2.in" });
      if (oldCards.length) gsap.to(oldCards, { opacity: 0, y: -40, scale: 0.95, duration: fadeOutDur, ease: "power2.in" });

      currentSection = index;
      updateHUD(currentSection);

      const target = getCameraTarget(wpsPx[currentSection]);
      
      // Hand-tuned progression stops to ensure the line leads the eye out of the screen
      // Scaled back slightly per user request
      const tunedProgressions = [0.15, 0.35, 0.60, 0.82, 1.0];
      const targetProgress = tunedProgressions[currentSection];

      const tl = gsap.timeline({
        onComplete: () => { isAnimating = false; }
      });

      // Move camera and GPS route together
      tl.to(world, {
        x: target.x,
        y: target.y,
        duration: travelTime,
        ease: "power2.inOut",
      }, 0);

      tl.to(routeProxy, {
        progress: targetProgress,
        duration: travelTime,
        ease: "power2.inOut",
        onUpdate: () => {
          if (routeLine && routeLength) {
            routeLine.style.strokeDashoffset = routeLength * (1 - routeProxy.progress);
          }
          updateGPSCoords(routeProxy.progress);
        }
      }, 0);

      // Fade in new content as the camera settles
      tl.to(newInner, { opacity: 1, y: 0, duration: cardDur, ease: "power2.out" }, travelTime * 0.5);
      if (newCards.length) {
        tl.to(newCards, { opacity: 1, y: 0, scale: 1, stagger: staggerTime, duration: cardDur, ease: "power2.out" }, travelTime * 0.6);
      }
    }

    function updateHUD(idx) {
      navDots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      if (hudSectionLabel) {
        const s = CONFIG.sections[idx];
        const transText = (window.I18N && window.I18N[currentLang] && window.I18N[currentLang][`nav.sec${idx+1}`]) || s.label;
        hudSectionLabel.innerHTML = `<span class="label-number">${s.num}</span> ${transText}`;
      }
      if (idx > 0 && hudScrollHint) {
        gsap.to(hudScrollHint, { opacity: 0, duration: 0.3 });
      } else if (idx === 0 && hudScrollHint) {
        gsap.to(hudScrollHint, { opacity: 1, duration: 0.3 });
      }

      // Hide the global CTA if we are on the final Join section
      if (hudCta) {
        if (idx === 4) {
          gsap.to(hudCta, { opacity: 0, scale: 0.9, duration: 0.3, pointerEvents: 'none' });
        } else {
          gsap.to(hudCta, { opacity: 1, scale: 1, duration: 0.3, pointerEvents: 'auto' });
        }
      }
    }

    function updateGPSCoords(progress) {
      const bx = lerp(-1200, 2800, progress);
      const by = lerp(3400, -1800, progress);
      if (hudX) hudX.textContent = padNum(bx + randomInt(-15, 15), 4);
      if (hudY) hudY.textContent = padNum(by + randomInt(-15, 15), 4);
    }

    const firstTarget = getCameraTarget(wpsPx[0]);
    gsap.set(world, { x: firstTarget.x, y: firstTarget.y });
    updateHUD(0);

    // ---- OBSERVER: LOCKED CAMERA MOVEMENT ----
    let autoTravelTimeout = null;
    let autoTravelTarget = -1;

    Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      tolerance: 40,
      preventDefault: true,
      onUp: () => {
        clearTimeout(autoTravelTimeout);
        autoTravelTarget = -1;
        goToSection(currentSection - 1);
      },
      onDown: () => {
        clearTimeout(autoTravelTimeout);
        autoTravelTarget = -1;
        goToSection(currentSection + 1);
      }
    });

    // ---- INTERACTIVE FLYOVER NAVIGATION ----
    function executeHop() {
      if (autoTravelTarget === -1 || currentSection === autoTravelTarget) {
        autoTravelTarget = -1;
        return;
      }
      
      const nextIdx = currentSection < autoTravelTarget ? currentSection + 1 : currentSection - 1;
      goToSection(nextIdx, true); // true = fast mode
      
      // Delay = travel (0.7s) + presentation pause (0.7s)
      autoTravelTimeout = setTimeout(executeHop, 1400);
    }

    function travelSequentially(target) {
      if (currentSection === target || isAnimating) return;
      clearTimeout(autoTravelTimeout);
      autoTravelTarget = target;
      executeHop();
    }

    if (hudCta) {
      hudCta.addEventListener('click', (e) => {
        e.preventDefault();
        travelSequentially(4);
      });
    }

    const btnDiscordHero = document.getElementById('btn-discord-hero');
    if (btnDiscordHero) {
      btnDiscordHero.addEventListener('click', (e) => {
        e.preventDefault();
        travelSequentially(4);
      });
    }

    // Nav Dot Clicking
    navDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetIdx = parseInt(dot.dataset.section);
        if (targetIdx !== currentSection) {
          travelSequentially(targetIdx);
        }
      });
    });

    // Initial Trigger
    updateHUD(0);

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Refresh specific targets on resize
        const newWps = getWaypointsPx();
        const tgt = getCameraTarget(newWps[currentSection]);
        gsap.set(world, { x: tgt.x, y: tgt.y });
      }, 250);
    });
  }

  // ---- APPLY & INIT ----
  applyConfig();
  if (IS_MOBILE) initMobile();
  else initDesktop();

  // ========================================================
  //  ENHANCED VISUAL ROUTE EDITOR
  //  - Drag sections (red) and route points (blue)
  //  - Drag curvature handles (green) per point
  //  - Add new points (toolbar button or double-click canvas)
  //  - Right-click blue point to delete
  //  - Global tension slider
  //  - Full JSON export to console
  // ========================================================

  let editorActive = false;
  let editorOverlay = null;
  let editorToolbar = null;
  let editorMarkers = [];       // { el, type, index }
  let addPointMode = false;
  let selectedPointIdx = null;

  window.toggleEditor = function () {
    editorActive = !editorActive;
    if (editorActive) {
      startEditor();
      console.log('%c✅ EDITOR ACTIVADO', 'color: #E63946; font-size: 16px; font-weight: bold');
      console.log('🔴 Rojo = secciones  |  🔵 Azul = ruta GPS  |  🟢 Verde = curvatura');
      console.log('➕ Botón "AÑADIR" o doble-clic en el canvas para añadir puntos');
      console.log('🗑️ Clic derecho en un punto azul para eliminarlo');
    } else {
      stopEditor();
      console.log('%c❌ EDITOR DESACTIVADO', 'color: #888; font-size: 16px; font-weight: bold');
      exportConfig();
    }
  };

  // ---- CSS for Editor ----
  const editorCSS = `
    #editor-toolbar {
      position: fixed; bottom: 0; left: 0; width: 100%;
      z-index: 99999; pointer-events: auto;
      background: rgba(10, 10, 15, 0.95); backdrop-filter: blur(16px);
      border-top: 2px solid #E63946; padding: 12px 24px;
      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
      font-family: 'Rajdhani', sans-serif; color: #fff;
    }
    #editor-toolbar .ed-title {
      font-weight: 700; font-size: 14px; letter-spacing: 2px;
      text-transform: uppercase; color: #E63946; margin-right: 8px;
    }
    #editor-toolbar button {
      padding: 6px 16px; border: 1px solid #E63946; background: transparent;
      color: #fff; font-family: 'Rajdhani', sans-serif; font-weight: 600;
      font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;
      cursor: pointer; transition: all 0.2s;
      clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);
    }
    #editor-toolbar button:hover { background: #E63946; }
    #editor-toolbar button.active { background: #E63946; }
    #editor-toolbar .ed-sep {
      width: 1px; height: 28px; background: rgba(255,255,255,0.15);
    }
    #editor-toolbar label {
      font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
      color: #a0a0b0; display: flex; align-items: center; gap: 8px;
    }
    #editor-toolbar input[type="range"] {
      width: 100px; accent-color: #E63946; cursor: pointer;
    }
    #editor-toolbar .ed-info {
      font-size: 11px; color: #666; letter-spacing: 1px; margin-left: auto;
    }
    .ed-marker {
      position: absolute; cursor: grab; pointer-events: auto;
      z-index: 10001; transform: translate(-50%, -50%);
      display: flex; align-items: center; justify-content: center;
      font-size: 8px; font-weight: bold; color: white; font-family: monospace;
      user-select: none; transition: box-shadow 0.2s;
    }
    .ed-marker:active { cursor: grabbing; }
    .ed-marker.route-point {
      width: 22px; height: 22px; background: #4488FF;
      border: 2px solid white; box-shadow: 0 0 10px rgba(68,136,255,0.6);
    }
    .ed-marker.route-point:hover { box-shadow: 0 0 20px rgba(68,136,255,0.9); }
    .ed-marker.route-point.selected {
      background: #66AAFF; box-shadow: 0 0 24px rgba(68,136,255,1);
    }
    .ed-marker.section-point {
      width: 22px; height: 22px; background: #E63946;
      border: 2px solid white; box-shadow: 0 0 10px rgba(230,57,70,0.6);
    }
    .ed-marker.tension-handle {
      width: 14px; height: 14px; background: #44CC66;
      border: 2px solid white; border-radius: 50%;
      box-shadow: 0 0 8px rgba(68,204,102,0.6);
    }
    .ed-marker.tension-handle:hover { box-shadow: 0 0 16px rgba(68,204,102,0.9); }
    .ed-tension-line {
      position: absolute; pointer-events: none; z-index: 10000;
      border-top: 1px dashed rgba(68,204,102,0.5);
      transform-origin: left center;
    }
    .ed-crosshair { cursor: crosshair !important; }
    .ed-point-label {
      position: absolute; pointer-events: none; z-index: 10002;
      font-family: monospace; font-size: 9px; color: rgba(255,255,255,0.7);
      white-space: nowrap; transform: translate(14px, -50%);
      background: rgba(0,0,0,0.6); padding: 1px 5px;
    }
  `;

  function injectEditorStyles() {
    if (document.getElementById('editor-styles')) return;
    const style = document.createElement('style');
    style.id = 'editor-styles';
    style.textContent = editorCSS;
    document.head.appendChild(style);
  }

  function removeEditorStyles() {
    const el = document.getElementById('editor-styles');
    if (el) el.remove();
  }

  // ---- START EDITOR ----
  function startEditor() {
    injectEditorStyles();

    // Overlay on world for markers
    editorOverlay = document.createElement('div');
    editorOverlay.id = 'editor-overlay';
    editorOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;';
    world.appendChild(editorOverlay);

    // Toolbar
    editorToolbar = document.createElement('div');
    editorToolbar.id = 'editor-toolbar';
    editorToolbar.innerHTML = `
      <span class="ed-title">✏️ ROUTE EDITOR</span>
      <div class="ed-sep"></div>
      <button id="ed-btn-add" title="Clic aquí y luego clic en el canvas para añadir un punto">➕ AÑADIR PUNTO</button>
      <button id="ed-btn-add-between" title="Añade un punto entre el seleccionado y el siguiente">➕ INSERTAR ENTRE</button>
      <button id="ed-btn-delete" title="Eliminar el punto seleccionado">🗑️ ELIMINAR</button>
      <div class="ed-sep"></div>
      <label>TENSIÓN GLOBAL
        <input type="range" id="ed-tension-slider" min="0" max="100" value="40" step="1">
        <span id="ed-tension-val">0.40</span>
      </label>
      <div class="ed-sep"></div>
      <button id="ed-btn-export" title="Copiar coordenadas al portapapeles">📋 EXPORTAR</button>
      <button id="ed-btn-close">❌ CERRAR</button>
      <span class="ed-info" id="ed-info">Puntos: ${CONFIG.gpsRoute.points.length} | Seleccionado: ninguno</span>
    `;
    document.body.appendChild(editorToolbar);

    // Double-click on canvas to add point
    editorOverlay.style.pointerEvents = 'auto';
    editorOverlay.addEventListener('dblclick', onCanvasDoubleClick);
    editorOverlay.addEventListener('click', onCanvasClick);

    // Toolbar events
    document.getElementById('ed-btn-add').addEventListener('click', toggleAddMode);
    document.getElementById('ed-btn-add-between').addEventListener('click', addPointBetween);
    document.getElementById('ed-btn-delete').addEventListener('click', deleteSelectedPoint);
    document.getElementById('ed-btn-export').addEventListener('click', () => { exportConfig(); copyToClipboard(); });
    document.getElementById('ed-btn-close').addEventListener('click', () => window.toggleEditor());

    const slider = document.getElementById('ed-tension-slider');
    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value) / 100;
      document.getElementById('ed-tension-val').textContent = val.toFixed(2);
      CONFIG.gpsRoute.points.forEach(p => { p[2] = val; });
      updateGPSPath();
      rebuildMarkers();
    });

    rebuildMarkers();
  }

  // ---- REBUILD ALL MARKERS ----
  function rebuildMarkers() {
    // Clear existing
    editorMarkers.forEach(m => { if (m.el && m.el.parentNode) m.el.remove(); });
    if (editorOverlay) {
      editorOverlay.querySelectorAll('.ed-tension-line, .ed-point-label').forEach(e => e.remove());
    }
    editorMarkers = [];

    const vbParts = CONFIG.gpsRoute.viewBox.split(' ').map(Number);
    const vbW = vbParts[2], vbH = vbParts[3];

    // Section markers (red)
    CONFIG.sections.forEach((sec, i) => {
      const el = createMarker(sec.x, sec.y, 'section-point', `S${i}`);
      makeDraggable(el, (newX, newY) => {
        CONFIG.sections[i].x = newX;
        CONFIG.sections[i].y = newY;
        const domEl = document.getElementById(sec.id);
        if (domEl) { domEl.style.left = newX + '%'; domEl.style.top = newY + '%'; }
      });
      editorOverlay.appendChild(el);
      editorMarkers.push({ el, type: 'section', index: i });
    });

    // Route point markers (blue) + tension handles (green)
    CONFIG.gpsRoute.points.forEach((pt, i) => {
      const pxPercent = (pt[0] / vbW) * 100;
      const pyPercent = (pt[1] / vbH) * 100;
      const tension = pt[2] !== undefined ? pt[2] : 0.4;

      // Blue point
      const el = createMarker(pxPercent, pyPercent, 'route-point', `${i}`);
      if (i === selectedPointIdx) el.classList.add('selected');

      makeDraggable(el, (newX, newY) => {
        CONFIG.gpsRoute.points[i][0] = Math.round((newX / 100) * vbW);
        CONFIG.gpsRoute.points[i][1] = Math.round((newY / 100) * vbH);
        updateGPSPath();
        rebuildMarkers();
      });

      // Select on click
      el.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          selectedPointIdx = i;
          updateEditorInfo();
          editorOverlay.querySelectorAll('.route-point').forEach(m => m.classList.remove('selected'));
          el.classList.add('selected');
        }
      });

      // Right-click to delete
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (CONFIG.gpsRoute.points.length > 2) {
          CONFIG.gpsRoute.points.splice(i, 1);
          if (selectedPointIdx === i) selectedPointIdx = null;
          else if (selectedPointIdx > i) selectedPointIdx--;
          updateGPSPath();
          rebuildMarkers();
          updateEditorInfo();
        }
      });

      editorOverlay.appendChild(el);
      editorMarkers.push({ el, type: 'route', index: i });

      // Coordinate label
      const label = document.createElement('div');
      label.className = 'ed-point-label';
      label.style.left = pxPercent + '%';
      label.style.top = pyPercent + '%';
      label.textContent = `[${pt[0]}, ${pt[1]}] t:${tension.toFixed(2)}`;
      editorOverlay.appendChild(label);

      // Green tension handle — offset to the right, distance = tension * 80px (visual)
      if (i < CONFIG.gpsRoute.points.length - 1) {
        const next = CONFIG.gpsRoute.points[i + 1];
        const nextPx = (next[0] / vbW) * 100;
        const nextPy = (next[1] / vbH) * 100;

        // Handle positioned at the bezier control point location
        const dx = nextPx - pxPercent;
        const dy = nextPy - pyPercent;
        const handleX = pxPercent + dx * tension;
        const handleY = pyPercent + dy * (0.1 * (1 - tension));

        const handle = createMarker(handleX, handleY, 'tension-handle', '');
        makeDraggable(handle, (newX, newY) => {
          // Compute new tension from handle position
          const totalDx = nextPx - pxPercent;
          if (Math.abs(totalDx) > 0.5) {
            const newTension = Math.max(0, Math.min(1, (newX - pxPercent) / totalDx));
            CONFIG.gpsRoute.points[i][2] = parseFloat(newTension.toFixed(2));
          } else {
            const totalDy = nextPy - pyPercent;
            if (Math.abs(totalDy) > 0.5) {
              const newTension = Math.max(0, Math.min(1, (newY - pyPercent) / totalDy));
              CONFIG.gpsRoute.points[i][2] = parseFloat(newTension.toFixed(2));
            }
          }
          updateGPSPath();
          rebuildMarkers();
        });

        editorOverlay.appendChild(handle);
        editorMarkers.push({ el: handle, type: 'tension', index: i });

        // Dashed line from point to handle
        const line = document.createElement('div');
        line.className = 'ed-tension-line';
        const lineLen = Math.sqrt(
          Math.pow((handleX - pxPercent) * world.offsetWidth / 100, 2) +
          Math.pow((handleY - pyPercent) * world.offsetHeight / 100, 2)
        );
        const lineAngle = Math.atan2(
          (handleY - pyPercent) * world.offsetHeight / 100,
          (handleX - pxPercent) * world.offsetWidth / 100
        ) * (180 / Math.PI);
        line.style.left = pxPercent + '%';
        line.style.top = pyPercent + '%';
        line.style.width = lineLen + 'px';
        line.style.transform = `rotate(${lineAngle}deg)`;
        editorOverlay.appendChild(line);
      }
    });

    updateEditorInfo();
  }

  // ---- CREATE MARKER ----
  function createMarker(xPercent, yPercent, className, label) {
    const el = document.createElement('div');
    el.className = `ed-marker ${className}`;
    el.style.left = xPercent + '%';
    el.style.top = yPercent + '%';
    el.textContent = label;
    return el;
  }

  // ---- MAKE DRAGGABLE ----
  function makeDraggable(el, onMove) {
    let dragging = false;

    el.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      dragging = true;
      el.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const rect = world.getBoundingClientRect();
      const newX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const newY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      el.style.left = newX + '%';
      el.style.top = newY + '%';
      onMove(parseFloat(newX.toFixed(1)), parseFloat(newY.toFixed(1)));
    });

    window.addEventListener('mouseup', () => {
      if (dragging) { dragging = false; el.style.cursor = 'grab'; }
    });
  }

  // ---- ADD POINT MODE ----
  function toggleAddMode() {
    addPointMode = !addPointMode;
    const btn = document.getElementById('ed-btn-add');
    btn.classList.toggle('active', addPointMode);
    if (addPointMode) {
      editorOverlay.classList.add('ed-crosshair');
    } else {
      editorOverlay.classList.remove('ed-crosshair');
    }
  }

  function onCanvasClick(e) {
    if (!addPointMode) return;
    addPointAtPosition(e);
    // Stay in add mode for multiple adds — click button again to exit
  }

  function onCanvasDoubleClick(e) {
    if (addPointMode) return; // Already handled by click
    addPointAtPosition(e);
  }

  function addPointAtPosition(e) {
    const rect = world.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const vbParts = CONFIG.gpsRoute.viewBox.split(' ').map(Number);
    const svgX = Math.round((xPercent / 100) * vbParts[2]);
    const svgY = Math.round((yPercent / 100) * vbParts[3]);

    // Find the best insertion index (closest segment)
    const points = CONFIG.gpsRoute.points;
    let bestIdx = points.length; // default: append at end
    let bestDist = Infinity;

    for (let i = 0; i < points.length - 1; i++) {
      const ax = points[i][0], ay = points[i][1];
      const bx = points[i + 1][0], by = points[i + 1][1];
      // Distance from new point to segment midpoint
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const dist = Math.sqrt((svgX - mx) ** 2 + (svgY - my) ** 2);
      if (dist < bestDist) { bestDist = dist; bestIdx = i + 1; }
    }

    CONFIG.gpsRoute.points.splice(bestIdx, 0, [svgX, svgY, 0.4]);
    selectedPointIdx = bestIdx;
    updateGPSPath();
    rebuildMarkers();
  }

  // ---- ADD POINT BETWEEN SELECTED & NEXT ----
  function addPointBetween() {
    if (selectedPointIdx === null || selectedPointIdx >= CONFIG.gpsRoute.points.length - 1) {
      console.log('⚠️ Selecciona un punto azul que tenga un siguiente punto.');
      return;
    }
    const curr = CONFIG.gpsRoute.points[selectedPointIdx];
    const next = CONFIG.gpsRoute.points[selectedPointIdx + 1];
    const midX = Math.round((curr[0] + next[0]) / 2);
    const midY = Math.round((curr[1] + next[1]) / 2);
    const midT = ((curr[2] || 0.4) + (next[2] || 0.4)) / 2;

    CONFIG.gpsRoute.points.splice(selectedPointIdx + 1, 0, [midX, midY, parseFloat(midT.toFixed(2))]);
    selectedPointIdx = selectedPointIdx + 1;
    updateGPSPath();
    rebuildMarkers();
  }

  // ---- DELETE SELECTED POINT ----
  function deleteSelectedPoint() {
    if (selectedPointIdx === null) {
      console.log('⚠️ Selecciona un punto azul primero.');
      return;
    }
    if (CONFIG.gpsRoute.points.length <= 2) {
      console.log('⚠️ Necesitas al menos 2 puntos en la ruta.');
      return;
    }
    CONFIG.gpsRoute.points.splice(selectedPointIdx, 1);
    selectedPointIdx = null;
    updateGPSPath();
    rebuildMarkers();
  }

  // ---- UPDATE INFO BAR ----
  function updateEditorInfo() {
    const info = document.getElementById('ed-info');
    if (!info) return;
    const sel = selectedPointIdx !== null
      ? `#${selectedPointIdx} [${CONFIG.gpsRoute.points[selectedPointIdx][0]}, ${CONFIG.gpsRoute.points[selectedPointIdx][1]}] t:${(CONFIG.gpsRoute.points[selectedPointIdx][2] || 0.4).toFixed(2)}`
      : 'ninguno';
    info.textContent = `Puntos: ${CONFIG.gpsRoute.points.length} | Seleccionado: ${sel}`;
  }

  // ---- STOP EDITOR ----
  function stopEditor() {
    if (editorOverlay) { editorOverlay.remove(); editorOverlay = null; }
    if (editorToolbar) { editorToolbar.remove(); editorToolbar = null; }
    editorMarkers = [];
    addPointMode = false;
    selectedPointIdx = null;
    removeEditorStyles();
  }

  // ---- EXPORT ----
  function exportConfig() {
    console.log('%c📋 COORDENADAS ACTUALIZADAS — Copia esto a config.js:', 'color: #4CAF50; font-size: 14px');

    console.log('\n// ---- SECCIONES ----');
    CONFIG.sections.forEach(s => {
      console.log(`  { id: '${s.id}', label: '${s.label}', num: '${s.num}', x: ${s.x}, y: ${s.y} },`);
    });

    console.log('\n// ---- RUTA GPS ----');
    console.log('points: [');
    CONFIG.gpsRoute.points.forEach((p, i) => {
      const t = p[2] !== undefined ? p[2] : 0.4;
      console.log(`  [${p[0]}, ${p[1]}, ${t.toFixed(2)}],  // Punto ${i}`);
    });
    console.log(']');
  }

  function copyToClipboard() {
    let text = '// SECCIONES\nsections: [\n';
    CONFIG.sections.forEach(s => {
      text += `  { id: '${s.id}', label: '${s.label}', num: '${s.num}', x: ${s.x}, y: ${s.y} },\n`;
    });
    text += ']\n\n// RUTA GPS\npoints: [\n';
    CONFIG.gpsRoute.points.forEach((p, i) => {
      const t = p[2] !== undefined ? p[2] : 0.4;
      text += `  [${p[0]}, ${p[1]}, ${t.toFixed(2)}],  // Punto ${i}\n`;
    });
    text += ']\n';

    navigator.clipboard.writeText(text).then(() => {
      console.log('%c✅ Copiado al portapapeles', 'color: #4CAF50; font-weight: bold');
    }).catch(() => {
      console.log('⚠️ No se pudo copiar. Copia manualmente desde la consola.');
    });
  }

})();
