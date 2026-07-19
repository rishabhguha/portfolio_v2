import useStore from '../../store/useStore.js'

const NAV_ITEMS = ['About', 'Skills', 'Experience', 'Contact']

export default function Nav() {
  const currentIsland = useStore((s) => s.currentIsland)
  const isOverview = useStore((s) => s.isOverview)
  const navigateToIsland = useStore((s) => s.navigateToIsland)

  return (
    <nav className="nav">
      <div className="nav-logo">| Rishabh</div>
      <ul className="nav-links">
        {NAV_ITEMS.map((label, i) => (
          <li
            key={i}
            className={!isOverview && currentIsland === i ? 'active' : ''}
            onClick={() => {
              if (!isOverview) navigateToIsland(i)
            }}
          >
            {label}
          </li>
        ))}
      </ul>
    </nav>
  )
}
