// Base d'exercices + programmes.
// Chaque exo a une description "comment faire" (pour se souvenir sans image),
// et un champ `image` optionnel (fichier dans icons/ex/ ajouté plus tard).

export const EXERCISES = {
  pompes:            { name: 'Pompes',                       muscle: 'Pecs, triceps',        desc: "Mains sous les épaules, corps gainé, descendre la poitrine près du sol. Sur les genoux si besoin." },
  pompes_diamant:    { name: 'Pompes diamant',               muscle: 'Triceps',              desc: "Mains jointes en losange sous la poitrine." },
  pike_pushups:      { name: 'Pike push-ups',                muscle: 'Épaules',              desc: "En V inversé (fesses en l'air), fléchir les coudes pour amener la tête vers le sol." },
  rowing:            { name: 'Rowing élastique / sac',       muscle: 'Dos',                  desc: "Buste penché, tirer la charge vers le ventre, serrer les omoplates." },
  dips:              { name: 'Dips sur chaise',              muscle: 'Triceps',              desc: "Mains au bord de la chaise, descendre le corps en pliant les coudes." },
  superman_tirage:   { name: 'Superman tirage',              muscle: 'Dos, lombaires',       desc: "À plat ventre, lever bras + jambes puis tirer les coudes vers les hanches ('W')." },

  squats:            { name: 'Squats amplitude modérée',     muscle: 'Quadris, fessiers',    desc: "Pousser les fesses en arrière, dos droit, descendre jusqu'à ~90°." },
  fentes_arriere:    { name: 'Fentes arrière',               muscle: 'Jambes',               desc: "Reculer une jambe et fléchir les deux jambes à 90°, buste droit." },
  pont_fessier:      { name: 'Pont fessier',                 muscle: 'Fessiers, ischios',    desc: "Allongé, pieds au sol, pousser le bassin vers le haut, serrer les fessiers en haut." },
  rdl:               { name: 'Soulevé de terre jambes tendues', muscle: 'Ischios, fessiers, dos', desc: "Charge (haltères/sac) ou 1 jambe. Buste qui descend, dos plat, sentir l'étirement des ischios." },
  mollets:           { name: 'Mollets',                      muscle: 'Mollets',              desc: "Relevés sur la pointe des pieds, lentement, pause en haut." },
  wall_sit:          { name: 'Chaise contre le mur',         muscle: 'Quadris (iso)',        desc: "Dos au mur, cuisses à l'horizontale, on tient (isométrique)." },

  planche:           { name: 'Gainage planche',              muscle: 'Tronc',                desc: "Appui avant-bras, corps aligné, ventre gainé, ne pas creuser le dos." },
  planche_laterale:  { name: 'Planche latérale',             muscle: 'Obliques',             desc: "Sur un avant-bras, corps de profil aligné. Change de côté à mi-temps." },
  crunchs:           { name: 'Crunchs',                      muscle: 'Abdos',                desc: "Décoller les épaules en soufflant, sans tirer sur la nuque." },
  releves_jambes:    { name: 'Relevés de jambes',            muscle: 'Bas des abdos',        desc: "Jambes tendues, les monter/descendre sans décoller le bas du dos." },
  superman:          { name: 'Superman',                     muscle: 'Bas du dos',           desc: "À plat ventre, lever buste + jambes." },
  russian_twists:    { name: 'Russian twists',               muscle: 'Obliques',             desc: "Assis, buste incliné, pivoter d'un côté à l'autre (charge en option)." },

  mountain_climbers: { name: 'Mountain climbers',            muscle: 'Cardio, tronc',        desc: "En planche, ramener les genoux vers la poitrine en alternance, rythme soutenu." },
  shoulder_taps:     { name: 'Planche shoulder taps',        muscle: 'Tronc',                desc: "En planche, toucher l'épaule opposée en alternance sans bouger le bassin." },
  walkouts:          { name: 'Walkouts / inchworm',          muscle: 'Full-body',            desc: "Debout, mains au sol, marcher les mains jusqu'en planche puis revenir. Zéro impact." },
  bear_crawl:        { name: 'Bear crawl',                   muscle: 'Full-body',            desc: "À quatre pattes genoux décollés, avancer/reculer (main et pied opposés)." },
  squats_sautes:     { name: 'Squats sautés',                muscle: 'Jambes, cardio',       desc: "Squat puis saut, réception souple, genoux dans l'axe. Variante : squats rapides sans saut." },
  fentes_marchees:   { name: 'Fentes marchées',             muscle: 'Jambes',               desc: "Avancer en fentes alternées." },
  speed_skaters:     { name: 'Speed skaters',                muscle: 'Jambes, cardio',       desc: "Pas latéraux souples d'un pied sur l'autre." },
  pont_dynamique:    { name: 'Pont fessier dynamique',       muscle: 'Fessiers',             desc: "Monter / descendre le bassin en rythme." },
  bicycle:           { name: 'Bicycle crunch',               muscle: 'Abdos',                desc: "Pédalage coude-genou opposé." },
  burpees:           { name: 'Burpees',                      muscle: 'Full-body',            desc: "Squat, mains au sol, pieds en arrière, (pompe), revenir, (saut). Variante sans saut." },
}

