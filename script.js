// ---------- Configuración ----------
const FLOORS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1]; // 0 = PB, -1 = Subsuelo
const FLOOR_LABELS = { 0: 'PB', '-1': 'S1' };

// ---------- Referencias ----------
const grid = document.getElementById('floorsGrid');
const currentFloorEl = document.getElementById('currentFloor');
const directionEl = document.getElementById('direction');
const clockEl = document.getElementById('clock');
const toastEl = document.getElementById('toast');
const clickSound = document.getElementById('clickSound');

// ---------- Estado ----------
let currentFloor = 1;
let direction = 'up';
let selectedFloors = new Set();

// ---------- Generar botones ----------
FLOORS.forEach((floor) => {
  const btn = document.createElement('button');
  btn.className = 'floor-btn';
  btn.dataset.floor = floor;
  btn.textContent = FLOOR_LABELS[floor] ?? floor;
  btn.addEventListener('click', (e) => onFloorClick(floor, btn, e));
  grid.appendChild(btn);
});

// ---------- Lógica de click en piso ----------
function onFloorClick(floor, btn, event) {
  playClick();
  createRipple(btn, event);

  if (floor === currentFloor) {
    showToast(`Ya estás en el piso ${labelFor(floor)}`);
    return;
  }

  if (selectedFloors.has(floor)) {
    selectedFloors.delete(floor);
    btn.classList.remove('selected');
    showToast(`Piso ${labelFor(floor)} cancelado`);
  } else {
    selectedFloors.add(floor);
    btn.classList.add('selected');
    showToast(`Piso ${labelFor(floor)} solicitado`);
  }
}

// ---------- Funciones especiales ----------
document.querySelectorAll('.special-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    playClick();
    const action = btn.dataset.action;
    const messages = {
      open: 'Puertas abriendo...',
      close: 'Puertas cerrando...',
      alarm: '¡ALARMA ACTIVADA!',
    };
    showToast(messages[action]);
    if (action === 'alarm') {
      btn.style.animation = 'pulse 0.5s 3';
      setTimeout(() => (btn.style.animation = ''), 1600);
    }
  });
});

// ---------- Ripple ----------
function createRipple(el, event) {
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = (event.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
  const y = (event.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  el.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

// ---------- Sonido ----------
function playClick() {
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  }
}

// ---------- Toast ----------
let toastTimeout;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

// ---------- Etiqueta de piso ----------
function labelFor(floor) {
  return FLOOR_LABELS[floor] ?? floor;
}

// ---------- Reloj ----------
function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
updateClock();
setInterval(updateClock, 1000);

// ---------- Simulación de movimiento (demo) ----------
// En producción, esto se reemplaza con datos reales del controlador del ascensor.
function simulateMovement() {
  if (selectedFloors.size === 0) return;

  const targets = Array.from(selectedFloors).sort((a, b) => a - b);
  const target = direction === 'up' ? targets[targets.length - 1] : targets[0];

  if (currentFloor === target) {
    selectedFloors.delete(target);
    const btn = document.querySelector(`.floor-btn[data-floor="${target}"]`);
    if (btn) btn.classList.remove('selected');
    return;
  }

  const step = direction === 'up' ? 1 : -1;
  const nextFloor = currentFloor + step;

  // Cambiar dirección si es necesario
  if (nextFloor > target && direction === 'up') {
    direction = 'down';
  } else if (nextFloor < target && direction === 'down') {
    direction = 'up';
  }

  currentFloor = nextFloor;
  currentFloorEl.textContent = labelFor(currentFloor);
  directionEl.textContent = direction === 'up' ? '▲ SUBIENDO' : '▼ BAJANDO';
}

setInterval(simulateMovement, 1500);