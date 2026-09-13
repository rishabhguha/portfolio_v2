import { create } from 'zustand'

// Lightweight, self-contained store for the dev "tweak" tool: turn on tweak
// mode, click an object in the scene to select it, then drag the XYZ sliders to
// reposition it. Kept deliberately separate from useStore so the tool is fully
// decoupled from the app's navigation/overlay state and can't perturb it.
//
// Positions are in island-LOCAL space (the same space islands.js props use), so
// a value copied out of the panel can be pasted straight back into the config.
const round = (n) => Math.round(n * 1000) / 1000

const useTweakStore = create((set) => ({
  enabled: false, // is tweak mode active? (props are only clickable when true)
  selectedId: null, // id of the object currently being edited
  selectedMeta: null, // prop: { islandId, label, defaultPosition } · island: { kind:'island', islandId, label, baseDiameter, baseYaw }
  overrides: {}, // prop id -> [x, y, z] — props that have been moved from default
  islandOverrides: {}, // islandId -> { size, yaw } — islands resized/rotated from their config

  // toggling off also drops the current selection so the gizmo disappears
  toggleEnabled: () =>
    set((s) => (s.enabled ? { enabled: false, selectedId: null, selectedMeta: null } : { enabled: true })),

  select: (id, meta) => set({ selectedId: id, selectedMeta: meta }),
  clearSelection: () => set({ selectedId: null, selectedMeta: null }),

  // edit one axis (0=x, 1=y, 2=z) of the selected object, seeding from its
  // existing override or, failing that, its config default
  setAxis: (axis, value) =>
    set((s) => {
      if (!s.selectedId) return {}
      const base = s.overrides[s.selectedId] ?? s.selectedMeta?.defaultPosition ?? [0, 0, 0]
      const next = [...base]
      next[axis] = round(value)
      return { overrides: { ...s.overrides, [s.selectedId]: next } }
    }),

  // edit one dimension of the selected ISLAND: key is 'size' (targetDiameter)
  // or 'yaw' (radians). Seeds the untouched dimension from the island's config
  // base so changing size alone doesn't wipe a rotation and vice versa.
  setIslandProp: (islandId, key, value) =>
    set((s) => {
      const meta = s.selectedMeta
      const base = s.islandOverrides[islandId] ?? {
        size: meta?.baseDiameter ?? 1,
        yaw: meta?.baseYaw ?? 0,
      }
      return {
        islandOverrides: {
          ...s.islandOverrides,
          [islandId]: { ...base, [key]: round(value) },
        },
      }
    }),

  // drop the selected object's override so it snaps back to its config values.
  // Islands live in islandOverrides (keyed by islandId), props in overrides.
  resetSelected: () =>
    set((s) => {
      if (!s.selectedId) return {}
      if (s.selectedMeta?.kind === 'island') {
        const { [s.selectedMeta.islandId]: _r, ...rest } = s.islandOverrides
        return { islandOverrides: rest }
      }
      const { [s.selectedId]: _removed, ...rest } = s.overrides
      return { overrides: rest }
    }),
}))

export default useTweakStore
