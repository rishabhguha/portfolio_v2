import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ISLAND_POSITIONS } from './Islands.jsx';

const OVERVIEW_POS = new THREE.Vector3(5, 22, 30);
const OVERVIEW_LOOKAT = new THREE.Vector3(0, 0, -15);

function getIslandCamera(index) {
  const pos = ISLAND_POSITIONS[index];
  return {
    position: new THREE.Vector3(pos.x + 8, 8, pos.z + 14),
    lookAt: new THREE.Vector3(pos.x, 4, pos.z),
  };
}

export default function CameraController({ isOverview, targetIsland }) {
  const { camera } = useThree();
  const currentLookAt = useRef(OVERVIEW_LOOKAT.clone());

  useFrame(() => {
    let targetPos, targetLook;

    if (isOverview) {
      targetPos = OVERVIEW_POS;
      targetLook = OVERVIEW_LOOKAT;
    } else {
      const cam = getIslandCamera(targetIsland);
      targetPos = cam.position;
      targetLook = cam.lookAt;
    }

    camera.position.lerp(targetPos, 0.02);

    // smooth look-at interpolation
    const worldDir = new THREE.Vector3();
    camera.getWorldDirection(worldDir);
    const currentLookPos = worldDir.multiplyScalar(10).add(camera.position);
    currentLookPos.lerp(targetLook, 0.02);

    camera.lookAt(currentLookPos);

    // keep track for next frame
    currentLookAt.current.copy(currentLookPos);
  });

  return null;
}
