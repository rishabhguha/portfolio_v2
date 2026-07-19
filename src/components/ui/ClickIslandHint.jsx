import useStore from '../../store/useStore.js'

export default function ClickIslandHint() {
  const isOverview = useStore((s) => s.isOverview)

  return (
    <div
      className="click-island-hint"
      style={{ opacity: isOverview ? 1 : 0, pointerEvents: 'none' }}
    >
      <span>Click the island to begin</span>
      <div className="pulse-ring" />
    </div>
  )
}
