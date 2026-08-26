import IslandModel from './IslandModel.jsx'
import PalmTree from './PalmTree.jsx'

// A themed island's landmass and props are built procedurally from the theme
// descriptor in islands.js — no downloaded GLTF is required for the structure.
// See docs/adr/0001-model-driven-themed-islands.md. Three things the old
// procedural islands provided are rebuilt here:
//
//   1. an invisible cylinder COLLIDER is the raycast target for entering
//      explore mode (only the entry island wires onIslandClick). It must
//      render (transparent, opacity 0) rather than visible={false}, because
//      the raycaster skips invisible objects and the click would never fire.
//   2. props + Signboard anchor to an explicit `surfaceY` (BaseIsland passes
//      it to the Signboard), never to a bounding box measured per frame.
//   3. shadows are cast/received by the procedural meshes directly.
//
// Real GLTF props still work: an entry with a `url` (e.g. the waterfall) loads
// through IslandModel; a `hero` prop faces the camera.

// The landmass: a cliff base + a themed surface cap, with a per-`style`
// flourish (snow mound / sand shoreline) that sells the theme with primitives.
function ProceduralStructure({ theme }) {
  const { surfaceColor, cliffColor, style, colliderRadius: r, surfaceY } = theme
  const capH = style === 'beach' ? 0.45 : 0.75

  return (
    <group>
      {/* cliff / base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, 4, 2.5, 64]} />
        <meshStandardMaterial color={cliffColor ?? 0xcbb994} roughness={1} />
      </mesh>

      {/* themed surface cap, top at surfaceY */}
      <mesh position={[0, surfaceY - capH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r * 0.9, capH, 64]} />
        <meshStandardMaterial color={surfaceColor ?? 0x4caf50} roughness={0.85} />
      </mesh>

      {/* snowy: a rounded snow mound so it reads as a hill, not a disc */}
      {style === 'snow' && (
        <mesh position={[0, surfaceY - 0.1, 0]} scale={[1, 0.5, 1]} castShadow receiveShadow>
          <sphereGeometry args={[r * 0.75, 32, 24]} />
          <meshStandardMaterial color={surfaceColor} roughness={0.9} />
        </mesh>
      )}

      {/* tropical: a sandy shoreline ring at the waterline */}
      {style === 'tropical' && (
        <mesh position={[0, surfaceY - 0.75, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[r * 1.05, r * 1.02, 0.5, 64]} />
          <meshStandardMaterial color={0xe8d8a0} roughness={1} />
        </mesh>
      )}
    </group>
  )
}

// ---- primitive props -------------------------------------------------------

function Pine({ position, rotation = [0, 0, 0], size = 1 }) {
  const s = size
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.35 * s, 0]} castShadow>
        <cylinderGeometry args={[0.09 * s, 0.12 * s, 0.7 * s, 8]} />
        <meshStandardMaterial color={0x6b4a2b} roughness={0.9} />
      </mesh>
      {[0.75, 1.2, 1.6].map((y, i) => (
        <mesh key={i} position={[0, y * s, 0]} castShadow>
          <coneGeometry args={[(0.62 - i * 0.14) * s, (0.72 - i * 0.1) * s, 10]} />
          <meshStandardMaterial color={0x2f6b3a} roughness={0.8} />
        </mesh>
      ))}
      {/* snow-dusted tip */}
      <mesh position={[0, 1.98 * s, 0]} castShadow>
        <coneGeometry args={[0.18 * s, 0.24 * s, 10]} />
        <meshStandardMaterial color={0xffffff} roughness={0.95} />
      </mesh>
    </group>
  )
}

