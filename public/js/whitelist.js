// Backend communication logic
// Check Auth Status on Load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/user');
        const data = await res.json();
        if (data.loggedIn) {
            document.getElementById('login-overlay').style.display = 'none';
            // Pre-fill the discord name or let the live ID handle it
            document.getElementById('live-discord').innerText = data.username;
        }
    } catch (e) {
        console.error('Failed to check auth status');
    }
});       
let currentStep = 1;

// ID Card Expiration Date setup
const today = new Date();
const expDate = new Date(today.setFullYear(today.getFullYear() + 2));
document.getElementById('current-date').innerText = expDate.toLocaleDateString('fr-FR');

// Experience Navigation
document.querySelectorAll('.exp-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.exp-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.getElementById('experience').value = e.currentTarget.getAttribute('data-exp');
    });
});

// Kiosk Path Toggle (Légal / Illégal)
function togglePath() {
    const track = document.getElementById('path-toggle');
    const label = document.getElementById('path-label');
    const input = document.getElementById('ic-path');
    const thumb = document.getElementById('path-thumb');
    const isIllegal = track.classList.contains('illegal');

    if (isIllegal) {
        track.classList.remove('illegal');
        label.innerText = 'CITOYEN MODÈLE (LÉGAL)';
        input.value = 'LÉGAL';
        updateIDCard();
    } else {
        track.classList.add('illegal');
        label.innerText = 'ASSOCIÉ NON ENREGISTRÉ (ILLÉGAL)';
        input.value = 'ILLÉGAL';
        updateIDCard();
    }
}

// Live Data Binding for ID Card
const idName = document.getElementById('live-ic-name');
const idAge = document.getElementById('live-ic-age');
const idPath = document.getElementById('live-ic-path');
const idDiscord = document.getElementById('live-discord');

document.getElementById('ic-name').addEventListener('input', (e) => {
    idName.innerText = e.target.value.trim() === '' ? 'NON RENSEIGNÉ' : e.target.value;
});

document.getElementById('ic-age').addEventListener('input', (e) => {
    idAge.innerText = e.target.value.trim() === '' ? '--' : e.target.value;     
});

document.getElementById('fivem-name').addEventListener('input', (e) => {        
    idDiscord.innerText = e.target.value.trim() === '' ? '---' : e.target.value;
});

function updateIDCard() {
    const val = document.getElementById('ic-path').value;
    idPath.innerText = val === 'LÉGAL' ? 'CLAIRE' : 'INVESTIGATION';
    if (val === 'ILLÉGAL') {
        idPath.style.color = '#E63946';
    } else {
        idPath.style.color = '#FFFFFF';
    }
}

// Form Validation and GSAP Transitions
function validateStep(step) {
    if (step === 1) {
        if (!document.getElementById('ooc-name').value) return false;
        if (!document.getElementById('ooc-age').value) return false;
        if (!document.getElementById('fivem-name').value) return false;
        if (!document.getElementById('experience').value) return false;
    }
    if (step === 2) {
        if (!document.getElementById('ic-name').value) return false;
        if (!document.getElementById('ic-age').value) return false;
    }
    if (step === 3) {
        if (!document.getElementById('ic-story').value) return false;
    }
    return true;
}

function updateProgress() {
    document.getElementById('progress-fill').style.width = `${(currentStep / 3) * 100}%`;
    document.getElementById('current-step-display').innerText = currentStep;    
}

function nextStep(step) {
    if (!validateStep(step)) {
        gsap.fromTo(`.step-active`, { x: -5 }, { x: 5, duration: 0.05, yoyo: true, repeat: 5 });
        return;
    }

    const currentElem = document.getElementById(`step-${step}`);
    const nextElem = document.getElementById(`step-${step + 1}`);

    gsap.to(currentElem, {
        opacity: 0, y: -30, duration: 0.4, ease: "power2.in", onComplete: () => {
            currentElem.classList.remove('step-active');
            nextElem.classList.add('step-active');
            gsap.fromTo(nextElem, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
            currentStep++;
            updateProgress();
        }
    });
}

function prevStep(step) {
    const currentElem = document.getElementById(`step-${step}`);
    const prevElem = document.getElementById(`step-${step - 1}`);

    gsap.to(currentElem, {
        opacity: 0, y: 30, duration: 0.4, ease: "power2.in", onComplete: () => {
            currentElem.classList.remove('step-active');
            prevElem.classList.add('step-active');
            gsap.fromTo(prevElem, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
            currentStep--;
            updateProgress();
        }
    });
}

// --- FINGERPRINT SCAN LOGIC ---
const fpContainer = document.getElementById('fp-container');
let scanTimer;
let isScanning = false;

if (fpContainer) {
    const startScan = (e) => {
        if(e.type !== 'touchstart' && e.button !== 0) return; // only left click or touch
        if (!validateStep(3)) {
            gsap.fromTo(`.step-active`, { x: -5 }, { x: 5, duration: 0.05, yoyo: true, repeat: 5 });
            return;
        }
        isScanning = true;
        fpContainer.classList.add('scanning');

        // Hold for 1.5 seconds to submit
        scanTimer = setTimeout(() => {
            if(isScanning) {
                stopScan();
                submitVisado();
            }
        }, 1500);
    };

    const stopScan = () => {
        isScanning = false;
        fpContainer.classList.remove('scanning');
        clearTimeout(scanTimer);
    };

    fpContainer.addEventListener('mousedown', startScan);
    fpContainer.addEventListener('touchstart', startScan, {passive: true});     

    window.addEventListener('mouseup', stopScan);
    window.addEventListener('touchend', stopScan);
}

function submitVisado() {
    // Check again just in case
    if (!validateStep(3)) return;

    fpContainer.style.pointerEvents = 'none';
    fpContainer.querySelector('.fp-text').innerHTML = 'TRANSMISSION...';        

    const payload = {
        oocName: document.getElementById('ooc-name').value,
        oocAge: document.getElementById('ooc-age').value,
        fivemName: document.getElementById('fivem-name').value,
        experience: document.getElementById('experience').value,
        icName: document.getElementById('ic-name').value,
        icAge: document.getElementById('ic-age').value,
        icPath: document.getElementById('ic-path').value,
        icStory: document.getElementById('ic-story').value
    };

    fetch('/api/submit-visado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(res => res.json())
      .then(data => {
          if(data.success) {
              showSuccess();
          } else {
              throw new Error(data.error || 'Server rejected');
          }
      })
      .catch(err => {
          console.error(err);
          fpContainer.style.pointerEvents = 'auto';
          fpContainer.querySelector('.fp-text').innerHTML = 'ERREUR - RÉESSAYER';
          setTimeout(() => fpContainer.querySelector('.fp-text').innerHTML = 'MAINTENEZ POUR SOUMETTRE', 3000);
      });
}

function showSuccess() {
    const currentElem = document.getElementById(`step-${currentStep}`);
    const successElem = document.getElementById('step-success');
    const scanLine = document.querySelector('.id-scanner');

    if(scanLine) scanLine.style.display = 'none';

    gsap.to(currentElem, {
        opacity: 0, scale: 0.95, duration: 0.5, onComplete: () => {
            currentElem.classList.remove('step-active');
            successElem.classList.add('step-active');
            gsap.fromTo(successElem, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" });

            // Hide header logic
            gsap.to('.wizard-header', {opacity: 0, height: 0, padding: 0, margin: 0, duration: 0.5});
        }
    });
}

