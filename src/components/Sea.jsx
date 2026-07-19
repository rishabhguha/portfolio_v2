import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Sea() {
  const meshRef = useRef()

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(400, 400, 120, 120)
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
