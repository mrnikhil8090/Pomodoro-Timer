// durations in seconds
const DEFAULTS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

const COLORS = {
  focus: '#e84855',
  short: '#3bba9c',
  long: '#5b8dee'
};

const LABELS = {
  focus: 'Focus Time',
  short: 'Short Break',
  long: 'Long Break'
};

// state
let durations = { ...DEFAULTS };
let currentMode = 'focus';
let timeLeft = durations.focus;
let totalTime = durations.focus;
let running = false;
let interval = null;
let sessionCount = 0;

// DOM refs
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const ring = document.getElementById('ring');
const timerCard = document.getElementById('timer-card');
const sessionCountEl = document.getElementById('session-count');
const currentLabel = document.getElementById('current-label');

const CIRCUMFERENCE = 553; // 2 * PI * 88

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateRing() {
  const progress = timeLeft / totalTime;
  const offset = CIRCUMFERENCE * (1 - progress);
  ring.style.strokeDashoffset = offset;
}

function render() {
  timeDisplay.textContent = formatTime(timeLeft);
  updateRing();
  document.title = `${formatTime(timeLeft)} — ${LABELS[currentMode]}`;
}

function tick() {
  if (timeLeft <= 0) {
    clearInterval(interval);
    running = false;
    startBtn.textContent = 'Start';
    timerCard.classList.remove('running');
    onSessionEnd();
    return;
  }
  timeLeft--;
  render();
}

function toggleTimer() {
  if (running) {
    clearInterval(interval);
    running = false;
    startBtn.textContent = 'Resume';
    timerCard.classList.remove('running');
  } else {
    interval = setInterval(tick, 1000);
    running = true;
    startBtn.textContent = 'Pause';
    timerCard.classList.add('running');
  }
}

function resetTimer() {
  clearInterval(interval);
  running = false;
  timeLeft = durations[currentMode];
  totalTime = durations[currentMode];
  startBtn.textContent = 'Start';
  timerCard.classList.remove('running');
  render();
}

function skipSession() {
  clearInterval(interval);
  running = false;
  startBtn.textContent = 'Start';
  timerCard.classList.remove('running');
  onSessionEnd();
}

function onSessionEnd() {
  if (currentMode === 'focus') {
    sessionCount++;
    sessionCountEl.textContent = sessionCount;
    // every 4 focus sessions, suggest a long break
    const nextMode = sessionCount % 4 === 0 ? 'long' : 'short';
    switchMode(nextMode);
  } else {
    switchMode('focus');
  }
}

function switchMode(mode) {
  clearInterval(interval);
  running = false;
  currentMode = mode;
  timeLeft = durations[mode];
  totalTime = durations[mode];

  startBtn.textContent = 'Start';
  timerCard.classList.remove('running');

  // update active tab
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });

  // update theme color
  const color = COLORS[mode];
  document.documentElement.style.setProperty('--active-color', color);

  currentLabel.textContent = LABELS[mode];
  render();
}

function updateDurations() {
  durations.focus = parseInt(document.getElementById('focus-dur').value) * 60 || DEFAULTS.focus;
  durations.short = parseInt(document.getElementById('short-dur').value) * 60 || DEFAULTS.short;
  durations.long  = parseInt(document.getElementById('long-dur').value) * 60 || DEFAULTS.long;
  resetTimer();
}

// init
switchMode('focus');
