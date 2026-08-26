# Theme-driven islands with an invisible interaction proxy

Each island is styled by a per-island `theme` descriptor in `islands.js`, replacing the former hard-coded sand-base + grass-disc cylinders. A theme names its `surfaceColor`, `cliffColor`, `style`, `surfaceY`, `colliderRadius`, and a list of `props`, and `ThemedIsland` renders the landmass and decorations from it. Because the landmass no longer exposes a single clickable sand mesh, we keep an **invisible cylinder collider** under each island as the raycast target for entering explore mode, and an explicit **`surfaceY`** the signboard and props anchor to.

**Structures are built procedurally** (a cliff cylinder + a themed surface cap + a per-`style` flourish — snow mound, sand shoreline), not from downloaded GLTFs: model files can't be generated in this environment and "GLTF slots only" rendered nothing. Downloaded GLTFs remain first-class *props* (the waterfall, palms) and can later override a procedural structure.

## Considered options

- **Per-structure GLTF landmass**: the original plan; abandoned because the required `.glb` files don't exist and can't be produced here, so every island fell back to an identical placeholder — no visible theming.
- **Augment the old cylinders** (drop a themed surface on top): rejected because tinted sand peeked under the themed surface.
- **Use a model's own meshes** as the click/anchor target: rejected because it re-breaks the entry mechanic and prop placement whenever a model changes.

## Consequences

- All four islands are themed (About/tropical, Skills/jungle, Experience/beach, Contact/snowy). The legacy procedural path (`island_rock` texture load, `baseTopRadius`/`grass*Radius`/`grassColor`/`trees`/`rocks` fields) is removed from `BaseIsland` and `islands.js`; per-theme `surfaceColor`/`cliffColor`/`style` replace it.
- The invisible collider must render nothing yet still receive pointer events, so it uses a transparent, zero-opacity material rather than `visible={false}` (which the raycaster skips). This drives enter-explore on the **entry island (About)**.
- Camera framing is unaffected: it derives from `island.position + CAMERA_OFFSET`, never from the island radii.
