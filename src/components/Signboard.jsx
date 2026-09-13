import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Tweakable from './Tweakable.jsx'
import useTweakStore from '../store/useTweakStore.js'

// The signboard's post is modelled so its base sits at this Y in island-group
// space (post centre 3.3, half-height 1.25). A themed island whose surface is
// at a different height passes its `surfaceY`; the outer anchor group shifts
// the whole board so the post always meets the ground.
const SIGN_BASE_Y = 2.05

export default function Signboard({
  label,
  color,
  isCurrent,
  isOverview,
  onSignboardClick,
  surfaceY = SIGN_BASE_Y,
  islandId,
}) {
  const groupRef = useRef()
  // while tweak mode is on, a board click selects the signboard for the
  // TweakPanel instead of opening its content card
  const tweakEnabled = useTweakStore((s) => s.enabled)
  // phase accumulates per-frame so speed changes bend the wobble instead of
  // snapping it — multiplying absolute clock time by a changing frequency
  // teleports the phase whenever isCurrent flips
  const phaseRef = useRef(Math.random() * Math.PI * 2)
  const ampRef = useRef(0)
  const intensityRef = useRef(1)

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
    ctx.fillText(label.toUpperCase(), 128, 64)
    return new THREE.CanvasTexture(canvas)
  }, [label])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    phaseRef.current += delta * (isCurrent ? 3.2 : 2.5)

    // frame-rate-independent damping toward the current targets
    ampRef.current = THREE.MathUtils.damp(ampRef.current, isOverview ? 0 : 1, 3, delta)
    intensityRef.current = THREE.MathUtils.damp(intensityRef.current, isCurrent ? 1.8 : 1, 3, delta)

    const w = phaseRef.current
    const a = ampRef.current * intensityRef.current
    group.rotation.z = Math.sin(w) * 0.06 * a
    group.rotation.x = Math.cos(w * 0.7) * 0.03 * a
    group.position.y = Math.sin(w * 1.2) * 0.08 * a
  })

  return (
    // Tweakable anchors the board on the island surface (and lets the dev tool
    // move it); the inner (ref'd) group owns the wobble, which overwrites
    // position.y every frame — independent of the anchor position.
    <Tweakable
      id={`${islandId}:signboard`}
      islandId={islandId}
      label="signboard"
      defaultPosition={[2.5, surfaceY - SIGN_BASE_Y, 2]}
    >
      <group ref={groupRef} rotation={[0, -0.3, 0]}>
        {/* post */}
        <mesh position={[0, 3.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.5, 8]} />
        <meshStandardMaterial color={0x6b4226} roughness={0.9} />
      </mesh>

      {/* board — clickable while its island is the current one; in tweak mode
          the click falls through to Tweakable so it selects instead */}
      <mesh
        position={[0, 4.8, 0]}
        castShadow
        onClick={(e) => {
          if (tweakEnabled) return
          e.stopPropagation()
          if (isCurrent) onSignboardClick()
        }}
      >
        <boxGeometry args={[1.6, 0.8, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

        {/* canvas label */}
        <mesh position={[0, 4.8, 0.06]}>
          <planeGeometry args={[1.5, 0.75]} />
          <meshBasicMaterial map={labelTexture} transparent />
        </mesh>
      </group>
    </Tweakable>
  )
}
