import useTweakStore from '../store/useTweakStore.js'

// Dev-only wrapper that makes a single prop instance selectable + movable by the
// TweakPanel. Its children must render at their LOCAL origin (position [0,0,0]) —
// this group carries the position so an override can move the whole thing.
//
// When tweak mode is off it is an inert positioned group with no handlers, so it
// has exactly zero effect on normal interaction. When on, clicking selects it
// (stopPropagation keeps the click off the island collider behind it) and the
// panel's sliders drive `overrides[id]`, falling back to `defaultPosition`.
export default function Tweakable({ id, label, islandId, defaultPosition, children }) {
  const enabled = useTweakStore((s) => s.enabled)
  const override = useTweakStore((s) => s.overrides[id])
  const selected = useTweakStore((s) => s.selectedId === id)
  const select = useTweakStore((s) => s.select)

  const position = override ?? defaultPosition

  const handlers = enabled
    ? {
        onClick: (e) => {
          e.stopPropagation()
          select(id, { islandId, label, defaultPosition })
        },
        onPointerOver: (e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          document.body.style.cursor = 'default'
        },
      }
    : {}

  return (
    <group position={position} {...handlers}>
      {children}

      {/* selection gizmo: red=X, green=Y, blue=Z, matching the slider axes.
          depthTest off so it stays visible through the object it marks. */}
      {enabled && selected && (
        <axesHelper
          args={[3]}
          ref={(o) => {
            if (!o) return
            o.material.depthTest = false
            o.material.depthWrite = false
            o.renderOrder = 999
          }}
        />
      )}
    </group>
  )
}
