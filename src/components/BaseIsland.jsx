import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Signboard from './Signboard.jsx';
import ThemedIsland from './ThemedIsland.jsx';

// Every island is model-driven: its landmass, invisible click proxy and props
// come from ThemedIsland, keyed off the island's `theme` descriptor. This shell
// owns only what is genuinely per-island-ordinal — the gentle bob and the entry
// island's overview pulse — plus the Signboard. See
// docs/adr/0001-model-driven-themed-islands.md.
export default function BaseIsland({
  island,
  islandIndex,
  currentIsland,
  isOverview,
  onSignboardClick,
  onIslandClick,
}) {
  const groupRef = useRef();
  const pulseAmpRef = useRef(island.isEntry ? 1 : 0);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    // gentle bob
    group.position.y = Math.sin(t * 0.5 + islandIndex * 1.5) * 0.15;

    // the entry island pulses in overview to invite the first click;
    // the amplitude is damped so leaving overview fades the pulse out
    // instead of snapping the scale back to 1 mid-pulse
    if (island.isEntry) {
      pulseAmpRef.current = THREE.MathUtils.damp(
        pulseAmpRef.current,
        isOverview ? 1 : 0,
        3,
        delta,
      );
      group.scale.setScalar(1 + Math.sin(t * 3) * 0.04 * pulseAmpRef.current);
    }
  });

  return (
    <group ref={groupRef} position={[island.position.x, 0, island.position.z]}>
      <ThemedIsland island={island} onIslandClick={onIslandClick} />

      <Signboard
        label={island.label}
        color={island.color}
        isCurrent={!isOverview && islandIndex === currentIsland}
        isOverview={isOverview}
        onSignboardClick={onSignboardClick}
        surfaceY={island.theme.surfaceY}
        islandId={island.id}
      />
    </group>
  );
}
