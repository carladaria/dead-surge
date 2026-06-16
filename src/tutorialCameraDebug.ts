export type TutorialObjectCameraDebugState = {
  xBias: number
  zBias: number
  height: number
  distance: number
  lookAtX: number
  lookAtHeight: number
}

export type TutorialObjectCameraDebugKey = keyof TutorialObjectCameraDebugState

const DEFAULT_TUTORIAL_ZOMBIE_CAMERA_DEBUG_STATE: TutorialObjectCameraDebugState = {
  xBias: 1.05,
  zBias: -0.15,
  height: 1.35,
  distance: 5.6,
  lookAtX: 6.75,
  lookAtHeight: -0.8
}

const DEFAULT_TUTORIAL_COIN_CAMERA_DEBUG_STATE: TutorialObjectCameraDebugState = {
  xBias: 0.95,
  zBias: -0.45,
  height: 2.15,
  distance: 3.25,
  lookAtX: 2.15,
  lookAtHeight: 0
}

const tutorialZombieCameraDebugState: TutorialObjectCameraDebugState = {
  ...DEFAULT_TUTORIAL_ZOMBIE_CAMERA_DEBUG_STATE
}

const tutorialCoinCameraDebugState: TutorialObjectCameraDebugState = {
  ...DEFAULT_TUTORIAL_COIN_CAMERA_DEBUG_STATE
}

export function getTutorialZombieCameraDebugState(): TutorialObjectCameraDebugState {
  return tutorialZombieCameraDebugState
}

export function getTutorialCoinCameraDebugState(): TutorialObjectCameraDebugState {
  return tutorialCoinCameraDebugState
}

export function adjustTutorialZombieCameraDebugValue(key: TutorialObjectCameraDebugKey, delta: number): void {
  tutorialZombieCameraDebugState[key] = Math.round((tutorialZombieCameraDebugState[key] + delta) * 100) / 100
}

export function adjustTutorialCoinCameraDebugValue(key: TutorialObjectCameraDebugKey, delta: number): void {
  tutorialCoinCameraDebugState[key] = Math.round((tutorialCoinCameraDebugState[key] + delta) * 100) / 100
}

export function resetTutorialZombieCameraDebugState(): void {
  tutorialZombieCameraDebugState.xBias = DEFAULT_TUTORIAL_ZOMBIE_CAMERA_DEBUG_STATE.xBias
  tutorialZombieCameraDebugState.zBias = DEFAULT_TUTORIAL_ZOMBIE_CAMERA_DEBUG_STATE.zBias
  tutorialZombieCameraDebugState.height = DEFAULT_TUTORIAL_ZOMBIE_CAMERA_DEBUG_STATE.height
  tutorialZombieCameraDebugState.distance = DEFAULT_TUTORIAL_ZOMBIE_CAMERA_DEBUG_STATE.distance
  tutorialZombieCameraDebugState.lookAtX = DEFAULT_TUTORIAL_ZOMBIE_CAMERA_DEBUG_STATE.lookAtX
  tutorialZombieCameraDebugState.lookAtHeight = DEFAULT_TUTORIAL_ZOMBIE_CAMERA_DEBUG_STATE.lookAtHeight
}

export function resetTutorialCoinCameraDebugState(): void {
  tutorialCoinCameraDebugState.xBias = DEFAULT_TUTORIAL_COIN_CAMERA_DEBUG_STATE.xBias
  tutorialCoinCameraDebugState.zBias = DEFAULT_TUTORIAL_COIN_CAMERA_DEBUG_STATE.zBias
  tutorialCoinCameraDebugState.height = DEFAULT_TUTORIAL_COIN_CAMERA_DEBUG_STATE.height
  tutorialCoinCameraDebugState.distance = DEFAULT_TUTORIAL_COIN_CAMERA_DEBUG_STATE.distance
  tutorialCoinCameraDebugState.lookAtX = DEFAULT_TUTORIAL_COIN_CAMERA_DEBUG_STATE.lookAtX
  tutorialCoinCameraDebugState.lookAtHeight = DEFAULT_TUTORIAL_COIN_CAMERA_DEBUG_STATE.lookAtHeight
}
