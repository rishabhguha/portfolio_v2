import { useEffect, useState } from 'react'
import useStore from '../../store/useStore.js'

export default function LoadingScreen() {
  const setLoaded = useStore((s) => s.setLoaded)
  const [progress, setProgress] = useState(0)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5
      if (p >= 100) {
        p = 100
        setProgress(100)
        clearInterval(interval)
        setTimeout(() => {
          setHidden(true)
          setLoaded(true)
        }, 500)
      } else {
        setProgress(p)
      }
    }, 150)
    return () => clearInterval(interval)
  }, [setLoaded])

  return (
    <div className={`loading-screen${hidden ? ' hidden' : ''}`}>
      <h1>RISHABH</h1>
      <div className="loading-bar-container">
        <div className="loading-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
