// Persistance locale (localStorage) : historique des séances + personnalisation.
// Tout est offline, propre à l'appareil.

const K_HIST = 'st.history'
const K_CUSTOM = 'st.custom.' // + progId

const DAY_IDS = ['A', 'B', 'C', 'D']

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function write(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ---------- Historique ----------
// { lastDay: {id, date}, lastSoir: {date} }  (date = ISO 'YYYY-MM-DD')
export function getHistory() {
  return read(K_HIST, { lastDay: null, lastSoir: null })
}
export function recordDone(progId, isoDate) {
  const h = getHistory()
  if (progId === 'soir') h.lastSoir = { date: isoDate }
  else if (DAY_IDS.includes(progId)) h.lastDay = { id: progId, date: isoDate }
  write(K_HIST, h)
}
// Prochaine séance jour conseillée dans la rotation A→B→C→D
export function nextDaySuggestion() {
  const h = getHistory()
  if (!h.lastDay) return 'A'
  const i = DAY_IDS.indexOf(h.lastDay.id)
  return DAY_IDS[(i + 1) % DAY_IDS.length]
}

// ---------- Personnalisation ----------
// custom = tableau parallèle aux blocs : [[exId,...], [exId,...]]  (ou null)
export function getCustom(progId) {
  return read(K_CUSTOM + progId, null)
}
export function setCustom(progId, blocksExercises) {
  write(K_CUSTOM + progId, blocksExercises)
}
export function resetCustom(progId) {
  try { localStorage.removeItem(K_CUSTOM + progId) } catch {}
}
export function hasCustom(progId) {
  return getCustom(progId) != null
}

// ---------- Séances personnalisées ----------
const K_UPROGS = 'st.userprogs'
export function getUserProgs() { return read(K_UPROGS, {}) }
export function getUserProg(id) { return getUserProgs()[id] || null }
export function saveUserProg(p) { const all = getUserProgs(); all[p.id] = p; write(K_UPROGS, all) }
export function deleteUserProg(id) { const all = getUserProgs(); delete all[id]; write(K_UPROGS, all) }

// ---------- Journal des séances (historique détaillé) ----------
const K_SESSIONS = 'st.sessions'
export function getSessions() { return read(K_SESSIONS, []) }
export function addSession(s) {
  const all = getSessions()
  all.push(s)
  write(K_SESSIONS, all)
}
export function deleteSession(id) {
  write(K_SESSIONS, getSessions().filter((s) => s.id !== id))
}

// ---------- Favoris ----------
const K_FAVS = 'st.favs'
export function getFavs() { return read(K_FAVS, []) }
export function isFav(id) { return getFavs().includes(id) }
export function toggleFav(id) {
  const f = getFavs()
  const i = f.indexOf(id)
  if (i >= 0) f.splice(i, 1); else f.push(id)
  write(K_FAVS, f)
  return i < 0 // true si désormais favori
}
