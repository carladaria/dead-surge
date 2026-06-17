let tutorialStateLoaded = false
let tutorialCompleted = false
let tutorialActive = false
let tutorialCombatEnabled = false

export function setTutorialServerState(completed: boolean): void {
  tutorialStateLoaded = true
  tutorialCompleted = completed
}

export function isTutorialStateLoaded(): boolean {
  return tutorialStateLoaded
}

export function isTutorialCompleted(): boolean {
  return tutorialCompleted
}

export function markTutorialCompletedLocally(): void {
  tutorialStateLoaded = true
  tutorialCompleted = true
}

export function setTutorialActive(value: boolean): void {
  tutorialActive = value
  if (!value) tutorialCombatEnabled = false
}

export function isTutorialActive(): boolean {
  return tutorialActive
}

export function setTutorialCombatEnabled(value: boolean): void {
  tutorialCombatEnabled = value
}

export function isTutorialCombatEnabled(): boolean {
  return tutorialCombatEnabled
}
