import BaseIsland from './BaseIsland.jsx';

const POSITION = { x: 35, z: -25 };
const ISLAND_COLOR = 0x00c8ff;

const TREE_DATA = [
  {
    position: [3.468, 2, 0.1879],
    rotation: [0, 1.8436, 0],
    scale: 0.08915,
  },
  {
    position: [-3.3064, 2, -0.3828],
    rotation: [0, 5.9165, 0],
    scale: 0.0801,
  },
];

const ROCK_DATA = [
  {
    size: 0.4683,
    position: [1.5576, 2.1, 4.5721],
    rotation: [2.8692, 1.2484, 0.6808],
    useIslandColor: false,
  },
  {
    size: 0.2026,
    position: [2.1656, 2.1, 3.9883],
    rotation: [0.1137, 1.5061, 0.0676],
    useIslandColor: false,
  },
  {
    size: 0.4319,
    position: [0.9197, 2.1, 4.1634],
    rotation: [1.5932, 2.5591, 1.022],
    useIslandColor: true,
  },
  {
    size: 0.2133,
    position: [4.0326, 2.1, -2.0246],
    rotation: [2.7637, 0.435, 1.9319],
    useIslandColor: true,
  },
];

export default function SkillsIsland({ currentIsland, isOverview, onSignboardClick }) {
  return (
    <BaseIsland
      islandIndex={1}
      position={POSITION}
      baseTopRadius={6.2773}
      grassTopRadius={5.2253}
      grassBottomRadius={5.7312}
      grassColor={0x388e3c}
      treeData={TREE_DATA}
      rockData={ROCK_DATA}
      islandColor={ISLAND_COLOR}
      currentIsland={currentIsland}
      isOverview={isOverview}
      onSignboardClick={onSignboardClick}
    />
  );
}
