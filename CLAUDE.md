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

## Architecture

### State management
All interactive state lives in a single Zustand store (`src/store/useStore.js`). The two most important flags are:

- `isOverview` — `true` on initial load; the camera sits high and wide showing all 4 islands. Clicking island 0 calls `enterExploreMode()` which sets this to `false`.
- `currentIsland` / `targetIsland` — `currentIsland` is the settled value (set after the 2200 ms animation timeout); `targetIsland` changes immediately so the camera starts moving at once. Navigation is locked via `isAnimating` and `scrollEnabled` during transitions.

### Rendering pipeline
`App.jsx` mounts an R3F `<Canvas>` alongside pure-HTML UI components. The canvas contains `Scene.jsx` which owns all event listeners (wheel, touch, keyboard) and renders the 3D tree:

```
Scene
 ├── Sky            – canvas gradient texture set as scene.background
 ├── Sea            – animated PlaneGeometry (120×120), waves via per-vertex Z displacement each frame
 ├── Islands        – renders 4 × Island at ISLAND_POSITIONS (exported from Islands.jsx, also consumed by CameraController)
 │    └── Island    – sand base + grass disc + PalmTrees + rocks + Signboard + SignatureElement
 ├── Clouds         – 20 groups of sphere puffs drifting on X, seeded RNG for stability
 ├── IslandGlow     – torus rings + orbiting particles visible only in overview mode
 └── CameraController – useFrame lerp: position α=0.012, lookAt α=0.01
```

### Camera
Two states, both defined as constants in `CameraController.jsx`:
- Overview: `pos=(5,22,30)`, `lookAt=(0,0,-15)`
- Per-island: `pos=(islandX+8, 8, islandZ+14)`, `lookAt=(islandX, 4, islandZ)`

### Geometry notes
Island geometry avoids deformation (`deformGeometry` was removed) because random vertex X/Z displacement on closed cylinders causes flipped triangle normals that appear as transparent holes. The grass disc is a plain capped `CylinderGeometry`; the sand base is also a plain cylinder. `PalmTree` uses a seeded LCG RNG (`seed` prop) so trunk tilt and leaf deformation are deterministic across re-renders.

### UI overlay
HTML UI components in `src/components/ui/` are positioned `fixed` over the canvas. `IslandOverlay` renders all 4 content cards simultaneously; only the active one has class `visible`. A `mousedown` listener on `document` (active only when `cardOpen=true`) dismisses the card when clicking outside `cardRef`.

### CSS
All design tokens are CSS custom properties on `:root` in `src/styles/index.css`. Fonts are Space Grotesk (body) and Space Mono (monospace/nav/labels).
