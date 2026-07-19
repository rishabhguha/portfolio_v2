import BaseIsland from './BaseIsland.jsx';

const POSITION = { x: 20, z: -85 };
const ISLAND_COLOR = 0xe8d5f5;

const TREE_DATA = [
  {
    position: [3.6345, 2, 1.1953],
    rotation: [0, 5.7198, 0],
    scale: 0.06764,
  },
  {
    position: [-2.4774, 2, -0.1005],
    rotation: [0, 1.7202, 0],
    scale: 0.08907,
  },
];

const ROCK_DATA = [
  {
    size: 0.2207,
    position: [-3.8661, 2.1, -1.9716],
    rotation: [0.1865, 2.5998, 1.8508],
    useIslandColor: false,
  },
  {
    size: 0.3193,
    position: [2.1117, 2.1, 0.1979],
    rotation: [1.9158, 2.7324, 0.7934],
    useIslandColor: false,
  },
  {
    size: 0.4095,
    position: [-4.2932, 2.1, -1.3204],
    rotation: [0.5573, 0.8134, 0.0594],
    useIslandColor: true,
  },
];

export default function ContactIsland({ currentIsland, isOverview, onSignboardClick }) {
  return (
    <BaseIsland
      islandIndex={3}
      position={POSITION}
      baseTopRadius={5.1653}
      grassTopRadius={5.2942}
      grassBottomRadius={5.0446}
      grassColor={0x4caf50}
      treeData={TREE_DATA}
      rockData={ROCK_DATA}
      islandColor={ISLAND_COLOR}
      currentIsland={currentIsland}
      isOverview={isOverview}
      onSignboardClick={onSignboardClick}
    />
  );
}
