# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server (opens index-react.html automatically)
npm run build    # production build → dist/
npm run preview  # serve the dist/ build locally
```

There are no tests and no linter configured.

The original vanilla Three.js implementation lives in `index.html` at the root and is intentionally preserved for reference. The active React app is served from `index-react.html`.

## Vite setup

- `publicDir` is `static/`, not the default `public/`. `static/models/island_1.glb` is served at `<base>models/island_1.glb`.
- `base` is `/` in dev and `/portfolio_v2/` for builds, because GitHub Pages serves the repo under that subpath. Vite rewrites HTML/CSS/import URLs itself, but plain string URLs in JS are not rewritten, so every public-dir URL in config must be written as `` `${import.meta.env.BASE_URL}models/...` ``. A bare `'/models/...'` works in dev and 404s in production.
- `build.rollupOptions.input.app` resolves `index-react.html` relative to the config file.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and deploys `dist/` to GitHub Pages (repo Settings → Pages → Source must be **GitHub Actions**). The build emits `dist/index-react.html`; the workflow renames it to `index.html` so it is served at the site root. If the repo is renamed or a custom domain is added, update `PAGES_BASE` in `vite.config.js` (`'/'` for a custom domain or a `<user>.github.io` repo).

## Architecture

### State management
All interactive state lives in a single Zustand store (`src/store/useStore.js`). The key flags:

- `isOverview` — `true` on initial load; the camera sits high and wide showing all 4 islands. Clicking the entry island's sand base calls `enterExploreMode()`, which clears the flag and unlocks navigation after `FLIGHT_MS`.
- `currentIsland` / `targetIsland` — `targetIsland` changes immediately so the camera starts moving at once; `currentIsland` is the settled value, written by a `SETTLE_MS` timeout in `navigateToIsland()`. Anything that should only react once the flight lands (label clickability, which overlay card is `visible`) reads `currentIsland`; the camera reads `targetIsland`.
- `isAnimating` / `scrollEnabled` — gate all navigation input during transitions.
- `cardOpen` — an overlay card is showing; also suppresses navigation.

All flight/settle durations live in `src/config/timings.js`: `FLIGHT_MS` (2000, camera tween) and `SETTLE_MS` (`FLIGHT_MS + 200`, store settle). `SETTLE_MS` must outlast `FLIGHT_MS` so overlays only appear once the camera has stopped. The store keeps a single module-level settle timer that is `clearTimeout`-ed whenever a new flight starts, so overlapping navigations can't interleave — a mid-flight retarget (e.g. a Nav click) cancels the stale timer and the camera redirects smoothly. `navigateToIsland` ignores re-entry into the current `targetIsland` and returns early *before* scheduling the timer; `Scene.jsx` adds a `SETTLE_MS + 300` wheel cooldown against trackpad inertia.

`Scene.jsx` gates all three input paths (wheel, touch, arrow keys) behind one `canNavigate` boolean and routes them through a shared `step(±1)` helper that bounds-checks against `LAST_ISLAND`. Escape-to-close is handled in the same keydown listener, ahead of the gate, so a card can be dismissed while navigation is locked.

### Rendering pipeline
`App.jsx` mounts an R3F `<Canvas>` alongside pure-HTML UI components. The canvas contains `Scene.jsx`, which owns all event listeners (wheel, touch, keyboard), the lights, and the 3D tree:

```
Scene
 ├── Sky            – canvas gradient texture set as scene.background
 ├── Sea            – 1000×1000 PlaneGeometry, 120×120 segments; waves via per-vertex Z
 │                    displacement + computeVertexNormals() every frame (hot loop)
 ├── Islands        – maps the ISLANDS config → BaseIsland, see below
 ├── Clouds         – 20 groups of sphere puffs drifting on X, seeded LCG for stability
 ├── IslandGlow     – torus rings + orbiting particles, visible only in overview mode
 └── CameraController – time-based tween between fixed endpoints, FLIGHT_MS long;
                        snaps exactly onto the target, then stops touching the camera
