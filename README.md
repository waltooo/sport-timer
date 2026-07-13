# 🏋️ Sport Timer

Une petite **PWA installable et 100% offline** qui déroule mes séances de sport (renfo / HIIT) avec un **chrono automatique** et la **description de chaque exercice**.

> **D'un besoin à une solution.** Je voulais un timer de séance adapté à *mes* contraintes (genoux fragiles → variantes sans saut, mes 4 programmes haut/bas/tronc/full-body, une routine du soir). Plutôt que de passer des heures à tester des apps payantes qui ne collent jamais tout à fait, j'ai utilisé ce temps pour me construire l'outil sur mesure. Ce repo, c'est le résultat.

## Ce que ça fait
- 5 programmes : **Haut du corps**, **Bas du corps**, **Tronc**, **Full body**, **Séance du soir**
- Chrono auto (effort / repos / repos de tour) avec **bips sonores** et **compte à rebours**
- Chaque exercice affiché avec son **nom, le muscle ciblé, une description** (« comment faire ») et une **image animée** de démonstration (2 frames) — parce que le nom seul ne suffit pas à s'en souvenir
- Aperçu de l'exercice **suivant** (pendant l'effort ET les temps de repos)
- Compte à rebours qui passe **en rouge dans les 5 dernières secondes**
- Bouton **Menu** bien visible pour arrêter à tout moment
- **Offline** (service worker) + **installable** sur le téléphone (PWA)
- Garde l'écran allumé pendant la séance (Wake Lock)
- Zéro backend, zéro dépendance, zéro build : du HTML/CSS/JS statique

## Lancer en local
```bash
# n'importe quel serveur statique, ex :
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```
> Un service worker a besoin de `http(s)://` (pas de `file://`).

## Installer sur le téléphone
Ouvrir l'URL (voir *Pages* ci-dessous) dans le navigateur → menu → **Ajouter à l'écran d'accueil**. L'app fonctionne ensuite sans réseau.

## Personnaliser
- **Programmes & exercices** : tout est dans [`js/data.js`](js/data.js) (descriptions, muscles, séries, temps). Facile à éditer.
- **Icônes** : régénérables avec `node scripts/gen-icons.mjs` (encodeur PNG maison, sans dépendance).
- **Images/gifs des exos** *(prochaine itération)* : un emplacement est prévu par exercice pour brancher une base d'exercices open-source.

## Structure
```
index.html            # coquille
css/style.css         # UI mobile-first, thème sombre
js/data.js            # 5 programmes + base d'exercices
js/timer.js           # moteur : construction de la séquence + chrono
js/app.js             # rendu des écrans, audio, wake lock, service worker
sw.js                 # cache offline (app shell)
manifest.webmanifest  # PWA
scripts/gen-icons.mjs # génération des icônes
```

## Feuille de route
- [x] Images de démonstration par exercice (animées, 2 frames) — 25/28 exos couverts
- [ ] Images pour les 3 exos restants (pike push-ups, chaise au mur, burpees)
- [ ] Historique des séances (lien avec mon carnet)
- [ ] Réglage perso des temps effort/repos
- [ ] Voix (annonce de l'exercice suivant)

## Crédits
- Images d'exercices : [free-exercise-db](https://github.com/yuhonas/free-exercise-db) — domaine public (Unlicense). Mapping des exercices → images dans le commit d'intégration ; frames dans `icons/ex/`.

---
Projet perso, construit en pair-programming avec Claude Code. Code sous licence MIT.
