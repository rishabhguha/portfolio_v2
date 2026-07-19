import { create } from 'zustand'

const useStore = create((set) => ({
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

  // composite action: leave overview mode and fly to island 0
  enterExploreMode: () => {
    set({ isOverview: false, targetIsland: 0, currentIsland: 0, isAnimating: true })
    setTimeout(() => {
      set({ scrollEnabled: true, isAnimating: false })
    }, 1200)
  },

  // composite action: navigate to a specific island index
  navigateToIsland: (index) => {
    set((state) => {
      if (index < 0 || index > 3 || index === state.currentIsland) return {}
      return { targetIsland: index, isAnimating: true, cardOpen: false, scrollEnabled: false }
    })
    setTimeout(() => {
      set({ currentIsland: index, isAnimating: false, scrollEnabled: true })
    }, 2200)
  },

  openCard: (index) => set({ cardOpen: true, scrollEnabled: false }),
  closeCard: () => set({ cardOpen: false, scrollEnabled: true }),
}))

export default useStore
