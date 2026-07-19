import BaseIsland from './BaseIsland.jsx';

const POSITION = { x: -30, z: -55 };
const ISLAND_COLOR = 0xff3b5c;

const TREE_DATA = [
  {
    position: [2.3582, 2, 0.4436],
    rotation: [0, 3.7817, 0],
    scale: 0.0634,
  },
  {
    position: [-1.6489, 2, -0.1287],
    rotation: [0, 3.8183, 0],
    scale: 0.06958,
  },
];

const ROCK_DATA = [
  {
    size: 0.3445,
    position: [3.4658, 2.1, -3.0017],
    rotation: [1.5279, 1.9241, 2.8366],
    useIslandColor: false,
  },
  {
    size: 0.411,
    position: [4.0308, 2.1, 2.6605],
    rotation: [2.5856, 2.1193, 2.0013],
    useIslandColor: false,
  },
  {
    size: 0.2707,
    position: [2.1156, 2.1, -1.9508],
    rotation: [1.0753, 0.1155, 0.5407],
    useIslandColor: false,
  },
  {
    size: 0.3402,
    position: [-0.2234, 2.1, -2.0402],
    rotation: [2.0909, 0.059, 1.3647],
    useIslandColor: false,
  },
  {
    size: 0.3596,
    position: [0.1012, 2.1, 3.234],
    rotation: [1.6162, 1.9559, 2.4522],
    useIslandColor: true,
  },
];

export default function ExperienceIsland({ currentIsland, isOverview, onSignboardClick }) {
  return (
    <BaseIsland
      islandIndex={2}
      position={POSITION}
      baseTopRadius={6.7213}
      grassTopRadius={4.5097}
      grassBottomRadius={6.3879}
      grassColor={0x81c784}
      treeData={TREE_DATA}
      rockData={ROCK_DATA}
      islandColor={ISLAND_COLOR}
      currentIsland={currentIsland}
      isOverview={isOverview}
      onSignboardClick={onSignboardClick}
    />
  );
}
