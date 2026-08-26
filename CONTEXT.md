# Portfolio Islands

The domain vocabulary for the 3D island portfolio: the world is a small archipelago the visitor flies between, one island per portfolio section.

## Language

**Island**:
One of the four landmasses in the world, each mapped to a portfolio section (About, Skills, Experience, Contact). Array order in `islands.js` is its index.
_Avoid_: page, section (those name the content, not the 3D place)

**Entry Island**:
The single island flagged `isEntry` (About). It pulses in overview mode and is the only island whose surface is clickable to leave overview and enter explore mode.

**Theme**:
The coherent visual identity of an island: its structure, topography, and props together (e.g. jungle, beach, snowy, tropical). A theme stops at the island's edge; the shared sea and sky are not themed.

**Structure**:
The landmass form of an island: the cliff/base and the themed surface cap on top of it. Built procedurally from the theme's `surfaceColor`/`cliffColor`/`style` (a downloaded GLTF may override it later).
_Avoid_: base, mesh, model (too generic)

**Topography**:
The shape of the walkable surface (a snow mound, a flat beach, a sandy shoreline ring), driven by the theme's `style`. Formerly a flat grass disc.
_Avoid_: terrain, ground

**Prop**:
A themed decoration on an island's surface — either a code-built primitive (pine, umbrella, flower, snowman, boulder) or a downloaded model (the waterfall, palms).
_Avoid_: object, decoration, asset

**Signboard**:
The per-island label board naming its section, mounted on the island surface and turned to face the focused camera.
