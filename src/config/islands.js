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
            { size: 0.2061, position: [-2.2992, 2.2, 1.6443], rotation: [0.8466, 1.5993, 0.0789] },
            { size: 0.3591, position: [-1.3684, 2.2, 2.1481], rotation: [1.7853, 0.7816, 2.3531] },
            { size: 0.3218, position: [0.0111, 2.2, 2.8527], rotation: [0.5977, 1.7259, 0.6805] },
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
        // dense canopy: reused ash_tree palms, pushed to the LEFT and RIGHT
        // edges so a central corridor stays clear and the back waterfall reads
        // through it (they used to cluster over the middle and hide it).
        {
          type: 'palm',
          instances: [
            { position: [4.3, 2.2, 1.8], rotation: [0, 1.8436, 0], scale: 0.062405 },
            { position: [-4.3, 2.2, 1.8], rotation: [0, 5.9165, 0], scale: 0.05607 },
            { position: [3.7, 2.2, -1.6], rotation: [0, 2.4, 0], scale: 0.0532 },
            { position: [-3.7, 2.2, -1.6], rotation: [0, 4.1, 0], scale: 0.049 },
          ],
        },
        // mossy jungle boulders
        {
          primitive: 'rock',
          instances: [
            { size: 0.4683, position: [1.5576, 2.3, 4.5721], rotation: [2.8692, 1.2484, 0.6808], color: 0x5a7d3a },
            { size: 0.4319, position: [0.9197, 2.3, 4.1634], rotation: [1.5932, 2.5591, 1.022], color: 0x5a7d3a },
            { size: 0.2133, position: [4.0326, 2.3, -2.0246], rotation: [2.7637, 0.435, 1.9319], color: 0x5a7d3a },
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
    // THEMED (beach) — flat sandy surface, palms, a bright umbrella, sandy
    // driftwood rocks. Fully procedural.
    theme: {
      name: 'beach',
      surfaceColor: 0xe8d8a0, // sand
      cliffColor: 0xd9c48f, // sand cliff
      style: 'beach', // flatter, thinner surface cap
      surfaceY: 2.2,
      colliderRadius: 6.7,
      props: [
        {
          primitive: 'umbrella',
          instances: [
            { position: [2.6, 2.2, 1.8], size: 1.1, color: 0xff5a5a },
          ],
        },
        {
          primitive: 'rock',
          instances: [
            { size: 0.3445, position: [3.4658, 2.2, -3.0017], rotation: [1.5279, 1.9241, 2.8366], color: 0xbfae8e },
            { size: 0.411, position: [4.0308, 2.2, 2.6605], rotation: [2.5856, 2.1193, 2.0013], color: 0xbfae8e },
            { size: 0.2707, position: [2.1156, 2.2, -1.9508], rotation: [1.0753, 0.1155, 0.5407], color: 0xbfae8e },
            { size: 0.3402, position: [-0.2234, 2.2, -2.0402], rotation: [2.0909, 0.059, 1.3647], color: 0xbfae8e },
            { size: 0.3596, position: [0.1012, 2.2, 3.234], rotation: [1.6162, 1.9559, 2.4522], color: 0xbfae8e },
          ],
        },
      ],
    },
  },
  {
    id: 'contact',
    label: 'Contact',
    color: 0xe8d5f5,
    position: { x: 20, z: -85 },
    // THEMED (snowy) — white snow cap + rounded mound, pine trees, a snowman,
    // and snow-capped rocks. Fully procedural.
    theme: {
      name: 'snowy',
      surfaceColor: 0xf5f9ff, // snow
      cliffColor: 0x8fa3b3, // icy grey-blue
      style: 'snow', // adds a rounded snow mound
      surfaceY: 2.2,
      colliderRadius: 5.2,
      props: [
        {
          primitive: 'snowman',
          instances: [{ position: [-1.5, 2.2, -1.8], size: 1 }],
        },
        {
          primitive: 'pine',
          instances: [
            { position: [3.6345, 2.2, 1.1953], size: 1.15 },
            { position: [-2.4774, 2.2, -0.1005], size: 1 },
            { position: [2.2, 2.2, -2.6], size: 0.9 },
          ],
        },
        {
          primitive: 'rock',
          instances: [
            { size: 0.2207, position: [-3.8661, 2.2, -1.9716], rotation: [0.1865, 2.5998, 1.8508], color: 0x9aa7b0, snowCap: true },
            { size: 0.3193, position: [2.1117, 2.2, 0.1979], rotation: [1.9158, 2.7324, 0.7934], color: 0x9aa7b0, snowCap: true },
            { size: 0.4095, position: [-4.2932, 2.2, -1.3204], rotation: [0.5573, 0.8134, 0.0594], color: 0x9aa7b0, snowCap: true },
          ],
        },
      ],
    },
  },
]

export const ISLAND_COUNT = ISLANDS.length
export const LAST_ISLAND = ISLAND_COUNT - 1

export const ENTRY_ISLAND_INDEX = ISLANDS.findIndex((i) => i.isEntry)
export const ENTRY_ISLAND = ISLANDS[ENTRY_ISLAND_INDEX]
