import { create } from 'zustand'
import { ENTRY_ISLAND_INDEX, LAST_ISLAND } from '../config/islands.js'
import { FLIGHT_MS, SETTLE_MS, SECRET_SETTLE_MS } from '../config/timings.js'
import { playRandomTrack, stopTrack } from '../audio/secretTrack.js'

// single managed settle timer — starting a new flight cancels the pending one,
// so a stale timeout can never finalise the wrong island or unlock input early
let settleTimer = null

const useStore = create((set, get) => ({
  // whether we are in the top-down overview or island-level explore mode
  isOverview: true,
  // the island that is currently in focus (finalised after animation)
  currentIsland: 0,
  // the island we are animating toward
  targetIsland: 0,
  // whether scroll / swipe / arrow navigation is active
  scrollEnabled: false,
  // whether a content card overlay is open
  cardOpen: false,
  // whether the camera is still mid-flight
  isAnimating: false,
  // whether the loading screen has finished
  loaded: false,
  // the hidden Plastic Beach island: 'off' | 'flying' (camera heading out) |
  // 'revealed' (landed, mist parting, quiz up) | 'solved' (album named)
  secretPhase: 'off',
  // title of the track playing on the secret island, for the "now playing" line
  secretTrack: null,

  setIsOverview: (v) => set({ isOverview: v }),
  setCurrentIsland: (v) => set({ currentIsland: v }),
  setTargetIsland: (v) => set({ targetIsland: v }),
  setScrollEnabled: (v) => set({ scrollEnabled: v }),
  setCardOpen: (v) => set({ cardOpen: v }),
  setIsAnimating: (v) => set({ isAnimating: v }),
  setLoaded: (v) => set({ loaded: v }),

  // composite action: leave overview mode and fly to the entry island
  enterExploreMode: () => {
    clearTimeout(settleTimer)
    set({
      isOverview: false,
      targetIsland: ENTRY_ISLAND_INDEX,
      currentIsland: ENTRY_ISLAND_INDEX,
      isAnimating: true,
    })
    settleTimer = setTimeout(() => {
      set({ scrollEnabled: true, isAnimating: false })
    }, FLIGHT_MS)
  },

  // composite action: navigate to a specific island index. From the secret
  // island (Nav / progress dots) it also leaves the easter egg — including back
  // to the island we came from, which is still targetIsland, so the same-target
  // early return must not apply then.
  navigateToIsland: (index) => {
    const fromSecret = get().secretPhase !== 'off'
    if (index < 0 || index > LAST_ISLAND) return
    if (index === get().targetIsland && !fromSecret) return
    clearTimeout(settleTimer)
    if (fromSecret) stopTrack()
    set({
      targetIsland: index,
      isAnimating: true,
      cardOpen: false,
      scrollEnabled: false,
      secretPhase: 'off',
      secretTrack: null,
    })
    settleTimer = setTimeout(() => {
      set({ currentIsland: index, isAnimating: false, scrollEnabled: true })
    }, fromSecret ? SECRET_SETTLE_MS : SETTLE_MS)
  },

  // composite action: fly out to the secret island. Called straight from the
  // mist's click handler, so the track starts inside the user gesture (Safari).
  enterSecret: () => {
    const s = get()
    if (s.isOverview || s.isAnimating || s.cardOpen || s.secretPhase !== 'off') return
    clearTimeout(settleTimer)
    const track = playRandomTrack()
    set({ secretPhase: 'flying', secretTrack: track.title, isAnimating: true, scrollEnabled: false })
    settleTimer = setTimeout(() => {
      set({ secretPhase: 'revealed', isAnimating: false })
    }, SECRET_SETTLE_MS)
  },

  solveSecret: () => set({ secretPhase: 'solved' }),

  // composite action: fly back to the island we left from (targetIsland never
  // changed while we were out). Safe mid-flight — the camera just redirects.
  exitSecret: () => {
    if (get().secretPhase === 'off') return
    clearTimeout(settleTimer)
    stopTrack()
    set({ secretPhase: 'off', secretTrack: null, isAnimating: true, scrollEnabled: false })
    settleTimer = setTimeout(() => {
      set({ isAnimating: false, scrollEnabled: true })
    }, SECRET_SETTLE_MS)
  },

  openCard: () => set({ cardOpen: true, scrollEnabled: false }),
  closeCard: () => set({ cardOpen: false, scrollEnabled: true }),
}))

export default useStore
