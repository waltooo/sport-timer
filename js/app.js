import { PROGRAMMES, PROGRAMME_ORDER, EXERCISES } from './data.js'
import { buildSequence, Engine } from './timer.js'
import { EX_FRAMES } from './ex-images.js'
import * as Store from './store.js'

const app = document.getElementById('app')
let engine = null
let currentSteps = []
let gifTimer = null
let wakeLock = null
let editState = null // { blocks:[[exId..]], times:[{work,rest,roundRest}], pause }

const ALL_EX = Object.entries(EXERCISES).map(([id, e]) => ({ id, name: e.name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

// ---------- Audio ----------
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
const todayISO = () => new Date().toISOString().slice(0, 10)
function frDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y.slice(2)}`
}
function clearGif() { if (gifTimer) { clearInterval(gifTimer); gifTimer = null } }

// Normalise l'ancien format (tableau) vers { blocks, times, pause }
function normCustom(c) {
  if (!c) return null
  if (Array.isArray(c)) return { blocks: c }
  return c
}
// Programme effectif = défaut + personnalisation locale (exos + temps + pause)
function getProgramme(id) {
  const base = PROGRAMMES[id]
  const c = normCustom(Store.getCustom(id))
  if (!c) return base
  const blocks = base.blocks.map((b, i) => ({
    ...b,
    exercises: (c.blocks && c.blocks[i] && c.blocks[i].length) ? c.blocks[i] : b.exercises,
    work: c.times?.[i]?.work ?? b.work,
    rest: c.times?.[i]?.rest ?? b.rest,
    roundRest: c.times?.[i]?.roundRest ?? b.roundRest,
  }))
  return { ...base, blocks, pause: c.pause ?? base.pause }
}
function effState(id) {
  const p = getProgramme(id)
  return {
    blocks: p.blocks.map((b) => [...b.exercises]),
    times: p.blocks.map((b) => ({ work: b.work, rest: b.rest, roundRest: b.roundRest })),
    pause: p.pause ?? 60,
  }
}

function exVisual(exId) {
  const ex = EXERCISES[exId]
  if (EX_FRAMES[exId]) return `<div class="ex-illus"><img id="ex-gif" src="./icons/ex/${exId}-0.jpg" alt="${ex.name}"></div>`
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
  const h = Store.getHistory()
  const nextId = Store.nextDaySuggestion()
  const lastDayTxt = h.lastDay
    ? `${PROGRAMMES[h.lastDay.id].emoji} ${PROGRAMMES[h.lastDay.id].name} · ${frDate(h.lastDay.date)}`
    : 'aucune encore'
  const soirTxt = h.lastSoir ? frDate(h.lastSoir.date) : 'aucune encore'

  app.innerHTML = `
    <header class="home-head">
      <h1>🏋️ Sport Timer</h1>
      <p class="tagline">Mes séances, mon chrono, hors-ligne.</p>
    </header>
    <div class="history">
      <div class="hist-row"><span>Dernière séance jour</span><b>${lastDayTxt}</b></div>
      <div class="hist-row"><span>→ Prochaine conseillée</span><b>${PROGRAMMES[nextId].emoji} ${PROGRAMMES[nextId].name}</b></div>
      <div class="hist-row"><span>Dernière séance du soir</span><b>${soirTxt}</b></div>
    </div>
    <div class="cards">
      ${PROGRAMME_ORDER.map((id) => {
        const p = PROGRAMMES[id]
        const star = id === nextId ? ' ⭐' : ''
        const custom = Store.hasCustom(id) ? ' <span class="badge">perso</span>' : ''
        return `<div class="card" style="--c:${p.color}">
          <button class="card-start" data-prog="${id}">
            <div class="card-emoji">${p.emoji}</div>
            <div class="card-body">
              <div class="card-title">${p.name}${star}${custom}</div>
              <div class="card-focus">${p.focus}</div>
            </div>
            <div class="card-dur">${p.duration}</div>
          </button>
          <button class="card-edit" data-edit="${id}" title="Personnaliser">✏️</button>
        </div>`
      }).join('')}
    </div>
    <footer class="home-foot">
      <p>Rotation conseillée : A → B → C → D. Séance du soir 1 soir sur 2.</p>
    </footer>`
  app.querySelectorAll('.card-start').forEach((b) => b.addEventListener('click', () => startSession(b.dataset.prog)))
  app.querySelectorAll('.card-edit').forEach((b) => b.addEventListener('click', () => renderEditor(b.dataset.edit)))
}

// ---------- Choix muscu / HIIT / complète ----------
function startSession(progId) {
  const prog = getProgramme(progId)
  if (prog.blocks.length >= 2) return renderChooser(progId, prog)
  runSession(progId, null)
}
function renderChooser(progId, prog) {
  document.body.style.setProperty('--accent', prog.color)
  const labels = ['Muscu seule', 'HIIT seul', 'Bloc 3', 'Bloc 4']
  const blockBtns = prog.blocks.map((b, i) =>
    `<button class="choice" data-only="${i}">${labels[i] || b.title} <small>${b.title}</small></button>`).join('')
  app.innerHTML = `
    <div class="chooser">
      <div class="topbar"><div class="heading">${prog.emoji} ${prog.name}</div>
        <button id="ch-back" class="quit" style="background:#475569">← Retour</button></div>
      <p class="edit-hint">Que veux-tu faire aujourd'hui ?</p>
      <button class="choice primary-choice" data-only="all">▶️ Séance complète <small>muscu + pause + HIIT</small></button>
      ${blockBtns}
    </div>`
  app.querySelector('[data-only="all"]').onclick = () => runSession(progId, null)
  prog.blocks.forEach((_, i) => {
    const el = app.querySelector(`[data-only="${i}"]`); if (el) el.onclick = () => runSession(progId, [i])
  })
  document.getElementById('ch-back').onclick = renderHome
}

// ---------- Éditeur ----------
function optionList(selectedId) {
  return ALL_EX.map((e) => `<option value="${e.id}"${e.id === selectedId ? ' selected' : ''}>${e.name}</option>`).join('')
}
function saveEdit(progId) { Store.setCustom(progId, editState) }

function renderEditor(progId) {
  const prog = PROGRAMMES[progId]
  if (!editState) editState = effState(progId)
  document.body.style.setProperty('--accent', prog.color)

  const blocksHtml = prog.blocks.map((b, bi) => {
    const t = editState.times[bi]
    const rows = editState.blocks[bi].map((exId, ei) => `
      <div class="edit-row">
        <select class="repl" data-b="${bi}" data-e="${ei}">${optionList(exId)}</select>
        <button class="mini danger-btn" data-rm-b="${bi}" data-rm-e="${ei}" ${editState.blocks[bi].length <= 1 ? 'disabled' : ''}>✕</button>
      </div>`).join('')
    return `<div class="edit-block">
      <h3>${b.title} <small>(${editState.blocks[bi].length} exos)</small></h3>
      <div class="edit-times">
        <label>Effort<input type="number" inputmode="numeric" min="5" max="600" class="tnum" data-t="work" data-b="${bi}" value="${t.work}"><span>s</span></label>
        <label>Repos<input type="number" inputmode="numeric" min="0" max="600" class="tnum" data-t="rest" data-b="${bi}" value="${t.rest}"><span>s</span></label>
        <label>Repos tours<input type="number" inputmode="numeric" min="0" max="600" class="tnum" data-t="roundRest" data-b="${bi}" value="${t.roundRest}"><span>s</span></label>
      </div>
      ${rows}
      <div class="edit-add">
        <select data-add="${bi}"><option value="">+ ajouter un exercice…</option>${optionList('')}</select>
      </div>
    </div>`
  }).join('')

  const pauseHtml = prog.blocks.length >= 2
    ? `<div class="edit-block"><h3>Pause entre les blocs</h3>
        <div class="edit-times"><label>Pause<input type="number" inputmode="numeric" min="0" max="600" class="tnum" data-t="pause" value="${editState.pause}"><span>s</span></label></div></div>`
    : ''

  app.innerHTML = `
    <div class="editor">
      <div class="topbar">
        <div class="heading">✏️ Personnaliser — ${prog.emoji} ${prog.name}</div>
        <button id="ed-done" class="quit" style="background:#22c55e">✓ OK</button>
      </div>
      <p class="edit-hint">Change les exercices et les temps (en secondes). Sauvegarde automatique sur ton appareil.</p>
      ${blocksHtml}
      ${pauseHtml}
      <div class="edit-foot">
        <button id="ed-reset" class="reset-btn">↺ Réinitialiser ce programme</button>
      </div>
    </div>`

  app.querySelectorAll('select.repl').forEach((s) => s.addEventListener('change', () => {
    editState.blocks[+s.dataset.b][+s.dataset.e] = s.value; saveEdit(progId); renderEditor(progId)
  }))
  app.querySelectorAll('[data-rm-b]').forEach((b) => b.addEventListener('click', () => {
    const bi = +b.dataset.rmB, ei = +b.dataset.rmE
    if (editState.blocks[bi].length <= 1) return
    editState.blocks[bi].splice(ei, 1); saveEdit(progId); renderEditor(progId)
  }))
  app.querySelectorAll('[data-add]').forEach((s) => s.addEventListener('change', () => {
    if (!s.value) return
    editState.blocks[+s.dataset.add].push(s.value); saveEdit(progId); renderEditor(progId)
  }))
  // Temps : mise à jour sans re-render (pour ne pas perdre le focus)
  app.querySelectorAll('input.tnum').forEach((inp) => inp.addEventListener('change', () => {
    const v = Math.max(0, Math.min(600, parseInt(inp.value, 10) || 0))
    inp.value = v
    if (inp.dataset.t === 'pause') editState.pause = v
    else editState.times[+inp.dataset.b][inp.dataset.t] = v
    saveEdit(progId)
  }))
  document.getElementById('ed-reset').onclick = () => {
    Store.resetCustom(progId); editState = effState(progId); renderEditor(progId)
  }
  document.getElementById('ed-done').onclick = () => { editState = null; renderHome() }
}

// ---------- Session ----------
function runSession(progId, blockFilter) {
  const prog = getProgramme(progId)
  currentSteps = buildSequence(prog, blockFilter ? { blocks: blockFilter } : {})
  document.body.style.setProperty('--accent', prog.color)
  requestWakeLock()
  engine = new Engine(currentSteps, {
    onStep: (step, idx, total) => renderStep(prog, step, idx, total),
    onTick: (rem) => updateTick(rem),
    onDone: () => renderDone(prog, progId),
  })
  engine.start()
}

const phaseClass = (t) => t === 'work' ? 'ph-work' : t === 'rest' ? 'ph-rest' : t === 'prep' ? 'ph-prep' : 'ph-info'

function renderStep(prog, step, idx, total) {
  clearGif()
  const pct = Math.round((idx / (total - 1)) * 100)
  let heading = prog.name
  if (step.type === 'work') heading = `${step.block} · Tour ${step.round}/${step.rounds} · Exo ${step.exIndex}/${step.exCount}`
  else if (step.type === 'rest') heading = step.label.includes('Pause') ? 'Pause' : 'Repos'
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
    main = `<div class="big-label">${step.label}</div>
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

function renderDone(prog, progId) {
  clearGif(); releaseWakeLock()
  Store.recordDone(progId, todayISO())
  beep(880, 0.15); setTimeout(() => beep(1180, 0.25), 160)
  document.body.style.setProperty('--accent', '#22c55e')
  app.innerHTML = `
    <div class="done">
      <div class="done-emoji">✅</div>
      <h2>Séance terminée !</h2>
      <p>${prog.emoji} ${prog.name} — bien joué.</p>
      <p class="done-tip">Enregistrée le ${frDate(todayISO())}. Pense à noter ton ressenti dans ton sport-log 📓</p>
      <button class="primary big" id="btn-home">Retour à l'accueil</button>
    </div>`
  document.getElementById('btn-home').onclick = renderHome
}

// ---------- Service worker ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}

renderHome()
