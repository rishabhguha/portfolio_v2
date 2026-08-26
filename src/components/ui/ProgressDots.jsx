import useStore from '../../store/useStore.js'
import { ISLANDS } from '../../config/islands.js'

export default function ProgressDots() {
  const currentIsland = useStore((s) => s.currentIsland)
  const isOverview = useStore((s) => s.isOverview)
  const navigateToIsland = useStore((s) => s.navigateToIsland)

  if (isOverview) return null

  return (
    <div className="progress">
      {ISLANDS.map((island, i) => (
        <div
          key={island.id}
          className={`progress-dot${currentIsland === i ? ' active' : ''}`}
          onClick={() => navigateToIsland(i)}
        />
      ))}
    </div>
  )
}
