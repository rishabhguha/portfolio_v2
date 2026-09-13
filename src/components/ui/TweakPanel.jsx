import useTweakStore from '../../store/useTweakStore.js'

// Top-right dev panel for tweaking the scene. Toggle it on, then click either a
// prop (edit X/Y/Z position) or an island's landmass (edit its size + rotation).
// "Copy" puts config-ready values on the clipboard to paste back into islands.js.
const AXES = ['X', 'Y', 'Z']
const MIN = -12
const MAX = 12
const STEP = 0.05

// island size (targetDiameter) slider bounds
const SIZE_MIN = 5
const SIZE_MAX = 40
const SIZE_STEP = 0.5

const fmt = (n) => Number(n).toFixed(3)
const RAD2DEG = 180 / Math.PI
const DEG2RAD = Math.PI / 180

// --- island: size (targetDiameter) + rotation (yawOffset) -------------------
function IslandControls({ meta }) {
  const override = useTweakStore((s) => s.islandOverrides[meta.islandId])
  const setIslandProp = useTweakStore((s) => s.setIslandProp)
  const resetSelected = useTweakStore((s) => s.resetSelected)
  const clearSelection = useTweakStore((s) => s.clearSelection)

  const size = override?.size ?? meta.baseDiameter ?? 1
  const yaw = override?.yaw ?? meta.baseYaw ?? 0
  const deg = Math.round(yaw * RAD2DEG)

  const copy = (text) => navigator.clipboard?.writeText(text)

  return (
    <>
      <div className="tweak-meta">
        <span className="tweak-label">{meta.label}</span>
        <span className="tweak-sub">{meta.islandId}</span>
      </div>

      <div className="tweak-row">
        <label>Size</label>
        <input
          type="range"
          min={SIZE_MIN}
          max={SIZE_MAX}
          step={SIZE_STEP}
          value={size}
          onChange={(e) => setIslandProp(meta.islandId, 'size', parseFloat(e.target.value))}
        />
        <input
          type="number"
          step={SIZE_STEP}
          value={size}
          onChange={(e) => setIslandProp(meta.islandId, 'size', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="tweak-row">
        <label>Rot°</label>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={deg}
          onChange={(e) => setIslandProp(meta.islandId, 'yaw', parseFloat(e.target.value) * DEG2RAD)}
        />
        <input
          type="number"
          step={1}
          value={deg}
          onChange={(e) => setIslandProp(meta.islandId, 'yaw', (parseFloat(e.target.value) || 0) * DEG2RAD)}
        />
      </div>

      <div className="tweak-readout">Ø {fmt(size)} · {deg}° ({fmt(yaw)} rad)</div>

      <div className="tweak-actions">
        <button onClick={() => copy(`targetDiameter: ${fmt(size)}, yawOffset: ${fmt(yaw)},`)}>
          Copy
        </button>
        <button onClick={resetSelected}>Reset</button>
        <button onClick={clearSelection}>Deselect</button>
      </div>
    </>
  )
}

// --- prop: X/Y/Z position ---------------------------------------------------
function PropControls({ meta }) {
  const override = useTweakStore((s) => (s.selectedId ? s.overrides[s.selectedId] : null))
  const setAxis = useTweakStore((s) => s.setAxis)
  const resetSelected = useTweakStore((s) => s.resetSelected)
  const clearSelection = useTweakStore((s) => s.clearSelection)

  const position = override ?? meta.defaultPosition
  const copy = (text) => navigator.clipboard?.writeText(text)

  return (
    <>
      <div className="tweak-meta">
        <span className="tweak-label">{meta.label}</span>
        <span className="tweak-sub">{meta.islandId}</span>
      </div>

      {AXES.map((axis, i) => (
        <div className="tweak-row" key={axis}>
          <label>{axis}</label>
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={position[i]}
            onChange={(e) => setAxis(i, parseFloat(e.target.value))}
          />
          <input
            type="number"
            step={STEP}
            value={position[i]}
            onChange={(e) => setAxis(i, parseFloat(e.target.value) || 0)}
          />
        </div>
      ))}

      <div className="tweak-readout">[{position.map(fmt).join(', ')}]</div>

      <div className="tweak-actions">
        <button onClick={() => copy(`[${position.map(fmt).join(', ')}]`)}>Copy</button>
        <button onClick={resetSelected}>Reset</button>
        <button onClick={clearSelection}>Deselect</button>
      </div>
    </>
  )
}

export default function TweakPanel() {
  const enabled = useTweakStore((s) => s.enabled)
  const toggleEnabled = useTweakStore((s) => s.toggleEnabled)
  const selectedMeta = useTweakStore((s) => s.selectedMeta)
  const overrideCount = useTweakStore((s) => Object.keys(s.overrides).length)

  const copyAll = () =>
    navigator.clipboard?.writeText(JSON.stringify(useTweakStore.getState().overrides, null, 2))

  return (
    <div className={`tweak-panel${enabled ? ' open' : ''}`}>
      <div className="tweak-header">
        <span className="tweak-title">Tweak</span>
        <button
          className={`tweak-toggle${enabled ? ' on' : ''}`}
          onClick={toggleEnabled}
        >
          {enabled ? 'On' : 'Off'}
        </button>
      </div>

      {enabled && (
        <div className="tweak-body">
          {!selectedMeta ? (
            <p className="tweak-hint">Click a prop (move it) or an island (resize / rotate) in the scene.</p>
          ) : selectedMeta.kind === 'island' ? (
            <IslandControls meta={selectedMeta} />
          ) : (
            <PropControls meta={selectedMeta} />
          )}

          {overrideCount > 0 && (
            <button className="tweak-copy-all" onClick={copyAll}>
              Copy all ({overrideCount})
            </button>
          )}
        </div>
      )}
    </div>
  )
}
