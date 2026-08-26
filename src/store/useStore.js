import { create } from 'zustand'
import { ENTRY_ISLAND_INDEX, LAST_ISLAND } from '../config/islands.js'
import { FLIGHT_MS, SETTLE_MS } from '../config/timings.js'

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

  // composite action: navigate to a specific island index
  navigateToIsland: (index) => {
    if (index < 0 || index > LAST_ISLAND || index === get().targetIsland) return
    clearTimeout(settleTimer)
    set({ targetIsland: index, isAnimating: true, cardOpen: false, scrollEnabled: false })
    settleTimer = setTimeout(() => {
      set({ currentIsland: index, isAnimating: false, scrollEnabled: true })
    }, SETTLE_MS)
  },

  openCard: () => set({ cardOpen: true, scrollEnabled: false }),
  closeCard: () => set({ cardOpen: false, scrollEnabled: true }),
}))

export default useStore
