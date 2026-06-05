import { AudioSource, engine, Entity, Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

/**
 * Centralized sound effects manager.
 *
 * Decentraland plays each AudioSource entity independently, so several sounds
 * CAN play at the same time. We use that here on purpose:
 *
 *  - Weapon fire has its OWN dedicated channel (one entity). Rapid shots just
 *    retrigger it, so consecutive shots replace each other (the natural behavior
 *    for a machine gun) and — crucially — gunfire is never cut off by coins,
 *    zombie deaths, pickups, etc.
 *  - Every other one-shot sound goes through a small round-robin pool, so
 *    overlapping triggers (multiple zombies dying at once, a coin during a
 *    death) don't interrupt one another.
 *
 * All clips are `global: true`, so they play at constant volume regardless of
 * where the player stands.
 */

export const Sounds = {
  // Weapons (one shot sound per arena weapon type)
  gunShot: 'assets/sounds/GunShot01.mp3',
  minigunShot: 'assets/sounds/SMGShot01.mp3',
  shotgunShot: 'assets/sounds/ShotgunShot01.mp3',
  // Zombies — picked at random on each death so it doesn't get repetitive
  zombieDeath: [
    'assets/sounds/ZombieDeath01.mp3',
    'assets/sounds/ZombieDeath02.mp3',
    'assets/sounds/ZombieDeath03.mp3',
    'assets/sounds/ZombieDeath04.mp3',
    'assets/sounds/ZombieDeath05.mp3',
    'assets/sounds/ZombieDeath06.mp3'
  ],
  zombieExplosion: 'assets/sounds/ZombieExplotion01.mp3',
  // Pickups
  coin: 'assets/sounds/Coin01.mp3',
  health: 'assets/sounds/healt01.mp3',
  rage: 'assets/sounds/rage01.mp3',
  speed: 'assets/sounds/speed01.mp3',
  // Player feedback
  damage: 'assets/sounds/damage.mp3',
  // Match outcome
  win: 'assets/sounds/yay01.mp3'
} as const

/** Global trim applied on top of every sound's own volume. One knob to scale ALL SFX. */
const MASTER_VOLUME = 1
/** Default volume for general sounds (deaths, pickups, win, etc.). */
const DEFAULT_VOLUME = 0.5
/** Weapon fire is intentionally quieter since it plays very frequently. */
const WEAPON_VOLUME = 0.3
/** The minigun (SMG) clip is recorded quieter, so bump it to match the others. */
const MINIGUN_VOLUME = 0.45
/** Coin pickups happen constantly, so keep them in the background. */
const COIN_VOLUME = 0.25

function createAudioEntity(): Entity {
  const entity = engine.addEntity()
  Transform.create(entity, {
    position: Vector3.create(0, 0, 0),
    rotation: Quaternion.Identity(),
    scale: Vector3.One()
  })
  return entity
}

function playOnEntity(entity: Entity, url: string, volume: number): void {
  // createOrReplace forces a fresh component write every call. Mutating an
  // existing AudioSource with identical values does NOT mark it dirty, so the
  // clip would only ever play once (the bug we hit with repeated gunfire).
  AudioSource.createOrReplace(entity, {
    audioClipUrl: url,
    loop: false,
    global: true,
    volume: volume * MASTER_VOLUME,
    currentTime: 0,
    playing: true
  })
}

// --- General round-robin pool (everything except weapon fire) ---
const POOL_SIZE = 12
const pool: Entity[] = []
let poolInitialized = false
let nextPoolIndex = 0

function ensurePool(): void {
  if (poolInitialized) return
  for (let i = 0; i < POOL_SIZE; i++) pool.push(createAudioEntity())
  poolInitialized = true
}

/** Play a one-shot sound globally through the shared pool. */
export function playSound(url: string, volume: number = DEFAULT_VOLUME): void {
  ensurePool()
  const entity = pool[nextPoolIndex]
  nextPoolIndex = (nextPoolIndex + 1) % POOL_SIZE
  playOnEntity(entity, url, volume)
}

// --- Dedicated weapon-fire channel ---
let weaponFireEntity: Entity | null = null

export type ArenaWeaponSoundType = 'gun' | 'shotgun' | 'minigun'

export function playWeaponShotSound(weaponType: ArenaWeaponSoundType): void {
  if (weaponFireEntity === null) weaponFireEntity = createAudioEntity()
  if (weaponType === 'shotgun') {
    playOnEntity(weaponFireEntity, Sounds.shotgunShot, WEAPON_VOLUME)
  } else if (weaponType === 'minigun') {
    playOnEntity(weaponFireEntity, Sounds.minigunShot, MINIGUN_VOLUME)
  } else {
    playOnEntity(weaponFireEntity, Sounds.gunShot, WEAPON_VOLUME)
  }
}

export function playZombieDeathSound(): void {
  const clips = Sounds.zombieDeath
  const url = clips[Math.floor(Math.random() * clips.length)]
  playSound(url)
}

export function playZombieExplosionSound(): void {
  playSound(Sounds.zombieExplosion)
}

export function playCoinSound(): void {
  playSound(Sounds.coin, COIN_VOLUME)
}

export function playDamageSound(): void {
  playSound(Sounds.damage)
}

export function playHealthPickupSound(): void {
  playSound(Sounds.health)
}

export function playRagePickupSound(): void {
  playSound(Sounds.rage)
}

export function playSpeedPickupSound(): void {
  playSound(Sounds.speed)
}

export function playWinSound(): void {
  playSound(Sounds.win)
}
