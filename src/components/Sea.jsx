import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ±500 reaches past the secret island at z -420 (config/secretIsland.js) so it
// floats on water rather than past the sea's edge. The segment count stays at
// 120 to keep the per-frame wave loop cheap; ~8.3-unit cells still sample the
// shortest wave (~89 units) adequately. Keep the far edge inside the camera's
// far plane (1000, App.jsx).
const SEA_SIZE = 1000

export default function Sea() {
  const meshRef = useRef()

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(SEA_SIZE, SEA_SIZE, 120, 120)
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x00a8cc,
        metalness: 0.1,
        roughness: 0.4,
        transparent: true,
        opacity: 0.88,
      }),
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const mesh = meshRef.current
    if (!mesh) return
    const pos = mesh.geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const wave =
        Math.sin(x * 0.08 + t * 0.8) * 0.3 +
        Math.sin(y * 0.06 + t * 0.6) * 0.2 +
        Math.sin((x + y) * 0.05 + t * 1.1) * 0.15
      pos.setZ(i, wave)
    }
    pos.needsUpdate = true
    mesh.geometry.computeVertexNormals()
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      receiveShadow
    />
  )
}
