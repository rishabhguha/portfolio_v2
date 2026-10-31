// The hidden easter-egg island: the floating island from Gorillaz' *Plastic
// Beach* album art, shrouded in mist far out on the horizon behind the About
// island. Clicking the mist flies the camera out, the mist parts, a random track
// from the album plays and the visitor is asked to name the album.
//
// It is deliberately NOT part of ISLANDS: it isn't a navigable stop, has no
// card, label, nav link or progress dot, and the store reaches it through its
// own `secretPhase` rather than an island index.
//
// "Gorillaz Plastic Beach floating island" — downloaded from Sketchfab. Check
// the model page for its license / attribution requirement; the site has no
// visible credit for it yet. The served copy is a compressed re-encode of the
// original (kept out of the build in models-src/):
//   gltf-transform resize --width 1024 --height 1024 → webp → meshopt
// (per-step, not `optimize`, which would join/flatten away the node names that
// hideNodes matches on).
//
// This module imports nothing, like islands.js.

export const SECRET_ISLAND = {
  // the red-circle spot: from the About camera this lands just right of the
  // About island's summit, near the horizon. Moving it further out along that
  // sightline keeps it in the same spot on screen (x ≈ 8 - 20·(14 - z)/169) but
  // it must stay inside the sea plane (Sea.jsx, edge at ±SEA_SIZE/2 = 500).
  position: { x: -43, z: -420 },
  model: {
    url: '/models/plastic_beach.glb',
    // centre-anchored. The model's own waterline sits ~0.4 model units above
    // its bbox centre, so at this scale position.y -0.8 puts the waterline just
    // above the sea's mean level (-0.5) and the stem hangs below the surface.
    position: [0, -0.8, 0],
    targetDiameter: 26,
    anchorY: 'center',
    yawOffset: 0,
    // the model ships a translucent cut-away water bowl under the island (our
    // sea replaces it) and one stray plank floating ~190 units up, which would
    // wreck the bounding box. Exact names: the prefix `Water` would also strip
    // the underwater `WaterRoom*` nodes.
    hideNodes: ['Water_WaterTexture_0', 'pCube138_LongPlanks_0'],
  },
  // invisible click sphere around the mist bank
  colliderRadius: 18,
  // how far the mist puffs sit from the island centre while it's shrouded
  mistRadius: 15,
  // focused framing: camera at position + offset, looking at (x, lookAtY, z)
  camera: { offset: { x: 16, y: 13, z: 34 }, lookAtY: 7 },
};

// Local files in static/audio/ (served at /audio/...). One is picked at random.
export const SECRET_TRACKS = [
  { title: 'Plastic Beach', url: '/audio/plastic-beach.mp3' },
  { title: 'Empire Ants', url: '/audio/empire-ants.mp3' },
  { title: 'On Melancholy Hill', url: '/audio/on-melancholy-hill.mp3' },
];

// compared case-insensitively, with whitespace trimmed and collapsed
export const SECRET_ANSWER = 'plastic beach';
