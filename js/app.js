import { PROGRAMMES, PROGRAMME_ORDER, EXERCISES } from './data.js'
import { buildSequence, Engine } from './timer.js'

const app = document.getElementById('app')
let engine = null
let wakeLock = null

// ---------- Audio (bips WebAudio, pas de fichier) ----------
let actx = null
function beep(freq = 880, dur = 0.12, vol = 0.25) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)()
    const o = actx.createOscillator(), g = actx.createGain()
    o.frequency.value = freq; o.type = 'sine'
    g.gain.value = vol
    o.connect(g); g.connect(actx.destination)
    o.start()
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur)
    o.stop(actx.currentTime + dur)
  } catch (e) { /* audio non dispo */ }
}

// ---------- Wake lock (garde l'écran allumé pendant la séance) ----------
async function requestWakeLock() {
  try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen') } catch (e) {}
}
function releaseWakeLock() { try { wakeLock && wakeLock.release(); wakeLock = null } catch (e) {} }

// ---------- Helpers ----------
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
function exImage(exId) {
  // Emplacement image optionnel : icons/ex/<id>.gif|png (ajouté plus tard).
  // Fallback : pastille avec l'initiale du muscle.
  const ex = EXERCISES[exId]
  return `<div class="ex-illus" aria-hidden="true"><span>${ex.name.slice(0, 1)}</span></div>`
}

// ---------- Écran d'accueil ----------
function renderHome() {
  releaseWakeLock()
  document.body.style.setProperty('--accent', '#0ea5e9')
  app.innerHTML = `
    <header class="home-head">
      <h1>🏋️ Sport Timer</h1>
      <p class="tagline">Mes séances, mon chrono, hors-ligne. Choisis un programme.</p>
    </header>
    <div class="cards">
      ${PROGRAMME_ORDER.map((id) => {
        const p = PROGRAMMES[id]
        return `<button class="card" data-prog="${id}" style="--c:${p.color}">
          <div class="card-emoji">${p.emoji}</div>
          <div class="card-body">
            <div class="card-title">${p.name}</div>
            <div class="card-focus">${p.focus}</div>
          </div>
          <div class="card-dur">${p.duration}</div>
        </button>`
      }).join('')}
    </div>
    <footer class="home-foot">
      <p>Rotation conseillée : A → B → C → D. Séance du soir 1 soir sur 2.</p>
      <p class="knee">⚠️ Genoux fragiles : variantes sans saut possibles, garde les genouillères.</p>
    </footer>`
  app.querySelectorAll('.card').forEach((b) =>
    b.addEventListener('click', () => startSession(b.dataset.prog)))
}

// ---------- Session (chrono) ----------
function startSession(progId) {
  const prog = PROGRAMMES[progId]
  const steps = buildSequence(prog)
  document.body.style.setProperty('--accent', prog.color)
  requestWakeLock()

  engine = new Engine(steps, {
    onStep: (step, idx, total) => renderStep(prog, step, idx, total),
    onTick: (rem) => updateTick(rem),
    onDone: () => renderDone(prog),
  })
  engine.start()
}

function phaseClass(type) {
  return type === 'work' ? 'ph-work' : type === 'rest' ? 'ph-rest'
    : type === 'prep' ? 'ph-prep' : 'ph-info'
}

function renderStep(prog, step, idx, total) {
  const pct = Math.round((idx / (total - 1)) * 100)
  let main = ''
  if (step.type === 'work') {
    const ex = EXERCISES[step.exId]
    main = `
      <div class="sub">${step.block} · tour ${step.round}/${step.rounds} · exo ${step.exIndex}/${step.exCount}</div>
      ${exImage(step.exId)}
      <div class="ex-name">${ex.name}</div>
      <div class="ex-muscle">${ex.muscle}</div>
      <div class="ex-desc">${ex.desc}</div>`
  } else if (step.type === 'rest') {
    const nx = step.nextExId ? EXERCISES[step.nextExId] : null
    main = `<div class="big-label">${step.label}</div>
      ${nx ? `<div class="next">⏭️ Ensuite : <b>${nx.name}</b><div class="next-desc">${nx.desc}</div></div>` : ''}`
  } else if (step.type === 'prep') {
    main = `<div class="big-label">${step.label}</div><div class="next">Mets-toi en place 👟</div>`
  } else { // info (échauffement / retour au calme)
    main = `<div class="big-label">${step.label}</div><div class="info-text">${step.text}</div>`
  }

  app.innerHTML = `
    <div class="session ${phaseClass(step.type)}">
      <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
      <div class="session-main">${main}</div>
      <div class="timer" id="timer">${fmt(step.duration)}</div>
      <div class="controls">
        <button id="btn-prev" title="Précédent">⏮️</button>
        <button id="btn-add" title="+20s">+20s</button>
        <button id="btn-pause" class="primary">⏸️ Pause</button>
        <button id="btn-skip" title="Suivant">⏭️</button>
        <button id="btn-quit" title="Quitter">✖️</button>
      </div>
    </div>`

  document.getElementById('btn-pause').onclick = (e) => {
    const paused = engine.togglePause()
    e.target.textContent = paused ? '▶️ Reprendre' : '⏸️ Pause'
  }
  document.getElementById('btn-skip').onclick = () => { beep(600, 0.08); engine.next() }
  document.getElementById('btn-prev').onclick = () => engine.prev()
  document.getElementById('btn-add').onclick = () => engine.addTime(20)
  document.getElementById('btn-quit').onclick = () => { engine.stop(); renderHome() }

  // Bip de changement d'étape
  if (step.type === 'work') beep(940, 0.15)
  else if (step.type === 'rest') beep(520, 0.15)
}

function updateTick(rem) {
  const t = document.getElementById('timer')
  if (!t) return
  t.textContent = fmt(rem)
  if (rem <= 3 && rem > 0) { beep(760, 0.09); t.classList.add('pulse') }
  else t.classList.remove('pulse')
}

function renderDone(prog) {
  releaseWakeLock()
  beep(880, 0.15); setTimeout(() => beep(1180, 0.25), 160)
  document.body.style.setProperty('--accent', '#22c55e')
  app.innerHTML = `
    <div class="done">
      <div class="done-emoji">✅</div>
      <h2>Séance terminée !</h2>
      <p>${prog.emoji} ${prog.name} — bien joué.</p>
      <p class="done-tip">Pense à noter ton ressenti dans ton sport-log 📓</p>
      <button class="primary big" id="btn-home">Retour à l'accueil</button>
    </div>`
  document.getElementById('btn-home').onclick = renderHome
}

// ---------- Service worker (offline) ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('./sw.js').catch(() => {}))
}

renderHome()
