import BaseIsland from './BaseIsland.jsx';

const POSITION = { x: 0, z: 0 };
const ISLAND_COLOR = 0xf2a1c2;

const TREE_DATA = [
  {
    position: [1.8668, 2, 0.8389],
    rotation: [0, 6.1887, 0],
    scale: 0.08491,
  },
];

const ROCK_DATA = [
  {
    size: 0.2061,
    position: [-2.2992, 2.1, 1.6443],
    rotation: [0.8466, 1.5993, 0.0789],
    useIslandColor: false,
  },
  {
    size: 0.3591,
    position: [-1.3684, 2.1, 2.1481],
    rotation: [1.7853, 0.7816, 2.3531],
    useIslandColor: false,
  },
  {
    size: 0.3218,
    position: [0.0111, 2.1, 2.8527],
    rotation: [0.5977, 1.7259, 0.6805],
    useIslandColor: false,
  },
];

export default function AboutIsland({ currentIsland, isOverview, onSignboardClick, onIslandClick }) {
  return (
    <BaseIsland
      islandIndex={0}
      position={POSITION}
      baseTopRadius={5.8334}
      grassTopRadius={5.9409}
      grassBottomRadius={5.0745}
      grassColor={0x4caf50}
      treeData={TREE_DATA}
      rockData={ROCK_DATA}
      islandColor={ISLAND_COLOR}
      currentIsland={currentIsland}
      isOverview={isOverview}
      onSignboardClick={onSignboardClick}
      onIslandClick={onIslandClick}
    />
  );
}
