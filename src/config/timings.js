// shared animation timings — the store's settle timer must outlast the camera
// flight so overlays and label emphasis only react once the camera is still

// camera tween duration (CameraController)
export const FLIGHT_MS = 2000
// store finalises currentIsland and re-enables input shortly after landing
export const SETTLE_MS = FLIGHT_MS + 200

// the secret island is ~400 units out, so its flights (out and back) are slower
export const SECRET_FLIGHT_MS = 5500
export const SECRET_SETTLE_MS = SECRET_FLIGHT_MS + 200
