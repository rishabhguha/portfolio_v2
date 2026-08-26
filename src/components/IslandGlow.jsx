import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ENTRY_ISLAND } from '../config/islands.js'

// the glow always sits on the entry island, which is what overview mode frames
const ISLAND0_POS = ENTRY_ISLAND.position

export default function IslandGlow({ isOverview }) {
  const ringRef = useRef()
  const outerRingRef = useRef()
  const glowLightRef = useRef()
  const particlesRef = useRef([])

  const particleDefs = useMemo(() => {
    let s = 0xf00ba77e
    const rng = () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      return (s >>> 0) / 0xffffffff
    }
    const count = 24
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      const radius = 7 + rng() * 1.5
      const height = 2.5 + rng() * 1.5
      return {
        key: i,
        size: 0.06 + rng() * 0.1,
        color: rng() > 0.5 ? 0x00c8ff : 0xf2a1c2,
        initialOpacity: 0.7 + rng() * 0.3,
        orbitAngle: angle,
        orbitRadius: radius,
        orbitHeight: height,
        orbitSpeed: 0.3 + rng() * 0.4,
        bobSpeed: 1.5 + rng() * 2,
        bobAmount: 0.2 + rng() * 0.4,
        initPos: [
          ISLAND0_POS.x + Math.cos(angle) * radius,
          height,
          ISLAND0_POS.z + Math.sin(angle) * radius,
        ],
      }
    })
  }, [])

  // mutable orbit angle store
  const orbitAngles = useRef(particleDefs.map((p) => p.orbitAngle))

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const targetOpacity = isOverview ? 1 : 0

    // ring
    if (ringRef.current) {
      const ring = ringRef.current
      ring.material.opacity += (targetOpacity * 0.6 - ring.material.opacity) * 0.05
      ring.visible = ring.material.opacity > 0.01

      if (isOverview) {
        const rs = 1 + Math.sin(t * 2) * 0.05
        ring.scale.set(rs, rs, 1)
        ring.position.y = 2.2 + Math.sin(t * 0.5) * 0.15
        ring.rotation.z = t * 0.15
      }
    }

    // outer ring
    if (outerRingRef.current) {
      const or = outerRingRef.current
      or.material.opacity += (targetOpacity * 0.15 - or.material.opacity) * 0.05
      or.visible = or.material.opacity > 0.01

      if (isOverview && ringRef.current) {
        const rs = 1 + Math.sin(t * 2) * 0.05
        or.scale.set(rs * 1.02, rs * 1.02, 1)
        or.position.y = 2.15 + Math.sin(t * 0.5) * 0.15
      }
    }

    // glow point light
    if (glowLightRef.current) {
      const lightTarget = isOverview ? 2.5 : 0
      glowLightRef.current.intensity +=
        (lightTarget - glowLightRef.current.intensity) * 0.05
      if (isOverview) {
        glowLightRef.current.intensity = lightTarget + Math.sin(t * 2) * 0.6
      }
      glowLightRef.current.position.y = 3 + Math.sin(t * 0.5) * 0.15
    }

    // particles
    particlesRef.current.forEach((mesh, i) => {
      if (!mesh) return
      const def = particleDefs[i]
      const targetO = isOverview ? def.initialOpacity : 0
      mesh.material.opacity += (targetO - mesh.material.opacity) * 0.05
      mesh.visible = mesh.material.opacity > 0.01

      if (isOverview) {
        orbitAngles.current[i] += def.orbitSpeed * 0.008
        mesh.position.x =
          ISLAND0_POS.x + Math.cos(orbitAngles.current[i]) * def.orbitRadius
        mesh.position.z =
          ISLAND0_POS.z + Math.sin(orbitAngles.current[i]) * def.orbitRadius
        mesh.position.y =
          def.orbitHeight +
          Math.sin(t * def.bobSpeed) * def.bobAmount +
          Math.sin(t * 0.5) * 0.15
      }
    })
  })

  return (
    <>
      {/* inner ring */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ISLAND0_POS.x, 2.2, ISLAND0_POS.z]}
      >
        <torusGeometry args={[7.5, 0.12, 16, 100]} />
        <meshBasicMaterial color={0x00c8ff} transparent opacity={0} />
      </mesh>

      {/* outer ring */}
      <mesh
        ref={outerRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ISLAND0_POS.x, 2.15, ISLAND0_POS.z]}
      >
        <torusGeometry args={[8.2, 0.3, 16, 100]} />
        <meshBasicMaterial color={0x00c8ff} transparent opacity={0} />
      </mesh>

      {/* point light */}
      <pointLight
        ref={glowLightRef}
        color={0x00c8ff}
        intensity={0}
        distance={25}
        decay={2}
        position={[ISLAND0_POS.x, 3, ISLAND0_POS.z]}
        castShadow={false}
      />

      {/* orbiting particles */}
      {particleDefs.map((p, i) => (
        <mesh
          key={p.key}
          ref={(el) => (particlesRef.current[i] = el)}
          position={p.initPos}
        >
          <sphereGeometry args={[p.size, 8, 6]} />
          <meshBasicMaterial color={p.color} transparent opacity={0} />
        </mesh>
      ))}
    </>
  )
}
