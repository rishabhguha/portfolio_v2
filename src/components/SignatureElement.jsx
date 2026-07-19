import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Island 0: flag + pole
function FlagElement({ color }) {
  const flagRef = useRef()

  const flagGeo = useMemo(() => new THREE.PlaneGeometry(1.5, 1, 8, 4), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const flag = flagRef.current
    if (!flag) return
    const pos = flag.geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      pos.setZ(i, Math.sin(x * 3 + t * 3) * 0.1)
    }
    pos.needsUpdate = true
  })

  return (
    <group position={[0, 0, 0]}>
      {/* pole */}
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 4, 8]} />
        <meshStandardMaterial color={0x8b4513} roughness={0.9} />
      </mesh>
      {/* flag */}
      <mesh ref={flagRef} geometry={flagGeo} position={[0.75, 5.2, 0]}>
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.6} />
      </mesh>
    </group>
  )
}

// Island 1: 3 spinning shapes
function SpinningShapes() {
  const shapesRef = useRef([])

  const shapes = useMemo(() => [
    {
      geometry: new THREE.OctahedronGeometry(0.5),
      color: 0x00c8ff,
      position: [Math.cos(0) * 1.2, 4, Math.sin(0) * 1.2],
      spinSpeed: 0.5 + Math.random(),
    },
    {
      geometry: new THREE.TorusGeometry(0.4, 0.15, 8, 16),
      color: 0xff3b5c,
      position: [Math.cos(2.1) * 1.2, 4.8, Math.sin(2.1) * 1.2],
      spinSpeed: 0.5 + Math.random(),
    },
    {
      geometry: new THREE.TetrahedronGeometry(0.4),
      color: 0xf2a1c2,
      position: [Math.cos(4.2) * 1.2, 5.6, Math.sin(4.2) * 1.2],
      spinSpeed: 0.5 + Math.random(),
    },
  ], [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    shapesRef.current.forEach((mesh, i) => {
      if (!mesh) return
      const speed = shapes[i].spinSpeed
      mesh.rotation.x += 0.01 * speed
      mesh.rotation.y += 0.015 * speed
      mesh.position.y = shapes[i].position[1] + Math.sin(t * 2 + speed) * 0.1
    })
  })

  return (
    <group>
      {shapes.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => (shapesRef.current[i] = el)}
          geometry={s.geometry}
          position={s.position}
          castShadow
        >
          <meshStandardMaterial color={s.color} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// Island 2: stacked tower
function TowerElement() {
  const levels = [
    { color: 0xff3b5c, y: 2.5, rot: 0 },
    { color: 0x00c8ff, y: 3.15, rot: 0.3 },
    { color: 0xf2a1c2, y: 3.8, rot: 0.6 },
    { color: 0xe8d5f5, y: 4.45, rot: 0.9 },
  ]

  return (
    <group>
      {levels.map((l, i) => {
        const s = 0.8 - i * 0.05
        return (
          <mesh key={i} position={[0, l.y, 0]} rotation={[0, l.rot, 0]} castShadow>
            <boxGeometry args={[s, 0.6, s]} />
            <meshStandardMaterial color={l.color} roughness={0.5} />
          </mesh>
        )
      })}
    </group>
  )
}

// Island 3: mailbox
function MailboxElement() {
  return (
    <group>
      {/* stick */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 6]} />
        <meshStandardMaterial color={0x8b4513} />
      </mesh>
      {/* box body */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.6]} />
        <meshStandardMaterial color={0xe8d5f5} roughness={0.5} />
      </mesh>
      {/* rounded top cap */}
      <mesh position={[0, 4.28, 0]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 0.6, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={0xe8d5f5} roughness={0.5} />
      </mesh>
    </group>
  )
}

export default function SignatureElement({ islandIndex, color }) {
  switch (islandIndex) {
    case 0:
      return <FlagElement color={color} />
    case 1:
      return <SpinningShapes />
    case 2:
      return <TowerElement />
    case 3:
      return <MailboxElement />
    default:
      return null
  }
}
