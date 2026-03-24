/* ============================================
   GANG MATRIX — Core Logic & Modal System
   Abrams RP — Cybertech / Valorant UI
   ============================================ */

(function () {
  'use strict';

  // ──────────────────────────────────────
  // STATE MANAGER
  // ──────────────────────────────────────
  const STATE = {
    nodes: {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false
    },
    currentNode: null,
    modalData: {
      1: {},
      2: {},
      3: {},
      4: {},
      5: {},
      6: {}
    }
  };

  // ──────────────────────────────────────
  // NODE CONFIGURATION
  // ──────────────────────────────────────
  const NODE_CONFIG = {
    1: { title: 'OPERADOR OOC', template: buildModal1 },
    2: { title: 'IDENTIDAD & LORE IC', template: buildModal2 },
    3: { title: 'LOGÍSTICA & ECONOMÍA', template: buildModal3 },
    4: { title: 'MAPA TÁCTICO', template: buildModal4 },
    5: { title: 'ESCUADRA / ROSTER', template: buildModal5 },
    6: { title: 'DIPLOMACIA & NORMAS', template: buildModal6 }
  };

  // ──────────────────────────────────────
  // DOM REFERENCES
  // ──────────────────────────────────────
  const $overlay = document.getElementById('modalOverlay');
  const $container = document.getElementById('modalContainer');
  const $modalTitle = document.getElementById('modalTitle');
  const $modalBody = document.getElementById('modalBody');
  const $modalClose = document.getElementById('modalClose');
  const $btnSave = document.getElementById('btnSave');
  const $btnTransmit = document.getElementById('btnTransmit');
  const $transmitLock = document.getElementById('transmitLock');
  const $headerCounter = document.getElementById('headerCounter');
  const $successOverlay = document.getElementById('successOverlay');

  // ──────────────────────────────────────
  // INIT
  // ──────────────────────────────────────
  function init() {
    // Bind node clicks
    document.querySelectorAll('.node-card').forEach(card => {
      card.addEventListener('click', () => {
        const nodeId = parseInt(card.dataset.node);
        openModal(nodeId);
      });
    });

    // Close modal
    $modalClose.addEventListener('click', closeModal);
    $overlay.addEventListener('click', (e) => {
      if (e.target === $overlay) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $overlay.classList.contains('active')) {
        closeModal();
      }
    });

    // Save button
    $btnSave.addEventListener('click', handleSave);

    // Transmit button (Sprint 5)
    $btnTransmit.addEventListener('click', handleTransmit);

    // Entrance animation
    animateEntrance();
  }

  // ──────────────────────────────────────
  // ENTRANCE ANIMATION
  // ──────────────────────────────────────
  function animateEntrance() {
    if (typeof gsap === 'undefined') return;

    gsap.from('.dash-header', {
      opacity: 0, y: -20, duration: 0.6, ease: 'power3.out'
    });

    gsap.from('.node-card', {
      opacity: 0, y: 30, scale: 0.95,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from('.dash-footer', {
      opacity: 0, y: 20, duration: 0.5, ease: 'power3.out', delay: 0.7
    });
  }

  // ──────────────────────────────────────
  // MODAL OPEN / CLOSE
  // ──────────────────────────────────────
  function openModal(nodeId) {
    STATE.currentNode = nodeId;
    const config = NODE_CONFIG[nodeId];

    $modalTitle.textContent = config.title;
    $modalBody.innerHTML = '';
    $modalBody.appendChild(config.template(nodeId));

    // Activate modal with slight delay for animation
    requestAnimationFrame(() => {
      $overlay.classList.add('active');
    });
  }

  function closeModal() {
    $overlay.classList.remove('active');
    STATE.currentNode = null;
  }

  // ──────────────────────────────────────
  // SAVE HANDLER
  // ──────────────────────────────────────
  function handleSave() {
    const nodeId = STATE.currentNode;
    if (!nodeId) return;

    // Validate the current modal
    const isValid = validateModal(nodeId);
    if (!isValid) return;

    // Collect data
    collectModalData(nodeId);

    // Mark node verified
    STATE.nodes[nodeId] = true;
    updateNodeUI(nodeId);
    updateHeaderCounter();
    checkAllVerified();

    // Close modal
    closeModal();
  }

  // ──────────────────────────────────────
  // NODE UI UPDATE
  // ──────────────────────────────────────
  function updateNodeUI(nodeId) {
    const card = document.getElementById(`node-${nodeId}`);
    const statusEl = document.getElementById(`status-${nodeId}`);

    card.classList.add('verified');
    statusEl.querySelector('.status-icon').textContent = '✓';
    statusEl.querySelector('.status-label').textContent = 'VERIFICADO';

    // Micro-animation
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(card, { scale: 0.97 }, {
        scale: 1, duration: 0.4, ease: 'back.out(1.7)'
      });
    }
  }

  function updateHeaderCounter() {
    const count = Object.values(STATE.nodes).filter(Boolean).length;
    $headerCounter.textContent = `${count} / 6`;
  }

  // ──────────────────────────────────────
  // CHECK ALL VERIFIED → UNLOCK TRANSMIT
  // ──────────────────────────────────────
  function checkAllVerified() {
    const allDone = Object.values(STATE.nodes).every(v => v === true);
    if (!allDone) return;

    // Pulse all nodes
    document.querySelectorAll('.node-card').forEach(card => {
      card.classList.add('pulse-energy');
    });

    // Reveal transmit button
    $transmitLock.classList.add('hidden');
    $btnTransmit.disabled = false;

    if (typeof gsap !== 'undefined') {
      gsap.to($btnTransmit, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.3,
        onStart: () => $btnTransmit.classList.add('active')
      });
    } else {
      $btnTransmit.classList.add('active');
    }

    // Update header
    document.querySelector('.header-status-text').textContent = 'DOSSIER COMPLETO';
  }

  // ══════════════════════════════════════
  // MODAL TEMPLATES (Sprint 2-4)
  // ══════════════════════════════════════

  // ── MODAL 1: OPERADOR OOC ──
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

    // Bind toggle
    setTimeout(() => {
      const toggle = document.getElementById('sanctionsToggle');
      const wrapper = document.getElementById('sanctionsWrapper');
      const reveal = document.getElementById('sanctionsReveal');
      const label = document.getElementById('sanctionsLabel');

      wrapper.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const isSanctioned = toggle.classList.contains('active');
        reveal.classList.toggle('visible', isSanctioned);
        label.textContent = isSanctioned ? 'SANCIONADO' : 'HISTORIAL LIMPIO';
      });
    }, 50);

    return frag;
  }

  // ── MODAL 2: IDENTIDAD & LORE IC ──
  function buildModal2() {
    const frag = document.createElement('div');
    const gangTypes = [
      { icon: '🔫', label: 'Pandilla' },
      { icon: '🎩', label: 'Mafia' },
      { icon: '💀', label: 'Cártel' },
      { icon: '🏍️', label: 'MC' },
      { icon: '🕸️', label: 'Red Criminal' },
      { icon: '⬡', label: 'Otro' }
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
          ${gangTypes.map(t => `
            <div class="holo-card" data-type="${t.label}">
              <div class="holo-card-icon">${t.icon}</div>
              <div class="holo-card-label">${t.label}</div>
            </div>
          `).join('')}
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
          <input class="gang-input" type="text" id="m2-appearance" placeholder="Colores, estilo, señas de identidad..." required>
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-label">MANIFIESTO REDACTADO</div>
        <p style="font-size: 11px; color: var(--color-text-dim); margin-bottom: 10px; letter-spacing: 0.5px;">
          Escribe la historia y lore de tu organización. Las palabras clave serán detectadas por el sistema.
        </p>
        <div class="manifesto-editor" contenteditable="true" id="manifestoEditor" data-placeholder="Escribe aquí el lore de tu organización..."></div>
      </div>
    `;

    // Bind holographic cards
    setTimeout(() => {
      const grid = document.getElementById('holoGrid');
      if (!grid) return;
      grid.querySelectorAll('.holo-card').forEach(card => {
        card.addEventListener('click', () => {
          grid.querySelectorAll('.holo-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
      });

      // Keyword scanner
      const editor = document.getElementById('manifestoEditor');
      if (editor) {
        const KEYWORDS = /\b(mafia|sangre|drogas|armas|territorio|dinero|c[aá]rtel|muerte)\b/gi;

        editor.addEventListener('input', () => {
          const sel = window.getSelection();
          const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;

          // Get raw text
          const text = editor.innerText;

          // Rebuild with highlights
          const highlighted = text.replace(KEYWORDS, '<span class="keyword-glow">$1</span>');

          if (highlighted !== editor.innerHTML) {
            editor.innerHTML = highlighted;
            // Restore cursor to end
            if (range) {
              const newRange = document.createRange();
              newRange.selectNodeContents(editor);
              newRange.collapse(false);
              sel.removeAllRanges();
              sel.addRange(newRange);
            }
          }
        });
      }
    }, 50);

    return frag;
  }

  // ── MODAL 3: LOGÍSTICA & ECONOMÍA ──
  function buildModal3() {
    const frag = document.createElement('div');
    const sliders = [
      { id: 'drugs', label: 'Narcotráfico' },
      { id: 'weapons', label: 'Tráfico de Armas' },
      { id: 'extortion', label: 'Extorsión' },
      { id: 'robbery', label: 'Robos' },
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
            <input class="gang-slider" type="range" min="0" max="100" value="0" id="slider-${s.id}" data-slider="${s.id}">
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

    // Bind 100-point constraint algorithm
    setTimeout(() => {
      const sliderEls = {};
      const valueEls = {};
      const sliderIds = ['drugs', 'weapons', 'extortion', 'robbery', 'laundering'];
      const $pointsValue = document.getElementById('pointsValue');

      sliderIds.forEach(id => {
        sliderEls[id] = document.getElementById(`slider-${id}`);
        valueEls[id] = document.getElementById(`val-${id}`);
      });

      function getTotal() {
        return sliderIds.reduce((sum, id) => sum + parseInt(sliderEls[id].value), 0);
      }

      function updateDisplay() {
        const total = getTotal();
        const remaining = 100 - total;
        $pointsValue.textContent = remaining;
        $pointsValue.classList.toggle('depleted', remaining <= 0);
        sliderIds.forEach(id => {
          valueEls[id].textContent = sliderEls[id].value;
          // Update track fill via inline background
          const pct = sliderEls[id].value;
          sliderEls[id].style.background = `linear-gradient(90deg, var(--color-accent) ${pct}%, rgba(255,255,255,0.08) ${pct}%)`;
        });
      }

      sliderIds.forEach(id => {
        sliderEls[id].addEventListener('input', () => {
          const currentValue = parseInt(sliderEls[id].value);
          const otherIds = sliderIds.filter(s => s !== id);
          const othersTotal = otherIds.reduce((sum, s) => sum + parseInt(sliderEls[s].value), 0);

          if (currentValue + othersTotal > 100) {
            const excess = (currentValue + othersTotal) - 100;
            // Proportionally reduce others
            let reduced = 0;
            const otherValues = otherIds.map(s => ({ id: s, val: parseInt(sliderEls[s].value) }));
            const otherSum = otherValues.reduce((s, o) => s + o.val, 0);

            if (otherSum > 0) {
              otherValues.forEach(o => {
                const reduction = Math.round((o.val / otherSum) * excess);
                const newVal = Math.max(0, o.val - reduction);
                sliderEls[o.id].value = newVal;
                reduced += o.val - newVal;
              });

              // Handle rounding errors
              if (reduced < excess) {
                for (const o of otherValues) {
                  const diff = excess - reduced;
                  if (diff <= 0) break;
                  const cv = parseInt(sliderEls[o.id].value);
                  const reduce = Math.min(cv, diff);
                  sliderEls[o.id].value = cv - reduce;
                  reduced += reduce;
                }
              }
            } else {
              // All others are 0, cap current slider
              sliderEls[id].value = 100;
            }
          }

          updateDisplay();
        });
      });

      updateDisplay();
    }, 50);

    return frag;
  }

  // ── MODAL 4: MAPA TÁCTICO ──
  function buildModal4() {
    const frag = document.createElement('div');
    frag.innerHTML = `
      <div class="modal-section">
        <div class="modal-section-label">TERRITORIO DE OPERACIÓN</div>
        <div class="map-container" id="mapContainer">
          <!-- Pin injected dynamically -->
        </div>
        <div class="gang-form-grid">
          <div class="gang-input-group">
            <label class="gang-label">Nombre de la Zona Reclamada</label>
            <input class="gang-input" type="text" id="m4-zone-name" placeholder="Ej: Puerto Sur de Los Santos" required>
          </div>
          <div class="gang-input-group">
            <label class="gang-label">Coordenadas Tácticas</label>
            <input class="gang-input terminal" type="text" id="m4-coords" readonly placeholder="[ HAZ CLIC EN EL MAPA ]">
          </div>
        </div>
      </div>
    `;

    // Bind map click
    setTimeout(() => {
      const map = document.getElementById('mapContainer');
      const coordsInput = document.getElementById('m4-coords');
      if (!map) return;

      map.addEventListener('click', (e) => {
        const rect = map.getBoundingClientRect();
        const xPct = ((e.clientX - rect.left) / rect.width) * 100;
        const yPct = ((e.clientY - rect.top) / rect.height) * 100;

        // Remove existing pin
        const oldPin = map.querySelector('.map-pin');
        if (oldPin) oldPin.remove();

        // Create new pin
        const pin = document.createElement('div');
        pin.className = 'map-pin';
        pin.style.left = `${xPct}%`;
        pin.style.top = `${yPct}%`;
        pin.innerHTML = `
          <div class="map-pin-core"></div>
          <div class="map-pin-ring"></div>
        `;
        map.appendChild(pin);

        // Calculate fake GTA coords (-4000 to +4000)
        const lat = ((xPct / 100) * 8000 - 4000).toFixed(2);
        const lng = ((yPct / 100) * -8000 + 4000).toFixed(2);
        coordsInput.value = `[ LAT: ${lat} | LNG: ${lng} ]`;

        // GSAP pin animation
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(pin, { scale: 0, opacity: 0 }, {
            scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)'
          });
        }
      });
    }, 50);

    return frag;
  }

  // ── MODAL 5: ESCUADRA / ROSTER ──
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
        <div class="modal-section-label">MIEMBROS DEL ESCUADRÓN</div>
        <div class="roster-container" id="rosterContainer">
          <!-- Leader card (non-removable) -->
          <div class="roster-card" data-roster-id="1">
            <div class="roster-card-header">
              <span class="roster-card-tag">LÍDER — #1</span>
            </div>
            <div class="gang-input-group">
              <label class="gang-label">Nombre IC</label>
              <input class="gang-input roster-name" type="text" placeholder="Nombre en personaje" required>
            </div>
            <div class="gang-input-group">
              <label class="gang-label">Discord OOC</label>
              <input class="gang-input roster-discord" type="text" placeholder="usuario#0000" required>
            </div>
            <div class="gang-input-group">
              <label class="gang-label">Rango</label>
              <input class="gang-input roster-rank" type="text" value="Líder" readonly>
            </div>
          </div>
        </div>
        <button class="btn-add-operative" id="btnAddOperative" type="button">
          <span>+</span> AÑADIR OPERATIVO
        </button>
      </div>
    `;

    setTimeout(() => {
      const container = document.getElementById('rosterContainer');
      const btnAdd = document.getElementById('btnAddOperative');
      let rosterCount = 1;

      if (!btnAdd) return;

      btnAdd.addEventListener('click', () => {
        rosterCount++;
        const card = document.createElement('div');
        card.className = 'roster-card';
        card.dataset.rosterId = rosterCount;
        card.innerHTML = `
          <div class="roster-card-header">
            <span class="roster-card-tag">OPERATIVO — #${rosterCount}</span>
            <button class="roster-card-remove" type="button">✕</button>
          </div>
          <div class="gang-input-group">
            <label class="gang-label">Nombre IC</label>
            <input class="gang-input roster-name" type="text" placeholder="Nombre en personaje">
          </div>
          <div class="gang-input-group">
            <label class="gang-label">Discord OOC</label>
            <input class="gang-input roster-discord" type="text" placeholder="usuario#0000">
          </div>
          <div class="gang-input-group">
            <label class="gang-label">Rango</label>
            <input class="gang-input roster-rank" type="text" placeholder="Soldado, Sicario, etc.">
          </div>
        `;

        // Bind remove
        card.querySelector('.roster-card-remove').addEventListener('click', () => {
          if (typeof gsap !== 'undefined') {
            gsap.to(card, {
              opacity: 0, scale: 0.9, height: 0, duration: 0.3, ease: 'power2.in',
              onComplete: () => card.remove()
            });
          } else {
            card.remove();
          }
        });

        container.appendChild(card);
      });
    }, 50);

    return frag;
  }

  // ── MODAL 6: DIPLOMACIA & NORMAS ──
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
          ${rules.map((r, i) => `
            <div class="rule-item">
              <span class="rule-text">${r}</span>
              <div class="seal-container" data-seal="${i}" id="seal-${i}">
                <svg class="seal-svg" viewBox="0 0 40 40">
                  <circle class="seal-bg" cx="20" cy="20" r="18"/>
                  <circle class="seal-progress" cx="20" cy="20" r="18"/>
                </svg>
                <span class="seal-icon">🔒</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind hold-to-unlock seals
    setTimeout(() => {
      const HOLD_DURATION = 1500; // 1.5 seconds
      const circumference = 2 * Math.PI * 18; // ~113

      document.querySelectorAll('.seal-container').forEach(seal => {
        if (seal.classList.contains('broken')) return;

        let holdTimer = null;
        let startTime = 0;
        let animFrame = null;

        const progressCircle = seal.querySelector('.seal-progress');
        progressCircle.style.strokeDasharray = circumference;
        progressCircle.style.strokeDashoffset = circumference;

        function startHold() {
          if (seal.classList.contains('broken')) return;
          startTime = Date.now();

          function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / HOLD_DURATION, 1);
            const offset = circumference * (1 - progress);
            progressCircle.style.strokeDashoffset = offset;

            if (progress >= 1) {
              // Seal broken!
              seal.classList.add('broken');
              seal.querySelector('.seal-icon').textContent = '🔓';
              return;
            }

            animFrame = requestAnimationFrame(animate);
          }

          animFrame = requestAnimationFrame(animate);
        }

        function stopHold() {
          if (seal.classList.contains('broken')) return;
          cancelAnimationFrame(animFrame);
          progressCircle.style.strokeDashoffset = circumference;
        }

        // Mouse events
        seal.addEventListener('mousedown', startHold);
        seal.addEventListener('mouseup', stopHold);
        seal.addEventListener('mouseleave', stopHold);

        // Touch events
        seal.addEventListener('touchstart', (e) => {
          e.preventDefault();
          startHold();
        });
        seal.addEventListener('touchend', stopHold);
        seal.addEventListener('touchcancel', stopHold);
      });
    }, 50);

    return frag;
  }

  // ══════════════════════════════════════
  // VALIDATION PER MODAL
  // ══════════════════════════════════════
  function validateModal(nodeId) {
    switch (nodeId) {
      case 1: return validateModal1();
      case 2: return validateModal2();
      case 3: return validateModal3();
      case 4: return validateModal4();
      case 5: return validateModal5();
      case 6: return validateModal6();
      default: return false;
    }
  }

  function validateModal1() {
    const name = val('m1-name');
    const age = val('m1-age');
    const discord = val('m1-discord');
    const exp = val('m1-experience');

    if (!name || !age || !discord || !exp) {
      shakeButton();
      return false;
    }

    const toggle = document.getElementById('sanctionsToggle');
    if (toggle && toggle.classList.contains('active')) {
      const detail = val('m1-sanction-detail');
      if (!detail) { shakeButton(); return false; }
    }

    return true;
  }

  function validateModal2() {
    const orgName = val('m2-org-name');
    const selected = document.querySelector('.holo-card.selected');
    const goalsS = val('m2-goals-short');
    const goalsL = val('m2-goals-long');
    const appearance = val('m2-appearance');
    const manifesto = document.getElementById('manifestoEditor');
    const lore = manifesto ? manifesto.innerText.trim() : '';

    if (!orgName || !selected || !goalsS || !goalsL || !appearance || !lore) {
      shakeButton();
      return false;
    }
    return true;
  }

  function validateModal3() {
    const sliderIds = ['drugs', 'weapons', 'extortion', 'robbery', 'laundering'];
    const total = sliderIds.reduce((sum, id) => {
      const el = document.getElementById(`slider-${id}`);
      return sum + (el ? parseInt(el.value) : 0);
    }, 0);

    const front = val('m3-front');

    if (total !== 100 || !front) {
      shakeButton();
      return false;
    }
    return true;
  }

  function validateModal4() {
    const zone = val('m4-zone-name');
    const coords = val('m4-coords');

    if (!zone || !coords) {
      shakeButton();
      return false;
    }
    return true;
  }

  function validateModal5() {
    const timezone = val('m5-timezone');
    const leaderCard = document.querySelector('.roster-card[data-roster-id="1"]');
    if (!timezone || !leaderCard) { shakeButton(); return false; }

    const leaderName = leaderCard.querySelector('.roster-name');
    const leaderDiscord = leaderCard.querySelector('.roster-discord');
    if (!leaderName.value.trim() || !leaderDiscord.value.trim()) {
      shakeButton();
      return false;
    }
    return true;
  }

  function validateModal6() {
    const stance = val('m6-stance');
    const seals = document.querySelectorAll('.seal-container');
    const allBroken = Array.from(seals).every(s => s.classList.contains('broken'));

    if (!stance || !allBroken) {
      shakeButton();
      return false;
    }
    return true;
  }

  // ══════════════════════════════════════
  // DATA COLLECTION (Sprint 5)
  // ══════════════════════════════════════
  function collectModalData(nodeId) {
    switch (nodeId) {
      case 1:
        STATE.modalData[1] = {
          name: val('m1-name'),
          age: val('m1-age'),
          discord: val('m1-discord'),
          experience: val('m1-experience'),
          sanctioned: document.getElementById('sanctionsToggle')?.classList.contains('active') || false,
          sanctionDetail: val('m1-sanction-detail') || ''
        };
        break;
      case 2: {
        const selected = document.querySelector('.holo-card.selected');
        const editor = document.getElementById('manifestoEditor');
        STATE.modalData[2] = {
          orgName: val('m2-org-name'),
          type: selected ? selected.dataset.type : '',
          goalsShort: val('m2-goals-short'),
          goalsLong: val('m2-goals-long'),
          appearance: val('m2-appearance'),
          lore: editor ? editor.innerText.trim() : ''
        };
        break;
      }
      case 3: {
        const ids = ['drugs', 'weapons', 'extortion', 'robbery', 'laundering'];
        const economy = {};
        ids.forEach(id => {
          const el = document.getElementById(`slider-${id}`);
          economy[id] = el ? parseInt(el.value) : 0;
        });
        economy.front = val('m3-front');
        STATE.modalData[3] = economy;
        break;
      }
      case 4:
        STATE.modalData[4] = {
          zoneName: val('m4-zone-name'),
          coords: val('m4-coords')
        };
        break;
      case 5: {
        const cards = document.querySelectorAll('.roster-card');
        const roster = [];
        cards.forEach(card => {
          const name = card.querySelector('.roster-name')?.value.trim();
          const discord = card.querySelector('.roster-discord')?.value.trim();
          const rank = card.querySelector('.roster-rank')?.value.trim();
          if (name) roster.push({ name, discord, rank });
        });
        STATE.modalData[5] = {
          timezone: val('m5-timezone'),
          roster
        };
        break;
      }
      case 6:
        STATE.modalData[6] = {
          stance: val('m6-stance'),
          rulesAccepted: true
        };
        break;
    }
  }

  // ══════════════════════════════════════
  // COMPILE DOSSIER (Sprint 5)
  // ══════════════════════════════════════
  function compileDossier() {
    return {
      ooc: STATE.modalData[1],
      ic: STATE.modalData[2],
      economy: STATE.modalData[3],
      territory: STATE.modalData[4],
      roster: STATE.modalData[5],
      diplomacy: STATE.modalData[6]
    };
  }

  // ══════════════════════════════════════
  // TRANSMIT HANDLER (Sprint 5)
  // ══════════════════════════════════════
  async function handleTransmit() {
    if ($btnTransmit.disabled || $btnTransmit.classList.contains('loading')) return;

    const dossier = compileDossier();

    // State 1: Encrypting
    $btnTransmit.classList.add('loading');
    $btnTransmit.querySelector('.transmit-text').textContent = 'ENCRIPTANDO Y TRANSMITIENDO...';

    try {
      const response = await fetch('/api/submit-gang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dossier)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // State 2A: Success
      showSuccess();

    } catch (error) {
      console.error('Transmission failed:', error);
      // State 2B: Error
      $btnTransmit.classList.remove('loading');
      $btnTransmit.classList.add('error');
      $btnTransmit.querySelector('.transmit-text').textContent = 'TRANSMISIÓN INTERCEPTADA — REINTENTAR';

      setTimeout(() => {
        $btnTransmit.classList.remove('error');
      }, 2000);
    }
  }

  // ══════════════════════════════════════
  // SUCCESS SEQUENCE
  // ══════════════════════════════════════
  function showSuccess() {
    // Fade out dashboard
    if (typeof gsap !== 'undefined') {
      gsap.to('#dashboard', {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: 'power2.in',
        onComplete: () => {
          $successOverlay.classList.add('active');
        }
      });
    } else {
      document.getElementById('dashboard').style.opacity = '0';
      $successOverlay.classList.add('active');
    }

    // Redirect after 4 seconds
    setTimeout(() => {
      window.location.href = '/';
    }, 4000);
  }

  // ══════════════════════════════════════
  // UTILITY FUNCTIONS
  // ══════════════════════════════════════
  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function shakeButton() {
    if (typeof gsap !== 'undefined') {
      gsap.fromTo($btnSave, { x: -6 }, {
        x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)'
      });
    }
  }

  // ──────────────────────────────────────
  // BOOT
  // ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

})();
