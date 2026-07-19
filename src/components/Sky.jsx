import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function Sky() {
  const { scene } = useThree()

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 0, 512)
    grad.addColorStop(0, '#87CEEB')
    grad.addColorStop(0.4, '#B0E0F6')
    grad.addColorStop(0.7, '#D4EFFF')
    grad.addColorStop(1, '#FFF5E6')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 2, 512)
    const tex = new THREE.CanvasTexture(canvas)
    scene.background = tex

    return () => {
      tex.dispose()
      scene.background = null
    }
  }, [scene])

  return null
}
