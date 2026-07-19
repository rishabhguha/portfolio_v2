import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import Scene from './components/Scene.jsx'
import Nav from './components/ui/Nav.jsx'
import LoadingScreen from './components/ui/LoadingScreen.jsx'
import IslandOverlay from './components/ui/IslandOverlay.jsx'
import ScrollHint from './components/ui/ScrollHint.jsx'
import ProgressDots from './components/ui/ProgressDots.jsx'
import ClickIslandHint from './components/ui/ClickIslandHint.jsx'
import useStore from './store/useStore.js'

function CanvasScene() {
  return (
    <Canvas
      camera={{ fov: 55, near: 0.1, far: 1000, position: [5, 22, 40] }}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ position: 'fixed', inset: 0 }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}

export default function App() {
  return (
    <>
      <CanvasScene />
      <LoadingScreen />
      <Nav />
      <IslandOverlay />
      <ClickIslandHint />
      <ScrollHint />
      <ProgressDots />
    </>
  )
}
