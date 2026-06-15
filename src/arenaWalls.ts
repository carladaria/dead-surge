import { ColliderLayer, engine, Entity, MeshCollider, Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { getCurrentRoomConfig } from './roomRuntime'
import { getLobbyState, isLocalReadyForMatch } from './multiplayer/lobbyClient'

/**
 * Tall invisible colliders along the arena's visual wall perimeter.
 *
 * The visual wall models already have physics colliders, but they are short
 * enough that players can jump/double-jump out of the arena. These boxes add the
 * missing height. They are only active DURING GAMEPLAY so players can still walk
 * freely in and out of the arena while in the lobby.
 *
 * The colliders are positioned at the current room's floor edges (the floor spans
 * exactly the walled area, see roomConfig.floor*), so they line up with the
 * visible walls regardless of which of the 4 rooms the local player is in.
 */

const WALL_HEIGHT = 10
const WALL_THICKNESS = 0.5

type WallSide = 'north' | 'south' | 'east' | 'west'
const WALL_SIDES: WallSide[] = ['north', 'south', 'east', 'west']

const wallEntityBySide = new Map<WallSide, Entity>()
let entitiesCreated = false
let wallsActive = false

function ensureWallEntities(): void {
  if (entitiesCreated) return
  for (const side of WALL_SIDES) {
    const entity = engine.addEntity()
    Transform.create(entity)
    wallEntityBySide.set(side, entity)
  }
  entitiesCreated = true
}

/** Match-active signal: same check potions/collectibles use for "in the current match". */
function isLocalPlayerInGameplay(): boolean {
  const lobbyState = getLobbyState()
  if (!lobbyState) return false
  if (lobbyState.phase !== 'match_created') return false
  return isLocalReadyForMatch()
}

function placeWall(side: WallSide, position: Vector3, scale: Vector3): void {
  const entity = wallEntityBySide.get(side)
  if (entity === undefined) return
  const transform = Transform.getMutable(entity)
  transform.position = position
  transform.scale = scale
  transform.rotation = Quaternion.Identity()
}

/** Position the four boxes around the current room's floor perimeter. */
function positionWallsForCurrentRoom(): void {
  const config = getCurrentRoomConfig()
  const minX = config.floorMinX
  const minZ = config.floorMinZ
  const maxX = config.floorMinX + config.floorSizeX
  const maxZ = config.floorMinZ + config.floorSizeZ
  const centerX = config.arenaCenter.x
  const centerZ = config.arenaCenter.z
  const halfHeight = WALL_HEIGHT / 2

  placeWall('south', Vector3.create(centerX, halfHeight, minZ), Vector3.create(config.floorSizeX, WALL_HEIGHT, WALL_THICKNESS))
  placeWall('north', Vector3.create(centerX, halfHeight, maxZ), Vector3.create(config.floorSizeX, WALL_HEIGHT, WALL_THICKNESS))
  placeWall('west', Vector3.create(minX, halfHeight, centerZ), Vector3.create(WALL_THICKNESS, WALL_HEIGHT, config.floorSizeZ))
  placeWall('east', Vector3.create(maxX, halfHeight, centerZ), Vector3.create(WALL_THICKNESS, WALL_HEIGHT, config.floorSizeZ))
}

function setWallCollision(enabled: boolean): void {
  for (const entity of wallEntityBySide.values()) {
    if (enabled) {
      MeshCollider.setBox(entity, ColliderLayer.CL_PHYSICS)
    } else {
      MeshCollider.deleteFrom(entity)
    }
  }
}

function arenaWallsSystem(): void {
  const shouldBeActive = isLocalPlayerInGameplay()
  if (shouldBeActive === wallsActive) return

  wallsActive = shouldBeActive
  ensureWallEntities()
  if (shouldBeActive) {
    positionWallsForCurrentRoom()
    setWallCollision(true)
  } else {
    setWallCollision(false)
  }
}

export function initArenaWallsSystem(): void {
  engine.addSystem(arenaWallsSystem, undefined, 'arena-walls-system')
}
