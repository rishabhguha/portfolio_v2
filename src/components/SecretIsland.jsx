import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import IslandModel from './IslandModel.jsx'
import useStore from '../store/useStore.js'
import { SECRET_ISLAND } from '../config/secretIsland.js'

// The hidden Plastic Beach island: the model, a bank of mist that shrouds it,
// and an invisible click sphere. The mist is the only thing a visitor sees out
// on the horizon; clicking it calls enterSecret(), and once the camera lands
// (secretPhase 'revealed') the mist disperses outward and upward. It rolls back
// in when the visitor leaves, so the egg stays hidden.

const PUFF_COUNT = 34
const MIST_COLOR = new THREE.Color('#eef2f3')

// seeded LCG so the mist bank has the same shape on every load (like Clouds)
function lcg(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

// a soft, slightly lumpy puff: a few overlapping radial gradients on a canvas
function makePuffTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const blobs = [
    [0.5, 0.5, 0.5, 1],
    [0.36, 0.56, 0.3, 0.6],
    [0.64, 0.46, 0.3, 0.6],
  ]
  for (const [x, y, r, a] of blobs) {
    const g = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, r * size)
    g.addColorStop(0, `rgba(255,255,255,${a})`)
    g.addColorStop(0.45, `rgba(255,255,255,${a * 0.6})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function makePuffs() {
  const rand = lcg(1010)
  const { mistRadius } = SECRET_ISLAND
  return Array.from({ length: PUFF_COUNT }, (_, i) => {
    // the first few puffs form a dense core so nothing shows through the middle
    const core = i < 8
    return {
      angle: rand() * Math.PI * 2,
      radius: (core ? 0.1 + rand() * 0.3 : 0.45 + rand() * 0.6) * mistRadius,
      y: core ? 6 + rand() * 12 : 1 + rand() * 22,
      size: core ? 22 + rand() * 8 : 12 + rand() * 12,
      opacity: core ? 0.95 : 0.6 + rand() * 0.3,
      // slow swirl around the island, alternating direction for some churn
      speed: (0.015 + rand() * 0.03) * (rand() < 0.5 ? -1 : 1),
      bobPhase: rand() * Math.PI * 2,
    }
  })
}

export default function SecretIsland() {
  const loaded = useStore((s) => s.loaded)
  const enterSecret = useStore((s) => s.enterSecret)

  const { position, model, colliderRadius } = SECRET_ISLAND
  const texture = useMemo(makePuffTexture, [])
  const puffs = useMemo(makePuffs, [])
  const materials = useMemo(
    () =>
      puffs.map(
        () =>
          new THREE.SpriteMaterial({
            map: texture,
            color: MIST_COLOR,
            transparent: true,
            depthWrite: false,
            toneMapped: false,
            fog: false,
          }),
      ),
    [puffs, texture],
  )

  const mistGroup = useRef()
  const sprites = useRef([])
  const mist = useRef(1) // 1 = fully shrouded, 0 = dispersed
  const hover = useRef(0)
  const hovered = useRef(false)
  const phase = useRef(0)

  // read live in event handlers / the frame loop instead of subscribing, so
  // hovering never re-renders the component
  const isClickable = () => {
    const s = useStore.getState()
    return !s.isOverview && !s.isAnimating && !s.cardOpen && s.secretPhase === 'off'
  }

  useFrame((_, delta) => {
    const { secretPhase } = useStore.getState()
    const revealed = secretPhase === 'revealed' || secretPhase === 'solved'
    // clears over ~2s once the camera lands; rolls back in a little slower
    mist.current = THREE.MathUtils.damp(mist.current, revealed ? 0 : 1, revealed ? 1.6 : 0.9, delta)
    hover.current = THREE.MathUtils.damp(
      hover.current,
      hovered.current && isClickable() ? 1 : 0,
      4,
      delta,
    )
    phase.current += delta

    const m = mist.current
    const spread = 1 - m
    if (mistGroup.current) mistGroup.current.visible = m > 0.01

    puffs.forEach((p, i) => {
      const sprite = sprites.current[i]
      if (!sprite) return
      const a = p.angle + phase.current * p.speed
      // dispersing pushes each puff outward and up as it fades
      const r = p.radius * (1 + spread * 1.2)
      const breathe = 1 + hover.current * 0.06 * Math.sin(phase.current * 3 + p.bobPhase)
      sprite.position.set(
        Math.cos(a) * r,
        p.y + spread * 10 + Math.sin(phase.current * 0.4 + p.bobPhase) * 0.6,
        Math.sin(a) * r,
      )
      const s = p.size * (1 + spread * 0.6) * breathe
      sprite.scale.set(s, s, 1)
      sprite.material.opacity = Math.min(1, p.opacity * m * (1 + hover.current * 0.12))
    })
  })

  return (
    <group position={[position.x, 0, position.z]}>
      {/* the 3MB model streams in after the loading screen; the mist hides it */}
      {loaded && <IslandModel faceCamera={false} model={model} />}

      <group ref={mistGroup}>
        {puffs.map((p, i) => (
          <sprite
            key={i}
            ref={(o) => (sprites.current[i] = o)}
            material={materials[i]}
            renderOrder={10}
          />
        ))}
      </group>

      {/* invisible click target. Transparent (not visible={false}) so the
          raycaster still hits it — same pattern as ThemedIsland's collider. */}
      <mesh
        position={[0, 10, 0]}
        onClick={(e) => {
          if (!isClickable()) return
          e.stopPropagation()
          enterSecret()
          document.body.style.cursor = 'default'
        }}
        onPointerOver={() => {
          hovered.current = true
          if (isClickable()) document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          hovered.current = false
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[colliderRadius, 24, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
