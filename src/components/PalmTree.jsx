import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

export default function PalmTree({ position, rotation, scale }) {
  const { scene } = useGLTF('/models/ash_tree.gltf');

  // clone so each tree instance is independent
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;

      // The leaf mesh uses alphaMode BLEND with a high shineThroughFactor
      // which makes leaves nearly invisible against the sea. Switch to
      // alpha-tested cutout so leaves render as solid opaque shapes.
      if (obj.material?.transparent) {
        obj.material = obj.material.clone();
        obj.material.transparent = false;
        obj.material.alphaTest = 0.2;
        obj.material.depthWrite = true;
      }
    });
    return c;
  }, [scene]);

  return (
    <primitive
      object={clone}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

useGLTF.preload('/models/ash_tree.gltf');