function Umbrella({ position, rotation = [0, 0, 0], size = 1, color = 0xff5a5a }) {
  const s = size
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.9 * s, 0]} castShadow>
        <cylinderGeometry args={[0.04 * s, 0.04 * s, 1.8 * s, 8]} />
        <meshStandardMaterial color={0xffffff} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.8 * s, 0]} castShadow>
        <coneGeometry args={[0.95 * s, 0.5 * s, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Flower({ position, color = 0xff6fae, size = 1 }) {
  const s = size
  return (
    <group position={position}>
      <mesh position={[0, 0.15 * s, 0]} castShadow>
        <cylinderGeometry args={[0.02 * s, 0.02 * s, 0.3 * s, 6]} />
        <meshStandardMaterial color={0x3a8a3a} />
      </mesh>
      <mesh position={[0, 0.33 * s, 0]} castShadow>
        <sphereGeometry args={[0.1 * s, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
    </group>
  )
}

function Snowman({ position, rotation = [0, 0, 0], size = 1 }) {
  const s = size
  const ball = (y, r) => (
    <mesh position={[0, y * s, 0]} castShadow receiveShadow>
      <sphereGeometry args={[r * s, 16, 12]} />
      <meshStandardMaterial color={0xffffff} roughness={0.9} />
    </mesh>
  )
  return (
    <group position={position} rotation={rotation}>
      {ball(0.45, 0.45)}
      {ball(1.0, 0.32)}
      {ball(1.45, 0.22)}
      {/* carrot nose */}
      <mesh position={[0, 1.45 * s, 0.22 * s]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.05 * s, 0.22 * s, 8]} />
        <meshStandardMaterial color={0xff8c1a} />
      </mesh>
    </group>
  )
}

// One themed prop entry → its meshes.
function Prop({ prop, islandColor }) {
  if (prop.type === 'palm') {
    return prop.instances.map((inst, i) => (
      <PalmTree
        key={i}
        position={inst.position}
        rotation={inst.rotation}
        scale={[inst.scale, inst.scale, inst.scale]}
      />
    ))
  }

  if (prop.primitive === 'rock') {
    return prop.instances.map((inst, i) => (
      <group key={i} position={inst.position} rotation={inst.rotation}>
        <mesh castShadow receiveShadow>
          <dodecahedronGeometry args={[inst.size, 0]} />
          <meshStandardMaterial
            color={inst.color ?? (inst.useIslandColor ? islandColor : 0xcccccc)}
            roughness={0.7}
          />
        </mesh>
        {inst.snowCap && (
          <mesh position={[0, inst.size * 0.45, 0]} castShadow>
            <sphereGeometry args={[inst.size * 0.9, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={0xffffff} roughness={0.95} />
          </mesh>
        )}
      </group>
    ))
  }

  if (prop.primitive === 'pine') {
    return prop.instances.map((inst, i) => <Pine key={i} {...inst} />)
  }

  if (prop.primitive === 'umbrella') {
    return prop.instances.map((inst, i) => <Umbrella key={i} {...inst} />)
  }

  if (prop.primitive === 'flower') {
    return prop.instances.map((inst, i) => <Flower key={i} {...inst} />)
  }

  if (prop.primitive === 'snowman') {
    return prop.instances.map((inst, i) => <Snowman key={i} {...inst} />)
  }

  // downloaded GLTF prop (e.g. the waterfall). `hero` props face the camera.
  const faceCamera = !!prop.faceCamera || !!prop.hero

  if (prop.instances) {
    return prop.instances.map((inst, i) => (
      <IslandModel
        key={i}
        faceCamera={faceCamera}
        model={{
          url: prop.url,
          position: inst.position,
          targetHeight: inst.targetHeight ?? prop.targetHeight,
          yawOffset: inst.yawOffset ?? prop.yawOffset ?? 0,
        }}
      />
    ))
  }

  return (
    <IslandModel
      faceCamera={faceCamera}
      model={{
        url: prop.url,
        position: prop.position,
        targetHeight: prop.targetHeight,
        yawOffset: prop.yawOffset ?? 0,
      }}
    />
  )
}

export default function ThemedIsland({ island, onIslandClick }) {
  const { theme } = island
  const { colliderRadius, props = [] } = theme

  return (
    <group>
      {/* procedural themed landmass */}
      <ProceduralStructure theme={theme} />

      {/* invisible entry/click proxy — only the entry island reacts. Transparent
          (not visible={false}) so the raycaster still hits it behind the model. */}
      {onIslandClick && (
        <mesh
          position={[0, 0.5, 0]}
          onClick={(e) => {
            e.stopPropagation()
            onIslandClick()
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default'
          }}
        >
          <cylinderGeometry args={[colliderRadius, 4, 2.5, 32]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* themed props */}
      {props.map((prop, i) => (
        <Prop key={i} prop={prop} islandColor={island.color} />
      ))}
    </group>
  )
}
