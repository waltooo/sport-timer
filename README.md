# 🏋️ Sport Timer

A tiny **offline, installable PWA** that runs my workout sessions (strength + HIIT) with an **automatic timer** and a **demo image for every exercise**.

> A personal project: rather than fight with generic fitness apps that never quite fit, I built the tool I actually wanted. Live demo: **https://waltooo.github.io/sport-timer/**

## Features

- **5 built-in programs** — Upper body, Lower body, Core, Full body, Evening — **plus your own custom sessions**
- **Automatic timer**: work → rest → round rest → inter-block pause, with beeps and a big countdown that **turns red for the last 5 seconds**
- Every exercise shows its **name, target muscle, description and an animated demo image**
- **Preview of the next exercise** during effort and rest
- Run the **full session** or just the **strength** or **HIIT** block
- **Editable programs**: swap / remove / add exercises and adjust the times — saved locally
- **Create your own sessions** (name + emoji), e.g. a "Holiday" routine
- **Exercise library**: 488 movements, searchable and filterable by muscle, with ❤️ **favorites** (favorites show up in the editor)
- **Session history** + suggested next program in the rotation
- **Works offline**, **installable** (PWA), and keeps the screen awake during a session
- No backend, no dependencies, no build step — plain static HTML/CSS/JS

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
> A service worker needs `http(s)://` (not `file://`).

## Install on your phone

Open the [live app](https://waltooo.github.io/sport-timer/) → browser menu → **Add to Home Screen**. It then works without a network connection.

## Customize

- **Programs & core exercises**: [`js/data.js`](js/data.js)
- **Extended library** (488 exercises, remote images): [`js/library.js`](js/library.js) (generated)
- **App icons**: regenerate with `node scripts/gen-icons.mjs` (no dependency)

## Project structure

```
index.html            # shell
css/style.css         # mobile-first UI, dark theme
js/data.js            # 5 programs + core exercises + custom-session factory
js/library.js         # extended exercise library (488)
js/ex-images.js       # local frames for core exercises
js/timer.js           # engine: build the step sequence + countdown
js/store.js           # localStorage: history, customizations, favorites, custom sessions
js/app.js             # screens, audio, wake lock, service worker
sw.js                 # offline cache
scripts/gen-icons.mjs # icon generation
```

## Credits

- Exercise images: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) — public domain (Unlicense). Core exercises are bundled for offline use; the extended library loads images on demand and caches them.

## License

MIT — built as a personal project, in pair-programming with Claude Code.
