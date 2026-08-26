// Camera framing constants.
//
// The per-island camera sits at island position + CAMERA_OFFSET and looks at
// the island. Anything that needs to orient toward the focused camera derives
// from this, so the framing and the props that face it can never drift apart.

export const CAMERA_OFFSET = { x: 8, y: 8, z: 14 }

// Height above the island origin that the camera aims at.
export const CAMERA_LOOKAT_Y = 4

// Yaw (radians) that points a model's +Z axis at the focused camera.
// atan2(x, z) is the standard three.js Y-rotation for a +Z-forward object.
// A model authored -Z-forward needs `yawOffset: Math.PI` in its descriptor.
export const FACE_CAMERA_YAW = Math.atan2(CAMERA_OFFSET.x, CAMERA_OFFSET.z)