```

### Islands — single source of truth
`src/config/islands.js` is the **only** place island data lives. `ISLANDS` is an array of four descriptors (`id`, `label`, `color`, `position`, radii, `grassColor`, `trees`, `rocks`, an optional `model`, and `isEntry` on island 0); array order *is* the island index used by the store. It also exports `ISLAND_COUNT`, `LAST_ISLAND`, `ENTRY_ISLAND_INDEX`, and `ENTRY_ISLAND`.

Every consumer derives from it, so adding, reordering, or restyling an island is a single-file edit:

| Consumer | Derives |
| --- | --- |
| `Islands.jsx` | maps `ISLANDS` → `BaseIsland` |
| `CameraController` | precomputes per-island camera framing from `position` |
| `IslandLabel` | reads `label`, `labelTheme`, optional `labelPosition` |
| `IslandGlow` | positions on `ENTRY_ISLAND` |
| `IslandModel` | renders the optional `model` descriptor |
| `Nav`, `ProgressDots` | map `ISLANDS` for labels and dots |
| `IslandOverlay` | maps `ISLANDS`, looks up its card by `island.id` |
| `useStore` | bounds-checks with `LAST_ISLAND`, enters at `ENTRY_ISLAND_INDEX` |

The config module imports nothing, so there is no cycle even though both the store and the 3D tree depend on it.

`BaseIsland` is the one island component: sand base + grass disc + palm trees + accent rocks + `IslandLabel`, plus the per-island bob and the entry island's overview pulse. It takes the whole descriptor as an `island` prop. Edit `BaseIsland` for island *mechanics*, `islands.js` for island *content*.

Only the island flagged `isEntry` receives `onIslandClick`, so its sand base is the sole exit from overview mode — and the same flag drives the invitation pulse.

`islandIndex` still exists as a prop, but only for things that are genuinely ordinal: the bob phase offset and the `currentIsland` comparison.

Island-side idle animations whose speed or amplitude depends on state (`IslandLabel` bob, entry-island pulse) accumulate phase per-frame (`phase += delta * speed`) and damp their amplitudes with `THREE.MathUtils.damp`. Never multiply absolute clock time by a state-dependent frequency — when the state flips, the phase teleports and the animation visibly snaps.

### Camera
Two states. The overview pair is a constant in `CameraController.jsx`; the per-island pairs are precomputed once at module load from the island config:
- Overview: `pos=(5,22,30)`, `lookAt=(0,0,-15)`
- Per-island: `pos=island + CAMERA_OFFSET`, `lookAt=(islandX, CAMERA_LOOKAT_Y, islandZ)`

`src/config/camera.js` owns `CAMERA_OFFSET` (`8,8,14`), `CAMERA_LOOKAT_Y`, and `FACE_CAMERA_YAW = atan2(offset.x, offset.z)` — the Y-rotation that points a +Z-forward object at the focused camera. Anything that must face the camera derives from this, so retuning the framing can't leave props facing the wrong way.

Flights are time-based tweens, not per-frame lerps. When the destination changes, the controller captures the camera's current position and current look point (world direction projected 10 units ahead) as fixed start values, then eases both toward the target over `FLIGHT_MS` — `easeInOutCubic` from rest, `easeOutCubic` when redirecting a flight already in motion (it has momentum, so no ease-in). At `t = 1` it snaps exactly onto the target and clears the flight, after which `useFrame` does nothing — the camera is perfectly still before `currentIsland` settles at `SETTLE_MS`. Don't reintroduce constant-α lerps here: they're frame-rate dependent and never arrive, which reads as end-of-flight creep/jank.

### Assets and geometry notes
- Island geometry deliberately avoids vertex deformation (a `deformGeometry` helper was removed). Random X/Z displacement on closed cylinders flips triangle normals, which reads as transparent holes. The grass disc and sand base are both plain capped `CylinderGeometry`.
- `IslandLabel` is each island's click target: an HTML `<button>` pill rendered through drei's `<Html>` (screen-aligned, `distanceFactor` 14, `zIndexRange` kept under the card overlay). Its colours come from the island's `labelTheme` (`bg`, `text`, `accent`, `onAccent`, `ring` → `--label-*` CSS vars); it sits at `labelPosition` (island-local) or defaults to a constant `(0, 8, 2)` on every island. It is clickable only when its island is `currentIsland` and the camera isn't animating; otherwise it is hidden (fades out, then `visibility: hidden`), so only the island in focus shows a label. In tweak mode a click selects it for the TweakPanel instead (Html isn't raycast, so it calls `select` itself), and the panel's Copy emits a paste-ready `labelPosition: [...]`.
- `IslandModel` renders an island's optional `model` descriptor (`url`, `position`, `targetHeight`, `yawOffset`). Downloaded props arrive in arbitrary authoring units, so it never hardcodes a scale: it measures the loaded scene's `Box3` and scales by `targetHeight / size.y`, then offsets so the model is centred on X/Z with its **base** on `position.y`. It is wrapped in an error boundary — a missing or malformed file logs a warning and the island renders without it, instead of throwing through `Scene`'s Suspense and blanking the canvas. Sketchfab assets must be downloaded manually (login + license acceptance) into `static/models/`.

### UI overlay
HTML UI components in `src/components/ui/` are positioned `fixed` over the canvas. `IslandOverlay` renders all 4 content cards simultaneously; only the one matching `currentIsland` gets class `visible`. A `mousedown` listener on `document` (registered only while `cardOpen`) dismisses the card on an outside click. Card copy is hardcoded in `IslandOverlay.jsx` as four components in a `CARDS` map keyed by island `id`.

### Secret island (Plastic Beach easter egg)
A hidden extra outside `ISLANDS`: the Gorillaz *Plastic Beach* island at `(-43, -420)`, far out on the horizon behind the About island, shrouded in mist. All of its data lives in `src/config/secretIsland.js`: position, model descriptor, camera framing, `SECRET_TRACKS`, `SECRET_ANSWER`.

- **State:** the store's `secretPhase` cycles through `'off'`, `'flying'`, `'revealed'` and `'solved'`.
  - Clicking the mist's invisible collider sphere in `SecretIsland.jsx` calls `enterSecret()`. It only works in explore mode with the camera settled and no card open.
  - `enterSecret()` schedules `'revealed'` after `SECRET_SETTLE_MS`, using the same single `settleTimer`. `exitSecret()` flies back to the unchanged `targetIsland`.
  - `navigateToIsland` also exits the egg. Coming from the egg, it skips its same-target early return, so Nav and the progress dots can fly home to the island the visitor left from.
  - `canNavigate` in `Scene.jsx` is false while the egg is open. Escape exits it.
- **Camera:** `CameraController` uses the destination key `'secret'`. Any flight to or from it lasts `SECRET_FLIGHT_MS` instead of `FLIGHT_MS`.
- **Mist:** about 34 seeded sprites. `THREE.MathUtils.damp` moves a single `mist` amount toward 0 on `'revealed'`/`'solved'`, which disperses the puffs outward and upward, and back toward 1 otherwise, so the mist rolls back in after the visitor leaves. The model mounts only once the store's `loaded` flag is set, so it stays off the critical path.
- **Audio:** `src/audio/secretTrack.js` holds the player. `playRandomTrack()` is called from `enterSecret()`, which runs inside the click handler. Keep it there: Safari only allows `audio.play()` while a user gesture is on the call stack. The audible start is delayed 2 s (`START_DELAY_MS`): the click does a muted play-then-pause to unlock the element, and a timer starts it for real. The MP3s live in `static/audio/`.
- **UI:** `SecretOverlay` renders the Back button, the quiz and the confetti. The track title stays hidden until the quiz is solved, because the title track has the album's name. `Confetti` is a dependency-free canvas burst thrown in from all four edges.
- **Asset pipeline:** the uncompressed source GLB lives in `models-src/`, which is gitignored and kept out of `static/` so it never ships. The served file is `static/models/plastic_beach.glb`, about 2.9 MB, re-encoded with `@gltf-transform/cli`: `resize --width 1024 --height 1024`, then `webp`, then `meshopt`.
  - Run these as separate steps. Don't use `optimize`, whose join/flatten would destroy the node names `hideNodes` matches.
  - `hideNodes` uses exact names (`Water_WaterTexture_0`, `pCube138_LongPlanks_0`), because the prefix `Water` would also strip the `WaterRoom*` nodes.

### CSS
All design tokens are CSS custom properties on `:root` in `src/styles/index.css`. Fonts are Space Grotesk (body) and Space Mono (monospace/nav/labels), loaded from Google Fonts in `index-react.html`.
