import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import PalmTree from './PalmTree.jsx';
import Signboard from './Signboard.jsx';
import SignatureElement from './SignatureElement.jsx';

export default function BaseIsland({
  islandIndex,
  position,
  baseTopRadius,
  grassTopRadius,
  grassBottomRadius,
  grassColor,
  treeData,
  rockData,
  islandColor,
  currentIsland,
  isOverview,
  onSignboardClick,
  onIslandClick,
}) {
  const groupRef = useRef();

  const [diffMap, armMap, norMap] = useTexture([
    '/textures/island_rock/island_rock_diff_2k.jpg',
    '/textures/island_rock/island_rock_arm_2k.jpg',
    '/textures/island_rock/island_rock_nor_gl_2k.jpg',
  ]);
  diffMap.colorSpace = THREE.SRGBColorSpace;

  for (const t of [diffMap, armMap, norMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 2);
    t.needsUpdate = true;
  }

  const baseGeo = useMemo(
    () => new THREE.CylinderGeometry(baseTopRadius, 4, 2.5, 64, 64),
    [baseTopRadius],
  );

  const grassGeo = useMemo(
    () =>
      new THREE.CylinderGeometry(grassTopRadius, grassBottomRadius, 0.75, 64),
    [grassTopRadius, grassBottomRadius],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    // gentle bob
    group.position.y = Math.sin(t * 0.5 + islandIndex * 1.5) * 0.15;

    // pulse island 0 in overview
    if (islandIndex === 0) {
      if (isOverview) {
        const pulse = 1 + Math.sin(t * 3) * 0.04;
        group.scale.setScalar(pulse);
      } else {
        group.scale.setScalar(1);
      }
    }
  });

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* sand base — clickable to enter explore mode when in overview */}
      <mesh
        geometry={baseGeo}
        position={[0, 0.5, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (onIslandClick) onIslandClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (onIslandClick) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (onIslandClick) document.body.style.cursor = 'default';
        }}
      >
        <meshStandardMaterial
          colorSpace={THREE.SRGBColorSpace}
          map={diffMap}
          normalMap={norMap}
          aoMap={armMap}
          roughnessMap={armMap}
          metalnessMap={armMap}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* grass top */}
      <mesh geometry={grassGeo} position={[0, 1.9, 0]} castShadow>
        <meshStandardMaterial color={grassColor} roughness={0.85} />
      </mesh>

      {/* palm trees */}
      {treeData.map((t, i) => (
        <PalmTree
          key={i}
          position={t.position}
          rotation={t.rotation}
          scale={[t.scale, t.scale, t.scale]}
        />
      ))}

      {/* accent rocks */}
      {rockData.map((r, i) => (
        <mesh key={i} position={r.position} rotation={r.rotation} castShadow>
          <dodecahedronGeometry args={[r.size, 0]} />
          <meshStandardMaterial
            color={r.useIslandColor ? islandColor : 0xcccccc}
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* signboard */}
      <Signboard
        islandIndex={islandIndex}
        currentIsland={currentIsland}
        isOverview={isOverview}
        onSignboardClick={onSignboardClick}
      />

      {/* signature element */}
      <SignatureElement islandIndex={islandIndex} color={islandColor} />
    </group>
  );
}

useTexture.preload('/textures/island_rock/island_rock_diff_2k.jpg');
useTexture.preload('/textures/island_rock/island_rock_arm_2k.jpg');
useTexture.preload('/textures/island_rock/island_rock_nor_gl_2k.jpg');
