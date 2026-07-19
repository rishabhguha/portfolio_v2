import useStore from '../../store/useStore.js'

export default function ProgressDots() {
  const currentIsland = useStore((s) => s.currentIsland)
  const isOverview = useStore((s) => s.isOverview)
  const navigateToIsland = useStore((s) => s.navigateToIsland)

  if (isOverview) return null

  return (
    <div className="progress">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`progress-dot${currentIsland === i ? ' active' : ''}`}
          onClick={() => navigateToIsland(i)}
        />
      ))}
    </div>
  )
}
