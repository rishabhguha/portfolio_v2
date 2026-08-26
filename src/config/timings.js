// shared animation timings — the store's settle timer must outlast the camera
// flight so overlays and signboard emphasis only react once the camera is still

// camera tween duration (CameraController)
export const FLIGHT_MS = 2000
// store finalises currentIsland and re-enables input shortly after landing
export const SETTLE_MS = FLIGHT_MS + 200
