import { SECRET_TRACKS } from '../config/secretIsland.js'

// One module-level player for the secret island's soundtrack.
//
// playRandomTrack() must be called synchronously inside the click handler that
// starts the easter egg: Safari only lets audio.play() through while a user
// gesture is on the call stack, so it can't be deferred to an effect that runs
// once the camera lands. The music still starts START_DELAY_MS after the click:
// the gesture-time play() is a muted unlock that is paused straight away, and
// the real play() on the same (now unlocked) element runs after the delay.

const VOLUME = 0.8
const FADE_IN_MS = 1500
const FADE_OUT_MS = 600
const START_DELAY_MS = 2000

let audio = null
let fadeRaf = null
let startTimer = null

// tween one element's volume; any running fade is cancelled first so a quick
// enter → exit can't leave two fades fighting over it
function fade(el, to, ms, onDone) {
  cancelAnimationFrame(fadeRaf)
  const from = el.volume
  const start = performance.now()
  const tick = (now) => {
    const t = Math.min((now - start) / ms, 1)
    el.volume = from + (to - from) * t
    if (t < 1) fadeRaf = requestAnimationFrame(tick)
    else onDone?.()
  }
  fadeRaf = requestAnimationFrame(tick)
}

export function playRandomTrack() {
  stopTrack(true)
  const track = SECRET_TRACKS[Math.floor(Math.random() * SECRET_TRACKS.length)]
  const el = new Audio(track.url)
  el.loop = true
  el.volume = 0
  el.muted = true
  audio = el
  // a missing file must not break the egg — it just plays silently
  const warn = (err) => console.warn(`[secretTrack] could not play "${track.url}".`, err)
  el.play()
    .then(() => {
      // every step bails if the visitor already left (audio no longer this el)
      if (audio !== el) return
      el.pause()
      el.currentTime = 0
      startTimer = setTimeout(() => {
        if (audio !== el) return
        el.muted = false
        el.play()
          .then(() => audio === el && fade(el, VOLUME, FADE_IN_MS))
          .catch(warn)
      }, START_DELAY_MS)
    })
    .catch(warn)
  return track
}

export function stopTrack(immediate = false) {
  const el = audio
  clearTimeout(startTimer)
  if (!el) return
  audio = null
  const release = () => {
    el.pause()
    el.removeAttribute('src')
    el.load()
  }
  if (immediate) {
    cancelAnimationFrame(fadeRaf)
    release()
  } else {
    fade(el, 0, FADE_OUT_MS, release)
  }
}