// Textes d'échauffement / retour au calme (étapes "info", chrono skippable).
const WARMUP_DEFAULT = "Rotations articulaires (épaules, hanches, chevilles) · marche rapide sur place + montées de genoux douces · quelques squats et pompes lents. Monter en température sans choquer les genoux."
const COOLDOWN_DEFAULT = "Étirements tenus 20-30s : quadriceps, ischios, mollets, fléchisseurs de hanche, dos + fessiers. Finir par 4-5 respirations lentes."
const COOLDOWN_SOIR = "Étirements (20-30s) : ischios, quadris, fessiers (figure-4), posture de l'enfant, poitrine. Puis respiration lente : inspire 4s / expire 6s (cohérence cardiaque) OU 4-7-8 (inspire 4s, bloque 7s, expire 8s). C'est ça qui t'endort."

export const PROGRAMMES = {
  A: {
    id: 'A', name: 'Haut du corps', emoji: '💪', color: '#3b82f6',
    focus: 'Pecs, dos, épaules, bras', duration: '~45 min',
    warmup: WARMUP_DEFAULT,
    pause: 60,
    blocks: [
      { title: 'Circuit muscu', rounds: 3, work: 40, rest: 20, roundRest: 45,
        exercises: ['pompes', 'pompes_diamant', 'pike_pushups', 'rowing', 'dips', 'superman_tirage'] },
      { title: 'Finisher', rounds: 3, work: 30, rest: 30, roundRest: 60,
        exercises: ['walkouts', 'mountain_climbers', 'shoulder_taps', 'bear_crawl'] },
    ],
    cooldown: COOLDOWN_DEFAULT,
  },
  B: {
    id: 'B', name: 'Bas du corps', emoji: '🦵', color: '#22c55e',
    focus: 'Quadris, ischios, fessiers, mollets', duration: '~45 min',
    warmup: WARMUP_DEFAULT,
    pause: 60,
    blocks: [
      { title: 'Circuit muscu', rounds: 3, work: 40, rest: 20, roundRest: 45,
        exercises: ['squats', 'fentes_arriere', 'pont_fessier', 'rdl', 'mollets', 'wall_sit'] },
      { title: 'Finisher', rounds: 3, work: 30, rest: 30, roundRest: 60,
        exercises: ['squats_sautes', 'fentes_marchees', 'speed_skaters', 'pont_dynamique'] },
    ],
    cooldown: COOLDOWN_DEFAULT,
  },
  C: {
    id: 'C', name: 'Tronc', emoji: '🎯', color: '#f59e0b',
    focus: 'Abdos, obliques, lombaires', duration: '~45 min',
    warmup: WARMUP_DEFAULT,
    pause: 60,
    blocks: [
      { title: 'Circuit muscu', rounds: 3, work: 40, rest: 20, roundRest: 45,
        exercises: ['planche', 'planche_laterale', 'crunchs', 'releves_jambes', 'superman', 'russian_twists'] },
      { title: 'Finisher', rounds: 3, work: 30, rest: 30, roundRest: 60,
        exercises: ['mountain_climbers', 'shoulder_taps', 'walkouts', 'bicycle'] },
    ],
    cooldown: COOLDOWN_DEFAULT,
  },
  D: {
    id: 'D', name: 'Full body', emoji: '🔥', color: '#ef4444',
    focus: 'Tout le corps', duration: '~45 min',
    warmup: WARMUP_DEFAULT,
    pause: 60,
    blocks: [
      { title: 'Circuit muscu', rounds: 3, work: 40, rest: 20, roundRest: 45,
        exercises: ['pompes', 'squats', 'pont_fessier', 'planche', 'dips', 'superman'] },
      { title: 'Finisher', rounds: 3, work: 30, rest: 30, roundRest: 60,
        exercises: ['mountain_climbers', 'squats_sautes', 'walkouts', 'burpees'] },
    ],
    cooldown: COOLDOWN_DEFAULT,
  },
  soir: {
    id: 'soir', name: 'Séance du soir', emoji: '🌙', color: '#8b5cf6',
    focus: 'Tronc + posture, basse intensité, avant le coucher', duration: '~12 min',
    warmup: null,
    blocks: [
      { title: 'Renfo doux', rounds: 2, work: 40, rest: 30, roundRest: 40,
        exercises: ['pompes', 'planche', 'pont_fessier'] },
    ],
    cooldown: COOLDOWN_SOIR,
  },
}

export const PROGRAMME_ORDER = ['A', 'B', 'C', 'D', 'soir']

// Fabrique une séance personnalisée (créée par l'utilisateur)
export function makeUserProg(id, name, emoji) {
  return {
    id, name: name || 'Ma séance', emoji: emoji || '🏖️', color: '#e4381C',
    focus: 'Séance personnalisée', duration: 'perso', user: true,
    warmup: WARMUP_DEFAULT, pause: 60,
    blocks: [
      { title: 'Circuit', rounds: 3, work: 40, rest: 20, roundRest: 45,
        exercises: ['pompes', 'squats', 'planche'] },
    ],
    cooldown: COOLDOWN_DEFAULT,
  }
}
