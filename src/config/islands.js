// Single source of truth for the four islands.
//
// Everything that used to be duplicated positionally across Islands.jsx, the
// four per-island wrapper components, Signboard, Nav,
// ProgressDots, IslandGlow and IslandOverlay now lives here. Array order is the
// island index used by the store (currentIsland / targetIsland).

export const ISLANDS = [
  {
    id: 'about',
    label: 'About',
    color: 0xf2a1c2,
    position: { x: 0, z: 0 },
    // island 0 is the entry point: it pulses in overview and is the only
    // island whose (invisible collider) is clickable to leave overview mode
    isEntry: true,
    // THEMED (tropical) — the calm entry island: bright grass dome, sandy
    // shoreline ring, palms and scattered flowers. Fully procedural.
    theme: {
      name: 'tropical',
      surfaceColor: 0x5cb85c, // bright grass cap
      cliffColor: 0xc2a878, // sandy cliff
      style: 'tropical', // adds a sand shoreline ring
      surfaceY: 2.2,
      colliderRadius: 5.8,
      props: [
        {
          primitive: 'flower',
          instances: [
            { position: [3.2, 2.2, -0.8], color: 0xff6fae },
            { position: [-0.5, 2.2, -2.8], color: 0xffd93b },
            { position: [1.2, 2.2, 2.6], color: 0xffffff },
            { position: [-2.8, 2.2, -0.4], color: 0xff5a5a },
            { position: [0.4, 2.2, 1.2], color: 0xff9d3b },
          ],
        },
        {
          primitive: 'rock',
          instances: [
            {
              size: 0.2061,
              position: [-2.2992, 2.2, 1.6443],
              rotation: [0.8466, 1.5993, 0.0789],
            },
            {
              size: 0.3591,
              position: [-1.3684, 2.2, 2.1481],
              rotation: [1.7853, 0.7816, 2.3531],
            },
            {
              size: 0.3218,
              position: [0.0111, 2.2, 2.8527],
              rotation: [0.5977, 1.7259, 0.6805],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'skills',
    label: 'Skills',
    color: 0x00c8ff,
    position: { x: 35, z: -25 },
    // THEMED (jungle) — dark, dense green terrain, clustered palm canopy, mossy
    // boulders, and the real waterfall (a downloaded GLTF that exists). See
    // CONTEXT.md and docs/adr/0001-model-driven-themed-islands.md.
    theme: {
      name: 'jungle',
      surfaceColor: 0x2e6b2e, // deep jungle green
      cliffColor: 0x6b5335, // dark earthy rock
      style: 'jungle',
      surfaceY: 2.2,
      colliderRadius: 5.7,
      props: [
        // hero: the existing waterfall. hero → faces the camera. Placed at the
        // BACK (-Z is the far side from the camera at island + CAMERA_OFFSET),
        // reading as a backdrop behind the signboard. Authored face is roughly
        // +X, so the extra -90° (offsetting FACE_CAMERA_YAW's +Z assumption)
        // turns that +X front squarely toward the viewer.
        {
          url: '/models/waterfall.glb',
          hero: true,
          position: [-1.0, 2.2, -3.2],
          targetHeight: 4,
          yawOffset: -Math.PI / 2,
        },
        // dense canopy: reused ash_tree palms. Positions were hand-tuned in the
        // tweak tool; the layout is kept off the central waterfall corridor (the
        // waterfall sits back-centre at ~[-1, -3.2]) so it still reads through.
        {
          type: 'palm',
          instances: [
            {
              position: [4.3, 2.2, -0.05],
              rotation: [0, 1.8436, 0],
              scale: 0.062405,
            },
            {
              position: [-3.4, 2.2, 1.8],
              rotation: [0, 5.9165, 0],
              scale: 0.05607,
            },
            {
              position: [2.65, 2.2, -1.55],
              rotation: [0, 2.4, 0],
              scale: 0.0532,
            },
            {
              position: [-3.7, 2.2, -1.6],
              rotation: [0, 4.1, 0],
              scale: 0.049,
            },
            // four added to fill out the canopy
            { position: [3.4, 2.2, 2.8], rotation: [0, 0.9, 0], scale: 0.058 },
            { position: [-2.6, 2.2, 3.1], rotation: [0, 3.4, 0], scale: 0.051 },
            { position: [4.6, 2.2, -2.4], rotation: [0, 2.0, 0], scale: 0.047 },
            { position: [-4.5, 2.2, -0.3], rotation: [0, 5.2, 0], scale: 0.06 },
          ],
        },
        // mossy jungle boulders
        {
          primitive: 'rock',
          instances: [
            {
              size: 0.4683,
              position: [1.5576, 2.3, 4.5721],
              rotation: [2.8692, 1.2484, 0.6808],
              color: 0x5a7d3a,
            },
            {
              size: 0.4319,
              position: [0.9197, 2.3, 4.1634],
              rotation: [1.5932, 2.5591, 1.022],
              color: 0x5a7d3a,
            },
            {
              size: 0.2133,
              position: [4.0326, 2.3, -2.0246],
              rotation: [2.7637, 0.435, 1.9319],
              color: 0x5a7d3a,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'experience',
    label: 'Experience',
    color: 0xff3b5c,
    position: { x: -30, z: -55 },
    // THEMED (winter) — a downloaded low-poly winter island replaces the
    // procedural landmass entirely (structureModel), like the Contact island.
    // The model carries its own snowy terrain, pines, rocks, gifts and a wide
    // icy underside. "scene.gltf" is authored with the KHR_materials_pbrSpecular-
    // Glossiness workflow, which three r167's GLTFLoader no longer supports, so
    // the served copy in static/models/ has been re-baked to metallic-roughness
    // baseColorFactor (see the material conversion in the asset pipeline / CONTEXT).
    theme: {
      name: 'winter',
      surfaceY: 4.0, // where the Signboard sits — tune live to the snow surface
      colliderRadius: 5.2, // only used for the (entry-only) click collider
      structureModel: {
        url: '/models/scene.gltf',
        // centre-anchored so the deep icy underside hangs below the anchor; the
        // group's y is the float height above the sea. position.y /
        // targetDiameter / surfaceY are visual tuning knobs — adjust live in the
        // dev TweakPanel. targetDiameter matches the Contact island (18) so the
        // two floating islands read at the same scale. position.y + surfaceY were
        // dropped 1.5 together (~20% of the above-water height) to sit it lower
        // in the sea — keep them in lockstep so the Signboard sinks with the land.
        position: [0, 0.0, 0],
        targetDiameter: 18.0,
        yawOffset: 0.017,
        anchorY: 'center',
        // the model ships Santa, his sleigh and the reindeer team tucked under
        // the landmass — strip them so only the island itself remains.
        hideNodes: ['santa', 'Sleigh', 'deer'],
        // the model's flowing water is the "Ice" mesh (glTF material "material_1",
        // a teal). Retint it to the sea's look (Sea.jsx: 0x00a8cc, roughness 0.4,
        // metalness 0.1) so the water pouring off the island reads as the same
        // water as the sea below.
        materialOverrides: {
          material_1: { color: 0x00a8cc, roughness: 0.4, metalness: 0.1 },
        },
      },
      props: [],
    },
  },
  {
    id: 'contact',
    label: 'Contact',
    color: 0xbfe6a8,
    position: { x: 20, z: -85 },
    // THEMED (floating) — a downloaded low-poly flying island replaces the
    // procedural landmass entirely (structureModel), so this island has no
    // procedural props of its own; the model already carries its own trees,
    // rocks and underside spike. "Low Poly Flying Island" by Mohamed Fsili,
    // CC-BY-4.0 (https://sketchfab.com/3d-models/low-poly-flying-island-49c22c7d4f3249688a000fc526b84a76)
    // — attribution required, see the Contact card / site credits.
    theme: {
      name: 'floating',
      surfaceY: 2.6, // where the Signboard sits — tune to the model's grass top
      colliderRadius: 5.2, // only used for the (entry-only) click collider
      structureModel: {
        url: '/models/flying_island.glb',
        // centre-anchored so the underside spike hangs below the anchor; the
        // group's y is the float height above the sea. All three of
        // position.y / targetDiameter / surfaceY are visual tuning knobs —
        // adjust live in the dev TweakPanel once the .bin is in place.
        position: [0, 1.5, 0],
        targetDiameter: 18.0,
        yawOffset: 1.518,
        anchorY: 'center',
        // the model ships its own river/pool water (glTF material "Material.001",
        // a murky teal at 33% opacity that reads olive over the brown rock and
        // clashes with our sea). Retint it to the sea's look (Sea.jsx: 0x00a8cc,
        // roughness 0.4, metalness 0.1) at a touch more opacity so the rock stops
        // bleeding through, so it reads as the same water as the sea below.
        materialOverrides: {
          'Material.001': {
            color: 0x00a8cc,
            opacity: 0.85,
            roughness: 0.4,
            metalness: 0.1,
          },
        },
      },
      props: [],
    },
  },
];

export const ISLAND_COUNT = ISLANDS.length;
export const LAST_ISLAND = ISLAND_COUNT - 1;

export const ENTRY_ISLAND_INDEX = ISLANDS.findIndex((i) => i.isEntry);
export const ENTRY_ISLAND = ISLANDS[ENTRY_ISLAND_INDEX];
