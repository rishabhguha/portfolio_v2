import useStore from '../../store/useStore.js';
import { ISLANDS } from '../../config/islands.js';

export default function Nav() {
  const currentIsland = useStore((s) => s.currentIsland);
  const isOverview = useStore((s) => s.isOverview);
  const navigateToIsland = useStore((s) => s.navigateToIsland);

  return (
    <nav className='nav'>
      <div className='nav-logo'>| Rishabh Guha</div>
      <ul className='nav-links'>
        {ISLANDS.map((island, i) => (
          <li
            key={island.id}
            className={!isOverview && currentIsland === i ? 'active' : ''}
            onClick={() => {
              if (!isOverview) navigateToIsland(i);
            }}
          >
            {island.label}
          </li>
        ))}
      </ul>
    </nav>
  );
}
