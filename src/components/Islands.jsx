import AboutIsland from './AboutIsland.jsx';
import SkillsIsland from './SkillsIsland.jsx';
import ExperienceIsland from './ExperienceIsland.jsx';
import ContactIsland from './ContactIsland.jsx';

export const ISLAND_POSITIONS = [
  { x: 0, z: 0 },
  { x: 35, z: -25 },
  { x: -30, z: -55 },
  { x: 20, z: -85 },
];

export default function Islands({ currentIsland, isOverview, onSignboardClick, onIslandClick }) {
  return (
    <>
      <AboutIsland
        currentIsland={currentIsland}
        isOverview={isOverview}
        onSignboardClick={onSignboardClick}
        onIslandClick={isOverview ? onIslandClick : undefined}
      />
      <SkillsIsland
        currentIsland={currentIsland}
        isOverview={isOverview}
        onSignboardClick={onSignboardClick}
      />
      <ExperienceIsland
        currentIsland={currentIsland}
        isOverview={isOverview}
        onSignboardClick={onSignboardClick}
      />
      <ContactIsland
        currentIsland={currentIsland}
        isOverview={isOverview}
        onSignboardClick={onSignboardClick}
      />
    </>
  );
}
