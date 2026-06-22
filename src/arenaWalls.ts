import { ColliderLayer, engine, Entity, MeshCollider, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { getArenaRoomConfig, ROOM_IDS, RoomId } from './shared/roomConfig'
import { getTutorialArenaFloorBounds } from './tutorial'

/**
 * Tall invisible colliders along the arena wall perimeters (all 4 rooms + tutorial).
 *
 * The visual wall models have short physics colliders that players can jump over.
 * These boxes cover the full height and are always active so mobile players cannot
 * exploit high lobby spots to jump into arenas.
 */

const WALL_HEIGHT = 10
const WALL_THICKNESS = 0.5

type WallSide = 'north' | 'south' | 'east' | 'west'
const WALL_SIDES: WallSide[] = ['north', 'south', 'east', 'west']

const wallEntitiesByRoom = new Map<RoomId, Map<WallSide, Entity>>()
const tutorialWallEntities = new Map<WallSide, Entity>()
let roomWallsReady = false
let tutorialWallsPositioned = false

function createWallSet(): Map<WallSide, Entity> {
  const map = new Map<WallSide, Entity>()
  for (const side of WALL_SIDES) {
    const entity = engine.addEntity()
    Transform.create(entity)
    map.set(side, entity)
  }
  return map
}

function positionAndEnableWalls(
  entities: Map<WallSide, Entity>,
  centerX: number,
  centerZ: number,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): void {
  const halfHeight = WALL_HEIGHT / 2 + 4
  const sizeX = maxX - minX
  const sizeZ = maxZ - minZ
  for (const [side, entity] of entities) {
    const t = Transform.getMutable(entity)
    if (side === 'south') {
      t.position = Vector3.create(centerX, halfHeight, minZ)
      t.scale = Vector3.create(sizeX, WALL_HEIGHT, WALL_THICKNESS)
    } else if (side === 'north') {
      t.position = Vector3.create(centerX, halfHeight, maxZ)
      t.scale = Vector3.create(sizeX, WALL_HEIGHT, WALL_THICKNESS)
    } else if (side === 'west') {
      t.position = Vector3.create(minX, halfHeight, centerZ)
      t.scale = Vector3.create(WALL_THICKNESS, WALL_HEIGHT, sizeZ)
    } else {
      t.position = Vector3.create(maxX, halfHeight, centerZ)
      t.scale = Vector3.create(WALL_THICKNESS, WALL_HEIGHT, sizeZ)
    }
    MeshCollider.setBox(entity, ColliderLayer.CL_PHYSICS)
  }
}

function arenaWallsSystem(): void {
  if (!roomWallsReady) {
    roomWallsReady = true
    for (const roomId of ROOM_IDS) {
      const entities = createWallSet()
      wallEntitiesByRoom.set(roomId, entities)
      const config = getArenaRoomConfig(roomId)
      positionAndEnableWalls(
        entities,
        config.arenaCenter.x,
        config.arenaCenter.z,
        config.floorMinX,
        config.floorMinX + config.floorSizeX,
        config.floorMinZ,
        config.floorMinZ + config.floorSizeZ
      )
    }
    for (const side of WALL_SIDES) {
      const entity = engine.addEntity()
      Transform.create(entity)
      tutorialWallEntities.set(side, entity)
    }
  }

  if (!tutorialWallsPositioned) {
    const bounds = getTutorialArenaFloorBounds()
    if (bounds) {
      tutorialWallsPositioned = true
      const { centerX, centerZ, sizeX, sizeZ } = bounds
      positionAndEnableWalls(
        tutorialWallEntities,
        centerX,
        centerZ,
        centerX - sizeX / 2,
        centerX + sizeX / 2,
        centerZ - sizeZ / 2,
        centerZ + sizeZ / 2
      )
    }
  }
}

export function initArenaWallsSystem(): void {
  engine.addSystem(arenaWallsSystem, undefined, 'arena-walls-system')
}
