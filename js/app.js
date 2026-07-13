import { PROGRAMMES, PROGRAMME_ORDER, EXERCISES } from './data.js'
import { buildSequence, Engine } from './timer.js'
import { EX_FRAMES } from './ex-images.js'

const app = document.getElementById('app')
let engine = null
let currentSteps = []
let gifTimer = null
let wakeLock = null

// ---------- Audio (bips WebAudio) ----------
let actx = null
function beep(freq = 880, dur = 0.12, vol = 0.25) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)()
    const o = actx.createOscillator(), g = actx.createGain()
    o.frequency.value = freq; o.type = 'sine'; g.gain.value = vol
    o.connect(g); g.connect(actx.destination); o.start()
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur)
    o.stop(actx.currentTime + dur)
  } catch (e) {}
}

// ---------- Wake lock ----------
async function requestWakeLock() {
  try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen') } catch (e) {}
}
function releaseWakeLock() { try { wakeLock && wakeLock.release(); wakeLock = null } catch (e) {} }

// ---------- Helpers ----------
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function clearGif() { if (gifTimer) { clearInterval(gifTimer); gifTimer = null } }

function exVisual(exId) {
  const ex = EXERCISES[exId]
  if (EX_FRAMES[exId]) {
    return `<div class="ex-illus"><img id="ex-gif" src="./icons/ex/${exId}-0.jpg" alt="${ex.name}"></div>`
  }
  return `<div class="ex-illus letter" aria-hidden="true"><span>${ex.name.slice(0, 1)}</span></div>`
}
function animateGif(exId) {
  clearGif()
  const frames = EX_FRAMES[exId]
  if (!frames || frames < 2) return
  let f = 0
  gifTimer = setInterval(() => {
    const img = document.getElementById('ex-gif')
    if (!img) return clearGif()
    f = (f + 1) % frames
    img.src = `./icons/ex/${exId}-${f}.jpg`
  }, 700)
}

// exercice de travail qui suit l'étape idx (saute les repos)
function nextWorkName(idx) {
  for (let j = idx + 1; j < currentSteps.length; j++) {
    if (currentSteps[j].type === 'work') return EXERCISES[currentSteps[j].exId].name
    if (currentSteps[j].type === 'info') return currentSteps[j].label
  }
  return 'Fin de séance'
}

// ---------- Accueil ----------
function renderHome() {
  clearGif(); releaseWakeLock()
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

// ---------- Session ----------
function startSession(progId) {
  const prog = PROGRAMMES[progId]
  currentSteps = buildSequence(prog)
  document.body.style.setProperty('--accent', prog.color)
  requestWakeLock()
  engine = new Engine(currentSteps, {
    onStep: (step, idx, total) => renderStep(prog, step, idx, total),
    onTick: (rem) => updateTick(rem),
    onDone: () => renderDone(prog),
  })
  engine.start()
}

const phaseClass = (t) => t === 'work' ? 'ph-work' : t === 'rest' ? 'ph-rest' : t === 'prep' ? 'ph-prep' : 'ph-info'

function renderStep(prog, step, idx, total) {
  clearGif()
  const pct = Math.round((idx / (total - 1)) * 100)

  // Bandeau du haut : tour / exo (gros), + bouton menu bien visible
  let heading = prog.name
  if (step.type === 'work') heading = `${step.block} · Tour ${step.round}/${step.rounds} · Exo ${step.exIndex}/${step.exCount}`
  else if (step.type === 'rest') heading = 'Repos'
  else heading = step.label

  let main = '', nextLine = ''
  if (step.type === 'work') {
    const ex = EXERCISES[step.exId]
    main = `${exVisual(step.exId)}
      <div class="ex-name">${ex.name}</div>
      <div class="ex-muscle">${ex.muscle}</div>
      <div class="ex-desc">${ex.desc}</div>`
    nextLine = `<div class="next-line">⏭️ Ensuite : <b>${nextWorkName(idx)}</b></div>`
  } else if (step.type === 'rest') {
    const nx = step.nextExId ? EXERCISES[step.nextExId] : null
    main = `<div class="big-label">⏸️ ${step.label}</div>
      ${nx ? `<div class="next">Prépare : <b>${nx.name}</b><div class="next-desc">${nx.desc}</div></div>` : ''}`
  } else if (step.type === 'prep') {
    main = `<div class="big-label">${step.label}</div><div class="next">Mets-toi en place 👟</div>`
    nextLine = `<div class="next-line">⏭️ Ensuite : <b>${nextWorkName(idx)}</b></div>`
  } else {
    main = `<div class="big-label">${step.label}</div><div class="info-text">${step.text}</div>`
  }

  app.innerHTML = `
    <div class="session ${phaseClass(step.type)}">
      <div class="topbar">
        <div class="heading">${heading}</div>
        <button id="btn-quit" class="quit">⏹ Menu</button>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
      <div class="session-main">${main}</div>
      ${nextLine}
      <div class="timer" id="timer">${fmt(step.duration)}</div>
      <div class="controls">
        <button id="btn-prev" title="Précédent">⏮️</button>
        <button id="btn-add" title="+20s">+20s</button>
        <button id="btn-pause" class="primary">⏸️ Pause</button>
        <button id="btn-skip" title="Suivant">⏭️</button>
      </div>
    </div>`

  document.getElementById('btn-pause').onclick = (e) => {
    const paused = engine.togglePause()
    e.target.textContent = paused ? '▶️ Reprendre' : '⏸️ Pause'
  }
  document.getElementById('btn-skip').onclick = () => { beep(600, 0.08); engine.next() }
  document.getElementById('btn-prev').onclick = () => engine.prev()
  document.getElementById('btn-add').onclick = () => engine.addTime(20)
  document.getElementById('btn-quit').onclick = () => { engine.stop(); clearGif(); renderHome() }

  if (step.type === 'work') { beep(940, 0.15); animateGif(step.exId) }
  else if (step.type === 'rest') beep(520, 0.15)
}

function updateTick(rem) {
  const t = document.getElementById('timer')
  if (!t) return
  t.textContent = fmt(rem)
  if (rem <= 5 && rem > 0) { t.classList.add('danger'); beep(760, 0.09) }
  else t.classList.remove('danger')
}

function renderDone(prog) {
  clearGif(); releaseWakeLock()
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

// ---------- Service worker ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}

renderHome()
