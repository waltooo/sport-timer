// Construit la séquence d'étapes d'un programme et pilote le chrono.
import { EXERCISES } from './data.js'

// Transforme un programme en liste plate d'étapes chronométrées.
// Types : 'prep' | 'info' | 'work' | 'rest'
export function buildSequence(prog) {
  const steps = []
  steps.push({ type: 'prep', label: 'Prêt ?', duration: 10 })

  if (prog.warmup) {
    steps.push({ type: 'info', label: 'Échauffement', text: prog.warmup, duration: 300 })
  }

  prog.blocks.forEach((block) => {
    for (let r = 1; r <= block.rounds; r++) {
      block.exercises.forEach((exId, i) => {
        steps.push({
          type: 'work', exId, label: EXERCISES[exId].name, duration: block.work,
          block: block.title, round: r, rounds: block.rounds,
          exIndex: i + 1, exCount: block.exercises.length,
        })
        const lastExOfLastRound = r === block.rounds && i === block.exercises.length - 1
        if (!lastExOfLastRound) {
          const isRoundEnd = i === block.exercises.length - 1
          steps.push({
            type: 'rest',
            label: isRoundEnd ? `Repos — tour ${r + 1}/${block.rounds}` : 'Repos',
            duration: isRoundEnd ? block.roundRest : block.rest,
            nextExId: isRoundEnd ? block.exercises[0] : block.exercises[i + 1],
          })
        }
      })
    }
  })

  if (prog.cooldown) {
    steps.push({ type: 'info', label: 'Retour au calme', text: prog.cooldown, duration: 300 })
  }
  return steps
}

export class Engine {
  constructor(steps, { onTick, onStep, onDone }) {
    this.steps = steps
    this.i = 0
    this.remaining = steps[0].duration
    this.paused = true
    this.onTick = onTick
    this.onStep = onStep
    this.onDone = onDone
    this._int = null
  }

  start() {
    this.paused = false
    this._emitStep()
    this._loop()
  }

  _loop() {
    clearInterval(this._int)
    this._int = setInterval(() => {
      if (this.paused) return
      this.remaining -= 1
      if (this.remaining <= 0) {
        this.next()
      } else {
        this.onTick(this.remaining)
      }
    }, 1000)
  }

  next() {
    if (this.i >= this.steps.length - 1) {
      clearInterval(this._int)
      this.onDone()
      return
    }
    this.i += 1
    this.remaining = this.steps[this.i].duration
    this._emitStep()
  }

  prev() {
    this.i = Math.max(0, this.i - 1)
    this.remaining = this.steps[this.i].duration
    this._emitStep()
  }

  addTime(sec) {
    this.remaining = Math.max(1, this.remaining + sec)
    this.onTick(this.remaining)
  }

  togglePause() {
    this.paused = !this.paused
    return this.paused
  }

  stop() { clearInterval(this._int) }

  _emitStep() {
    const step = this.steps[this.i]
    this.onStep(step, this.i, this.steps.length)
    this.onTick(this.remaining)
  }
}
