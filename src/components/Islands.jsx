import BaseIsland from './BaseIsland.jsx';
import { ISLANDS } from '../config/islands.js';

export default function Islands({ currentIsland, isOverview, onSignboardClick, onIslandClick }) {
  return (
    <>
      {ISLANDS.map((island, index) => (
        <BaseIsland
          key={island.id}
          island={island}
          islandIndex={index}
          currentIsland={currentIsland}
          isOverview={isOverview}
          onSignboardClick={onSignboardClick}
          onIslandClick={island.isEntry && isOverview ? onIslandClick : undefined}
        />
      ))}
    </>
  );
}
