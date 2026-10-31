import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ISLANDS } from '../config/islands.js'
import { FLIGHT_MS, SECRET_FLIGHT_MS } from '../config/timings.js'
import { SECRET_ISLAND } from '../config/secretIsland.js'
import { CAMERA_OFFSET, CAMERA_LOOKAT_Y } from '../config/camera.js'

const OVERVIEW_POS = new THREE.Vector3(5, 22, 30)
const OVERVIEW_LOOKAT = new THREE.Vector3(0, 0, -15)

// precomputed per-island camera framing, derived from the island config
const ISLAND_CAMERAS = ISLANDS.map(({ position }) => ({
  position: new THREE.Vector3(
    position.x + CAMERA_OFFSET.x,
    CAMERA_OFFSET.y,
    position.z + CAMERA_OFFSET.z,
  ),
  lookAt: new THREE.Vector3(position.x, CAMERA_LOOKAT_Y, position.z),
}))

// the hidden easter-egg island has its own framing (it's bigger and further out)
const SECRET_CAMERA = (() => {
  const { position, camera } = SECRET_ISLAND
  return {
    position: new THREE.Vector3(
      position.x + camera.offset.x,
      camera.offset.y,
      position.z + camera.offset.z,
    ),
    lookAt: new THREE.Vector3(position.x, camera.lookAtY, position.z),
  }
})()

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

const LOOK = new THREE.Vector3()

export default function CameraController({ isOverview, secretActive, targetIsland }) {
  const { camera } = useThree()
  const destKey = useRef(null)
  const flight = useRef(null)

  useFrame(() => {
    const key = isOverview ? 'overview' : secretActive ? 'secret' : targetIsland

    // destination changed → start a new flight from wherever the camera is now
    if (destKey.current !== key) {
      const dest = isOverview
        ? { position: OVERVIEW_POS, lookAt: OVERVIEW_LOOKAT }
        : secretActive
          ? SECRET_CAMERA
          : ISLAND_CAMERAS[targetIsland]
      const fromLook = new THREE.Vector3()
      camera.getWorldDirection(fromLook).multiplyScalar(10).add(camera.position)
      flight.current = {
        fromPos: camera.position.clone(),
        fromLook,
        toPos: dest.position,
        toLook: dest.lookAt,
        startedAt: performance.now(),
        // the long haul to / from the secret island gets a slower flight
        duration: key === 'secret' || destKey.current === 'secret' ? SECRET_FLIGHT_MS : FLIGHT_MS,
        // a redirect mid-flight already has momentum, so only ease out;
        // a flight from rest gets the full ease-in-out
        ease: flight.current ? easeOutCubic : easeInOutCubic,
      }
      destKey.current = key
    }

    if (!flight.current) return // landed — leave the camera perfectly still

    const f = flight.current
    const t = Math.min((performance.now() - f.startedAt) / f.duration, 1)
    const k = f.ease(t)

    camera.position.lerpVectors(f.fromPos, f.toPos, k)
    camera.lookAt(LOOK.lerpVectors(f.fromLook, f.toLook, k))

    // exact arrival: snap done, stop touching the camera so nothing can drift
    if (t === 1) flight.current = null
  })

  return null
}
