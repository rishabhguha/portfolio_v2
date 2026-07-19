import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Cloud({ initialPosition, scale, speed, puffs }) {
  const groupRef = useRef()

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    group.position.x += speed * 0.01
    if (group.position.x > 80) group.position.x = -80
  })

  return (
    <group ref={groupRef} position={initialPosition} scale={[scale, scale, scale]}>
      {puffs.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 12, 8]} />
          <meshStandardMaterial
            color={0xffffff}
            roughness={1}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function Clouds() {
  const cloudDefs = useMemo(() => {
    // seeded random so it stays stable
    let s = 0xabcdef01
    const rng = () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      return (s >>> 0) / 0xffffffff
    }

    return Array.from({ length: 20 }, (_, i) => {
      const count = 3 + Math.floor(rng() * 4)
      const puffs = Array.from({ length: count }, () => ({
        size: 0.5 + rng(),
        position: [
          (rng() - 0.5) * 2,
          rng() * 0.5,
          (rng() - 0.5) * 1,
        ],
      }))
      return {
        key: i,
        initialPosition: [
          (rng() - 0.5) * 150,
          15 + rng() * 20,
          (rng() - 0.5) * 150,
        ],
        scale: 1 + rng() * 2,
        speed: 0.3 + rng() * 0.5,
        puffs,
      }
    })
  }, [])

  return (
    <>
      {cloudDefs.map((c) => (
        <Cloud
          key={c.key}
          initialPosition={c.initialPosition}
          scale={c.scale}
          speed={c.speed}
          puffs={c.puffs}
        />
      ))}
    </>
  )
}
