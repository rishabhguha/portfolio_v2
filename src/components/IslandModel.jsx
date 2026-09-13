import { Component, Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { FACE_CAMERA_YAW } from '../config/camera.js'

// Downloaded GLTF props arrive in arbitrary units — Blender exports can be
// metres, centimetres or whatever the author worked in. Rather than hardcoding
// a magic scale per model, normalise from the model's own bounding box so the
// descriptor asks for a real-world size and always gets it.
//
// Two normalisation modes:
//   • `targetHeight` (default, for props): scale so the model is that many
//     units tall. Right for vertical props like the waterfall.
//   • `targetDiameter` (for landmass structures): scale so the model's
//     footprint (its larger X/Z extent) is that wide. A whole-island model is
//     sized by how much sea it covers, not by its height — its height is often
//     dominated by an underside spike or tall trees, which would mis-size a
//     height-normalised fit. If both are given, `targetDiameter` wins.
//
// `anchorY` decides how the model is placed vertically relative to the
// descriptor's `position.y`:
//   • 'base' (default): the model's lowest point sits on `position.y`, so
//     `position.y` reads as "ground level" — right for props standing on a
//     surface.
//   • 'center': the model's bounding-box centre sits on `position.y` — right
//     for a floating island whose underside hangs below the anchor.
//
// `faceCamera` decides whether the model's front is turned toward the focused
// camera. Camera-facing props (signboard-style hero props like the waterfall)
// want it; a landmass structure or scattered foliage has a fixed orientation
// and must NOT swivel, so it passes faceCamera={false} and only its own
// yawOffset applies.
//
// `materialOverrides` retints downloaded materials by name (a downloaded model
// carries whatever colours its author chose; e.g. the flying island's own
// river/pool water is a murky teal that clashes with our sea). Keyed by the
// material's glTF name → { color, opacity, roughness, metalness }. The material
// is cloned before mutation so the override never leaks into useGLTF's shared
// cached copy.
//
// `hideNodes` strips subtrees a downloaded model ships that we don't want (e.g.
// the winter island arrives with Santa, his sleigh and reindeer tucked under
// the landmass). It's a list of node-name prefixes; any object whose name
// matches is removed BEFORE the bounding box is measured, so the removed props
// never skew the structure's scale or centring.
function Model({ url, targetHeight, targetDiameter, anchorY = 'base', yawOffset = 0, faceCamera = true, materialOverrides, hideNodes }) {
  const { scene } = useGLTF(url)

  // Clone + measure once per source scene. This is the expensive pass (a deep
  // clone of every mesh), so it must NOT depend on the size target — otherwise
  // live-dragging the tweak size slider would re-clone the whole model each
  // tick. Measured in the model's own units, before any scaling.
  const { object, size, center, minY } = useMemo(() => {
    const clone = scene.clone(true)

    // drop unwanted subtrees first, so they don't count toward the box below
    if (hideNodes && hideNodes.length) {
      const doomed = []
      clone.traverse((obj) => {
        if (hideNodes.some((h) => obj.name === h || obj.name.startsWith(h))) doomed.push(obj)
      })
      doomed.forEach((obj) => obj.parent && obj.parent.remove(obj))
    }

    clone.traverse((obj) => {
      if (!obj.isMesh) return
      obj.castShadow = true
      obj.receiveShadow = true

      const ov = materialOverrides && obj.material && materialOverrides[obj.material.name]
      if (ov) {
        // clone first so we never mutate useGLTF's shared cached material
        const m = obj.material.clone()
        if (ov.color !== undefined) m.color = new THREE.Color(ov.color)
        if (ov.roughness !== undefined) m.roughness = ov.roughness
        if (ov.metalness !== undefined) m.metalness = ov.metalness
        if (ov.opacity !== undefined) {
          m.opacity = ov.opacity
          m.transparent = ov.opacity < 1
        }
        m.needsUpdate = true
        obj.material = m
      }
    })
    const box = new THREE.Box3().setFromObject(clone)
    const sz = box.getSize(new THREE.Vector3())
    const ct = box.getCenter(new THREE.Vector3())
    return { object: clone, size: [sz.x, sz.y, sz.z], center: [ct.x, ct.y, ct.z], minY: box.min.y }
  }, [scene, materialOverrides, hideNodes])

  // Cheap: recompute only the scale + offset when the size target changes, so
  // the tweak slider stays smooth. Guards a degenerate box against /0.
  const { scale, offset } = useMemo(() => {
    let s
    if (targetDiameter) {
      const footprint = Math.max(size[0], size[2])
      s = footprint > 1e-6 ? targetDiameter / footprint : 1
    } else {
      s = size[1] > 1e-6 ? targetHeight / size[1] : 1
    }

    // vertical placement: base-on-anchor for props, centre-on-anchor for a
    // floating landmass whose spike hangs below the anchor point. Centre-anchor
    // also keeps resizing in place (the centre stays put as `s` changes).
    const offsetY = anchorY === 'center' ? -center[1] * s : -minY * s

    // always centre on X/Z; offsetY chosen by anchorY above
    return { scale: s, offset: [-center[0] * s, offsetY, -center[2] * s] }
  }, [size, center, minY, targetHeight, targetDiameter, anchorY])

  const yaw = faceCamera ? FACE_CAMERA_YAW + yawOffset : yawOffset

  return (
    <group rotation={[0, yaw, 0]}>
      <primitive object={object} position={offset} scale={scale} />
    </group>
  )
}

// A missing or malformed model file must not take the whole canvas down with
// it — without this, one 404 throws through Scene's Suspense and the scene
// renders as a blank screen. On failure it renders `fallback` (a placeholder,
// e.g. a plain structure cylinder) instead of the model, or nothing.
class ModelBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn(`[IslandModel] failed to load "${this.props.url}" — rendering fallback.`, error)
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}

// `faceCamera` — turn the model's front toward the camera (props); pass false
// for a structure/foliage that must keep a fixed orientation.
// `fallback` — rendered at `position` if the model file is missing/malformed.
export default function IslandModel({ model, faceCamera = true, fallback = null }) {
  const { url, position, targetHeight, targetDiameter, anchorY, yawOffset, materialOverrides, hideNodes } = model

  return (
    <group position={position}>
      <ModelBoundary url={url} fallback={fallback}>
        <Suspense fallback={null}>
          <Model
            url={url}
            targetHeight={targetHeight}
            targetDiameter={targetDiameter}
            anchorY={anchorY}
            yawOffset={yawOffset}
            faceCamera={faceCamera}
            materialOverrides={materialOverrides}
            hideNodes={hideNodes}
          />
        </Suspense>
      </ModelBoundary>
    </group>
  )
}
