import { Component, Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { FACE_CAMERA_YAW } from '../config/camera.js'

// Downloaded GLTF props arrive in arbitrary units — Blender exports can be
// metres, centimetres or whatever the author worked in. Rather than hardcoding
// a magic scale per model, normalise from the model's own bounding box so the
// descriptor asks for a real-world height and always gets it.
//
// `faceCamera` decides whether the model's front is turned toward the focused
// camera. Camera-facing props (signboard-style hero props like the waterfall)
// want it; a landmass structure or scattered foliage has a fixed orientation
// and must NOT swivel, so it passes faceCamera={false} and only its own
// yawOffset applies.
function Model({ url, targetHeight, yawOffset = 0, faceCamera = true }) {
  const { scene } = useGLTF(url)

  const { object, scale, offset } = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((obj) => {
      if (!obj.isMesh) return
      obj.castShadow = true
      obj.receiveShadow = true
    })

    // measure in the model's own units, before any scaling
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    // guard against a degenerate/empty box so we never divide by zero
    const s = size.y > 1e-6 ? targetHeight / size.y : 1

    return {
      object: clone,
      scale: s,
      // centre on X/Z and sit the model's base exactly on the anchor point,
      // so the descriptor's `position.y` means "ground level", not "origin"
      offset: [-center.x * s, -box.min.y * s, -center.z * s],
    }
  }, [scene, targetHeight])

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
  const { url, position, targetHeight, yawOffset } = model

  return (
    <group position={position}>
      <ModelBoundary url={url} fallback={fallback}>
        <Suspense fallback={null}>
          <Model
            url={url}
            targetHeight={targetHeight}
            yawOffset={yawOffset}
            faceCamera={faceCamera}
          />
        </Suspense>
      </ModelBoundary>
    </group>
  )
}
