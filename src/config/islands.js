// Single source of truth for the four islands.
//
// Everything that used to be duplicated positionally across Islands.jsx, the
// four per-island wrapper components, IslandLabel, Nav,
// ProgressDots, IslandGlow and IslandOverlay now lives here. Array order is the
// island index used by the store (currentIsland / targetIsland).
//
// Structure models are served as `/models/island_<n>.<ext>`, numbered by island
// number as the visitor counts them — island 1 is this array's index 0.

export const ISLANDS = [
  {
    id: 'about',
    label: 'About',
    color: 0xf2a1c2,
    position: { x: 0, z: 0 },
    // island 0 is the entry point: it pulses in overview and is the only
    // island whose (invisible collider) is clickable to leave overview mode
    isEntry: true,
    // IslandLabel colours, sampled from the model: lime grass + terracotta rock.
    // `labelPosition: [x, y, z]` (island-local) may be added to move the label
    // off its default — the TweakPanel's label Copy button produces it.
    labelTheme: { bg: '#f6fbe9', text: '#3a4a1f', accent: '#ce6348', onAccent: '#fff6ef', ring: '#9ad839' },
    // THEMED (fantasy) — a downloaded low-poly fantasy island replaces the
    // procedural landmass entirely (structureModel), like the other three. The
    // model carries its own grass skirt, terraced mountain, trees, ruin, rocks
    // and flowers, so there are no procedural props here either.
    // "Fantasy_Island" by Omar Faruq Tawsif, CC-BY-4.0
    // (https://sketchfab.com/3d-models/fantasy-island-88765d3c5db349e59c39cf9f592eba17)
    // — attribution required; the site has no visible credit for it yet.
    theme: {
      name: 'fantasy',
      // the label floats over the mountain's first terrace, not on the outer
      // grass skirt: its island-local X/Z is fixed at (2.5, 2), which at this
      // diameter falls on the terrace. Tracks position.y — see yawOffset.
      surfaceY: 2.27,
      colliderRadius: 7.0, // only used for the (entry-only) click collider
      structureModel: {
        url: '/models/island_1.glb',
        // centre-anchored. This model has a shallow underside (a wide disc, not
        // a deep spike), so position.y is set so the red rock band under the
        // grass straddles the waterline instead of the green skirt drowning.
        // targetDiameter is 15, not the 18 the other three use: the mountain is
        // centred and tall, and at 18 it overflows the per-island framing.
        position: [0, 4.4, 0],
        targetDiameter: 15.0,
        // 215°. Chosen by probing the terrace height at the label's default
        // island-local (2.5, 2) across a full turn: 200°–215° is the one wide
        // window where that spot is flat ground clear of the trees and the
        // summit ruin, so the label reads against the sky.
        yawOffset: 3.752,
        anchorY: 'center',
        // the model ships two loose rocks floating in the sea beside the island
        // (a tall banner-topped spire and a smaller lump) plus its own 480-unit
        // ocean plane. The plane also has to go because it is measured into the
        // bounding box, which would shrink the island to a fifth of its size.
        hideNodes: ['Cylinder009_94', 'Cube080_270', 'yet_111'],
      },
      props: [],
    },
  },
  {
    id: 'skills',
    label: 'Skills',
    color: 0x00c8ff,
    position: { x: 35, z: -25 },
    // IslandLabel colours, sampled from the model: dark pine + moss over slate.
    labelTheme: { bg: '#1f3324', text: '#eef3ea', accent: '#8fb339', onAccent: '#1f3324', ring: '#50770f' },
    // THEMED (alpine) — a downloaded low-poly island replaces the procedural
    // landmass entirely (structureModel), like Experience and Contact. The model
    // carries its own pines, rocky peaks, boulders and dark underside.
    // "Lowpoly island" by alfance, CC-BY-4.0
    // (https://sketchfab.com/3d-models/lowpoly-island-26c3f2f271ab41a5a0c9178ac5304df8)
    // — attribution required; the site has no visible credit for it yet.
    // The download is ONE merged mesh with one texture-palette material, so its
    // sun and clouds can't be stripped with hideNodes (no nodes to match) or
    // materialOverrides (tinting would hit the whole island). The served copy in
    // static/models/ has had them cut out offline, by connected component.
    theme: {
      name: 'alpine',
      surfaceY: 2.25, // grass height under the label — tracks position.y
      colliderRadius: 5.2, // only used for the (entry-only) click collider
      structureModel: {
        url: '/models/island_2.glb',
        // centre-anchored so the deep underside hangs below the anchor into the
        // sea. yawOffset turns the rocky peaks to the back, so they frame the
        // label and it floats over on open grass in front of the boulders (the
        // label's default X/Z is fixed, so yaw is what keeps it clear of the props). Keep
        // position.y and surfaceY in lockstep so the label sinks with the land.
        position: [0, 0.5, 0],
        targetDiameter: 18.0,
        yawOffset: 3.403,
        anchorY: 'center',
      },
      props: [],
    },
  },
  {
    id: 'experience',
    label: 'Experience',
    color: 0xff3b5c,
    position: { x: -30, z: -55 },
    // IslandLabel colours, sampled from the model: snow + glacial ice.
    labelTheme: { bg: '#f4f9fb', text: '#2b4a5a', accent: '#3fa9c9', onAccent: '#ffffff', ring: '#85e1e6' },
    // THEMED (winter) — a downloaded low-poly winter island replaces the
    // procedural landmass entirely (structureModel), like the Contact island.
    // The model carries its own snowy terrain, pines, rocks, gifts and a wide
    // icy underside. "island_3.gltf" is authored with the KHR_materials_pbrSpecular-
    // Glossiness workflow, which three r167's GLTFLoader no longer supports, so
    // the served copy in static/models/ has been re-baked to metallic-roughness
    // baseColorFactor (see the material conversion in the asset pipeline / CONTEXT).
    theme: {
      name: 'winter',
      surfaceY: 4.0, // the ground the label floats over — tune live to the snow surface
      colliderRadius: 5.2, // only used for the (entry-only) click collider
      structureModel: {
        url: '/models/island_3.gltf',
        // centre-anchored so the deep icy underside hangs below the anchor; the
        // group's y is the float height above the sea. position.y /
        // targetDiameter / surfaceY are visual tuning knobs — adjust live in the
        // dev TweakPanel. targetDiameter matches the Contact island (18) so the
        // two floating islands read at the same scale. position.y + surfaceY were
        // dropped 1.5 together (~20% of the above-water height) to sit it lower
        // in the sea — keep them in lockstep so the label sinks with the land.
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
    // IslandLabel colours, sampled from the model: warm earth rock + bright grass.
    labelTheme: { bg: '#fbf3ea', text: '#5a3a22', accent: '#5ea821', onAccent: '#ffffff', ring: '#a96d42' },
    // THEMED (floating) — a downloaded low-poly flying island replaces the
    // procedural landmass entirely (structureModel), so this island has no
    // procedural props of its own; the model already carries its own trees,
    // rocks and underside spike. "Low Poly Flying Island" by Mohamed Fsili,
    // CC-BY-4.0 (https://sketchfab.com/3d-models/low-poly-flying-island-49c22c7d4f3249688a000fc526b84a76)
    // — attribution required, see the Contact card / site credits.
    theme: {
      name: 'floating',
      surfaceY: 2.6, // the ground the label floats over — tune to the model's grass top
      colliderRadius: 5.2, // only used for the (entry-only) click collider
      structureModel: {
        url: '/models/island_4.glb',
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
