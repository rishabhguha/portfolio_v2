import { useEffect, useRef } from 'react'

// A one-shot confetti burst thrown in from all four screen edges, drawn on a
// full-screen canvas (no dependency). Mount it to fire; it calls onDone once
// every piece has fallen out of view (or after MAX_MS) so the parent can unmount
// it. Skipped entirely under prefers-reduced-motion.

const COUNT = 240
const MAX_MS = 5500
const GRAVITY = 900 // px/s²
const DRAG = 1.1 // per second
// Plastic Beach palette: sea teal, coral, candy pink, sunshine yellow, white
const COLORS = ['#1fb5b0', '#ff6f59', '#ff9ec7', '#ffd23f', '#ffffff', '#3a86ff']

const rand = (a, b) => a + Math.random() * (b - a)

// every edge launches inward; the bottom gets extra lift to beat gravity
function spawn(edge, w, h) {
  const base = {
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: rand(6, 11),
    h: rand(10, 18),
    rot: rand(0, Math.PI * 2),
    spin: rand(-8, 8),
    flutter: rand(0, Math.PI * 2),
    flutterSpeed: rand(6, 12),
    // a little stagger so the four volleys don't all land in one frame
    delay: rand(0, 0.25),
  }
  switch (edge) {
    case 0: // left
      return { ...base, x: -20, y: rand(h * 0.3, h), vx: rand(400, 900), vy: rand(-900, -300) }
    case 1: // right
      return { ...base, x: w + 20, y: rand(h * 0.3, h), vx: -rand(400, 900), vy: rand(-900, -300) }
    case 2: // top
      return { ...base, x: rand(0, w), y: -20, vx: rand(-200, 200), vy: rand(50, 350) }
    default: // bottom
      return { ...base, x: rand(w * 0.1, w * 0.9), y: h + 20, vx: rand(-350, 350), vy: -rand(900, 1500) }
  }
}

export default function Confetti({ onDone }) {
  const canvasRef = useRef()
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDoneRef.current?.()
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const pieces = Array.from({ length: COUNT }, (_, i) => spawn(i % 4, w, h))
    const start = performance.now()
    let last = start
    let raf

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      const elapsed = (now - start) / 1000
      last = now
      ctx.clearRect(0, 0, w, h)

      let alive = 0
      for (const p of pieces) {
        if (elapsed < p.delay) {
          alive++
          continue
        }
        p.vy += GRAVITY * dt
        p.vx -= p.vx * DRAG * dt
        p.vy -= p.vy * DRAG * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.spin * dt
        p.flutter += p.flutterSpeed * dt

        // still on screen, or still rising in from below
        if (p.y < h + 40 || p.vy < 0) alive++
        else continue

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        // squash on one axis to fake the paper flipping over
        ctx.scale(1, Math.cos(p.flutter))
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (alive && now - start < MAX_MS) raf = requestAnimationFrame(frame)
      else onDoneRef.current?.()
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className='confetti' aria-hidden='true' />
}
