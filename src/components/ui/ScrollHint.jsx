import { useState, useEffect } from 'react'
import useStore from '../../store/useStore.js'

export default function ScrollHint() {
  const isOverview = useStore((s) => s.isOverview)
  const scrollEnabled = useStore((s) => s.scrollEnabled)
  const [visible, setVisible] = useState(false)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    if (!isOverview && scrollEnabled) {
      setVisible(true)
      setOpacity(1)
    }
  }, [isOverview, scrollEnabled])

  // hide hint after first scroll
  useEffect(() => {
    const handleScroll = () => {
      if (visible) setOpacity(0)
    }
    window.addEventListener('wheel', handleScroll, { passive: true })
    return () => window.removeEventListener('wheel', handleScroll)
  }, [visible])

  if (!visible) return null

  return (
    <div className="scroll-hint" style={{ opacity }}>
      <span>Scroll to explore</span>
      <div className="scroll-arrow" />
    </div>
  )
}
