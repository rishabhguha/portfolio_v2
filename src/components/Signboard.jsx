import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BOARD_COLORS = [0xf2a1c2, 0x00c8ff, 0xff3b5c, 0xe8d5f5]
const LABELS = ['ABOUT', 'SKILLS', 'EXPERIENCE', 'CONTACT']

export default function Signboard({ islandIndex, currentIsland, isOverview, onSignboardClick }) {
  const groupRef = useRef()
  const wobbleOffset = useMemo(() => Math.random() * Math.PI * 2, [])
  const wobbleIntensityRef = useRef(0)

  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 256, 128)
    ctx.fillStyle = '#1A1A2E'
    ctx.font = 'bold 42px Space Grotesk, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(LABELS[islandIndex], 128, 64)
    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [islandIndex])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const group = groupRef.current
    if (!group) return

    const wobbleSpeed = isOverview ? 0 : 1
    const isCurrent = !isOverview && islandIndex === currentIsland ? 1 : 0
    const targetIntensity = isCurrent ? 1.8 : 1
    wobbleIntensityRef.current +=
      (targetIntensity - wobbleIntensityRef.current) * 0.05
    const intensity = wobbleIntensityRef.current

    const wobbleT = t * (isCurrent ? 3.2 : 2.5) + wobbleOffset
    group.rotation.z = Math.sin(wobbleT) * 0.06 * wobbleSpeed * intensity
    group.rotation.x = Math.cos(wobbleT * 0.7) * 0.03 * wobbleSpeed * intensity
    group.position.y = Math.sin(wobbleT * 1.2) * 0.08 * wobbleSpeed * intensity
  })

  const boardColor = BOARD_COLORS[islandIndex]

  return (
    <group
      ref={groupRef}
      position={[2.5, 0, 2]}
      rotation={[0, -0.3, 0]}
    >
      {/* post */}
      <mesh position={[0, 3.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.5, 8]} />
        <meshStandardMaterial color={0x6b4226} roughness={0.9} />
      </mesh>

      {/* board — clickable */}
      <mesh
        position={[0, 4.8, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation()
          if (islandIndex === currentIsland && !isOverview) {
            onSignboardClick(islandIndex)
          }
        }}
      >
        <boxGeometry args={[1.6, 0.8, 0.1]} />
        <meshStandardMaterial color={boardColor} roughness={0.5} />
      </mesh>

      {/* canvas label */}
      <mesh position={[0, 4.8, 0.06]}>
        <planeGeometry args={[1.5, 0.75]} />
        <meshBasicMaterial map={labelTexture} transparent />
      </mesh>
    </group>
  )
}
